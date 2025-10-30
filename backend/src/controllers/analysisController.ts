/**
 * 分析結果管理コントローラー
 * リクエスト・レスポンス処理
 */

import { Request, Response, NextFunction } from 'express';
import * as analysisService from '../services/analysisService';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * GET /api/analysis/:stockId
 * 特定銘柄の最新分析結果を取得（T029）
 */
export const getLatestAnalysis = asyncHandler(async (req: Request, res: Response) => {
  const { stockId } = req.params as { stockId: string };
  const stockIdNum = parseInt(stockId, 10);

  if (isNaN(stockIdNum)) {
    throw new AppError('銘柄IDは数値である必要があります。', 400);
  }

  const result = await analysisService.getLatestAnalysis(stockIdNum);

  res.json({
    status: 'success',
    data: result,
  });
});

/**
 * GET /api/analysis/:stockId/history
 * 特定銘柄の過去分析履歴を取得（T030）
 */
export const getAnalysisHistory = asyncHandler(async (req: Request, res: Response) => {
  const { stockId } = req.params as { stockId: string };
  const { limit = '30', offset = '0' } = req.query;

  const stockIdNum = parseInt(stockId, 10);
  if (isNaN(stockIdNum)) {
    throw new AppError('銘柄IDは数値である必要があります。', 400);
  }

  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 30));
  const offsetNum = Math.max(0, parseInt(offset as string) || 0);

  const result = await analysisService.getAnalysisHistory(stockIdNum, limitNum, offsetNum);

  res.json({
    status: 'success',
    data: result.data,
    pagination: result.pagination,
  });
});

export default {
  getLatestAnalysis,
  getAnalysisHistory,
};
