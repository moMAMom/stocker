/**
 * 分析結果管理ルーター
 * GET /api/analysis/:stockId
 * GET /api/analysis/:stockId/history
 * POST /api/analysis/save
 * POST /api/analysis/trigger
 */

import { Router } from 'express';
import * as analysisController from '../controllers/analysisController';

const router = Router();

/**
 * POST /api/analysis/trigger
 * ユーザーからの分析実行リクエストを受け付ける
 */
router.post('/trigger', analysisController.triggerAnalysis);

/**
 * POST /api/analysis/save
 * Python 分析エンジンから分析結果を受け取って保存
 */
router.post('/save', analysisController.saveAnalysisResult);

/**
 * GET /api/analysis/:stockId/history
 * 特定銘柄の過去分析履歴を取得
 */
router.get('/:stockId/history', analysisController.getAnalysisHistory);

/**
 * GET /api/analysis/:stockId
 * 特定銘柄の最新分析結果を取得
 */
router.get('/:stockId', analysisController.getLatestAnalysis);

export default router;
