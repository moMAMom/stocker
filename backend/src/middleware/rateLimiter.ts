/**
 * レート制限ミドルウェア
 * DDoS攻撃およびブルートフォース攻撃対策
 * 作成日　25/10/30
 * 更新日　25/10/30
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// ========================================
// インメモリレート制限ストア
// ========================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * インメモリストアのクリーンアップ
 * 5分ごとに期限切れエントリを削除
 */
setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    logger.debug(`Rate limit store cleaned: removed ${cleanedCount} expired entries`);
  }
}, 5 * 60 * 1000); // 5分ごと

// ========================================
// レート制限ミドルウェア
// ========================================

interface RateLimitOptions {
  windowMs: number;      // 時間枠（ミリ秒）
  maxRequests: number;   // 最大リクエスト数
  keyGenerator?: (req: Request) => string;  // キー生成関数
  skipSuccessfulRequests?: boolean;  // 成功時をカウント対象外
  skipFailedRequests?: boolean;      // 失敗時をカウント対象外
}

const defaultOptions: RateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15分
  maxRequests: 100,         // 15分間に100リクエスト
};

/**
 * レート制限ミドルウェアファクトリー
 */
export const createRateLimiter = (options: Partial<RateLimitOptions> = {}) => {
  const config = { ...defaultOptions, ...options };

  const keyGenerator = config.keyGenerator || ((req: Request) => {
    // IPアドレスをキーとして使用
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || 'unknown';
  });

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyGenerator(req);
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || entry.resetTime < now) {
      // 新しいエントリを作成
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      next();
    } else {
      entry.count++;

      if (entry.count > config.maxRequests) {
        logger.warn(`Rate limit exceeded for IP: ${key}, count: ${entry.count}`);

        res.status(429).json({
          error: 'Too Many Requests',
          message: 'リクエストが多すぎます。しばらく後に再度お試しください。',
          retryAfter: Math.ceil((entry.resetTime - now) / 1000),
        });

        res.set('Retry-After', Math.ceil((entry.resetTime - now) / 1000).toString());
      } else {
        res.set('X-RateLimit-Limit', config.maxRequests.toString());
        res.set('X-RateLimit-Remaining', (config.maxRequests - entry.count).toString());
        res.set('X-RateLimit-Reset', entry.resetTime.toString());
        next();
      }
    }
  };
};

// ========================================
// 標準的なレート制限設定
// ========================================

// 一般的なAPI呼び出し用（15分間に100リクエスト）
export const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
});

// ログイン試行用（15分間に5回）
export const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
});

// 分析エンドポイント用（1時間に20回）
export const analysisLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 20,
});

// ファイルアップロード用（1時間に5回）
export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 5,
});
