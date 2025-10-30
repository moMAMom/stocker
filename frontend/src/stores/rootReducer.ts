/**
 * Redux ルートリデューサー
 * 全スライスを統合
 */

import { combineReducers } from '@reduxjs/toolkit';
import stocksReducer from './slices/stocksSlice';
import analysisReducer from './slices/analysisSlice';

const rootReducer = combineReducers({
  stocks: stocksReducer,
  analysis: analysisReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
