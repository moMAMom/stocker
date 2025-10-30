/**
 * バックエンド API メインエントリーポイント
 * Express.js サーバーの初期化と起動
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from './utils/logger';

// 環境変数を読み込む
dotenv.config();

const app: Express = express();
const PORT = process.env.API_PORT || 3000;

// ========================================
// ミドルウェア設定
// ========================================

// CORS 設定
app.use(
  cors({
    origin: process.env.NODE_ENV === 'development' ? '*' : ['http://localhost:5173'],
    credentials: true,
  })
);

// JSON パーサー
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ========================================
// ルート定義
// ========================================

// ヘルスチェック
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API ベースパス
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    message: 'PayPay Investment Helper API',
    version: '1.0.0',
    docs: '/api-docs',
  });
});

// ========================================
// エラーハンドリング
// ========================================

// 404 ハンドラー
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'リクエストされたエンドポイントが見つかりません。',
  });
});

// グローバルエラーハンドラー
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'サーバーエラーが発生しました。',
  });
});

// ========================================
// サーバー起動
// ========================================

app.listen(PORT, () => {
  logger.info(`🚀 サーバーが起動しました: http://localhost:${PORT}`);
  logger.info(`📚 API ドキュメント: http://localhost:${PORT}/api-docs`);
});

export default app;
