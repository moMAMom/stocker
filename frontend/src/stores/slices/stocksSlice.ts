/**
 * Redux スライス - 銘柄管理
 * 銘柄リスト、フィルタ、ソート状態を管理
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Stock {
  id: number;
  symbol: string;
  name: string;
  market: string;
  sector?: string;
  created_at: string;
  updated_at: string;
}

export interface StocksState {
  items: Stock[];
  loading: boolean;
  error: string | null;
  filter: {
    signal?: string;
    scoreRange?: [number, number];
    sector?: string;
  };
  sort: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

const initialState: StocksState = {
  items: [],
  loading: false,
  error: null,
  filter: {},
  sort: {
    field: 'name',
    direction: 'asc',
  },
};

const stocksSlice = createSlice({
  name: 'stocks',
  initialState,
  reducers: {
    // 銘柄一覧取得開始
    fetchStocksStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    // 銘柄一覧取得成功
    fetchStocksSuccess: (state, action: PayloadAction<Stock[]>) => {
      state.loading = false;
      state.items = action.payload;
    },
    // 銘柄一覧取得失敗
    fetchStocksError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    // フィルタ設定
    setFilter: (state, action: PayloadAction<StocksState['filter']>) => {
      state.filter = action.payload;
    },
    // ソート設定
    setSort: (state, action: PayloadAction<StocksState['sort']>) => {
      state.sort = action.payload;
    },
    // 銘柄追加
    addStock: (state, action: PayloadAction<Stock>) => {
      state.items.push(action.payload);
    },
    // 銘柄削除
    removeStock: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const {
  fetchStocksStart,
  fetchStocksSuccess,
  fetchStocksError,
  setFilter,
  setSort,
  addStock,
  removeStock,
} = stocksSlice.actions;

export default stocksSlice.reducer;
