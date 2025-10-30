/**
 * Redux ストア設定
 * Redux Toolkit を使用したストア初期化
 */

import { configureStore } from '@reduxjs/toolkit';
import rootReducer, { RootState } from './rootReducer';

const store = configureStore({
  reducer: rootReducer,
});

export type AppDispatch = typeof store.dispatch;

export default store;
