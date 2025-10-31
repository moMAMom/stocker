/**
 * 銘柄リスト初期投入スクリプト
 * CSV から銘柄データを読み込み、データベースに投入
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import logger from '../src/utils/logger';

const prisma = new PrismaClient();

interface StockRow {
  銘柄名: string;
  証券コード: string;
  カテゴリー: string;
}

async function seedStocks() {
  try {
    logger.info('🌱 銘柄リスト初期投入を開始します...');

    // CSV ファイルを読み込む
    const csvPath = path.join(__dirname, '../../paypay_securities_japanese_stocks.csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV ファイルが見つかりません: ${csvPath}`);
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    
    // CSV を パース（日本語対応）
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      encoding: 'utf-8',
    }) as StockRow[];

    logger.info(`📊 ${records.length} 件の銘柄データを読み込みました`);

    // 既存の銘柄をクリア（オプション）
    // const deleteResult = await prisma.stock.deleteMany({});
    // logger.info(`既存の銘柄 ${deleteResult.count} 件を削除しました`);

    // 銘柄を投入
    let createdCount = 0;
    let skippedCount = 0;

    for (const row of records) {
      try {
        // 銘柄コードから .T サフィックスを作成（日本株）
        const symbol = `${row.証券コード}.T`;
        
        // 既存の銘柄をチェック
        const existingStock = await prisma.stock.findUnique({
          where: { symbol },
        });

        if (existingStock) {
          skippedCount++;
          logger.debug(`⏭️  既存銘柄をスキップ: ${row.銘柄名} (${symbol})`);
          continue;
        }

        // 新しい銘柄を作成
        await prisma.stock.create({
          data: {
            symbol,
            name: row.銘柄名,
            sector: row.カテゴリー || '日本株', // カテゴリーをセクターとして使用
            market: 'TSE', // Tokyo Stock Exchange
          },
        });

        createdCount++;
        logger.debug(`✅ 銘柄を作成しました: ${row.銘柄名} (${symbol})`);
      } catch (error) {
        logger.error(`❌ 銘柄の作成に失敗: ${row.銘柄名} (${row.証券コード}) - ${error instanceof Error ? error.message : error}`);
      }
    }

    logger.info(`✨ 銘柄リスト初期投入完了`);
    logger.info(`   作成: ${createdCount} 件`);
    logger.info(`   スキップ: ${skippedCount} 件`);

  } catch (error) {
    logger.error(`❌ 初期投入に失敗しました: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 実行
seedStocks();
