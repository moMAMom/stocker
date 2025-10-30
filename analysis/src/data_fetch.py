"""
株価データ取得モジュール

yfinanceを使用して日本株の株価データを取得します。
"""

import yfinance as yf
import pandas as pd
import logging
from typing import Optional, List, Dict
from datetime import datetime, timedelta
import pytz

# ロギング設定
logger = logging.getLogger(__name__)

class DataFetcher:
    """株価データ取得クラス"""

    # 日本のタイムゾーン
    JST = pytz.timezone("Asia/Tokyo")

    @staticmethod
    def get_stock_data(
        ticker: str,
        period: str = "1y",
        interval: str = "1d",
        timeout: int = 30,
    ) -> Optional[pd.DataFrame]:
        """
        yfinanceから株価データを取得します。

        Args:
            ticker: 銘柄コード（例：9999.T）
            period: 取得期間（例：1y、6mo、3mo、1mo）
            interval: データ間隔（例：1d、1wk、1mo）
            timeout: タイムアウト時間（秒）

        Returns:
            OHLCV データを含むDataFrame、取得失敗時はNone
        """
        try:
            # .T サフィックスを追加
            if not ticker.endswith(".T"):
                ticker = f"{ticker}.T"

            # データを取得
            stock = yf.Ticker(ticker, timeout=timeout)
            hist = stock.history(period=period, interval=interval)

            if hist.empty:
                logger.warning(f"No data found for {ticker}")
                return None

            # 列名を小文字に統一
            hist.columns = hist.columns.str.lower()

            # インデックスをリセット
            hist = hist.reset_index()

            logger.info(f"Successfully fetched {len(hist)} records for {ticker}")
            return hist

        except Exception as e:
            logger.error(f"Error fetching data for {ticker}: {str(e)}")
            return None

    @staticmethod
    def get_multiple_stocks(
        tickers: List[str],
        period: str = "1y",
        interval: str = "1d",
        timeout: int = 30,
    ) -> Dict[str, Optional[pd.DataFrame]]:
        """
        複数銘柄の株価データを取得します。

        Args:
            tickers: 銘柄コードのリスト
            period: 取得期間
            interval: データ間隔
            timeout: タイムアウト時間

        Returns:
            銘柄コードをキーとしたDataFrameの辞書
        """
        results = {}

        for ticker in tickers:
            results[ticker] = DataFetcher.get_stock_data(
                ticker, period=period, interval=interval, timeout=timeout
            )

        return results

    @staticmethod
    def get_latest_price(ticker: str) -> Optional[float]:
        """
        最新の終値を取得します。

        Args:
            ticker: 銘柄コード

        Returns:
            最新終値、取得失敗時はNone
        """
        try:
            if not ticker.endswith(".T"):
                ticker = f"{ticker}.T"

            stock = yf.Ticker(ticker)
            hist = stock.history(period="1d")

            if hist.empty:
                return None

            # 最後の行の終値を取得
            latest_price = hist["Close"].iloc[-1]
            return float(latest_price)

        except Exception as e:
            logger.error(f"Error fetching latest price for {ticker}: {str(e)}")
            return None

    @staticmethod
    def get_intraday_data(
        ticker: str,
        interval: str = "1h",
        timeout: int = 30,
    ) -> Optional[pd.DataFrame]:
        """
        日中（当日）のデータを取得します。

        Args:
            ticker: 銘柄コード
            interval: データ間隔（1m、5m、15m、30m、60m、90m、1h等）
            timeout: タイムアウト時間

        Returns:
            OHLCV データを含むDataFrame
        """
        try:
            if not ticker.endswith(".T"):
                ticker = f"{ticker}.T"

            stock = yf.Ticker(ticker, timeout=timeout)
            hist = stock.history(period="1d", interval=interval)

            if hist.empty:
                logger.warning(f"No intraday data found for {ticker}")
                return None

            hist.columns = hist.columns.str.lower()
            hist = hist.reset_index()

            return hist

        except Exception as e:
            logger.error(
                f"Error fetching intraday data for {ticker}: {str(e)}"
            )
            return None

    @staticmethod
    def get_date_range_data(
        ticker: str,
        start_date: str,
        end_date: str,
        timeout: int = 30,
    ) -> Optional[pd.DataFrame]:
        """
        指定日付範囲のデータを取得します。

        Args:
            ticker: 銘柄コード
            start_date: 開始日付（YYYY-MM-DD形式）
            end_date: 終了日付（YYYY-MM-DD形式）
            timeout: タイムアウト時間

        Returns:
            OHLCV データを含むDataFrame
        """
        try:
            if not ticker.endswith(".T"):
                ticker = f"{ticker}.T"

            stock = yf.Ticker(ticker, timeout=timeout)
            hist = stock.history(start=start_date, end=end_date)

            if hist.empty:
                logger.warning(f"No data found for {ticker} in range {start_date}-{end_date}")
                return None

            hist.columns = hist.columns.str.lower()
            hist = hist.reset_index()

            return hist

        except Exception as e:
            logger.error(
                f"Error fetching data for {ticker} ({start_date}-{end_date}): {str(e)}"
            )
            return None

    @staticmethod
    def validate_ticker(ticker: str) -> bool:
        """
        銘柄コードが有効か確認します。

        Args:
            ticker: 銘柄コード

        Returns:
            有効な場合True、無効な場合False
        """
        try:
            if not ticker.endswith(".T"):
                ticker = f"{ticker}.T"

            stock = yf.Ticker(ticker)
            hist = stock.history(period="1d")

            return not hist.empty

        except Exception as e:
            logger.warning(f"Ticker validation failed for {ticker}: {str(e)}")
            return False

    @staticmethod
    def get_stock_info(ticker: str) -> Optional[Dict]:
        """
        銘柄情報を取得します。

        Args:
            ticker: 銘柄コード

        Returns:
            銘柄情報の辞書、取得失敗時はNone
        """
        try:
            if not ticker.endswith(".T"):
                ticker = f"{ticker}.T"

            stock = yf.Ticker(ticker)
            info = stock.info

            return {
                "name": info.get("longName", ""),
                "sector": info.get("sector", ""),
                "industry": info.get("industry", ""),
                "market_cap": info.get("marketCap", 0),
                "pe_ratio": info.get("trailingPE", 0),
                "dividend_yield": info.get("dividendYield", 0),
            }

        except Exception as e:
            logger.error(f"Error fetching stock info for {ticker}: {str(e)}")
            return None
