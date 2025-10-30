/**
 * バックエンド API メインエントリーポイント
 * Express.js サーバーの初期化と起動
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from './utils/logger';
import { errorHandler, asyncHandler, AppError } from './middleware/errorHandler';
import { requestLogger, performanceLogger } from './middleware/requestLogger';
import { getCorsConfig } from './middleware/corsConfig';
import { securityHeadersMiddleware } from './middleware/securityHeaders';
import { generalLimiter, analysisLimiter } from './middleware/rateLimiter';
import stocksRouter from './routes/stocks';
import analysisRouter from './routes/analysis';
import portfolioRouter from './routes/portfolio';
import { setupSwagger } from './swagger';

// 環境変数を読み込む
dotenv.config();

const app: Express = express();
const PORT = process.env.API_PORT || 3000;

// ========================================
// ミドルウェア設定
// ========================================

// CORS 設定
app.use(cors(getCorsConfig()));

// Swagger 設定
setupSwagger(app);

// JSON パーサー
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// セキュリティヘッダー設定
app.use(securityHeadersMiddleware);

// レート制限（全般的なAPI呼び出し）
app.use('/api/', generalLimiter);

// ロギングミドルウェア
app.use(requestLogger);
app.use(performanceLogger);

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

// 銘柄管理 API ルーター
app.use('/api/stocks', stocksRouter);

// 分析結果 API ルーター（一般的なレート制限のみを適用）
app.use('/api/analysis', analysisRouter);

// ポートフォリオ API ルーター
app.use('/api/portfolio', portfolioRouter);

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
app.use(errorHandler);

// ========================================
// サーバー起動
// ========================================

app.listen(PORT, () => {
  logger.info(`🚀 サーバーが起動しました: http://localhost:${PORT}`);
  logger.info(`📚 API ドキュメント: http://localhost:${PORT}/api-docs`);
});

// エクスポート
export { asyncHandler, AppError };
export default app;
