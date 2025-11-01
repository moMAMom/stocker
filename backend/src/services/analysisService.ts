/**
 * 分析結果管理サービス層
 * ビジネスロジックの実装（Prisma ORM を使用）
 */

import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import prisma, { ensureUtf8Encoding } from '../utils/prismaClient';

interface AnalysisResultInput {
  signal: 'BUY' | 'SELL' | 'HOLD';
  score: number;
  confidence: number;
  reason?: string;
  ma_5?: number;
  ma_20?: number;
  ma_50?: number;
  rsi_14?: number;
  macd?: number;
  macd_signal?: number;
  current_price: number;
}

/**
 * 特定銘柄の最新分析結果を取得（T029）
 */
export async function getLatestAnalysis(stockId: number) {
  try {
    // 銘柄の存在確認
    const stock = await prisma.stock.findUnique({
      where: { id: stockId },
    });

    if (!stock) {
      throw new AppError(`銘柄ID ${stockId} が見つかりません。`, 404);
    }

    // 最新の分析結果を取得
    const analysis = await prisma.analysisResult.findFirst({
      where: { stock_id: stockId },
      orderBy: { analysis_date: 'desc' },
    });

    if (!analysis) {
      throw new AppError(`銘柄ID ${stockId} の分析結果がまだ作成されていません。`, 404);
    }

    logger.info(`✅ 最新分析結果取得成功 (Stock ID: ${stockId})`);

    return {
      id: analysis.id,
      stockId: analysis.stock_id,
      signal: analysis.signal,
      score: analysis.score,
      confidence: analysis.confidence,
      reason: analysis.reason,
      indicators: {
        ma_5: analysis.ma_5,
        ma_20: analysis.ma_20,
        ma_50: analysis.ma_50,
        rsi_14: analysis.rsi_14,
        macd: analysis.macd,
        macd_signal: analysis.macd_signal,
      },
      currentPrice: analysis.current_price,
      analysisDate: analysis.analysis_date,
      createdAt: analysis.created_at,
      updatedAt: analysis.updated_at,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(`❌ 最新分析結果取得失敗: ${error instanceof Error ? error.message : error}`);
    throw new AppError('分析結果の取得に失敗しました。', 500);
  }
}

/**
 * 特定銘柄の過去分析履歴を取得（T030）
 */
export async function getAnalysisHistory(stockId: number, limit: number = 30, offset: number = 0) {
  try {
    // 銘柄の存在確認
    const stock = await prisma.stock.findUnique({
      where: { id: stockId },
    });

    if (!stock) {
      throw new AppError(`銘柄ID ${stockId} が見つかりません。`, 404);
    }

    // 分析結果の総件数を取得
    const total = await prisma.analysisResult.count({
      where: { stock_id: stockId },
    });

    // 過去の分析結果を取得
    const history = await prisma.analysisResult.findMany({
      where: { stock_id: stockId },
      orderBy: { analysis_date: 'desc' },
      take: Math.min(limit, 100), // 最大100件制限
      skip: Math.max(0, offset),
    });

    logger.info(`✅ 分析履歴取得成功 (Stock ID: ${stockId}、件数: ${total})`);

    return {
      data: history.map((analysis) => ({
        id: analysis.id,
        stockId: analysis.stock_id,
        signal: analysis.signal,
        score: analysis.score,
        confidence: analysis.confidence,
        reason: analysis.reason,
        indicators: {
          ma_5: analysis.ma_5,
          ma_20: analysis.ma_20,
          ma_50: analysis.ma_50,
          rsi_14: analysis.rsi_14,
          macd: analysis.macd,
          macd_signal: analysis.macd_signal,
        },
        currentPrice: analysis.current_price,
        analysisDate: analysis.analysis_date,
        createdAt: analysis.created_at,
        updatedAt: analysis.updated_at,
      })),
      pagination: {
        total,
        limit,
        offset,
        returned: history.length,
      },
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(`❌ 分析履歴取得失敗: ${error instanceof Error ? error.message : error}`);
    throw new AppError('分析履歴の取得に失敗しました。', 500);
  }
}

/**
 * 分析結果を作成・更新（内部用）
 */
export async function upsertAnalysisResult(stockId: number, input: AnalysisResultInput) {
  try {
    // 銘柄の存在確認
    const stock = await prisma.stock.findUnique({
      where: { id: stockId },
    });

    if (!stock) {
      throw new AppError(`銘柄ID ${stockId} が見つかりません。`, 404);
    }

    // スコアと信頼度のバリデーション
    if (input.score < 0 || input.score > 100) {
      throw new AppError('スコアは0-100の範囲である必要があります。', 400);
    }

    if (input.confidence < 0 || input.confidence > 1) {
      throw new AppError('信頼度は0-1の範囲である必要があります。', 400);
    }

    // 今日の分析結果を取得
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAnalysis = await prisma.analysisResult.findFirst({
      where: {
        stock_id: stockId,
        analysis_date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    let analysis;

    if (existingAnalysis) {
      // 既存の分析結果を更新
      analysis = await prisma.analysisResult.update({
        where: { id: existingAnalysis.id },
        data: {
          signal: input.signal,
          score: input.score,
          confidence: input.confidence,
          reason: input.reason || null,
          ma_5: input.ma_5 || null,
          ma_20: input.ma_20 || null,
          ma_50: input.ma_50 || null,
          rsi_14: input.rsi_14 || null,
          macd: input.macd || null,
          macd_signal: input.macd_signal || null,
          current_price: input.current_price,
          updated_at: new Date(),
        },
      });

      logger.info(`✅ 分析結果を更新しました (Stock ID: ${stockId})`);
    } else {
      // 新しい分析結果を作成
      analysis = await prisma.analysisResult.create({
        data: {
          stock_id: stockId,
          signal: input.signal,
          score: input.score,
          confidence: input.confidence,
          reason: input.reason || null,
          ma_5: input.ma_5 || null,
          ma_20: input.ma_20 || null,
          ma_50: input.ma_50 || null,
          rsi_14: input.rsi_14 || null,
          macd: input.macd || null,
          macd_signal: input.macd_signal || null,
          current_price: input.current_price,
          analysis_date: new Date(),
        },
      });

      logger.info(`✅ 分析結果を作成しました (Stock ID: ${stockId})`);
    }

    return {
      id: analysis.id,
      stockId: analysis.stock_id,
      signal: analysis.signal,
      score: analysis.score,
      confidence: analysis.confidence,
      reason: analysis.reason,
      currentPrice: analysis.current_price,
      analysisDate: analysis.analysis_date,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(`❌ 分析結果操作失敗: ${error instanceof Error ? error.message : error}`);
    throw new AppError('分析結果の操作に失敗しました。', 500);
  }
}

/**
 * Python から送られた分析結果を保存
 * （銘柄コードから銘柄 ID を検索して保存）
 */
export async function saveAnalysisResultFromPython(ticker: string, analysis: any) {
  try {
    // 銘柄シンボルから銘柄を検索
    const stock = await prisma.stock.findUnique({
      where: { symbol: ticker },
    });

    if (!stock) {
      throw new AppError(`銘柄シンボル ${ticker} が見つかりません。`, 404);
    }

    logger.info(`📊 Python分析結果: ${JSON.stringify(analysis).substring(0, 300)}...`);

    // Python から返されたデータの形式を確認し、適切なフィールドをマッピング
    const indicators = analysis.indicators || {};
    
    // 分析結果を保存
    const result = await prisma.analysisResult.create({
      data: {
        stock_id: stock.id,
        signal: (analysis.signal || 'hold').toUpperCase(),
        score: Math.round((analysis.score || 0.5) * 100), // スコアを0-100の範囲に変換
        confidence: analysis.confidence || 0.5,
        reason: analysis.reason || null,
        ma_5: indicators.ma_5 || null,
        ma_20: indicators.ma_20 || null,
        ma_50: indicators.ma_50 || null,
        rsi_14: indicators.rsi || null,
        macd: indicators.macd || null,
        macd_signal: indicators.macd_signal || null,
        current_price: analysis.current_price || 0,
        analysis_date: new Date(),
      },
    });

    logger.info(`✅ 分析結果を保存しました (Ticker: ${ticker}, Stock ID: ${stock.id}, Signal: ${result.signal}, Score: ${result.score})`);
    return result;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(`❌ 分析結果保存失敗 (${ticker}): ${error instanceof Error ? error.message : error}`);
    throw new AppError('分析結果の保存に失敗しました。', 500);
  }
}

/**
 * 複数の銘柄 ID から銘柄情報を取得
 */
export async function getStocksByIds(stockIds: number[]) {
  try {
    logger.info(`🔍 銘柄IDで検索開始: ${stockIds.join(', ')}`);
    
    const stocks = await prisma.stock.findMany({
      where: {
        id: {
          in: stockIds,
        },
      },
    });

    logger.info(`✅ 検索完了: ${stocks.length}件見つかりました`);
    if (stocks.length === 0) {
      logger.warn(`⚠️  見つかった銘柄がありません。検索ID: ${stockIds.join(', ')}`);
    }

    return stocks;
  } catch (error) {
    logger.error(`❌ 銘柄情報取得失敗: ${error instanceof Error ? error.message : error}`);
    throw new AppError('銘柄情報の取得に失敗しました。', 500);
  }
}

export default {
  getLatestAnalysis,
  getAnalysisHistory,
  upsertAnalysisResult,
  saveAnalysisResultFromPython,
  getStocksByIds,
};
