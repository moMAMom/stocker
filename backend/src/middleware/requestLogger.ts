/**
 * リクエスト/レスポンスロギングミドルウェア
 * すべてのリクエストとレスポンスをログ出力
 * 作成日　25/10/30
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// ========================================
// リクエスト/レスポンスロギングミドルウェア
// ========================================

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // リクエスト開始時刻
  const startTime = Date.now();

  // リクエスト情報をログ出力
  logger.info(
    `[${req.method}] ${req.path} - リモートアドレス: ${req.ip || req.socket.remoteAddress}`
  );

  if (Object.keys(req.query).length > 0) {
    logger.debug(`クエリパラメータ: ${JSON.stringify(req.query)}`);
  }

  if (req.method !== 'GET' && req.method !== 'HEAD' && Object.keys(req.body).length > 0) {
    // 機密情報をマスク
    const maskedBody = maskSensitiveData(req.body);
    logger.debug(`リクエストボディ: ${JSON.stringify(maskedBody)}`);
  }

  // レスポンス送信時のイベントリスナー
  const originalSend = res.send;

  res.send = function (data: any): Response {
    // レスポンス情報をログ出力
    const duration = Date.now() - startTime;
    logger.info(`[${req.method}] ${req.path} - ステータス: ${res.statusCode} (${duration}ms)`);

    if (process.env.LOG_LEVEL === 'debug' && data) {
      try {
        const responseData =
          typeof data === 'string' ? JSON.parse(data) : data;
        const maskedResponse = maskSensitiveData(responseData);
        logger.debug(`レスポンスボディ: ${JSON.stringify(maskedResponse)}`);
      } catch {
        // JSON パース失敗時はスキップ
      }
    }

    return originalSend.call(this, data);
  };

  next();
};

// ========================================
// 機密情報マスク関数
// ========================================

const maskSensitiveData = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const masked = Array.isArray(data) ? [...data] : { ...data };
  const sensitiveKeys = ['password', 'token', 'secret', 'jwt', 'apiKey', 'api_key'];

  const maskRecursive = (obj: any) => {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (sensitiveKeys.some((k) => key.toLowerCase().includes(k.toLowerCase()))) {
          obj[key] = '***MASKED***';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          maskRecursive(obj[key]);
        }
      }
    }
  };

  maskRecursive(masked);
  return masked;
};

// ========================================
// パフォーマンスログミドルウェア
// ========================================

export const performanceLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    // 遅いリクエストをログ出力（1秒以上）
    if (duration > 1000) {
      logger.warn(
        `⚠️ 遅いリクエスト検出: [${req.method}] ${req.path} - ${duration.toFixed(2)}ms`
      );
    }
  });

  next();
};
