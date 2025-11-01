# プロジェクトルール

**作成日　25/10/30**
**更新日　25/11/01**

## 1. ファイル・フォルダ構造

プロジェクトのファイルとフォルダは整理され、明確な分類を行います。

```
PayPay/
├── Do/                          # 設計ドキュメント
│   ├── 01_Requirements.md       # プロジェクト要件
│   ├── 02_Tech_Roadmap.md       # 技術選択と開発ロードマップ
│   ├── 03_Tech_datasheet.md     # 技術補助資料
│   ├── 04_Tasks.md              # タスク分解と進捗管理
│   ├── 05_Integrity_Report.md   # 整合性報告書
│   ├── 06_DeveloperGuide.md     # 開発者ガイド
│   ├── 07_Deployment_Checklist.md # デプロイメントチェックリスト
│   ├── 08_Security_Checklist.md # セキュリティチェックリスト
│   ├── 09_Database_Migration_Plan.md # DBマイグレーションプラン
│   ├── 10_Implementation_Review.md # 実装レビュー
│   ├── 11_Implementation_Fixes.md # 実装修正
│   ├── 12_Implementation_Completion_Report.md # 実装完了報告
│   ├── 13_Latest_Fixes.md       # 最新修正
│   ├── 14_503ErrorResolution.md # 503エラー解決
│   ├── 15_Analysis_Function_Fix.md # 分析機能修正
│   ├── 16_Ticker_Symbol_Fix.md  # ティッカーシンボル修正
│   ├── 17_yfinance_429_Diagnosis.md # yfinance 429診断
│   ├── 18_yfinance_429_RootCause_Analysis.md # yfinance 429根本原因分析
│   ├── 19_yfinance_429_Implementation.md # yfinance 429実装
│   ├── BUGFIX_SUMMARY_429.md    # 429エラーバグフィックスサマリー
│   ├── BUGFIX_SUMMARY_503.md    # 503エラーバグフィックスサマリー
│   ├── ANALYSIS_FIX_SUMMARY.md  # 分析修正サマリー
│   ├── CODE_REVIEW_RESPONSE.md  # コードレビューレスポンス
│   ├── FINAL_ANALYSIS_FIX_REPORT.md # 最終分析修正報告
│   ├── FRONTEND_BLANK_SCREEN_TROUBLESHOOTING.md # フロントエンド空白画面トラブルシューティング
│   ├── NextPlan.md              # 次期計画
│   └── DESIGN_RULE.md           # 設計ルール
├── backend/                     # バックエンド（Node.js + Express.js + TypeScript）
│   ├── src/
│   │   ├── controllers/         # API コントローラ
│   │   ├── services/            # ビジネスロジック
│   │   ├── routes/              # ルート定義
│   │   ├── middleware/          # ミドルウェア
│   │   │   ├── errorHandler.ts  # エラーハンドリング（AppError、asyncHandler）
│   │   │   ├── validator.ts     # リクエスト検証（validateRequest、schemas）
│   │   │   ├── corsConfig.ts    # CORS 設定（getCorsConfig）
│   │   │   └── requestLogger.ts # ロギング（requestLogger、performanceLogger）
│   │   ├── models/              # データモデル
│   │   └── utils/               # ユーティリティ関数
│   ├── prisma/
│   │   ├── schema.prisma        # Prisma スキーマ
│   │   └── migrations/          # DB マイグレーション
│   ├── tests/                   # ユニットテスト・統合テスト
│   ├── package.json
│   ├── tsconfig.json
├── frontend/                    # フロントエンド（React + Vite + TypeScript）
│   ├── src/
│   │   ├── components/          # React コンポーネント
│   │   ├── pages/               # ページコンポーネント
│   │   ├── stores/              # Redux Slice
│   │   ├── services/            # API サービス層
│   │   ├── hooks/               # カスタム Hook
│   │   ├── types/               # TypeScript 型定義
│   │   └── utils/               # ユーティリティ関数
│   ├── public/                  # 静的ファイル
│   ├── tests/                   # ユニットテスト
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── analysis/                    # テクニカル分析エンジン（Python）
│   ├── src/
│   │   ├── indicators.py        # 技術指標計算
│   │   ├── analyzer.py          # 分析アルゴリズム
│   │   ├── data_fetch.py        # データ取得（yfinance）
│   │   ├── backtest.py          # バックテスト
│   │   └── utils.py             # ユーティリティ
│   ├── tests/                   # Python テスト
│   ├── requirements.txt
│   └── README.md
├── data/                        # データファイル
│   ├── paypay_securities_japanese_stocks.csv # 銘柄リストCSV
│   └── stocks.json              # 銘柄データJSON
├── postgres/                    # PostgreSQL関連ファイル
│   ├── init-tables.sql          # テーブル初期化SQL
│   ├── init.sql/                # 初期化スクリプト
│   ├── query.sql                # クエリ1
│   ├── query2.sql               # クエリ2
│   └── query3.sql               # クエリ3
├── onetime/                     # 一時的なファイル
│   ├── test_yfinance_debug.py   # yfinanceデバッグテスト
│   ├── test_yfinance_fix_integration.py # 統合テスト
│   ├── test_yfinance_fixed.py   # 修正テスト
│   ├── test_yfinance.py         # yfinanceテスト
│   ├── yfinance_diagnosis_1_1_revised.py # 診断スクリプト改訂
│   ├── yfinance_diagnosis_1_1.py # 診断スクリプト
│   ├── test_analysis_function.py # 分析機能テスト
│   ├── test_analysis_request.json # テストリクエストJSON
│   └── test_trigger.json         # トリガーテストJSON
├── logs/                        # ログファイル
├── .env.example                 # 環境変数テンプレート
├── .gitignore
├── README.md                    # プロジェクト概要
├── 00-project-rule.md           # このファイル
├── 01-project-progress.md       # プロジェクト進捗
└── docs/                        # その他ドキュメント

## 2. プロジェクト定数・クラス・型ヒント一覧

| 名前 | 型 | 説明 |
|:---|:---|:---|
| `API_PORT` | `number` | バックエンド API ポート（デフォルト: 3000） |
| `FRONTEND_PORT` | `number` | フロントエンド開発サーバーポート（デフォルト: 5173） |
| `PYTHON_SERVICE_PORT` | `number` | Python 分析エンジンポート（デフォルト: 5000） |
| `DATABASE_URL` | `string` | PostgreSQL データベース接続URL |
| `JWT_SECRET` | `string` | JWT トークンシークレット |
| `YFINANCE_TIMEOUT` | `number` | yfinance API タイムアウト（秒） |
| `ANALYSIS_INTERVAL` | `number` | 定期分析実行間隔（分） |
| `MAX_STOCKS` | `number` | 最大銘柄数 |
| `MA_PERIODS` | `array` | 移動平均線の期間（[5, 20, 50]） |
| `RSI_PERIOD` | `number` | RSI 計算期間（デフォルト: 14） |
| `MACD_FAST` | `number` | MACD 短期 EMA（デフォルト: 12） |
| `MACD_SLOW` | `number` | MACD 長期 EMA（デフォルト: 26） |
| `POLLING_INTERVAL_MS` | `number` | フロントエンド分析自動リロードポーリング間隔（ミリ秒、デフォルト: 500） |
| `MAX_POLLING_DURATION_MS` | `number` | 最大ポーリング期間（ミリ秒、デフォルト: 300000 = 5分） |
| `CSV_STOCK_LIST_PATH` | `string` | 銘柄リスト CSV ファイルパス（`paypay_securities_japanese_stocks.csv`） |
| `AppError` | `class` | カスタムエラークラス（statusCode、message、details） |
| `asyncHandler` | `function` | 非同期エラーハンドリングラッパー |
| `validateRequest` | `function` | リクエスト検証ミドルウェアファクトリー |
| `schemas` | `object` | 共通バリデーションスキーマ（stock、analysisResult、portfolio、portfolioEntry） |
| `corsOptions` | `CorsOptions` | CORS 設定オプション |
| `requestLogger` | `function` | リクエスト/レスポンスロギングミドルウェア |
| `performanceLogger` | `function` | パフォーマンスログミドルウェア |

## 3. ファイル命名規則

- **ファイル**: kebab-case（例：`error-handler.ts`）
- **クラス**: PascalCase（例：`StockService`）
- **関数**: camelCase（例：`calculateMovingAverage`）
- **定数**: UPPER_SNAKE_CASE（例：`MAX_RETRIES`）
- **型・インターフェース**: PascalCase（例：`IStock`、`Stock`）

## 4. コーディング原則

- **言語**: コメント・ドキュメントは日本語。コード内の文字列はユーザーに表示される場合を除き英語。
- **フォーマット**: ESLint + Prettier で自動フォーマット
- **型安全性**: TypeScript の strict mode を使用
- **テスト**: 単体テスト・統合テストを実装（カバレッジ目標 80%）
- **ログ**: Winston（Node.js）、Python logging で記録
- **単一責任**: 1 ファイル 1000 行以内、1 関数は 1 つの役割

## 5. Git コミット規則

```

[<type>] <subject>

<body>
```

- **type**: `feat`（機能）、`fix`（バグ修正）、`refactor`（リファクタリング）、`perf`（パフォーマンス）、`docs`（ドキュメント）、`style`（スタイル）、`test`（テスト）、`chore`（雑務）
- **subject**: 命令形、最初は大文字、末尾にピリオドなし

## 6. デプロイメント

- **開発環境**: ローカル実行（Node.js, Python, PostgreSQL）
- **ステージング環境**: TBD
- **本番環境**: TBD（Heroku / AWS 検討中）

## 7. 起動方法

### 開発環境起動（推奨）

1. **PostgreSQL の起動確認**
   ```powershell
   netstat -ano | Select-String ":5432"
   ```

2. **バックエンド起動**
   ```powershell
   cd backend
   npm start
   # http://localhost:3000 でアクセス
   ```

3. **Python 分析エンジン起動**
   ```powershell
   cd analysis
   .\venv\Scripts\Activate.ps1
   python -m src.app
   # http://localhost:5000 でアクセス
   ```

4. **フロントエンド起動（複数選択肢）**
   
   **方法A: 開発サーバー（推奨）**
   ```powershell
   cd frontend
   npm run dev -- --port 5174
   # http://localhost:5174 でアクセス
   ```
   
   **方法B: ビルド + 静的配信（安定）**
   ```powershell
   cd frontend
   npm run build
   cd dist
   python -m http.server 4173
   # http://localhost:4173 でアクセス
   ```

### トラブルシューティング

- **フロントエンドが起動しない場合**: 方法B の静的配信を使用
- **PowerShell バックグラウンド実行が不安定**: 複数ターミナルウィンドウを使用
- **ポート競合**: 異なるポート番号を指定（例: --port 5175）
