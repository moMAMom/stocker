/**
 * 銘柄管理サービス層
 * ビジネスロジックの実装（Prisma ORM を使用）
 */

import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface CreateStockInput {
  symbol: string;
  name: string;
  sector?: string;
  market?: string;
}

interface UpdateStockInput {
  name?: string;
  sector?: string;
  market?: string;
}

interface StockFilter {
  search?: string;
  sector?: string;
  market?: string;
}

/**
 * 全銘柄を取得
 * フィルタ・ソート対応
 */
export async function getAllStocks(filter?: StockFilter, page: number = 1, limit: number = 20) {
  try {
    const skip = (page - 1) * limit;

    // フィルタ条件を構築
    const where: any = {};
    if (filter?.search) {
      where.OR = [
        { symbol: { contains: filter.search, mode: 'insensitive' } },
        { name: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    if (filter?.sector) {
      where.sector = filter.sector;
    }
    if (filter?.market) {
      where.market = filter.market;
    }

    // 総件数を取得
    const total = await prisma.stock.count({ where });

    // 銘柄データを取得
    const stocks = await prisma.stock.findMany({
      where,
      include: {
        analysis_results: {
          take: 1,
          orderBy: { analysis_date: 'desc' },
        },
      },
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
    });

    // レスポンス形式を整形
    const data = stocks.map((stock: any) => ({
      id: stock.id,
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      market: stock.market,
      latestAnalysis: stock.analysis_results[0]
        ? {
            signal: stock.analysis_results[0].signal,
            score: stock.analysis_results[0].score,
            confidence: stock.analysis_results[0].confidence,
            date: stock.analysis_results[0].analysis_date,
          }
        : null,
      createdAt: stock.created_at,
      updatedAt: stock.updated_at,
    }));

    logger.info(`✅ 全銘柄取得成功（件数: ${total}、ページ: ${page}）`);

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
    logger.error(`❌ 全銘柄取得失敗: ${error instanceof Error ? error.message : error}`);
    throw new AppError('銘柄データの取得に失敗しました。', 500);
  }
}

/**
 * 銘柄詳細を取得
 */
export async function getStockById(id: number) {
  try {
    const stock = await prisma.stock.findUnique({
      where: { id },
      include: {
        analysis_results: {
          orderBy: { analysis_date: 'desc' },
          take: 10,
        },
        technical_indicators: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        portfolio_entries: true,
      },
    });

    if (!stock) {
      throw new AppError(`銘柄ID ${id} が見つかりません。`, 404);
    }

    logger.info(`✅ 銘柄詳細取得成功 (ID: ${id})`);

    return {
      id: stock.id,
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      market: stock.market,
      analysisResults: stock.analysis_results.map((result: any) => ({
        id: result.id,
        date: result.analysis_date,
        signal: result.signal,
        score: result.score,
        confidence: result.confidence,
        ma5: result.ma_5,
        ma20: result.ma_20,
        ma50: result.ma_50,
        rsi: result.rsi_14,
        macd: result.macd,
      })),
      technicalIndicators: stock.technical_indicators,
      portfolioEntries: stock.portfolio_entries.length,
      createdAt: stock.created_at,
      updatedAt: stock.updated_at,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(`❌ 銘柄詳細取得失敗: ${error instanceof Error ? error.message : error}`);
    throw new AppError('銘柄詳細の取得に失敗しました。', 500);
  }
}

/**
 * 新規銘柄を追加
 */
export async function createStock(input: CreateStockInput) {
  try {
    // 重複チェック
    const existingStock = await prisma.stock.findUnique({
      where: { symbol: input.symbol },
    });

    if (existingStock) {
      throw new AppError(`銘柄シンボル ${input.symbol} は既に登録されています。`, 409);
    }

    // 新規銘柄を作成
    const stock = await prisma.stock.create({
      data: {
        symbol: input.symbol,
        name: input.name,
        sector: input.sector || null,
        market: input.market || 'TSE',
      },
    });

    logger.info(`✅ 新規銘柄を作成しました (シンボル: ${input.symbol})`);

    return {
      id: stock.id,
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      market: stock.market,
      createdAt: stock.created_at,
      updatedAt: stock.updated_at,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(`❌ 銘柄作成失敗: ${error instanceof Error ? error.message : error}`);
    throw new AppError('銘柄の作成に失敗しました。', 500);
  }
}

/**
 * 銘柄情報を更新
 */
export async function updateStock(id: number, input: UpdateStockInput) {
  try {
    // 銘柄の存在確認
    const stock = await prisma.stock.findUnique({
      where: { id },
    });

    if (!stock) {
      throw new AppError(`銘柄ID ${id} が見つかりません。`, 404);
    }

    // 更新を実行
    const updatedStock = await prisma.stock.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.sector !== undefined && { sector: input.sector }),
        ...(input.market !== undefined && { market: input.market }),
        updated_at: new Date(),
      },
    });

    logger.info(`✅ 銘柄情報を更新しました (ID: ${id})`);

    return {
      id: updatedStock.id,
      symbol: updatedStock.symbol,
      name: updatedStock.name,
      sector: updatedStock.sector,
      market: updatedStock.market,
      createdAt: updatedStock.created_at,
      updatedAt: updatedStock.updated_at,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(`❌ 銘柄更新失敗: ${error instanceof Error ? error.message : error}`);
    throw new AppError('銘柄の更新に失敗しました。', 500);
  }
}

/**
 * 銘柄を削除
 */
export async function deleteStock(id: number) {
  try {
    // 銘柄の存在確認
    const stock = await prisma.stock.findUnique({
      where: { id },
      include: {
        analysis_results: true,
        technical_indicators: true,
        portfolio_entries: true,
      },
    });

    if (!stock) {
      throw new AppError(`銘柄ID ${id} が見つかりません。`, 404);
    }

    // 削除処理を実行（関連データも削除）
    await prisma.$transaction([
      prisma.analysisResult.deleteMany({ where: { stock_id: id } }),
      prisma.technicalIndicator.deleteMany({ where: { stock_id: id } }),
      prisma.portfolioEntry.deleteMany({ where: { stock_id: id } }),
      prisma.stock.delete({ where: { id } }),
    ]);

    logger.info(`✅ 銘柄を削除しました (ID: ${id}、シンボル: ${stock.symbol})`);

    return {
      id: stock.id,
      symbol: stock.symbol,
      message: '銘柄を削除しました。',
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(`❌ 銘柄削除失敗: ${error instanceof Error ? error.message : error}`);
    throw new AppError('銘柄の削除に失敗しました。', 500);
  }
}

/**
 * 複数銘柄を一括作成
 */
export async function batchCreateStocks(stocks: CreateStockInput[]) {
  try {
    let created = 0;
    const results = [];

    for (const stock of stocks) {
      try {
        // シンボルの重複チェック
        const existing = await prisma.stock.findUnique({
          where: { symbol: stock.symbol },
        });

        if (existing) {
          logger.warn(`⚠️ シンボル ${stock.symbol} は既に存在します。スキップします。`);
          continue;
        }

        // 銘柄を作成
        const newStock = await prisma.stock.create({
          data: {
            symbol: stock.symbol,
            name: stock.name,
            sector: stock.sector,
            market: stock.market || 'TSE',
          },
        });

        results.push(newStock);
        created++;
      } catch (err) {
        logger.error(`❌ シンボル ${stock.symbol} の作成失敗: ${err instanceof Error ? err.message : err}`);
        // エラーが発生しても他の銘柄の処理は続行
      }
    }

    logger.info(`✅ ${created}件の銘柄を一括作成しました。`);

    return {
      created,
      total: stocks.length,
      skipped: stocks.length - created,
      data: results,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(`❌ 銘柄一括作成失敗: ${error instanceof Error ? error.message : error}`);
    throw new AppError('銘柄の一括作成に失敗しました。', 500);
  }
}

export default {
  getAllStocks,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
  batchCreateStocks,
};
