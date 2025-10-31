import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface StockRow {
  銘柄名: string;
  証券コード: string;
  カテゴリー: string;
}

async function main() {
  console.log('🌱 銘柄リスト初期投入を開始します...');

  try {
    // CSV ファイルを読み込む
    // Docker 環境では /app, ローカルでは ../paypay_securities_japanese_stocks.csv
    const csvPaths = [
      path.join(__dirname, '../paypay_securities_japanese_stocks.csv'),    // Docker & ローカル
      '/app/paypay_securities_japanese_stocks.csv',                        // Docker 内の絶対パス
    ];
    
    let csvPath = '';
    for (const p of csvPaths) {
      if (fs.existsSync(p)) {
        csvPath = p;
        console.log(`📂 CSV ファイルを検出: ${p}`);
        break;
      }
    }
    
    if (!csvPath) {
      console.warn(`⚠️ CSV ファイルが見つかりません`);
      console.warn(`  確認済みパス: ${csvPaths.join(', ')}`);
      console.warn('デフォルトのサンプルデータを使用します');
      
      // デフォルトのサンプル銘柄データ
      const sampleStocks = [
        { symbol: '9984.T', name: 'ソフトバンクグループ', market: 'TSE', sector: '日本株' },
        { symbol: '7203.T', name: 'トヨタ自動車', market: 'TSE', sector: '日本株' },
        { symbol: '6758.T', name: 'ソニーグループ', market: 'TSE', sector: '日本株' },
        { symbol: '4063.T', name: '信越化学工業', market: 'TSE', sector: '日本株' },
        { symbol: '9432.T', name: '日本電信電話', market: 'TSE', sector: '日本株' },
      ];

      await prisma.stock.deleteMany({});
      console.log('✅ 既存の銘柄を削除しました');

      for (const stock of sampleStocks) {
        await prisma.stock.create({ data: stock });
        console.log(`✅ 銘柄を作成: ${stock.symbol} - ${stock.name}`);
      }

      console.log(`\n🎉 初期投入完了: ${sampleStocks.length} 件`);
      return;
    }

    // CSV を読み込む
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as any[];

    console.log(`📊 ${records.length} 件の銘柄データを読み込みました`);
    if (records.length > 0) {
      console.log(`📝 最初のレコード: ${JSON.stringify(records[0])}`);
    }

    // 既存の銘柄を削除
    const deleteResult = await prisma.stock.deleteMany({});
    console.log(`✅ 既存の銘柄 ${deleteResult.count} 件を削除しました`);

    // 銘柄を投入
    let createdCount = 0;

    for (const row of records) {
      try {
        // 列名がどのようになっているか確認
        const stockCode = Object.entries(row).find(([key]) => 
          key.includes('証券コード') || key.includes('code')
        )?.[1];
        const stockName = Object.entries(row).find(([key]) => 
          key.includes('銘柄名') || key.includes('name')
        )?.[1];
        const category = Object.entries(row).find(([key]) => 
          key.includes('カテゴリー') || key.includes('category')
        )?.[1];

        if (!stockCode || !stockName) {
          console.warn(`⚠️ 必須フィールドが見つかりません: ${JSON.stringify(row)}`);
          continue;
        }

        const symbol = `${stockCode}.T`;
        
        await prisma.stock.create({
          data: {
            symbol,
            name: String(stockName),
            sector: String(category || '日本株'),
            market: 'TSE',
          },
        });

        createdCount++;
        if (createdCount % 50 === 0) {
          console.log(`✅ ${createdCount} 件作成完了...`);
        }
      } catch (error) {
        console.error(`❌ 銘柄の作成に失敗: ${JSON.stringify(row)} - ${error instanceof Error ? error.message : error}`);
      }
    }

    console.log(`\n🎉 初期投入完了: ${createdCount} 件作成`);

  } catch (error) {
    console.error('❌ 初期投入に失敗しました:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
