import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with sample stocks...');

  // サンプル銘柄データ
  const sampleStocks = [
    {
      symbol: '9984',
      name: 'ソフトバンクグループ',
      market: 'TSE',
      sector: '情報・通信業',
    },
    {
      symbol: '7203',
      name: 'トヨタ自動車',
      market: 'TSE',
      sector: '輸送用機械',
    },
    {
      symbol: '6758',
      name: 'ソニーグループ',
      market: 'TSE',
      sector: '電気・ガス業',
    },
    {
      symbol: '4063',
      name: '信越化学工業',
      market: 'TSE',
      sector: '化学',
    },
    {
      symbol: '9432',
      name: 'NTT',
      market: 'TSE',
      sector: '情報・通信業',
    },
    {
      symbol: '8306',
      name: '三菱UFJ銀行',
      market: 'TSE',
      sector: '銀行業',
    },
    {
      symbol: '4502',
      name: '武田薬品工業',
      market: 'TSE',
      sector: '医薬品',
    },
    {
      symbol: '7974',
      name: 'ニッポン高度紙工業',
      market: 'TSE',
      sector: '紙・パルプ',
    },
    {
      symbol: '6861',
      name: 'キーエンス',
      market: 'TSE',
      sector: '電気機器',
    },
    {
      symbol: '8031',
      name: '三井物産',
      market: 'TSE',
      sector: '卸売業',
    },
    {
      symbol: '6902',
      name: '横河電機',
      market: 'TSE',
      sector: '電気機器',
    },
    {
      symbol: '7186',
      name: 'コンコルディア・フィナンシャルグループ',
      market: 'TSE',
      sector: '銀行業',
    },
    {
      symbol: '8058',
      name: '三菱商事',
      market: 'TSE',
      sector: '卸売業',
    },
    {
      symbol: '1926',
      name: '黒田電気',
      market: 'TSE',
      sector: '卸売業',
    },
    {
      symbol: '6869',
      name: 'シスメックス',
      market: 'TSE',
      sector: '医療機器',
    },
  ];

  try {
    // 既存の銘柄を削除（テスト用）
    await prisma.stock.deleteMany({});
    console.log('✅ Cleared existing stocks');

    // 新しい銘柄を追加
    for (const stock of sampleStocks) {
      const created = await prisma.stock.create({
        data: stock,
      });
      console.log(`✅ Created stock: ${created.symbol} - ${created.name}`);
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log(`📊 Total stocks created: ${sampleStocks.length}`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
