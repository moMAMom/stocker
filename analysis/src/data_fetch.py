"""Stock data fetching module with retry logic and rate limiting."""

import yfinance as yf
import pandas as pd
import logging
from typing import Optional, List, Dict
from datetime import datetime, timedelta
import pytz
import time
from functools import wraps

logger = logging.getLogger(__name__)


def retry_with_backoff(max_retries=5, initial_delay=2, max_delay=120):
    """
    Decorator to retry function with exponential backoff.
    
    429レート制限エラーに対して、長めの待機時間を設定し、
    最大120秒まで待機してリトライを行う。
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            delay = initial_delay
            last_exception = None
            
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    error_msg = str(e)
                    
                    # 429エラーの場合は、遅延を大幅に増加させる
                    if '429' in error_msg or 'Too Many Requests' in error_msg:
                        delay = min(delay * 3, max_delay)
                        logger.warning(
                            f"Rate limited (429) on {func.__name__}: {error_msg[:100]}. "
                            f"Attempt {attempt + 1}/{max_retries}. "
                            f"Waiting {delay} seconds..."
                        )
                    else:
                        logger.warning(
                            f"Attempt {attempt + 1}/{max_retries} failed for {func.__name__}: "
                            f"{error_msg[:100]}. Retrying in {delay} seconds..."
                        )
                    
                    if attempt < max_retries - 1:
                        time.sleep(delay)
                        # 429以外のエラーは通常の指数バックオフ
                        if '429' not in error_msg:
                            delay = min(delay * 2, max_delay)
                    else:
                        logger.error(
                            f"All {max_retries} attempts failed for {func.__name__}: {error_msg[:200]}"
                        )
            
            if last_exception:
                raise last_exception
        
        return wrapper
    return decorator


class DataFetcher:
    """Fetches Japanese stock price data from yfinance."""
    
    def __init__(self):
        """Initialize DataFetcher."""
        self.jst = pytz.timezone('Asia/Tokyo')
        # レート制限対応：各リクエスト前に遅延を設定
        self.rate_limit_delay = 1.5  # 秒
        # 異なるティッカー間の遅延（レート制限回避）
        self.min_delay_between_requests = 3.0  # 秒
        logger.info("DataFetcher initialized with rate limiting enabled")
    
    @retry_with_backoff(max_retries=5, initial_delay=2, max_delay=120)
    def fetch_stock_data(
        self,
        ticker: str,
        period: str = '1y',
        interval: str = '1d'
    ) -> Optional[pd.DataFrame]:
        """
        Fetch stock price data from yfinance.
        
        Args:
            ticker: Stock ticker symbol (e.g., '9984.T' for SoftBank)
            period: Data period ('1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y')
            interval: Data interval ('1m', '5m', '15m', '30m', '60m', '1d', '1wk', '1mo')
        
        Returns:
            DataFrame with OHLCV data, or None if fetch fails
        
        Raises:
            Exception: If fetch fails after all retries
        """
        try:
            logger.info(f"Fetching data for {ticker} (period={period}, interval={interval})...")
            time.sleep(self.rate_limit_delay)
            
            # yfinanceがデフォルトでcurl_cffiセッションを使用
            # セッションを指定しないことで、最新のAPIメカニズムに対応
            stock = yf.Ticker(ticker)
            df = stock.history(period=period, interval=interval)
            
            if df.empty:
                logger.warning(f"No data received for {ticker}")
                raise ValueError(f"Empty data for {ticker}")
            
            # Normalize column names to lowercase
            df.columns = df.columns.str.lower()
            
            logger.info(f"Successfully fetched {len(df)} records for {ticker}")
            return df
        
        except Exception as e:
            logger.error(f"Failed to fetch data for {ticker}: {str(e)}")
            raise
    
    def fetch_multiple_stocks(
        self,
        tickers: List[str],
        period: str = '1y',
        interval: str = '1d'
    ) -> Dict[str, Optional[pd.DataFrame]]:
        """
        Fetch data for multiple stocks with rate limiting.
        
        複数のティッカーからデータを取得し、レート制限に対応しながら
        リトライを実行します。ティッカー間には最小遅延を設定します。
        
        Args:
            tickers: List of stock ticker symbols
            period: Data period
            interval: Data interval
        
        Returns:
            Dictionary mapping ticker to DataFrame
        """
        results = {}
        successful_count = 0
        failed_count = 0
        
        logger.info(f"Starting batch fetch for {len(tickers)} stocks...")
        
        for i, ticker in enumerate(tickers):
            try:
                logger.info(f"[{i+1}/{len(tickers)}] Fetching {ticker}...")
                df = self.fetch_stock_data(ticker, period, interval)
                results[ticker] = df
                successful_count += 1
                
                # ティッカー間に遅延を挿入してレート制限を回避
                if i < len(tickers) - 1:
                    logger.debug(
                        f"Waiting {self.min_delay_between_requests}s before next ticker..."
                    )
                    time.sleep(self.min_delay_between_requests)
                    
            except Exception as e:
                logger.error(f"Failed to fetch {ticker} after all retries: {str(e)}")
                results[ticker] = None
                failed_count += 1
        
        # 完了統計をログ出力
        logger.info(
            f"Batch fetch completed: {successful_count}/{len(tickers)} successful, "
            f"{failed_count} failed"
        )
        
        return results
    
    def fetch_latest_price(self, ticker: str) -> Optional[float]:
        """
        Fetch the latest price for a stock.
        
        Args:
            ticker: Stock ticker symbol
        
        Returns:
            Latest closing price, or None if fetch fails
        """
        try:
            df = self.fetch_stock_data(ticker, period='1d', interval='1d')
            if df is not None and not df.empty:
                return float(df['close'].iloc[-1])
            return None
        except Exception as e:
            logger.error(f"Failed to fetch latest price for {ticker}: {str(e)}")
            return None
    
    @retry_with_backoff(max_retries=3, initial_delay=2, max_delay=60)
    def get_stock_info(self, ticker: str) -> Optional[Dict]:
        """
        Get stock information (company name, sector, etc.).
        
        Args:
            ticker: Stock ticker symbol
        
        Returns:
            Dictionary with stock info, or None if fetch fails
        
        Raises:
            Exception: If fetch fails after all retries
        """
        try:
            logger.info(f"Fetching info for {ticker}...")
            time.sleep(self.rate_limit_delay)
            
            # yfinanceがデフォルトでcurl_cffiセッションを使用
            stock = yf.Ticker(ticker)
            info = stock.info
            
            if not info:
                logger.warning(f"No info received for {ticker}")
                raise ValueError(f"Empty info for {ticker}")
            
            logger.info(f"Successfully fetched info for {ticker}")
            return info
        
        except Exception as e:
            logger.error(f"Failed to fetch info for {ticker}: {str(e)}")
            raise
