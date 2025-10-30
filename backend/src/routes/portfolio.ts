/**
 * ポートフォリオ管理ルーター
 * GET /api/portfolio
 * POST /api/portfolio/:portfolioId/entries
 * PUT /api/portfolio/entries/:entryId
 * DELETE /api/portfolio/entries/:entryId
 */

import { Router } from 'express';
import * as portfolioController from '../controllers/portfolioController';

const router = Router();

/**
 * GET /api/portfolio
 * ポートフォリオ一覧を取得
 */
router.get('/', portfolioController.getAllPortfolios);

/**
 * POST /api/portfolio/:portfolioId/entries
 * ポートフォリオエントリを追加
 */
router.post('/:portfolioId/entries', portfolioController.createPortfolioEntry);

/**
 * PUT /api/portfolio/entries/:entryId
 * ポートフォリオエントリを更新
 */
router.put('/entries/:entryId', portfolioController.updatePortfolioEntry);

/**
 * DELETE /api/portfolio/entries/:entryId
 * ポートフォリオエントリを削除
 */
router.delete('/entries/:entryId', portfolioController.deletePortfolioEntry);

export default router;
