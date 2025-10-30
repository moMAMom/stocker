"""
テクニカル指標計算モジュール

移動平均線（MA）、RSI、MACDなどのテクニカル指標を計算します。
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple

class TechnicalIndicators:
    """テクニカル指標計算クラス"""

    @staticmethod
    def calculate_ma(prices: pd.Series, period: int) -> pd.Series:
        """
        移動平均線（Moving Average）を計算します。

        Args:
            prices: 終値のSeries
            period: 計算期間（日数）

        Returns:
            移動平均線の値
        """
        return prices.rolling(window=period).mean()

    @staticmethod
    def calculate_ema(prices: pd.Series, period: int) -> pd.Series:
        """
        指数移動平均（Exponential Moving Average）を計算します。

        Args:
            prices: 終値のSeries
            period: 計算期間（日数）

        Returns:
            指数移動平均の値
        """
        return prices.ewm(span=period, adjust=False).mean()

    @staticmethod
    def calculate_rsi(prices: pd.Series, period: int = 14) -> pd.Series:
        """
        相対力指数（RSI: Relative Strength Index）を計算します。

        Args:
            prices: 終値のSeries
            period: 計算期間（デフォルト: 14日）

        Returns:
            RSI値（0-100）
        """
        # 前日比の計算
        delta = prices.diff()

        # 上昇分と下降分を分離
        gain = delta.where(delta > 0, 0)
        loss = -delta.where(delta < 0, 0)

        # 平均利益・平均損失を計算
        avg_gain = gain.rolling(window=period).mean()
        avg_loss = loss.rolling(window=period).mean()

        # RSを計算
        rs = avg_gain / avg_loss

        # RSIを計算
        rsi = 100 - (100 / (1 + rs))

        return rsi

    @staticmethod
    def calculate_macd(
        prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9
    ) -> Dict[str, pd.Series]:
        """
        MACD（Moving Average Convergence Divergence）を計算します。

        Args:
            prices: 終値のSeries
            fast: 短期EMA期間（デフォルト: 12）
            slow: 長期EMA期間（デフォルト: 26）
            signal: シグナルライン期間（デフォルト: 9）

        Returns:
            MACD、シグナル、ヒストグラムを含む辞書
        """
        # EMAを計算
        ema_fast = TechnicalIndicators.calculate_ema(prices, fast)
        ema_slow = TechnicalIndicators.calculate_ema(prices, slow)

        # MACDを計算
        macd = ema_fast - ema_slow

        # シグナルラインを計算
        signal_line = TechnicalIndicators.calculate_ema(macd, signal)

        # ヒストグラムを計算
        histogram = macd - signal_line

        return {
            "macd": macd,
            "signal": signal_line,
            "histogram": histogram,
        }

    @staticmethod
    def calculate_bollinger_bands(
        prices: pd.Series, period: int = 20, std_dev: float = 2.0
    ) -> Dict[str, pd.Series]:
        """
        ボリンジャーバンドを計算します。

        Args:
            prices: 終値のSeries
            period: 計算期間（デフォルト: 20日）
            std_dev: 標準偏差の倍数（デフォルト: 2.0）

        Returns:
            上部バンド、中部バンド、下部バンドを含む辞書
        """
        # 移動平均を計算
        sma = TechnicalIndicators.calculate_ma(prices, period)

        # 標準偏差を計算
        std = prices.rolling(window=period).std()

        # バンドを計算
        upper_band = sma + (std * std_dev)
        lower_band = sma - (std * std_dev)

        return {
            "upper": upper_band,
            "middle": sma,
            "lower": lower_band,
        }

    @staticmethod
    def calculate_atr(
        high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14
    ) -> pd.Series:
        """
        平均真実変動幅（ATR: Average True Range）を計算します。

        Args:
            high: 高値のSeries
            low: 安値のSeries
            close: 終値のSeries
            period: 計算期間（デフォルト: 14日）

        Returns:
            ATR値
        """
        # 真実変動幅を計算
        tr1 = high - low
        tr2 = abs(high - close.shift())
        tr3 = abs(low - close.shift())

        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)

        # ATRを計算
        atr = tr.rolling(window=period).mean()

        return atr

    @staticmethod
    def calculate_stochastic(
        high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14
    ) -> Dict[str, pd.Series]:
        """
        ストキャスティクスを計算します。

        Args:
            high: 高値のSeries
            low: 安値のSeries
            close: 終値のSeries
            period: 計算期間（デフォルト: 14日）

        Returns:
            %K、%Dを含む辞書
        """
        # 最高値・最安値を計算
        lowest_low = low.rolling(window=period).min()
        highest_high = high.rolling(window=period).max()

        # %Kを計算
        k_percent = (close - lowest_low) / (highest_high - lowest_low) * 100

        # %Dを計算（%Kの3日移動平均）
        d_percent = k_percent.rolling(window=3).mean()

        return {
            "k_percent": k_percent,
            "d_percent": d_percent,
        }

    @staticmethod
    def calculate_volume_ma(volume: pd.Series, period: int = 20) -> pd.Series:
        """
        出来高の移動平均を計算します。

        Args:
            volume: 出来高のSeries
            period: 計算期間（デフォルト: 20日）

        Returns:
            出来高の移動平均
        """
        return volume.rolling(window=period).mean()

    @staticmethod
    def calculate_obv(close: pd.Series, volume: pd.Series) -> pd.Series:
        """
        オンバランスボリューム（OBV）を計算します。

        Args:
            close: 終値のSeries
            volume: 出来高のSeries

        Returns:
            OBV値
        """
        obv = np.zeros(len(close))

        for i in range(1, len(close)):
            if close.iloc[i] > close.iloc[i - 1]:
                obv[i] = obv[i - 1] + volume.iloc[i]
            elif close.iloc[i] < close.iloc[i - 1]:
                obv[i] = obv[i - 1] - volume.iloc[i]
            else:
                obv[i] = obv[i - 1]

        return pd.Series(obv, index=close.index)
