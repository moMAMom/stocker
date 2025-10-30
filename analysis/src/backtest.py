"""
バックテスト実装モジュール

過去データを使用して分析アルゴリズムの精度を検証します。
"""

import pandas as pd
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from analyzer import TechnicalAnalyzer, Signal
from data_fetch import DataFetcher

# ロギング設定
logger = logging.getLogger(__name__)

class BacktestResult:
    """バックテスト結果を保持するクラス"""

    def __init__(self):
        self.total_trades = 0
        self.winning_trades = 0
        self.losing_trades = 0
        self.total_return = 0.0
        self.winning_rate = 0.0
        self.max_drawdown = 0.0
        self.trades = []

    def calculate_metrics(self):
        """メトリクスを計算します"""
        if self.total_trades > 0:
            self.winning_rate = (self.winning_trades / self.total_trades) * 100

    def to_dict(self) -> Dict:
        """辞書形式で結果を返します"""
        return {
            "total_trades": self.total_trades,
            "winning_trades": self.winning_trades,
            "losing_trades": self.losing_trades,
            "winning_rate": self.winning_rate,
            "total_return": self.total_return,
            "max_drawdown": self.max_drawdown,
        }

class Backtester:
    """バックテスター"""

    def __init__(self, initial_capital: float = 1000000.0):
        """
        バックテスターを初期化します。

        Args:
            initial_capital: 初期資本（デフォルト: 100万円）
        """
        self.initial_capital = initial_capital
        self.capital = initial_capital

    def run_backtest(
        self,
        ticker: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        period: str = "1y",
    ) -> Optional[BacktestResult]:
        """
        単一銘柄のバックテストを実行します。

        Args:
            ticker: 銘柄コード
            start_date: 開始日付（YYYY-MM-DD形式）
            end_date: 終了日付（YYYY-MM-DD形式）
            period: 期間（start_dateとend_dateが指定されない場合に使用）

        Returns:
            バックテスト結果
        """
        try:
            # データを取得
            if start_date and end_date:
                df = DataFetcher.get_date_range_data(ticker, start_date, end_date)
            else:
                df = DataFetcher.get_stock_data(ticker, period=period)

            if df is None or df.empty or len(df) < 50:
                logger.warning(f"Insufficient data for backtest: {ticker}")
                return None

            result = BacktestResult()
            position = None  # 保有ポジション（"long"または"short"）
            entry_price = 0.0

            # 過去データをループして分析
            for i in range(50, len(df)):
                # 現在までのデータでスナップショットを作成
                historical_df = df.iloc[:i].copy()

                # 分析を実行
                analysis_result = TechnicalAnalyzer.analyze_stock(ticker, period="1y")
                if not analysis_result:
                    continue

                signal = Signal(analysis_result["signal"])
                current_price = df.iloc[i]["close"]

                # 売買シグナルを処理
                if signal == Signal.BUY and position is None:
                    # 買いシグナル：ポジション確立
                    position = "long"
                    entry_price = current_price
                    result.total_trades += 1

                elif signal == Signal.SELL and position == "long":
                    # 売りシグナル：ポジション解除
                    profit = current_price - entry_price
                    profit_percent = (profit / entry_price) * 100

                    if profit > 0:
                        result.winning_trades += 1
                    else:
                        result.losing_trades += 1

                    result.total_return += profit_percent
                    result.trades.append({
                        "entry_price": entry_price,
                        "exit_price": current_price,
                        "profit": profit,
                        "profit_percent": profit_percent,
                    })

                    position = None
                    entry_price = 0.0

            # メトリクスを計算
            result.calculate_metrics()

            logger.info(
                f"Backtest completed for {ticker}: "
                f"Winning rate: {result.winning_rate:.2f}%, "
                f"Total return: {result.total_return:.2f}%"
            )

            return result

        except Exception as e:
            logger.error(f"Error running backtest for {ticker}: {str(e)}")
            return None

    def run_multiple_backtests(
        self,
        tickers: List[str],
        period: str = "1y",
    ) -> Dict[str, Optional[BacktestResult]]:
        """
        複数銘柄のバックテストを実行します。

        Args:
            tickers: 銘柄コードのリスト
            period: 期間

        Returns:
            銘柄コードをキーとしたバックテスト結果の辞書
        """
        results = {}

        for ticker in tickers:
            results[ticker] = self.run_backtest(ticker, period=period)

        return results

    @staticmethod
    def monte_carlo_simulation(
        ticker: str,
        num_simulations: int = 1000,
        period: str = "1y",
    ) -> Optional[Dict]:
        """
        モンテカルロシミュレーションを実行します。

        Args:
            ticker: 銘柄コード
            num_simulations: シミュレーション回数
            period: 期間

        Returns:
            シミュレーション結果
        """
        try:
            df = DataFetcher.get_stock_data(ticker, period=period)
            if df is None or df.empty:
                return None

            # リターンを計算
            close = df["close"]
            returns = close.pct_change().dropna()

            results = []

            for _ in range(num_simulations):
                # ランダムなリターンを生成
                sampled_returns = returns.sample(n=len(returns), replace=True)

                # キャピタルの最終値を計算
                final_capital = 1000000.0
                for ret in sampled_returns:
                    final_capital *= (1 + ret)

                results.append(final_capital)

            results_df = pd.DataFrame({"final_capital": results})

            return {
                "mean": float(results_df["final_capital"].mean()),
                "std": float(results_df["final_capital"].std()),
                "min": float(results_df["final_capital"].min()),
                "max": float(results_df["final_capital"].max()),
                "percentile_5": float(results_df["final_capital"].quantile(0.05)),
                "percentile_95": float(results_df["final_capital"].quantile(0.95)),
            }

        except Exception as e:
            logger.error(f"Error running Monte Carlo simulation for {ticker}: {str(e)}")
            return None

    @staticmethod
    def calculate_sharpe_ratio(
        ticker: str,
        period: str = "1y",
        risk_free_rate: float = 0.02,
    ) -> Optional[float]:
        """
        シャープレシオを計算します。

        Args:
            ticker: 銘柄コード
            period: 期間
            risk_free_rate: リスクフリーレート（年率）

        Returns:
            シャープレシオ
        """
        try:
            df = DataFetcher.get_stock_data(ticker, period=period)
            if df is None or df.empty:
                return None

            close = df["close"]
            returns = close.pct_change().dropna()

            # 平均リターンと標準偏差を計算
            mean_return = returns.mean() * 252  # 年率化
            std_return = returns.std() * (252 ** 0.5)  # 年率化

            # シャープレシオを計算
            sharpe_ratio = (mean_return - risk_free_rate) / std_return

            return float(sharpe_ratio)

        except Exception as e:
            logger.error(f"Error calculating Sharpe ratio for {ticker}: {str(e)}")
            return None

    @staticmethod
    def calculate_max_drawdown(ticker: str, period: str = "1y") -> Optional[float]:
        """
        最大ドローダウンを計算します。

        Args:
            ticker: 銘柄コード
            period: 期間

        Returns:
            最大ドローダウン（%）
        """
        try:
            df = DataFetcher.get_stock_data(ticker, period=period)
            if df is None or df.empty:
                return None

            close = df["close"]

            # 累積最大値を計算
            cumulative_max = close.cummax()

            # ドローダウンを計算
            drawdown = (close - cumulative_max) / cumulative_max

            # 最大ドローダウンを計算
            max_drawdown = drawdown.min() * 100

            return float(max_drawdown)

        except Exception as e:
            logger.error(f"Error calculating max drawdown for {ticker}: {str(e)}")
            return None
