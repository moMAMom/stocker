/**
 * 銘柄管理コントローラー
 * リクエスト・レスポンス処理
 */

import { Request, Response, NextFunction } from 'express';
import * as stocksService from '../services/stocksService';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { successResponse } from '../utils/responseHelper';

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

  successResponse(res, result.data, undefined, result.pagination);
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

  successResponse(res, result);
});

/**
 * POST /api/stocks
 * 新規銘柄を追加
 */
export const createStock = asyncHandler(async (req: Request, res: Response) => {
  const { symbol, name, sector, market } = req.body;

  const input = {
    symbol: String(symbol).trim(),
    name: String(name).trim(),
    sector: sector ? String(sector).trim() : undefined,
    market: market ? String(market).trim() : undefined,
  };

  const result = await stocksService.createStock(input);

  return successResponse(res, result, '銘柄を作成しました。', undefined, 201);
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

  return successResponse(res, result, '銘柄を更新しました。');
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

  return successResponse(res, result, '銘柄を削除しました。');
});

/**
 * POST /api/stocks/batch/import
 * 複数銘柄を一括登録
 * 
 * Request Body:
 * [
 *   { symbol: "1234", name: "企業A", sector: "日本株", market: "TSE" },
 *   { symbol: "5678", name: "企業B", sector: "日本株", market: "TSE" }
 * ]
 */
export const batchCreateStocks = asyncHandler(async (req: Request, res: Response) => {
  const stocks = req.body;

  if (!Array.isArray(stocks) || stocks.length === 0) {
    throw new AppError('銘柄データは空でない配列である必要があります。', 400);
  }

  // バリデーション
  const validatedStocks = stocks.map((stock, index) => {
    if (!stock.symbol || typeof stock.symbol !== 'string' || stock.symbol.trim().length === 0) {
      throw new AppError(`インデックス ${index} の銘柄シンボルが無効です。`, 400);
    }
    if (!stock.name || typeof stock.name !== 'string' || stock.name.trim().length === 0) {
      throw new AppError(`インデックス ${index} の銘柄名が無効です。`, 400);
    }

    return {
      symbol: stock.symbol.trim(),
      name: stock.name.trim(),
      sector: stock.sector ? String(stock.sector).trim() : undefined,
      market: stock.market ? String(stock.market).trim() : 'TSE',
    };
  });

  const result = await stocksService.batchCreateStocks(validatedStocks);

  return successResponse(res, result, `${result.created}件の銘柄を登録しました。`, undefined, 201);
});

export default {
  getAllStocks,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
  batchCreateStocks,
};
