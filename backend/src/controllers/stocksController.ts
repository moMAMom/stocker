/**
 * 銘柄管理コントローラー
 * リクエスト・レスポンス処理
 */

import { Request, Response, NextFunction } from 'express';
import * as stocksService from '../services/stocksService';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * GET /api/stocks
 * 全銘柄を取得
 */
export const getAllStocks = asyncHandler(async (req: Request, res: Response) => {
  const { search, sector, market, page = '1', limit = '20' } = req.query;

  // ページネーション用のクエリパラメータを数値に変換
  const pageNum = Math.max(1, parseInt(page as string) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20)); // 最大100件制限

  const filter = {
    search: search as string | undefined,
    sector: sector as string | undefined,
    market: market as string | undefined,
  };

  const result = await stocksService.getAllStocks(filter, pageNum, limitNum);

  res.json({
    status: 'success',
    data: result.data,
    pagination: result.pagination,
  });
});

/**
 * GET /api/stocks/:id
 * 銘柄詳細を取得
 */
export const getStockById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const idNum = parseInt(id, 10);

  if (isNaN(idNum)) {
    throw new AppError('銘柄IDは数値である必要があります。', 400);
  }

  const result = await stocksService.getStockById(idNum);

  res.json({
    status: 'success',
    data: result,
  });
});

/**
 * POST /api/stocks
 * 新規銘柄を追加
 */
export const createStock = asyncHandler(async (req: Request, res: Response) => {
  const { symbol, name, sector, market } = req.body;

  // バリデーション
  if (!symbol || typeof symbol !== 'string' || symbol.trim().length === 0) {
    throw new AppError('銘柄シンボルは必須で、空でない文字列である必要があります。', 400);
  }

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new AppError('銘柄名は必須で、空でない文字列である必要があります。', 400);
  }

  const input = {
    symbol: symbol.trim(),
    name: name.trim(),
    sector: sector ? String(sector).trim() : undefined,
    market: market ? String(market).trim() : undefined,
  };

  const result = await stocksService.createStock(input);

  res.status(201).json({
    status: 'success',
    data: result,
    message: '銘柄を作成しました。',
  });
});

/**
 * PUT /api/stocks/:id
 * 銘柄情報を更新
 */
export const updateStock = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, sector, market } = req.body;

  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) {
    throw new AppError('銘柄IDは数値である必要があります。', 400);
  }

  // 更新内容をバリデーション
  const input: any = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new AppError('銘柄名は空でない文字列である必要があります。', 400);
    }
    input.name = name.trim();
  }

  if (sector !== undefined) {
    input.sector = sector ? String(sector).trim() : null;
  }

  if (market !== undefined) {
    input.market = market ? String(market).trim() : null;
  }

  if (Object.keys(input).length === 0) {
    throw new AppError('更新する項目を指定してください。', 400);
  }

  const result = await stocksService.updateStock(idNum, input);

  res.json({
    status: 'success',
    data: result,
    message: '銘柄を更新しました。',
  });
});

/**
 * DELETE /api/stocks/:id
 * 銘柄を削除
 */
export const deleteStock = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const idNum = parseInt(id, 10);

  if (isNaN(idNum)) {
    throw new AppError('銘柄IDは数値である必要があります。', 400);
  }

  const result = await stocksService.deleteStock(idNum);

  res.json({
    status: 'success',
    data: result,
    message: '銘柄を削除しました。',
  });
});

export default {
  getAllStocks,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
};
