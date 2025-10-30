/**
 * リクエスト検証ミドルウェア
 * リクエストボディ、クエリパラメータなどの検証
 * 作成日　25/10/30
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// ========================================
// バリデーションスキーマ定義
// ========================================

export interface ValidationRule {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
}

export type ValidationSchema = Record<string, ValidationRule>;

// ========================================
// バリデーション関数
// ========================================

export const validateValue = (
  value: any,
  rule: ValidationRule,
  fieldName: string
): string | null => {
  // 必須チェック
  if (rule.required && (value === null || value === undefined || value === '')) {
    return `${fieldName}は必須フィールドです。`;
  }

  // 値がない場合はここで終了
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // 型チェック
  const actualType = Array.isArray(value) ? 'array' : typeof value;
  if (actualType !== rule.type) {
    return `${fieldName}は${rule.type}型である必要があります。受け取った型: ${actualType}`;
  }

  // 文字列の検証
  if (rule.type === 'string' && typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      return `${fieldName}は最低${rule.minLength}文字である必要があります。`;
    }
    if (rule.maxLength && value.length > rule.maxLength) {
      return `${fieldName}は最大${rule.maxLength}文字である必要があります。`;
    }
    if (rule.pattern && !rule.pattern.test(value)) {
      return `${fieldName}は正しい形式ではありません。`;
    }
  }

  // 数値の検証
  if (rule.type === 'number' && typeof value === 'number') {
    if (rule.min !== undefined && value < rule.min) {
      return `${fieldName}は${rule.min}以上である必要があります。`;
    }
    if (rule.max !== undefined && value > rule.max) {
      return `${fieldName}は${rule.max}以下である必要があります。`;
    }
  }

  // Enum チェック
  if (rule.enum && !rule.enum.includes(value)) {
    return `${fieldName}は以下のいずれかである必要があります: ${rule.enum.join(', ')}`;
  }

  return null;
};

// ========================================
// バリデーションミドルウェアファクトリー
// ========================================

export const validateRequest =
  (schema: ValidationSchema, source: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const data = req[source] || {};
    const errors: Record<string, string> = {};

    // スキーマの各フィールドを検証
    for (const [fieldName, rule] of Object.entries(schema)) {
      const error = validateValue(data[fieldName], rule, fieldName);
      if (error) {
        errors[fieldName] = error;
      }
    }

    // エラーがあれば例外を投げる
    if (Object.keys(errors).length > 0) {
      return next(new AppError(400, 'リクエスト検証エラー', errors));
    }

    next();
  };

// ========================================
// 共通バリデーションスキーマ
// ========================================

export const schemas = {
  // 銘柄作成・更新
  stock: {
    symbol: { type: 'string' as const, required: true, minLength: 1, maxLength: 10 },
    name: { type: 'string' as const, required: true, minLength: 1, maxLength: 255 },
    market: { type: 'string' as const, required: false, enum: ['TSE', 'NASDAQ', 'NYSE'] },
    sector: { type: 'string' as const, required: false, maxLength: 255 },
  },

  // 分析結果作成
  analysisResult: {
    stock_id: { type: 'number' as const, required: true, min: 1 },
    signal: { type: 'string' as const, required: true, enum: ['BUY', 'SELL', 'HOLD'] },
    score: { type: 'number' as const, required: true, min: 0, max: 100 },
    confidence: { type: 'number' as const, required: true, min: 0, max: 1 },
    current_price: { type: 'number' as const, required: true, min: 0 },
  },

  // ポートフォリオ作成・更新
  portfolio: {
    name: { type: 'string' as const, required: true, minLength: 1, maxLength: 255 },
    description: { type: 'string' as const, required: false, maxLength: 1000 },
  },

  // ポートフォリオエントリ作成・更新
  portfolioEntry: {
    portfolio_id: { type: 'number' as const, required: true, min: 1 },
    stock_id: { type: 'number' as const, required: true, min: 1 },
    purchase_price: { type: 'number' as const, required: true, min: 0 },
    quantity: { type: 'number' as const, required: true, min: 0 },
    purchase_date: { type: 'string' as const, required: true },
  },
};
