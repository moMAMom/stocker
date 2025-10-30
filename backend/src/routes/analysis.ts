/**
 * 分析結果管理ルーター
 * GET /api/analysis/:stockId
 * GET /api/analysis/:stockId/history
 */

import { Router } from 'express';
import * as analysisController from '../controllers/analysisController';

const router = Router();

/**
 * GET /api/analysis/:stockId
 * 特定銘柄の最新分析結果を取得
 */
router.get('/:stockId', analysisController.getLatestAnalysis);

/**
 * GET /api/analysis/:stockId/history
 * 特定銘柄の過去分析履歴を取得
 */
router.get('/:stockId/history', analysisController.getAnalysisHistory);

export default router;
