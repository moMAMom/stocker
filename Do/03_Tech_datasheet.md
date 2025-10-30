# 技術ドキュメント（データシート）

**最終更新：** 2025-10-30

---

## 1. 使用技術

本プロジェクトで採用する主要技術、フレームワーク、ライブラリ、ツールの詳細：

### 1.1 フロントエンド技術スタック

| 項目 | 技術 | バージョン | 用途 |
|------|------|-----------|------|
| フレームワーク | React | 18.x | UI フレームワーク、コンポーネント開発 |
| 言語 | TypeScript | 5.x | 型安全性、開発効率向上 |
| UI ライブラリ | Material-UI | 5.x | ダッシュボード、テーブル、フォーム UI |
| 状態管理 | Redux Toolkit | 1.9.x | 複数銘柄データの集中管理 |
| HTTP クライアント | Axios | 1.6.x | API 通信 |
| チャート表示 | Recharts | 2.x | テクニカル指標のグラフ描画 |
| ビルドツール | Vite | 5.x | 高速なビルド・開発サーバー |
| テスト | Jest + React Testing Library | 29.x | ユニットテスト、統合テスト |

**主要な理由：**

- React：コンポーネント指向で再利用性が高く、複数銘柄ダッシュボード表示に最適
- TypeScript：型チェックにより複雑なデータ構造を安全に扱える
- Material-UI：豊富な UI コンポーネントにより、開発効率が高い
- Redux Toolkit：複数銘柄の分析結果、ユーザー設定などを効率的に管理

### 1.2 バックエンド技術スタック

| 項目 | 技術 | バージョン | 用途 |
|------|------|-----------|------|
| ランタイム | Node.js | 18 LTS / 20 LTS | JavaScript/TypeScript 実行環境 |
| フレームワーク | Express.js | 4.18.x | REST API 構築、ルーティング |
| 言語 | TypeScript | 5.x | 型安全性、フロントエンドとの型共有 |
| データベース | PostgreSQL | 15.x | 銘柄データ、分析結果の永続化 |
| ORM | Prisma | 5.x | DB アクセス、マイグレーション管理 |
| スケジューラ | なし（手動更新） | - | ユーザーが UI から手動で更新実行 |
| 認証 | jsonwebtoken (JWT) | 9.x | ユーザー認証（将来対応） |
| 検証 | joi / express-validator | - | リクエストデータの検証 |
| ロギング | winston / pino | - | アプリケーション動作ログ |
| テスト | Jest + Supertest | 29.x | API テスト、ユニットテスト |

**主要な理由：**

- Node.js + Express.js：JavaScript/TypeScript で統一でき、開発効率が高い
- PostgreSQL：ACID トランザクション、大容量データ対応、JSON データ型対応
- Prisma：TypeScript サポートが優秀、自動スキーママイグレーション
- node-cron：軽量で使いやすいスケジューリング

### 1.3 テクニカル分析エンジン（Python）

| 項目 | 技術 | バージョン | 用途 |
|------|------|-----------|------|
| 言語 | Python | 3.11+ | テクニカル指標計算、データ処理 |
| 株価データ取得 | yfinance | 0.2.x | Yahoo Finance から株価データ取得 |
| テクニカル分析 | ta-lib / pandas-ta | 0.4.x | テクニカル指標計算（MA、RSI、MACD など） |
| データ処理 | pandas | 2.x | データ加工、時系列データ処理 |
| 数値計算 | numpy | 1.x | 行列計算、統計処理 |
| API 呼び出し | requests | 2.x | Express.js API への結果送信 |
| 環境管理 | python-dotenv | 1.x | 環境変数管理 |
| テスト | pytest | 7.x | Python スクリプトテスト |

**主要な理由：**

- Python：データ分析ライブラリが豊富、テクニカル計算に最適化
- yfinance：無料で株価データを簡単に取得可能
- ta-lib / pandas-ta：テクニカル指標の高精度計算

### 1.4 インフラ・デプロイ技術

| 項目 | 技術 | 用途 |
|------|------|------|
| コンテナ | Docker | 開発環境の再現性確保、デプロイメント簡素化 |
| コンテナ管理 | Docker Compose | ローカル開発環境の multi-container 管理 |
| CI/CD | GitHub Actions | 自動テスト、デプロイメント自動化 |
| バージョン管理 | Git + GitHub | ソースコード管理、協業 |
| デプロイ先 | Heroku / AWS EC2 / ローカルサーバー | 環境に応じた選択（要件次第） |
| リバースプロキシ | nginx | HTTP リクエスト振り分け（本番環境） |

---

## 2. 設計決定

### 2.1 アーキテクチャ パターン

**採用：レイヤード・モノリスアーキテクチャ**

```
┌────────────────────────────────────────┐
│   Presentation Layer (React UI)        │
│  [コンポーネント] [Redux 状態管理]     │
└────────────────┬───────────────────────┘
                 │ HTTP/REST
┌────────────────▼───────────────────────┐
│   API Layer (Express.js Routes)        │
│  [ルーティング] [ミドルウェア]          │
└────────────────┬───────────────────────┘
                 │
┌────────────────▼───────────────────────┐
│   Business Logic Layer                 │
│  [サービス] [ビジネスロジック]          │
└────────────────┬───────────────────────┘
                 │
┌────────────────▼───────────────────────┐
│   Data Access Layer (Prisma ORM)       │
│  [DB クエリ] [トランザクション]        │
└────────────────┬───────────────────────┘
                 │
┌────────────────▼───────────────────────┐
│   Database Layer (PostgreSQL)          │
│  [テーブル] [インデックス]             │
└────────────────────────────────────────┘
```

**理由：** 初期段階では単純で理解しやすく、ローカルサーバーでの実行に最適。将来的にマイクロサービスへの移行も可能。

### 2.2 データベーススキーマ

**主要テーブル設計：**

#### テーブル 1: `stocks`（銘柄マスタ）

```sql
CREATE TABLE stocks (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,        -- 銘柄コード（例：9984）
  name VARCHAR(255) NOT NULL,              -- 銘柄名
  sector VARCHAR(100),                     -- 業種
  market VARCHAR(50),                      -- 市場（東証 1 部など）
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### テーブル 2: `analysis_results`（分析結果）

```sql
CREATE TABLE analysis_results (
  id SERIAL PRIMARY KEY,
  stock_id INTEGER NOT NULL REFERENCES stocks(id),
  analysis_date DATE NOT NULL,             -- 分析日
  signal VARCHAR(20),                      -- 「買い」「売り」「保有」
  signal_score DECIMAL(3,2),               -- スコア（0-1.0）
  confidence DECIMAL(3,2),                 -- 信頼度（0-1.0）
  ma_5 DECIMAL(10,2),                      -- 5 日移動平均
  ma_20 DECIMAL(10,2),                     -- 20 日移動平均
  ma_50 DECIMAL(10,2),                     -- 50 日移動平均
  rsi DECIMAL(5,2),                        -- RSI 値
  macd DECIMAL(10,4),                      -- MACD 値
  signal_line DECIMAL(10,4),               -- シグナルライン
  histogram DECIMAL(10,4),                 -- ヒストグラム
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(stock_id, analysis_date)
);
```

#### テーブル 3: `technical_indicators`（テクニカル指標キャッシュ）

```sql
CREATE TABLE technical_indicators (
  id SERIAL PRIMARY KEY,
  stock_id INTEGER NOT NULL REFERENCES stocks(id),
  indicator_date DATE NOT NULL,
  close_price DECIMAL(10,2),               -- 終値
  volume BIGINT,                           -- 取引量
  high_price DECIMAL(10,2),                -- 高値
  low_price DECIMAL(10,2),                 -- 安値
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(stock_id, indicator_date)
);
```

#### テーブル 4: `portfolio`（ポートフォリオ）

```sql
CREATE TABLE portfolio (
  id SERIAL PRIMARY KEY,
  stock_id INTEGER NOT NULL REFERENCES stocks(id),
  entry_date DATE,                         -- 買付日
  exit_date DATE,                          -- 売却日（NULL = 保有中）
  entry_price DECIMAL(10,2),               -- 買付価格
  exit_price DECIMAL(10,2),                -- 売却価格
  quantity INTEGER,                        -- 数量
  notes TEXT,                              -- メモ
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**インデックス戦略：**

- `stocks.code` - クエリ速度向上
- `analysis_results.stock_id, analysis_results.analysis_date` - 最新分析結果検索の高速化
- `technical_indicators.stock_id, technical_indicators.indicator_date` - 時系列データアクセス最適化

### 2.3 API 仕様

#### エンドポイント一覧

**銘柄管理関連：**

```
GET    /api/stocks                    # 全銘柄取得（フィルタ対応）
POST   /api/stocks                    # 新規銘柄追加
GET    /api/stocks/:id                # 銘柄詳細取得
PUT    /api/stocks/:id                # 銘柄情報更新
DELETE /api/stocks/:id                # 銘柄削除
```

**分析結果関連：**

```
GET    /api/analysis/:stockId         # 分析結果取得
GET    /api/analysis/:stockId/history # 分析履歴取得（時系列）
```

**ポートフォリオ関連：**

```
GET    /api/portfolio                 # ポートフォリオ一覧
POST   /api/portfolio                 # ポートフォリオにエントリ追加
PUT    /api/portfolio/:id             # ポートフォリオエントリ更新
DELETE /api/portfolio/:id             # ポートフォリオエントリ削除
```

**例：GET /api/stocks レスポンス**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "code": "9984",
      "name": "ソフトバンクグループ",
      "sector": "情報・通信",
      "market": "東証プライム",
      "latestAnalysis": {
        "signal": "買い",
        "score": 0.78,
        "confidence": 0.85
      }
    }
  ]
}
```

### 2.4 認証・認可

**初期版：** シングルユーザーまたは簡易認証（省略可能）

**将来対応：** JWT ベースの認証

```
認証フロー：
1. ユーザー → /api/auth/login (email, password)
2. バックエンド → JWT トークン発行
3. フロントエンド → Authorization ヘッダーに JWT を付与
4. バックエンド → JWT 検証 → リクエスト処理
```

### 2.5 テクニカル指標計算ロジック

#### 買い/売り判定アルゴリズム（案）

```python
def calculate_signal(stock_data):
    """
    テクニカル指標に基づいて買い/売り/保有を判定
    """
    # 1. 移動平均線の計算
    ma_5 = stock_data['close'].rolling(5).mean()
    ma_20 = stock_data['close'].rolling(20).mean()
    ma_50 = stock_data['close'].rolling(50).mean()
    
    # 2. ゴールデンクロス/デッドクロス判定
    golden_cross = (ma_5 > ma_20) and (ma_5.shift(1) <= ma_20.shift(1))
    dead_cross = (ma_5 < ma_20) and (ma_5.shift(1) >= ma_20.shift(1))
    
    # 3. RSI 計算
    rsi = calculate_rsi(stock_data['close'])
    
    # 4. MACD 計算
    macd, signal_line, histogram = calculate_macd(stock_data['close'])
    
    # 5. スコア算出（複数指標の重み付け）
    signal_score = 0.0
    if golden_cross:
        signal_score += 0.4  # ゴールデンクロス：40%
    if rsi < 30:
        signal_score += 0.3  # RSI 売られ過ぎ：30%
    if macd > signal_line:
        signal_score += 0.3  # MACD ポジティブ：30%
    
    # 6. 判定ルール
    if signal_score >= 0.7:
        return "買い", signal_score
    elif signal_score <= 0.3:
        return "売り", signal_score
    else:
        return "保有", signal_score
```

**重要：** 実装時は過去データでのバックテストを実施し、判定ロジックの妥当性を検証すること。

---

## 3. 実装手順

### 3.1 フロントエンド実装手順

**ステップ 1: プロジェクト初期化**

```bash
npm create vite@latest stock-analyzer-frontend -- --template react-ts
cd stock-analyzer-frontend
npm install
npm install redux @reduxjs/toolkit react-redux
npm install @mui/material @emotion/react @emotion/styled
npm install recharts axios
```

**ステップ 2: ディレクトリ構造**

```
src/
├── components/
│   ├── StockListTable.tsx
│   ├── DashboardView.tsx
│   ├── FilterPanel.tsx
│   └── ChartComponent.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── DetailsPage.tsx
│   └── PortfolioPage.tsx
├── store/
│   ├── stockSlice.ts
│   ├── analysisSlice.ts
│   └── store.ts
├── services/
│   └── api.ts
├── types/
│   └── index.ts
└── App.tsx
```

**ステップ 3: Redux ストアセットアップ例**

```typescript
// store/stockSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Stock {
  id: number;
  code: string;
  name: string;
  latestAnalysis: { signal: string; score: number };
}

const stockSlice = createSlice({
  name: 'stocks',
  initialState: { items: [] as Stock[], loading: false },
  reducers: {
    setStocks: (state, action: PayloadAction<Stock[]>) => {
      state.items = action.payload;
    }
  }
});

export default stockSlice.reducer;
```

### 3.2 バックエンド実装手順

**ステップ 1: プロジェクト初期化**

```bash
npm init -y
npm install express typescript ts-node @types/express @types/node
npm install @prisma/client prisma dotenv
npm install axios node-cron
npm install --save-dev jest @types/jest ts-jest
```

**ステップ 2: Prisma セットアップ**

```bash
npx prisma init
# .env に DATABASE_URL を設定
# prisma/schema.prisma にテーブル定義
npx prisma migrate dev --name init
```

**ステップ 3: API ルーター例**

```typescript
// routes/stocks.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const stocks = await prisma.stocks.findMany();
  res.json(stocks);
});

router.post('/', async (req, res) => {
  const { code, name, sector } = req.body;
  const stock = await prisma.stocks.create({
    data: { code, name, sector }
  });
  res.json(stock);
});

export default router;
```

### 3.3 Python テクニカル分析実装手順

**ステップ 1: 環境構築**

```bash
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# または
venv\Scripts\activate     # Windows

pip install yfinance ta-lib pandas numpy requests python-dotenv
```

**ステップ 2: テクニカル指標計算スクリプト例**

```python
# analysis/technical.py
import yfinance as yf
import pandas as pd
from ta.momentum import RSIIndicator
from ta.trend import MACD

def fetch_stock_data(code: str, period: str = '1y'):
    """株価データを取得"""
    ticker = f"{code}.T"  # 日本株
    data = yf.download(ticker, period=period, progress=False)
    return data

def calculate_indicators(data: pd.DataFrame):
    """テクニカル指標を計算"""
    # 移動平均線
    data['MA5'] = data['Close'].rolling(5).mean()
    data['MA20'] = data['Close'].rolling(20).mean()
    data['MA50'] = data['Close'].rolling(50).mean()
    
    # RSI
    data['RSI'] = RSIIndicator(data['Close']).rsi()
    
    # MACD
    macd = MACD(data['Close'])
    data['MACD'] = macd.macd()
    data['Signal'] = macd.macd_signal()
    data['Histogram'] = macd.macd_diff()
    
    return data

def generate_signal(data: pd.DataFrame):
    """買い/売り判定を生成"""
    latest = data.iloc[-1]
    
    score = 0.0
    if latest['MA5'] > latest['MA20']:
        score += 0.4
    if latest['RSI'] < 30:
        score += 0.3
    if latest['MACD'] > latest['Signal']:
        score += 0.3
    
    if score >= 0.7:
        return "買い", score
    elif score <= 0.3:
        return "売り", score
    else:
        return "保有", score
```

**ステップ 3: スケジューラ（Node.js 側）**

```typescript
// scheduler/updateAnalysis.ts
import cron from 'node-cron';
import axios from 'axios';

cron.schedule('0 15 * * 1-5', async () => {
  // 平日 15:30 に実行（マーケット終了後）
  try {
    const response = await axios.post('http://localhost:5000/api/update-analysis');
    console.log('Analysis updated:', response.data);
  } catch (error) {
    console.error('Failed to update analysis:', error);
  }
});
```

---

## 4. ベストプラクティスと考慮事項

### 4.1 フロントエンド

- **コンポーネント設計：** 再利用可能な小さなコンポーネントに分割
- **状態管理：** Redux で複数銘柄のデータを一元管理
- **パフォーマンス：** React.memo、useMemo で不要なレンダリング抑制
- **エラーハンドリング：** API エラー時のユーザーフレンドリーなメッセージ表示
- **アクセシビリティ：** WCAG 2.1 ガイドラインに従った UI 設計

### 4.2 バックエンド

- **入力検証：** すべてのリクエストデータを検証（joi、express-validator）
- **エラーハンドリング：** 統一的なエラーレスポンス形式
- **ログ記録：** winston で詳細なログを記録、本番環境では外部サービスに送信
- **セキュリティ：** CORS 設定、レート制限、SQL インジェクション対策
- **API ドキュメント：** Swagger で API 仕様書を自動生成

### 4.3 データベース

- **バックアップ：** 本番環境では定期的なバックアップ実施
- **マイグレーション：** Prisma で スキーマ変更を管理、ダウンタイムなしで実施
- **インデックス：** パフォーマンス測定後、必要なインデックスを追加
- **トランザクション：** 複数テーブル更新時は ACID トランザクション保証

### 4.4 テクニカル分析

- **バックテスト：** 実装したロジックを過去 1 年のデータでテスト、勝率を検証
- **過学習回避：** 機械学習導入時は十分なテストデータセット確保
- **リスク管理：** 買い推奨でも必ず「損切りポイント」を提示
- **定期的な検証：** 月次で判定精度を検証、必要に応じてロジック調整

### 4.5 運用・保守

- **ログ監視：** 本番環境の異常を早期発見
- **パフォーマンス監視：** レスポンス時間、DB クエリ時間の可視化
- **定期テスト：** E2E テストで定期的に全フロー検証
- **セキュリティ更新：** 依存ライブラリの脆弱性定期確認、更新

### 4.6 スケーリング時の考慮

**初期版（シングルサーバー）での対応上限：**

- ユーザー：1-5 人
- 銘柄数：100-500
- 日次分析件数：最大 1000 件

**スケール拡張時：**

- キャッシュレイヤー（Redis）導入
- DB レプリケーション・読み取り専用レプリカ
- API の非同期処理化（Kafka、RabbitMQ）
- CDN による静的ファイル配信

---

## 5. 開発環境セットアップガイド

### 5.1 必須ツール

- Node.js 18 LTS 以上
- Python 3.11 以上
- PostgreSQL 15 以上
- Docker & Docker Compose
- Git

### 5.2 ローカル環境セットアップ

```bash
# リポジトリクローン
git clone <repository-url>
cd stock-analyzer

# バックエンド
cd backend
npm install
cp .env.example .env  # 環境変数設定
npx prisma migrate dev

# フロントエンド
cd ../frontend
npm install

# Python 環境
cd ../analysis
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Docker で実行
cd ..
docker-compose up
```

---

## 6. デプロイメント

### 6.1 本番環境チェックリスト

- [ ] 環境変数を本番用に設定（API キー、DB URL など）
- [ ] SSL 証明書をセットアップ（HTTPS）
- [ ] バックアップストレージを設定
- [ ] 監視・アラート設定（CPU、メモリ、DB）
- [ ] ログ集約サービスを設定
- [ ] CI/CD パイプラインをテスト
- [ ] 本番 DB マイグレーション実行
- [ ] セキュリティスキャン実施

### 6.2 推奨デプロイ先

**小規模（1-5 ユーザー）：**

- Heroku（シンプル、管理が容易）
- AWS Lightsail（固定費用、スケーラビリティあり）

**中規模以上：**

- AWS EC2 + RDS
- Google Cloud Platform
- DigitalOcean

---

## 7. 参考資料・リンク

- React 公式ドキュメント：<https://react.dev>
- Express.js 公式ドキュメント：<https://expressjs.com>
- Prisma ドキュメント：<https://www.prisma.io/docs>
- yfinance GitHub：<https://github.com/ranaroussi/yfinance>
- PostgreSQL 公式ドキュメント：<https://www.postgresql.org/docs>
