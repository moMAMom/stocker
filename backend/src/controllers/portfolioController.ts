/**
 * ポートフォリオ管理コントローラー
 * リクエスト・レスポンス処理
 */

import { Request, Response, NextFunction } from 'express';
import * as portfolioService from '../services/portfolioService';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * GET /api/portfolio
 * ポートフォリオ一覧を取得（T031）
 */
export const getAllPortfolios = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '20' } = req.query;

  const pageNum = Math.max(1, parseInt(page as string) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));

  const result = await portfolioService.getAllPortfolios(pageNum, limitNum);

  res.json({
    status: 'success',
    data: result.data,
    pagination: result.pagination,
  });
});

/**
 * POST /api/portfolio/:portfolioId/entries
 * ポートフォリオエントリを追加（T032）
 */
export const createPortfolioEntry = asyncHandler(async (req: Request, res: Response) => {
  const { portfolioId } = req.params as { portfolioId: string };
  const { stock_id, purchase_price, quantity, purchase_date, notes } = req.body;

  const portfolioIdNum = parseInt(portfolioId, 10);
  if (isNaN(portfolioIdNum)) {
    throw new AppError('ポートフォリオIDは数値である必要があります。', 400);
  }

  // パラメータを数値に変換
  const stock_idNum = typeof stock_id === 'string' ? parseInt(stock_id, 10) : stock_id;
  const purchase_priceNum = typeof purchase_price === 'string' ? parseFloat(purchase_price) : purchase_price;
  const quantityNum = typeof quantity === 'string' ? parseFloat(quantity) : quantity;

  // バリデーション
  if (!stock_id || isNaN(stock_idNum)) {
    throw new AppError('銘柄IDは必須で、数値である必要があります。', 400);
  }

  if (!purchase_price || isNaN(purchase_priceNum)) {
    throw new AppError('購入価格は必須で、数値である必要があります。', 400);
  }

  if (!quantity || isNaN(quantityNum)) {
    throw new AppError('数量は必須で、数値である必要があります。', 400);
  }

  if (!purchase_date || typeof purchase_date !== 'string') {
    throw new AppError('購入日付は必須で、文字列である必要があります。', 400);
  }

  const input = {
    stock_id: stock_idNum,
    purchase_price: purchase_priceNum,
    quantity: quantityNum,
    purchase_date,
    notes: notes ? String(notes).trim() : undefined,
  };

  const result = await portfolioService.createPortfolioEntry(portfolioIdNum, input);

  res.status(201).json({
    status: 'success',
    data: result,
    message: 'ポートフォリオエントリを作成しました。',
  });
});

/**
 * PUT /api/portfolio/entries/:entryId
 * ポートフォリオエントリを更新（T033）
 */
export const updatePortfolioEntry = asyncHandler(async (req: Request, res: Response) => {
  const { entryId } = req.params as { entryId: string };
  const { purchase_price, quantity, purchase_date, sale_price, sale_date, notes } = req.body;

  const entryIdNum = parseInt(entryId, 10);
  if (isNaN(entryIdNum)) {
    throw new AppError('エントリIDは数値である必要があります。', 400);
  }

  // 更新内容をバリデーション
  const input: any = {};

  if (purchase_price !== undefined) {
    if (typeof purchase_price !== 'number') {
      throw new AppError('購入価格は数値である必要があります。', 400);
    }
    input.purchase_price = purchase_price;
  }

  if (quantity !== undefined) {
    if (typeof quantity !== 'number') {
      throw new AppError('数量は数値である必要があります。', 400);
    }
    input.quantity = quantity;
  }

  if (purchase_date !== undefined) {
    if (typeof purchase_date !== 'string') {
      throw new AppError('購入日付は文字列である必要があります。', 400);
    }
    input.purchase_date = purchase_date;
  }

  if (sale_price !== undefined) {
    if (sale_price !== null && typeof sale_price !== 'number') {
      throw new AppError('売却価格は数値またはnullである必要があります。', 400);
    }
    input.sale_price = sale_price;
  }

  if (sale_date !== undefined) {
    if (sale_date !== null && typeof sale_date !== 'string') {
      throw new AppError('売却日付は文字列またはnullである必要があります。', 400);
    }
    input.sale_date = sale_date;
  }

  if (notes !== undefined) {
    input.notes = notes ? String(notes).trim() : null;
  }

  if (Object.keys(input).length === 0) {
    throw new AppError('更新する項目を指定してください。', 400);
  }

  const result = await portfolioService.updatePortfolioEntry(entryIdNum, input);

  res.json({
    status: 'success',
    data: result,
    message: 'ポートフォリオエントリを更新しました。',
  });
});

/**
 * DELETE /api/portfolio/entries/:entryId
 * ポートフォリオエントリを削除（T033）
 */
export const deletePortfolioEntry = asyncHandler(async (req: Request, res: Response) => {
  const { entryId } = req.params as { entryId: string };
  const entryIdNum = parseInt(entryId, 10);

  if (isNaN(entryIdNum)) {
    throw new AppError('エントリIDは数値である必要があります。', 400);
  }

  const result = await portfolioService.deletePortfolioEntry(entryIdNum);

  res.json({
    status: 'success',
    data: result,
    message: 'ポートフォリオエントリを削除しました。',
  });
});

export default {
  getAllPortfolios,
  createPortfolioEntry,
  updatePortfolioEntry,
  deletePortfolioEntry,
};
