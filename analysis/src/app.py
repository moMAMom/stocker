"""
Flask Webアプリケーション

テクニカル分析エンジンをAPIとして公開します。
"""

import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from .analyzer import TechnicalAnalyzer
from .backtest import Backtester
import requests
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import wraps

# 環境変数を読み込み
load_dotenv()

# ロギング設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flaskアプリケーション初期化
app = Flask(__name__)
CORS(app)

# 設定
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")
PYTHON_SERVICE_PORT = int(os.getenv("PYTHON_SERVICE_PORT", 5000))
MAX_SAVE_WORKERS = int(os.getenv("MAX_SAVE_WORKERS", 10))  # 並列保存の最大ワーカー数

def handle_errors(f):
    """共通のエラーハンドリングデコレータ"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error in {f.__name__}: {str(e)}")
            return jsonify({"error": str(e)}), 500
    return wrapper

@app.route("/health", methods=["GET"])
def health_check():
    """
    ヘルスチェック用エンドポイント
    """
    return jsonify({"status": "ok", "service": "analysis_engine"}), 200

@app.route("/analyze/<ticker>", methods=["GET"])
@handle_errors
def analyze_stock(ticker: str):
    """
    単一銘柄を分析します。

    Args:
        ticker: 銘柄コード

    Returns:
        分析結果のJSON
    """
    period = request.args.get("period", "1y")

    # 分析を実行
    result = TechnicalAnalyzer.analyze_stock(ticker, period=period)

    if result is None:
        return jsonify({
            "error": "Failed to analyze stock",
            "ticker": ticker
        }), 400

    # 【新規追加】バックエンドに分析結果を保存
    try:
        save_response = requests.post(
            f"{BACKEND_URL}/api/analysis/save",
            json={
                "ticker": ticker,
                "analysis": result
            },
            timeout=10
        )
        if save_response.status_code != 201:
            logger.warning(f"Failed to save analysis to backend: {save_response.text}")
    except Exception as save_error:
        logger.error(f"Error saving analysis to backend: {str(save_error)}")
        # ここでは処理を続行（分析結果は返す）

    return jsonify(result), 200

@app.route("/analyze/batch", methods=["POST"])
@app.route("/analyze", methods=["POST"])
@handle_errors
def analyze_batch():
    """
    複数銘柄を分析します。

    Request body:
        {
            "stockIds": [1, 2, 3],  # または "tickers": ["1234.T", "5678.T"]
            "period": "1y",
            "save_to_backend": true  # オプション: バックエンドに自動保存
        }

    Returns:
        分析結果のJSON辞書
    """
    data = request.get_json()
    
    # stockIds または tickers のいずれかを受け取る
    tickers = data.get("tickers", [])
    if not tickers and "stockIds" in data:
        stock_ids = data.get("stockIds", [])
        try:
            stocks_response = requests.get(
                f"{BACKEND_URL}/api/stocks",
                timeout=10
            )
            if stocks_response.status_code == 200:
                all_stocks = stocks_response.json().get("data", [])
                tickers = [
                    stock["symbol"] for stock in all_stocks
                    if stock["id"] in stock_ids
                ]
                logger.info(f"✅ stockIds を tickers に変換しました: {tickers}")
        except Exception as fetch_error:
            logger.error(f"❌ バックエンドから株式情報を取得できません: {str(fetch_error)}")
            return jsonify({"error": "Failed to fetch stock information"}), 500
    
    period = data.get("period", "1y")
    save_to_backend = data.get("save_to_backend", True)

    if not tickers:
        return jsonify({"error": "No tickers provided"}), 400

    logger.info(f"Batch analysis started for {len(tickers)} tickers")

    # 複数銘柄を分析
    results = TechnicalAnalyzer.analyze_multiple_stocks(tickers, period=period)

    # バックエンドに結果を並列保存（パフォーマンス改善）
    saved_count = 0
    if save_to_backend:
        def save_single_result(ticker, result):
            """単一の分析結果を保存"""
            try:
                save_response = requests.post(
                    f"{BACKEND_URL}/api/analysis/save",
                    json={
                        "ticker": ticker,
                        "analysis": result
                    },
                    timeout=10
                )
                if save_response.status_code == 201:
                    logger.info(f"Saved analysis for {ticker} to backend")
                    return True
                else:
                    logger.warning(f"Failed to save {ticker}: {save_response.status_code}")
                    return False
            except Exception as save_error:
                logger.error(f"Error saving {ticker} to backend: {str(save_error)}")
                return False
        
        # ThreadPoolExecutorで並列保存（環境変数で設定可能）
        with ThreadPoolExecutor(max_workers=MAX_SAVE_WORKERS) as executor:
            future_to_ticker = {
                executor.submit(save_single_result, ticker, result): ticker 
                for ticker, result in results.items()
            }
            
            for future in as_completed(future_to_ticker):
                ticker = future_to_ticker[future]
                try:
                    if future.result():
                        saved_count += 1
                except Exception as exc:
                    logger.error(f"{ticker} generated an exception: {exc}")

    logger.info(f"Batch analysis completed: {len(results)} analyzed, {saved_count} saved")

    # デバッグ: 返される結果の形式を確認
    logger.info(f"📊 結果は dict 形式です。キー: {list(results.keys())[:5]}...")
    logger.info(f"📊 結果の総数: {len(results)}")

    return jsonify(results), 200

@app.route("/backtest/<ticker>", methods=["GET"])
@handle_errors
def backtest_stock(ticker: str):
    """
    銘柄のバックテストを実行します。

    Args:
        ticker: 銘柄コード

    Returns:
        バックテスト結果のJSON
    """
    period = request.args.get("period", "1y")

    backtester = Backtester()
    result = backtester.run_backtest(ticker, period=period)

    if result is None:
        return jsonify({
            "error": "Failed to run backtest",
            "ticker": ticker
        }), 400

    return jsonify(result.to_dict()), 200

@app.route("/sharpe-ratio/<ticker>", methods=["GET"])
@handle_errors
def get_sharpe_ratio(ticker: str):
    """
    シャープレシオを計算します。

    Args:
        ticker: 銘柄コード

    Returns:
        シャープレシオのJSON
    """
    period = request.args.get("period", "1y")

    sharpe_ratio = Backtester.calculate_sharpe_ratio(ticker, period=period)

    if sharpe_ratio is None:
        return jsonify({
            "error": "Failed to calculate Sharpe ratio",
            "ticker": ticker
        }), 400

    return jsonify({
        "ticker": ticker,
        "sharpe_ratio": sharpe_ratio,
        "period": period
    }), 200

@app.route("/max-drawdown/<ticker>", methods=["GET"])
@handle_errors
def get_max_drawdown(ticker: str):
    """
    最大ドローダウンを計算します。

    Args:
        ticker: 銘柄コード

    Returns:
        最大ドローダウンのJSON
    """
    period = request.args.get("period", "1y")

    max_drawdown = Backtester.calculate_max_drawdown(ticker, period=period)

    if max_drawdown is None:
        return jsonify({
            "error": "Failed to calculate max drawdown",
            "ticker": ticker
        }), 400

    return jsonify({
        "ticker": ticker,
        "max_drawdown": max_drawdown,
        "period": period
    }), 200

@app.route("/notify-analysis", methods=["POST"])
@handle_errors
def notify_analysis():
    """
    バックエンドに分析結果を通知します。

    Request body:
        {
            "tickers": ["1234", "5678"]
        }

    Returns:
        通知結果のJSON
    """
    data = request.get_json()
    tickers = data.get("tickers", [])

    if not tickers:
        return jsonify({"error": "No tickers provided"}), 400

    # 複数銘柄を分析
    results = TechnicalAnalyzer.analyze_multiple_stocks(tickers, period="1y")

    # バックエンドに通知
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/analysis/batch",
            json={"results": results},
            timeout=30
        )
        response.raise_for_status()
    except requests.RequestException as e:
        logger.warning(f"Failed to notify backend: {str(e)}")

    return jsonify({
        "status": "success",
        "analyzed_count": len(results),
        "timestamp": datetime.now().isoformat()
    }), 200

@app.errorhandler(404)
def not_found(error):
    """404エラーハンドラー"""
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    """500エラーハンドラー"""
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    logger.info(f"Starting Flask analysis engine on port {PYTHON_SERVICE_PORT}")
    app.run(host="0.0.0.0", port=PYTHON_SERVICE_PORT, debug=False)
