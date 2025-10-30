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


def retry_with_backoff(max_retries=5, initial_delay=3, max_delay=60):
    """Decorator to retry function with exponential backoff."""
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
                    if attempt < max_retries - 1:
                        logger.warning(
                            f"Attempt {attempt + 1}/{max_retries} failed for {func.__name__}: {str(e)}. "
                            f"Retrying in {delay} seconds..."
                        )
                        time.sleep(delay)
                        delay = min(delay * 2, max_delay)
                    else:
                        logger.error(
                            f"All {max_retries} attempts failed for {func.__name__}: {str(e)}"
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
        self.rate_limit_delay = 2  # Increased from 0.2 to 2 seconds for Yahoo Finance API
    
    @retry_with_backoff(max_retries=3, initial_delay=1, max_delay=8)
    def fetch_stock_data(
        self,
        ticker: str,
        period: str = '1y',
        interval: str = '1d'
    ) -> Optional[pd.DataFrame]:
        """Fetch stock price data from yfinance.
        
        Args:
            ticker: Stock ticker symbol (e.g., '9984.T' for SoftBank)
            period: Data period ('1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y')
            interval: Data interval ('1m', '5m', '15m', '30m', '60m', '1d', '1wk', '1mo')
        
        Returns:
            DataFrame with OHLCV data, or None if fetch fails
        """
        try:
            logger.info(f"Fetching data for {ticker}...")
            time.sleep(self.rate_limit_delay)
            
            stock = yf.Ticker(ticker)
            df = stock.history(period=period, interval=interval)
            
            if df.empty:
                logger.warning(f"No data received for {ticker}")
                return None
            
            # Normalize column names to lowercase
            df.columns = df.columns.str.lower()
            
            logger.info(f"Successfully fetched {len(df)} records for {ticker}")
            return df
        
        except Exception as e:
            logger.error(f"Failed to fetch data for {ticker}: {str(e)}")
            raise
    
    def fetch_latest_price(self, ticker: str) -> Optional[float]:
        """Fetch the latest price for a stock.
        
        Args:
            ticker: Stock ticker symbol
        
        Returns:
            Latest closing price, or None if fetch fails
        """
        try:
            df = self.fetch_stock_data(ticker, period='1d', interval='1d')
            if df is not None and not df.empty:
                return float(df['Close'].iloc[-1])
            return None
        except Exception as e:
            logger.error(f"Failed to fetch latest price for {ticker}: {str(e)}")
            return None
    
    def fetch_multiple_stocks(
        self,
        tickers: List[str],
        period: str = '1y',
        interval: str = '1d'
    ) -> Dict[str, Optional[pd.DataFrame]]:
        """Fetch data for multiple stocks.
        
        Args:
            tickers: List of stock ticker symbols
            period: Data period
            interval: Data interval
        
        Returns:
            Dictionary mapping ticker to DataFrame
        """
        results = {}
        for i, ticker in enumerate(tickers):
            try:
                results[ticker] = self.fetch_stock_data(ticker, period, interval)
                # Add delay between requests to avoid rate limiting
                if i < len(tickers) - 1:
                    time.sleep(self.rate_limit_delay * 2)
            except Exception as e:
                logger.error(f"Failed to fetch {ticker}: {str(e)}")
                results[ticker] = None
        
        return results
    
    def get_stock_info(self, ticker: str) -> Optional[Dict]:
        """Get stock information (company name, sector, etc.).
        
        Args:
            ticker: Stock ticker symbol
        
        Returns:
            Dictionary with stock info, or None if fetch fails
        """
        try:
            logger.info(f"Fetching info for {ticker}...")
            time.sleep(self.rate_limit_delay)
            
            stock = yf.Ticker(ticker)
            info = stock.info
            
            logger.info(f"Successfully fetched info for {ticker}")
            return info
        
        except Exception as e:
            logger.error(f"Failed to fetch info for {ticker}: {str(e)}")
            return None
