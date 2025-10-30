/**
 * キャッシング戦略ユーティリティ
 * APIレスポンス時間最適化用
 * 作成日　25/10/30
 */

import logger from './logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // ミリ秒
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxSize: number = 1000; // 最大キャッシュ数

  /**
   * キャッシュを設定
   * @param key キャッシュキー
   * @param data キャッシュデータ
   * @param ttlSeconds TTL（秒）
   */
  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    });

    logger.debug(`キャッシュ設定: ${key} (TTL: ${ttlSeconds}秒)`);
  }

  /**
   * キャッシュを取得
   * @param key キャッシュキー
   * @returns キャッシュデータまたはnull
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // TTL確認
    const elapsed = Date.now() - entry.timestamp;
    if (elapsed > entry.ttl) {
      this.cache.delete(key);
      logger.debug(`キャッシュ期限切れ: ${key}`);
      return null;
    }

    logger.debug(`キャッシュヒット: ${key}`);
    return entry.data as T;
  }

  /**
   * キャッシュを削除
   * @param key キャッシュキー
   */
  delete(key: string): void {
    this.cache.delete(key);
    logger.debug(`キャッシュ削除: ${key}`);
  }

  /**
   * キャッシュをクリア
   */
  clear(): void {
    this.cache.clear();
    logger.info('全キャッシュをクリアしました');
  }

  /**
   * キャッシュサイズを取得
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 最も古いキャッシュを削除（メモリ管理）
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime: number = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      logger.debug(`最古キャッシュを削除: ${oldestKey}`);
    }
  }
}

// グローバルキャッシュインスタンス
export const cacheManager = new CacheManager();

/**
 * キャッシュキー生成ヘルパー
 */
export const cacheKeys = {
  stocks: (page: number, limit: number, search?: string, sector?: string) =>
    `stocks:${page}:${limit}:${search || ''}:${sector || ''}`,
  stockDetail: (id: number) => `stock:${id}`,
  analysis: (stockId: number) => `analysis:${stockId}`,
  analysisHistory: (stockId: number, days: number = 30) => `analysis:history:${stockId}:${days}`,
  portfolio: (userId?: string) => `portfolio:${userId || 'default'}`,
  portfolioDetail: (id: number) => `portfolio:${id}`,
};

export default cacheManager;
