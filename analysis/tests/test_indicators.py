"""
テクニカル指標計算のユニットテスト

indicators.pyのテストケースを実装します。
"""

import pytest
import pandas as pd
import numpy as np
from src.indicators import TechnicalIndicators

class TestTechnicalIndicators:
    """テクニカル指標計算のテストクラス"""

    @pytest.fixture
    def sample_data(self):
        """テスト用のサンプルデータを作成します"""
        # 100日間のテストデータ
        dates = pd.date_range(start="2024-01-01", periods=100)
        prices = np.random.uniform(100, 110, 100)
        prices = pd.Series(prices, index=dates)
        return prices

    def test_calculate_ma(self, sample_data):
        """移動平均線の計算テスト"""
        ma = TechnicalIndicators.calculate_ma(sample_data, 20)

        # 結果がSeriesであることを確認
        assert isinstance(ma, pd.Series)

        # 長さが元データと同じであることを確認
        assert len(ma) == len(sample_data)

        # NaNの個数が期待値であることを確認（最初の19個がNaN）
        assert ma.isna().sum() == 19

    def test_calculate_ema(self, sample_data):
        """指数移動平均の計算テスト"""
        ema = TechnicalIndicators.calculate_ema(sample_data, 20)

        assert isinstance(ema, pd.Series)
        assert len(ema) == len(sample_data)

        # EMAは最初の値がNaNでないことを確認
        assert not pd.isna(ema.iloc[0])

    def test_calculate_rsi(self, sample_data):
        """RSI計算テスト"""
        rsi = TechnicalIndicators.calculate_rsi(sample_data, 14)

        assert isinstance(rsi, pd.Series)
        assert len(rsi) == len(sample_data)

        # RSIが0-100の範囲内であることを確認
        valid_rsi = rsi.dropna()
        assert (valid_rsi >= 0).all()
        assert (valid_rsi <= 100).all()

    def test_calculate_macd(self, sample_data):
        """MACD計算テスト"""
        macd_result = TechnicalIndicators.calculate_macd(
            sample_data, fast=12, slow=26, signal=9
        )

        # 結果が辞書であることを確認
        assert isinstance(macd_result, dict)

        # 必要なキーが存在することを確認
        assert "macd" in macd_result
        assert "signal" in macd_result
        assert "histogram" in macd_result

        # 各要素がSeriesであることを確認
        assert isinstance(macd_result["macd"], pd.Series)
        assert isinstance(macd_result["signal"], pd.Series)
        assert isinstance(macd_result["histogram"], pd.Series)

    def test_calculate_bollinger_bands(self, sample_data):
        """ボリンジャーバンド計算テスト"""
        bb = TechnicalIndicators.calculate_bollinger_bands(sample_data, 20)

        # 結果が辞書であることを確認
        assert isinstance(bb, dict)

        # 必要なキーが存在することを確認
        assert "upper" in bb
        assert "middle" in bb
        assert "lower" in bb

        # 上部バンドが中部バンドより高いことを確認
        valid_idx = ~(bb["upper"].isna() | bb["middle"].isna())
        assert (bb["upper"][valid_idx] >= bb["middle"][valid_idx]).all()

        # 下部バンドが中部バンドより低いことを確認
        valid_idx = ~(bb["lower"].isna() | bb["middle"].isna())
        assert (bb["lower"][valid_idx] <= bb["middle"][valid_idx]).all()

    def test_calculate_atr(self):
        """ATR計算テスト"""
        dates = pd.date_range(start="2024-01-01", periods=50)

        high = pd.Series(np.random.uniform(110, 120, 50), index=dates)
        low = pd.Series(np.random.uniform(95, 105, 50), index=dates)
        close = pd.Series(np.random.uniform(100, 110, 50), index=dates)

        atr = TechnicalIndicators.calculate_atr(high, low, close, 14)

        assert isinstance(atr, pd.Series)
        assert len(atr) == 50

        # ATRは正の値であることを確認
        valid_atr = atr.dropna()
        assert (valid_atr >= 0).all()

    def test_calculate_stochastic(self):
        """ストキャスティクス計算テスト"""
        dates = pd.date_range(start="2024-01-01", periods=50)

        high = pd.Series(np.random.uniform(110, 120, 50), index=dates)
        low = pd.Series(np.random.uniform(95, 105, 50), index=dates)
        close = pd.Series(np.random.uniform(100, 110, 50), index=dates)

        stoch = TechnicalIndicators.calculate_stochastic(high, low, close, 14)

        # 結果が辞書であることを確認
        assert isinstance(stoch, dict)

        # 必要なキーが存在することを確認
        assert "k_percent" in stoch
        assert "d_percent" in stoch

        # %Kが0-100の範囲内であることを確認
        valid_k = stoch["k_percent"].dropna()
        assert (valid_k >= 0).all()
        assert (valid_k <= 100).all()

    def test_calculate_volume_ma(self):
        """出来高移動平均テスト"""
        volume = pd.Series(np.random.uniform(1000, 5000, 50))

        vol_ma = TechnicalIndicators.calculate_volume_ma(volume, 20)

        assert isinstance(vol_ma, pd.Series)
        assert len(vol_ma) == 50

        # NaNの個数が期待値であることを確認
        assert vol_ma.isna().sum() == 19

    def test_calculate_obv(self):
        """OBV計算テスト"""
        close = pd.Series([100, 102, 101, 103, 104, 102, 105])
        volume = pd.Series([1000, 1500, 1200, 1800, 2000, 1500, 2200])

        obv = TechnicalIndicators.calculate_obv(close, volume)

        assert isinstance(obv, pd.Series)
        assert len(obv) == len(close)

        # 最初の値は0であることを確認
        assert obv.iloc[0] == 0
