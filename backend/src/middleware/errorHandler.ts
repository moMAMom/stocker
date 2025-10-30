/**
 * エラーハンドリングミドルウェア
 * すべてのエラーを一元管理し、統一されたレスポンス形式で返す
 * 作成日　25/10/30
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// ========================================
// カスタムエラークラス
// ========================================

export class AppError extends Error {
  statusCode: number;
  message: string;
  details?: Record<string, any>;

  constructor(message: string, statusCode: number = 500, details?: Record<string, any>) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ========================================
// エラーハンドリングミドルウェア
// ========================================

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // エラーレベルの決定
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = err.message || 'サーバーエラーが発生しました。';

  // ログ出力
  if (statusCode === 500) {
    logger.error('Unhandled error:', err);
  } else {
    logger.warn(`Client error (${statusCode}):`, message);
  }

  // レスポンス
  const response: Record<string, any> = {
    error: {
      status: statusCode,
      message,
    },
    timestamp: new Date().toISOString(),
  };

  // 開発環境では詳細情報を追加
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
    if (isAppError && err.details) {
      response.error.details = err.details;
    }
  }

  res.status(statusCode).json(response);
};

// ========================================
// 非同期エラーハンドリングラッパー
// ========================================

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
