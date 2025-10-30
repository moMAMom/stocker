/**
 * ポートフォリオ管理サービス層
 * ビジネスロジックの実装（Prisma ORM を使用）
 */

import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface CreatePortfolioEntryInput {
  stock_id: number;
  purchase_price: number;
  quantity: number;
  purchase_date: string;
  notes?: string;
}

interface UpdatePortfolioEntryInput {
  purchase_price?: number;
  quantity?: number;
  purchase_date?: string;
  sale_price?: number;
  sale_date?: string;
  notes?: string;
}

/**
 * ポートフォリオ一覧を取得（T031）
 */
export async function getAllPortfolios(page: number = 1, limit: number = 20) {
  try {
    const skip = (page - 1) * limit;

    // 総数を取得
    const total = await prisma.portfolio.count();

    // ポートフォリオを取得
    const portfolios = await prisma.portfolio.findMany({
      include: {
        entries: {
          include: {
            stock: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
    });

    // 成績計算
    const data = portfolios.map((portfolio: any) => {
      let totalInvestment = 0;
      let totalReturn = 0;
      let profitLoss = 0;

      portfolio.entries.forEach((entry: any) => {
        const investmentAmount = entry.purchase_price * entry.quantity;
        totalInvestment += investmentAmount;

        if (entry.sale_price && entry.sale_date) {
          const returnAmount = entry.sale_price * entry.quantity;
          totalReturn += returnAmount;
          profitLoss += returnAmount - investmentAmount;
        }
      });

      const returnPercentage = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;

      return {
        id: portfolio.id,
        name: portfolio.name,
        description: portfolio.description,
        entries: portfolio.entries.map((entry: any) => ({
          id: entry.id,
          stockId: entry.stock_id,
          stockSymbol: entry.stock.symbol,
          stockName: entry.stock.name,
          purchasePrice: entry.purchase_price,
          quantity: entry.quantity,
          purchaseDate: entry.purchase_date,
          salePrice: entry.sale_price,
          saleDate: entry.sale_date,
          investmentAmount: entry.purchase_price * entry.quantity,
          notes: entry.notes,
        })),
        totalInvestment,
        totalReturn,
        profitLoss,
        returnPercentage: returnPercentage.toFixed(2),
        createdAt: portfolio.created_at,
        updatedAt: portfolio.updated_at,
      };
    });

    logger.info(`✅ ポートフォリオ一覧取得成功（件数: ${total}）`);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error(`❌ ポートフォリオ一覧取得失敗: ${error instanceof Error ? error.message : error}`);
    throw new AppError('ポートフォリオの取得に失敗しました。', 500);
  }
}

/**
 * ポートフォリオエントリを追加（T032）
 */
export async function createPortfolioEntry(portfolioId: number, input: CreatePortfolioEntryInput) {
  try {
    // ポートフォリオの存在確認
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
    });

    if (!portfolio) {
      throw new AppError(`ポートフォリオID ${portfolioId} が見つかりません。`, 404);
    }

    // 銘柄の存在確認
    const stock = await prisma.stock.findUnique({
      where: { id: input.stock_id },
    });

    if (!stock) {
      throw new AppError(`銘柄ID ${input.stock_id} が見つかりません。`, 404);
    }

    // バリデーション
    if (input.purchase_price <= 0 || input.quantity <= 0) {
      throw new AppError('購入価格と数量は正の数である必要があります。', 400);
    }

    // ポートフォリオエントリを作成
    const entry = await prisma.portfolioEntry.create({
      data: {
        portfolio_id: portfolioId,
        stock_id: input.stock_id,
        purchase_price: input.purchase_price,
        quantity: input.quantity,
        purchase_date: new Date(input.purchase_date),
        notes: input.notes || null,
      },
      include: {
        stock: true,
      },
    });

    logger.info(`✅ ポートフォリオエントリを作成しました (Portfolio ID: ${portfolioId})`);

    return {
      id: entry.id,
      portfolioId: entry.portfolio_id,
      stockId: entry.stock_id,
      stockSymbol: entry.stock.symbol,
      stockName: entry.stock.name,
      purchasePrice: entry.purchase_price,
      quantity: entry.quantity,
      purchaseDate: entry.purchase_date,
      investmentAmount: entry.purchase_price * entry.quantity,
      notes: entry.notes,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(`❌ ポートフォリオエントリ作成失敗: ${error instanceof Error ? error.message : error}`);
    throw new AppError('ポートフォリオエントリの作成に失敗しました。', 500);
  }
}

/**
 * ポートフォリオエントリを更新（T033）
 */
export async function updatePortfolioEntry(entryId: number, input: UpdatePortfolioEntryInput) {
  try {
    // エントリの存在確認
    const entry = await prisma.portfolioEntry.findUnique({
      where: { id: entryId },
      include: {
        stock: true,
      },
    });

    if (!entry) {
      throw new AppError(`ポートフォリオエントリID ${entryId} が見つかりません。`, 404);
    }

    // バリデーション
    if (input.purchase_price !== undefined && input.purchase_price <= 0) {
      throw new AppError('購入価格は正の数である必要があります。', 400);
    }

    if (input.quantity !== undefined && input.quantity <= 0) {
      throw new AppError('数量は正の数である必要があります。', 400);
    }

    // 更新を実行
    const updatedEntry = await prisma.portfolioEntry.update({
      where: { id: entryId },
      data: {
        ...(input.purchase_price !== undefined && { purchase_price: input.purchase_price }),
        ...(input.quantity !== undefined && { quantity: input.quantity }),
        ...(input.purchase_date !== undefined && { purchase_date: new Date(input.purchase_date) }),
        ...(input.sale_price !== undefined && { sale_price: input.sale_price || null }),
        ...(input.sale_date !== undefined && { sale_date: input.sale_date ? new Date(input.sale_date) : null }),
        ...(input.notes !== undefined && { notes: input.notes || null }),
        updated_at: new Date(),
      },
    });

    logger.info(`✅ ポートフォリオエントリを更新しました (ID: ${entryId})`);

    return {
      id: updatedEntry.id,
      portfolioId: updatedEntry.portfolio_id,
      stockId: updatedEntry.stock_id,
      stockSymbol: entry.stock.symbol,
      stockName: entry.stock.name,
      purchasePrice: updatedEntry.purchase_price,
      quantity: updatedEntry.quantity,
      purchaseDate: updatedEntry.purchase_date,
      salePrice: updatedEntry.sale_price,
      saleDate: updatedEntry.sale_date,
      investmentAmount: updatedEntry.purchase_price * updatedEntry.quantity,
      notes: updatedEntry.notes,
      createdAt: updatedEntry.created_at,
      updatedAt: updatedEntry.updated_at,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(`❌ ポートフォリオエントリ更新失敗: ${error instanceof Error ? error.message : error}`);
    throw new AppError('ポートフォリオエントリの更新に失敗しました。', 500);
  }
}

/**
 * ポートフォリオエントリを削除（T033）
 */
export async function deletePortfolioEntry(entryId: number) {
  try {
    // エントリの存在確認
    const entry = await prisma.portfolioEntry.findUnique({
      where: { id: entryId },
      include: {
        stock: true,
      },
    });

    if (!entry) {
      throw new AppError(`ポートフォリオエントリID ${entryId} が見つかりません。`, 404);
    }

    // 削除を実行
    await prisma.portfolioEntry.delete({
      where: { id: entryId },
    });

    logger.info(`✅ ポートフォリオエントリを削除しました (ID: ${entryId})`);

    return {
      id: entry.id,
      stockSymbol: entry.stock.symbol,
      message: 'ポートフォリオエントリを削除しました。',
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(`❌ ポートフォリオエントリ削除失敗: ${error instanceof Error ? error.message : error}`);
    throw new AppError('ポートフォリオエントリの削除に失敗しました。', 500);
  }
}

export default {
  getAllPortfolios,
  createPortfolioEntry,
  updatePortfolioEntry,
  deletePortfolioEntry,
};
