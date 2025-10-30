/**
 * 銘柄管理ルーター
 * Express ルート定義
 */

import { Router } from 'express';
import * as stocksController from '../controllers/stocksController';

const router = Router();

// T024: GET /api/stocks - 全銘柄取得
router.get('/', stocksController.getAllStocks);

// T026: GET /api/stocks/:id - 銘柄詳細取得
router.get('/:id', stocksController.getStockById);

// T025: POST /api/stocks - 新規銘柄追加
router.post('/', stocksController.createStock);

// T027: PUT /api/stocks/:id - 銘柄情報更新
router.put('/:id', stocksController.updateStock);

// T028: DELETE /api/stocks/:id - 銘柄削除
router.delete('/:id', stocksController.deleteStock);

export default router;
