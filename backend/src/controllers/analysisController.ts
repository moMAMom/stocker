/**
 * 分析結果管理コントローラー
 * リクエスト・レスポンス処理
 */

import { Request, Response, NextFunction } from 'express';
import * as analysisService from '../services/analysisService';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import axios from 'axios';

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
    success: true,
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
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

/**
 * POST /api/analysis/save
 * Python から送られてきた分析結果を DB に保存
 */
export const saveAnalysisResult = asyncHandler(async (req: Request, res: Response) => {
  const { ticker, analysis } = req.body;

  if (!ticker || !analysis) {
    throw new AppError('ticker と analysis は必須です。', 400);
  }

  try {
    // 分析結果を保存
    const result = await analysisService.saveAnalysisResultFromPython(ticker, analysis);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Error saving analysis for ${ticker}:`, error);
    throw error;
  }
});

/**
 * POST /api/analysis/trigger
 * Python 分析エンジンに分析を実行させる（非同期バックグラウンド処理）
 */
export const triggerAnalysis = asyncHandler(async (req: Request, res: Response) => {
  const { stockIds } = req.body;

  if (!stockIds || !Array.isArray(stockIds) || stockIds.length === 0) {
    throw new AppError('stockIds は必須で、非空の配列である必要があります。', 400);
  }

  try {
    // 銘柄コードを取得
    const stocks = await analysisService.getStocksByIds(stockIds);

    if (stocks.length === 0) {
      throw new AppError('指定された銘柄が見つかりません。', 404);
    }

    // Python に分析リクエストを送信
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';
    
    const tickers = stocks.map((stock: any) => stock.symbol);
    
    // 即座にレスポンスを返す（バックグラウンドで処理）
    res.json({
      success: true,
      message: '分析を開始しました。結果は順次保存されます。',
      analysis_count: stocks.length,
      tickers: tickers,
      status: 'processing',
    });

    // バックグラウンドで分析を実行（レスポンス後に実行）
    setImmediate(async () => {
      try {
        logger.info(`バックグラウンド分析開始: ${tickers.join(', ')}`);
        
        const analysisResponse = await axios.post(
          `${pythonServiceUrl}/analyze/batch`,
          {
            tickers: tickers,
            period: '1y',
          },
          { timeout: 300000 } // 5分タイムアウト（複数銘柄対応）
        );

        logger.info(`バックグラウンド分析完了: ${tickers.length}銘柄`);
        
        // 分析結果をデータベースに並列保存（パフォーマンス改善）
        const results = analysisResponse.data;
        const savePromises = Object.keys(results).map(async (ticker) => {
          try {
            await analysisService.saveAnalysisResultFromPython(ticker, results[ticker]);
            logger.info(`分析結果を保存: ${ticker}`);
            return { ticker, success: true };
          } catch (saveError) {
            logger.error(`分析結果保存エラー (${ticker}):`, saveError);
            return { ticker, success: false, error: saveError };
          }
        });
        
        // すべての保存処理を並列実行（失敗しても他の保存は継続）
        const saveResults = await Promise.allSettled(savePromises);
        const successCount = saveResults.filter(r => r.status === 'fulfilled' && r.value.success).length;
        logger.info(`分析結果保存完了: ${successCount}/${tickers.length}銘柄`);
        
      } catch (error) {
        logger.error('バックグラウンド分析エラー:', error);
      }
    });

  } catch (error) {
    logger.error('Error triggering analysis:', error);
    throw error;
  }
});

export default {
  getLatestAnalysis,
  getAnalysisHistory,
  saveAnalysisResult,
  triggerAnalysis,
};
