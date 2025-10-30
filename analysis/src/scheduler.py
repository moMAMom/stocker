"""
定期実行スケジューラ

指定した時間に自動的に分析を実行します。
"""

import schedule
import time
import logging
from typing import List, Callable
from datetime import datetime
import requests
import os
from dotenv import load_dotenv

# 環境変数を読み込み
load_dotenv()

# ロギング設定
logger = logging.getLogger(__name__)

# 設定
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")
ANALYSIS_INTERVAL = int(os.getenv("ANALYSIS_INTERVAL", 1440))  # デフォルト: 1日
ANALYSIS_TIME = os.getenv("ANALYSIS_TIME", "15:30")  # 日本市場の取引終了時刻

class AnalysisScheduler:
    """分析エンジンスケジューラ"""

    def __init__(self):
        """スケジューラを初期化します"""
        self.jobs = []
        self.is_running = False

    def add_daily_job(
        self,
        func: Callable,
        time_str: str = "15:30",
    ):
        """
        毎日特定の時刻に実行するジョブを追加します。

        Args:
            func: 実行する関数
            time_str: 実行時刻（HH:MM形式）
        """
        job = schedule.every().day.at(time_str).do(func)
        self.jobs.append(job)
        logger.info(f"Added daily job at {time_str}")

    def add_interval_job(
        self,
        func: Callable,
        interval: int = 1440,
        unit: str = "minutes",
    ):
        """
        指定間隔で実行するジョブを追加します。

        Args:
            func: 実行する関数
            interval: 間隔
            unit: 単位（seconds、minutes、hours、days等）
        """
        if unit == "seconds":
            job = schedule.every(interval).seconds.do(func)
        elif unit == "minutes":
            job = schedule.every(interval).minutes.do(func)
        elif unit == "hours":
            job = schedule.every(interval).hours.do(func)
        elif unit == "days":
            job = schedule.every(interval).days.do(func)
        else:
            logger.error(f"Unknown unit: {unit}")
            return

        self.jobs.append(job)
        logger.info(f"Added interval job: every {interval} {unit}")

    def run_pending(self):
        """
        保留中のジョブを実行します。
        """
        schedule.run_pending()

    def start(self):
        """
        スケジューラを開始します。
        """
        self.is_running = True
        logger.info("Scheduler started")

        try:
            while self.is_running:
                self.run_pending()
                time.sleep(60)  # 1分ごとにチェック
        except KeyboardInterrupt:
            logger.info("Scheduler stopped by user")
            self.stop()

    def stop(self):
        """
        スケジューラを停止します。
        """
        self.is_running = False
        schedule.clear()
        logger.info("Scheduler stopped")

    def get_jobs(self) -> List:
        """
        登録されているすべてのジョブを取得します。

        Returns:
            ジョブのリスト
        """
        return self.jobs

def analyze_and_notify(tickers: List[str] = None):
    """
    分析を実行してバックエンドに通知します。

    Args:
        tickers: 分析対象の銘柄コードリスト
    """
    try:
        logger.info(f"Starting analysis job at {datetime.now().isoformat()}")

        # バックエンドからティッカーリストを取得
        if not tickers:
            try:
                response = requests.get(
                    f"{BACKEND_URL}/api/stocks",
                    params={"limit": 1000},
                    timeout=30
                )
                response.raise_for_status()
                stocks = response.json()

                if isinstance(stocks, dict) and "data" in stocks:
                    tickers = [s["code"] for s in stocks["data"]]
                elif isinstance(stocks, list):
                    tickers = [s["code"] for s in stocks]
                else:
                    logger.warning("Unexpected response format from backend")
                    return

            except requests.RequestException as e:
                logger.error(f"Failed to fetch stocks from backend: {str(e)}")
                return

        logger.info(f"Analyzing {len(tickers)} stocks")

        # ローカルFlaskサーバーで分析を実行
        try:
            response = requests.post(
                "http://localhost:5000/notify-analysis",
                json={"tickers": tickers},
                timeout=300
            )
            response.raise_for_status()

            logger.info(
                f"Analysis job completed: {response.json().get('analyzed_count')} stocks analyzed"
            )

        except requests.RequestException as e:
            logger.error(f"Failed to run analysis: {str(e)}")

    except Exception as e:
        logger.error(f"Error in analysis job: {str(e)}")

def retry_failed_analysis(max_retries: int = 3):
    """
    失敗した分析を再試行します。

    Args:
        max_retries: 最大リトライ回数
    """
    try:
        logger.info("Starting retry job")

        # バックエンドから失敗した分析を取得
        try:
            response = requests.get(
                f"{BACKEND_URL}/api/analysis/failed",
                timeout=30
            )
            response.raise_for_status()
            failed_stocks = response.json()

            if not failed_stocks:
                logger.info("No failed analyses to retry")
                return

            tickers = [s["code"] for s in failed_stocks]

            # 再分析を実行
            for attempt in range(max_retries):
                try:
                    response = requests.post(
                        "http://localhost:5000/notify-analysis",
                        json={"tickers": tickers},
                        timeout=300
                    )
                    response.raise_for_status()
                    logger.info(f"Retry job completed on attempt {attempt + 1}")
                    break

                except requests.RequestException as e:
                    logger.warning(f"Retry attempt {attempt + 1} failed: {str(e)}")
                    if attempt == max_retries - 1:
                        logger.error(f"Retry job failed after {max_retries} attempts")

        except requests.RequestException as e:
            logger.error(f"Failed to fetch failed analyses: {str(e)}")

    except Exception as e:
        logger.error(f"Error in retry job: {str(e)}")

def health_check():
    """
    分析エンジンのヘルスチェックを実行します。
    """
    try:
        response = requests.get(
            "http://localhost:5000/health",
            timeout=5
        )
        response.raise_for_status()
        logger.info("Health check passed")

    except requests.RequestException as e:
        logger.error(f"Health check failed: {str(e)}")

if __name__ == "__main__":
    # ロギング設定
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    # スケジューラを初期化
    scheduler = AnalysisScheduler()

    # ジョブを追加
    scheduler.add_daily_job(
        lambda: analyze_and_notify(),
        time_str=ANALYSIS_TIME
    )

    # 6時間ごとにリトライを実行
    scheduler.add_interval_job(
        retry_failed_analysis,
        interval=6,
        unit="hours"
    )

    # 1時間ごとにヘルスチェック
    scheduler.add_interval_job(
        health_check,
        interval=1,
        unit="hours"
    )

    logger.info("Analysis scheduler initialized")
    logger.info(f"Daily analysis scheduled at {ANALYSIS_TIME}")

    # スケジューラを開始
    scheduler.start()
