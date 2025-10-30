/**
 * TypeScript 型定義
 * アプリケーション全体で使用する型
 */

export interface Stock {
  id: number;
  symbol: string;
  name: string;
  market: string;
  sector?: string;
  created_at: string;
  updated_at: string;
}

export interface TechnicalIndicator {
  id: number;
  stock_id: number;
  ma_5: number;
  ma_20: number;
  ma_50: number;
  rsi_14: number;
  macd: number;
  macd_signal: number;
  created_at: string;
  updated_at: string;
}

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

export interface Portfolio {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioEntry {
  id: number;
  portfolio_id: number;
  stock_id: number;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}
