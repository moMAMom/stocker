"""
買い/売り判定アナライザー

テクニカル指標に基づいて買い・売り判定を行います。
"""

import pandas as pd
import logging
from typing import Dict, Optional, Tuple
from enum import Enum
from .indicators import TechnicalIndicators
from .data_fetch import DataFetcher

# ロギング設定
logger = logging.getLogger(__name__)

class Signal(Enum):
    """買い・売りシグナルの種類"""

    BUY = "buy"
    SELL = "sell"
    HOLD = "hold"
    NEUTRAL = "neutral"

class TechnicalAnalyzer:
    """テクニカル分析による買い/売り判定クラス"""

    # 指標の設定値
    MA_PERIODS = [5, 20, 50]
    RSI_PERIOD = 14
    RSI_OVERBOUGHT = 70
    RSI_OVERSOLD = 30
    MACD_FAST = 12
    MACD_SLOW = 26
    MACD_SIGNAL = 9

    @staticmethod
    def analyze_stock(
        ticker: str,
        period: str = "1y",
    ) -> Optional[Dict]:
        """
        銘柄を総合的に分析します。

        Args:
            ticker: 銘柄コード
            period: 分析対象期間

        Returns:
            分析結果を含む辞書
        """
        try:
            # データを取得
            df = DataFetcher.get_stock_data(ticker, period=period)
            if df is None or df.empty:
                logger.warning(f"Failed to fetch data for {ticker}")
                return None

            # テクニカル指標を計算
            indicators = TechnicalAnalyzer._calculate_indicators(df)

            # 各指標に基づいて判定
            ma_signal = TechnicalAnalyzer._analyze_moving_average(df, indicators)
            rsi_signal = TechnicalAnalyzer._analyze_rsi(indicators)
            macd_signal = TechnicalAnalyzer._analyze_macd(indicators)

            # 総合スコアを計算
            score, composite_signal = TechnicalAnalyzer._calculate_composite_signal(
                ma_signal, rsi_signal, macd_signal
            )

            # 現在の価格情報
            latest_row = df.iloc[-1]
            current_price = latest_row["close"]
            previous_close = df.iloc[-2]["close"] if len(df) > 1 else current_price
            change_percent = ((current_price - previous_close) / previous_close) * 100

            return {
                "ticker": ticker,
                "current_price": float(current_price),
                "change_percent": float(change_percent),
                "signal": composite_signal.value,
                "score": float(score),
                "indicators": indicators,
                "details": {
                    "ma_signal": ma_signal.value,
                    "rsi_signal": rsi_signal.value,
                    "macd_signal": macd_signal.value,
                },
                "timestamp": latest_row["date"] if "date" in latest_row.index else None,
            }

        except Exception as e:
            logger.error(f"Error analyzing {ticker}: {str(e)}")
            return None

    @staticmethod
    def _calculate_indicators(df: pd.DataFrame) -> Dict:
        """テクニカル指標を計算します"""
        try:
            close = df["close"]
            high = df["high"]
            low = df["low"]
            volume = df.get("volume", pd.Series(0, index=df.index))

            indicators = {}

            # 移動平均線
            for period in TechnicalAnalyzer.MA_PERIODS:
                indicators[f"ma_{period}"] = float(
                    TechnicalIndicators.calculate_ma(close, period).iloc[-1]
                )

            # RSI
            rsi = TechnicalIndicators.calculate_rsi(close, TechnicalAnalyzer.RSI_PERIOD)
            indicators["rsi"] = float(rsi.iloc[-1]) if not pd.isna(rsi.iloc[-1]) else None

            # MACD
            macd_result = TechnicalIndicators.calculate_macd(
                close,
                fast=TechnicalAnalyzer.MACD_FAST,
                slow=TechnicalAnalyzer.MACD_SLOW,
                signal=TechnicalAnalyzer.MACD_SIGNAL,
            )
            indicators["macd"] = float(macd_result["macd"].iloc[-1])
            indicators["macd_signal"] = float(macd_result["signal"].iloc[-1])
            indicators["macd_histogram"] = float(macd_result["histogram"].iloc[-1])

            # ボリンジャーバンド
            bb = TechnicalIndicators.calculate_bollinger_bands(close)
            indicators["bb_upper"] = float(bb["upper"].iloc[-1])
            indicators["bb_middle"] = float(bb["middle"].iloc[-1])
            indicators["bb_lower"] = float(bb["lower"].iloc[-1])

            # ATR
            atr = TechnicalIndicators.calculate_atr(high, low, close)
            indicators["atr"] = float(atr.iloc[-1]) if not pd.isna(atr.iloc[-1]) else None

            return indicators

        except Exception as e:
            logger.error(f"Error calculating indicators: {str(e)}")
            return {}

    @staticmethod
    def _analyze_moving_average(
        df: pd.DataFrame, indicators: Dict
    ) -> Signal:
        """移動平均線に基づいて判定します"""
        try:
            current_price = df["close"].iloc[-1]
            ma5 = indicators.get("ma_5")
            ma20 = indicators.get("ma_20")
            ma50 = indicators.get("ma_50")

            if not all([ma5, ma20, ma50]):
                return Signal.NEUTRAL

            # ゴールデンクロス：短期MA > 中期MA > 長期MA
            if ma5 > ma20 > ma50 and current_price > ma5:
                return Signal.BUY
            # デッドクロス：短期MA < 中期MA < 長期MA
            elif ma5 < ma20 < ma50 and current_price < ma5:
                return Signal.SELL
            # 価格が上昇トレンドの中
            elif ma5 > ma20 > ma50:
                return Signal.BUY
            # 価格が下降トレンドの中
            elif ma5 < ma20 < ma50:
                return Signal.SELL
            else:
                return Signal.HOLD

        except Exception as e:
            logger.error(f"Error in MA analysis: {str(e)}")
            return Signal.NEUTRAL

    @staticmethod
    def _analyze_rsi(indicators: Dict) -> Signal:
        """RSIに基づいて判定します"""
        try:
            rsi = indicators.get("rsi")

            if rsi is None or pd.isna(rsi):
                return Signal.NEUTRAL

            # 売られすぎ：買いシグナル
            if rsi < TechnicalAnalyzer.RSI_OVERSOLD:
                return Signal.BUY
            # 買われすぎ：売りシグナル
            elif rsi > TechnicalAnalyzer.RSI_OVERBOUGHT:
                return Signal.SELL
            else:
                return Signal.HOLD

        except Exception as e:
            logger.error(f"Error in RSI analysis: {str(e)}")
            return Signal.NEUTRAL

    @staticmethod
    def _analyze_macd(indicators: Dict) -> Signal:
        """MACDに基づいて判定します"""
        try:
            macd = indicators.get("macd")
            macd_signal = indicators.get("macd_signal")
            histogram = indicators.get("macd_histogram")

            if not all([macd is not None, macd_signal is not None, histogram is not None]):
                return Signal.NEUTRAL

            if pd.isna(macd) or pd.isna(macd_signal) or pd.isna(histogram):
                return Signal.NEUTRAL

            # MACDがシグナルラインを上抜け：買いシグナル
            if histogram > 0 and macd > macd_signal:
                return Signal.BUY
            # MACDがシグナルラインを下抜け：売りシグナル
            elif histogram < 0 and macd < macd_signal:
                return Signal.SELL
            else:
                return Signal.HOLD

        except Exception as e:
            logger.error(f"Error in MACD analysis: {str(e)}")
            return Signal.NEUTRAL

    @staticmethod
    def _calculate_composite_signal(
        ma_signal: Signal, rsi_signal: Signal, macd_signal: Signal
    ) -> Tuple[float, Signal]:
        """複数の指標から総合スコアと判定を計算します"""
        signal_scores = {
            Signal.BUY: 1.0,
            Signal.SELL: -1.0,
            Signal.HOLD: 0.0,
            Signal.NEUTRAL: 0.0,
        }

        # 各シグナルのスコアを計算
        score = (
            signal_scores[ma_signal] * 0.4
            + signal_scores[rsi_signal] * 0.3
            + signal_scores[macd_signal] * 0.3
        )

        # スコアから最終判定を決定
        if score > 0.3:
            return score, Signal.BUY
        elif score < -0.3:
            return score, Signal.SELL
        else:
            return score, Signal.HOLD

    @staticmethod
    def analyze_multiple_stocks(
        tickers: list,
        period: str = "1y",
    ) -> Dict[str, Dict]:
        """複数銘柄を分析します"""
        results = {}

        for ticker in tickers:
            result = TechnicalAnalyzer.analyze_stock(ticker, period=period)
            if result:
                results[ticker] = result

        return results

    @staticmethod
    def get_signal_confidence(score: float) -> str:
        """スコアから信頼度を返します"""
        abs_score = abs(score)

        if abs_score > 0.7:
            return "very_high"
        elif abs_score > 0.5:
            return "high"
        elif abs_score > 0.3:
            return "medium"
        else:
            return "low"
