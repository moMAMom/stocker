/**
 * セキュリティヘッダーミドルウェア
 * OWASP推奨のセキュリティヘッダーを自動設定
 * 作成日　25/10/30
 * 更新日　25/10/30
 */

import { Request, Response, NextFunction } from 'express';

/**
 * セキュリティヘッダー設定ミドルウェア
 * OWASP Top 10対策を実装
 */
export const securityHeadersMiddleware = (_req: Request, res: Response, next: NextFunction): void => {
  // X-Content-Type-Options: XSSインジェクション対策
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options: クリックジャッキング対策
  res.setHeader('X-Frame-Options', 'DENY');

  // X-XSS-Protection: XSS保護（レガシーブラウザ対応）
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Strict-Transport-Security: HTTPS強制
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Content-Security-Policy: インラインスクリプト、外部スクリプト制限
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
  );

  // Referrer-Policy: リファラ情報の制御
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy: ブラウザ機能の制御
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  next();
};

/**
 * サニタイゼーション用ユーティリティ関数
 * SQLインジェクション対策
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  // 危険な文字をエスケープ
  return input
    .replace(/'/g, "''")           // シングルクォート
    .replace(/"/g, '\\"')          // ダブルクォート
    .replace(/\\/g, '\\\\')        // バックスラッシュ
    .replace(/\0/g, '\\0')         // null
    .replace(/\n/g, '\\n')         // 改行
    .replace(/\r/g, '\\r')         // キャリッジリターン
    .replace(/\x1a/g, '\\Z');     // ctrl+Z
};

/**
 * バリデーション用ユーティリティ関数
 * XSS対策
 */
export const validateAndSanitize = (value: any, fieldName: string = 'field'): string => {
  if (!value) {
    throw new Error(`${fieldName} is required`);
  }

  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }

  // HTMLタグ除去
  const sanitized = value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // script タグ
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // iframe タグ
    .replace(/<on\w+\s*=/gi, '')                                           // イベントハンドラ
    .trim();

  // 長さチェック（XSS攻撃のペイロード制限）
  if (sanitized.length > 10000) {
    throw new Error(`${fieldName} exceeds maximum length of 10000 characters`);
  }

  return sanitized;
};

/**
 * 数値入力バリデーション
 */
export const validateNumericInput = (value: any, min: number = 0, max: number = 999999): number => {
  const num = parseInt(value, 10);

  if (isNaN(num)) {
    throw new Error('Input must be a valid number');
  }

  if (num < min || num > max) {
    throw new Error(`Input must be between ${min} and ${max}`);
  }

  return num;
};

/**
 * メールアドレスバリデーション
 */
export const validateEmail = (email: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  return email.toLowerCase().trim();
};

/**
 * URL検証
 */
export const validateUrl = (url: string): string => {
  try {
    new URL(url);
    return url;
  } catch {
    throw new Error('Invalid URL format');
  }
};
