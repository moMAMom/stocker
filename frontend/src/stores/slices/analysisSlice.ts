/**
 * Redux スライス - 分析結果管理
 * 分析結果、テクニカル指標をキャッシュ
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AnalysisResult {
  id: number;
  stock_id: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  score: number;
  confidence: number;
  reason?: string;
  ma_5?: number;
  ma_20?: number;
  ma_50?: number;
  rsi_14?: number;
  macd?: number;
  macd_signal?: number;
  current_price: number;
  analysis_date: string;
  created_at: string;
  updated_at: string;
}

export interface AnalysisState {
  results: Record<number, AnalysisResult>;
  history: Record<number, AnalysisResult[]>;
  loading: boolean;
  error: string | null;
}

const initialState: AnalysisState = {
  results: {},
  history: {},
  loading: false,
  error: null,
};

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    // 分析結果取得開始
    fetchAnalysisStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    // 分析結果取得成功
    fetchAnalysisSuccess: (state, action: PayloadAction<AnalysisResult>) => {
      state.loading = false;
      state.results[action.payload.stock_id] = action.payload;
    },
    // 分析結果取得失敗
    fetchAnalysisError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    // 分析履歴取得
    setAnalysisHistory: (
      state,
      action: PayloadAction<{ stockId: number; history: AnalysisResult[] }>
    ) => {
      state.history[action.payload.stockId] = action.payload.history;
    },
    // 複数の分析結果を一括設定
    setMultipleAnalysisResults: (
      state,
      action: PayloadAction<AnalysisResult[]>
    ) => {
      action.payload.forEach((result) => {
        state.results[result.stock_id] = result;
      });
    },
    // 分析結果をリセット
    clearAnalysisResults: (state) => {
      state.results = {};
      state.history = {};
    },
  },
});

export const {
  fetchAnalysisStart,
  fetchAnalysisSuccess,
  fetchAnalysisError,
  setAnalysisHistory,
  setMultipleAnalysisResults,
  clearAnalysisResults,
} = analysisSlice.actions;

export default analysisSlice.reducer;
