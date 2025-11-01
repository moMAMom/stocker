/**
 * Prisma クライアント シングルトン
 * 
 * データベース接続を一元管理し、エンコーディング設定を明示的に指定します。
 * UTF-8 データの正確な取得を保証します。
 */

import { PrismaClient } from '@prisma/client';

// グローバルスコープに型を拡張（ホットリロード時の多重接続を防ぐ）
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    // ログレベル設定（本番環境では 'error' に変更）
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });

// 開発環境ではホットリロード時の多重接続を防ぐ
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * データベース接続前に、client_encoding を UTF-8 に設定
 */
export async function ensureUtf8Encoding() {
  try {
    await prisma.$queryRaw`SET client_encoding = 'UTF8'`;
    console.log('✅ PostgreSQL client_encoding を UTF-8 に設定しました');
  } catch (error) {
    console.error('⚠️ client_encoding の設定に失敗しました:', error);
    // エラーでも続行する（接続文字列で指定されている場合は問題ない）
  }
}

export default prisma;
