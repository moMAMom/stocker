# PayPay Investment Helper

テクニカル分析に基づく投資判断支援Webアプリケーション

## プロジェクト概要

PayPay Investment Helper は、ユーザーが事前に準備した日本株の銘柄リストに対して、テクニカル指標に基づいて自動的に買い/売り判断を出力し、投資判断を支援するWebベースのアプリケーションです。

### コア機能

- **銘柄管理**: ユーザーが管理したい銘柄をリスト化
- **テクニカル分析**: 移動平均線、RSI、MACDなどの指標を自動計算
- **買い/売り判定**: 複数指標に基づいた確定的な買い/売りシグナル出力
- **ダッシュボード**: 銘柄ごとの分析結果と推移を可視化
- **ポートフォリオ追跡**: 実際の購入銘柄の成績記録・管理

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| **フロントエンド** | React 18 + Vite + TypeScript + Redux Toolkit + Material-UI |
| **バックエンド** | Node.js + Express.js + TypeScript |
| **データベース** | PostgreSQL + Prisma ORM |
| **分析エンジン** | Python 3.11 + yfinance + ta-lib |
| **インフラ** | Docker + Docker Compose |

## プロジェクト構造

```
PayPay/
├── backend/                 # バックエンド（Node.js + Express.js + TypeScript）
├── frontend/                # フロントエンド（React 18 + Vite + TypeScript）
├── analysis/                # 分析エンジン（Python 3.11 + yfinance + ta-lib）
├── Do/                      # 設計ドキュメント（19ファイル）
├── data/                    # データファイル（CSV、JSON）
├── postgres/                # PostgreSQL スクリプト
├── logs/                    # ログファイル
├── onetime/                 # 一時的なファイル
├── .env.example             # 環境変数テンプレート
├── 00-project-rule.md       # プロジェクトルール
├── 01-project-progress.md   # プロジェクト進捗
└── README.md                # このファイル
```

## セットアップ方法

### 前提条件（ローカル開発環境）

**このプロジェクトは Docker を使わずローカル実行します**

- **PostgreSQL 14+** （ローカルインストール・起動済み）
  - ユーザー: `paypay`
  - パスワード: `paypay_password`
  - ポート: `5432`
  - データベース: `paypay_investment_helper`
- **Node.js 18+** （npm 9+）
- **Python 3.11+** （pip 付属）
- **Git**

### クイックスタート

1. **リポジトリをクローン**

```bash
git clone <repository-url>
cd PayPay
```

2. **環境変数を設定**

```bash
cp .env.example .env
# 確認内容:
# DATABASE_URL=postgresql://paypay:paypay_password@localhost:5432/paypay_investment_helper
# BACKEND_URL=http://localhost:3000
```

3. **4つのターミナルで各サービスを起動**

**ターミナル 1: バックエンド API（Node.js）**

```powershell
cd backend
npm install
npm run prisma:migrate  # DB スキーマ作成
npm run prisma:generate
npm run prisma:seed     # 179銘柄データを投入
npm run dev
# ✅ http://localhost:3000 で起動
```

**ターミナル 2: Python 分析エンジン**

```powershell
cd analysis
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows PowerShell
pip install -r requirements.txt
python src/app.py
# ✅ http://localhost:5000 で起動
```

**ターミナル 3: フロントエンド ビルド**

```powershell
cd frontend
npm install
npm run build  # dist フォルダを生成
```

**ターミナル 4: フロントエンド サーバー（静的配信）**

```powershell
cd frontend\dist
python -m http.server 4173
# ✅ http://localhost:4173 で起動
```

4. **ブラウザで確認**

- **フロントエンド**: `http://localhost:4173`
- **バックエンド API**: `http://localhost:3000/api`
- **API ドキュメント**: `http://localhost:3000/api-docs`
- **Python 分析エンジン**: `http://localhost:5000`

## 開発ガイド

### ローカル開発環境での起動

**全4ターミナルを並行実行してください** （詳細は「クイックスタート」参照）

### テスト実行

```bash
# バックエンド テスト
cd backend
npm test

# フロントエンド テスト
cd frontend
npm test

# Python テスト
cd analysis
python -m pytest
```

### コード品質チェック

```bash
# バックエンド Lint + 型チェック
cd backend
npm run lint
npm run type-check

# フロントエンド Lint + 型チェック
cd frontend
npm run lint
npm run type-check
```

### 推奨される開発ワークフロー

1. **環境変数確認** → `cat .env`
2. **DB 準備** → `npm run prisma:migrate` (バックエンド)
3. **4ターミナル起動** → 各サービス起動
4. **ブラウザ確認** → `http://localhost:4173`
5. **分析テスト** → 「全銘柄を分析」ボタンをクリック
6. **ログ確認** → 各ターミナルで処理の進行状況を確認

## API ドキュメント

API の詳細仕様は、以下のエンドポイントで Swagger UI として参照できます：

- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/api-docs.json`

### 主要エンドポイント

**銘柄管理**:

- `GET /api/stocks` - 銘柄一覧取得（ページネーション対応）
- `GET /api/stocks/:id` - 銘柄詳細取得

**テクニカル分析**:

- `POST /api/analysis/trigger` - 手動分析実行（複数銘柄対応）
- `GET /api/analysis/:id` - 分析結果取得

**ポートフォリオ**:

- `GET /api/portfolio` - ポートフォリオ一覧
- `POST /api/portfolio` - ポートフォリオ追加
- `PUT /api/portfolio/:id` - ポートフォリオ更新
- `DELETE /api/portfolio/:id` - ポートフォリオ削除

## データベーススキーマ

Prisma を使用してスキーマを管理しています。

### マイグレーション実行

```bash
cd backend

# スキーマ変更をDBに反映
npm run prisma:migrate

# スキーマ確認
npx prisma studio

# 初期データ投入（CSV から 179銘柄）
npm run prisma:seed
```

### 主要テーブル

- **Stock**: 銘柄情報（ID、シンボル、名前、セクター等）- 179件
- **AnalysisResult**: テクニカル分析結果（MA、RSI、MACD等）
- **Portfolio**: ユーザーのポートフォリオ情報
- **AnalysisJob**: 分析ジョブの履歴・ステータス

## プロジェクト進捗

現在の進捗状況は `01-project-progress.md` を参照してください。

## ドキュメント

詳細なドキュメントは `Do/` フォルダに保存されています：

- `01_Requirements.md` - プロジェクト要件
- `02_Tech_Roadmap.md` - 技術選択と開発ロードマップ
- `03_Tech_datasheet.md` - 技術補助資料
- `04_Tasks.md` - タスク分解と進捗管理
- `05_Integrity_Report.md` - 整合性報告書

## プロジェクトルール

プロジェクト全体のルール、ファイル構造、コーディング規則は `00-project-rule.md` を参照してください。

## トラブルシューティング

### PostgreSQL 接続エラー

**症状**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**解決方法**:

1. PostgreSQL が起動しているか確認

   ```powershell
   # Windows: タスクマネージャーで postgres.exe を確認
   # または PostgreSQL サービスを確認
   ```

2. 接続情報を確認

   ```bash
   cat .env  # DATABASE_URL を確認
   ```

3. データベースが存在するか確認

   ```powershell
   psql -U paypay -d paypay_investment_helper -c "SELECT 1"
   ```

### バックエンド起動エラー

**症状**: `Error: P4001 Prisma schema not initialized`

**解決方法**:

```powershell
cd backend
npm run prisma:migrate
npm run prisma:generate
npm start
```

### フロントエンドが起動しない

**症状**: ポート 4173 で接続できない

**解決方法**:

```powershell
cd frontend/dist
# ポート確認
netstat -ano | Select-String ":4173"
# ポート使用中の場合は異なるポートで実行
python -m http.server 5000
```

### Python 分析エンジン エラー

**症状**: `ModuleNotFoundError: No module named 'yfinance'`

**解決方法**:

```powershell
cd analysis
pip install -r requirements.txt --upgrade
```

### yfinance API レート制限エラー（429）

**症状**: 多数の銘柄を分析すると HTTP 429 エラーが発生

**解決方法**:

- 分析リクエスト間隔を広げている（内部で 0.5-2 秒の遅延を実装）
- yfinance のバージョン確認: `pip show yfinance`（0.2.66 以上推奨）
- レート制限に達した場合は5分待機してから再実行

## プロジェクト進捗と詳細ドキュメント

### 進捗管理

- **全体進捗**: 98.7% （77/78 タスク完了）
- **最新更新**: 2025-11-01
- 詳細は `01-project-progress.md` を参照してください

### ドキュメント一覧

設計ドキュメント（`Do/` フォルダ）:

- `01_Requirements.md` - プロジェクト要件・仕様
- `02_Tech_Roadmap.md` - 技術選択と開発ロードマップ
- `03_Tech_datasheet.md` - 技術補助資料
- `04_Tasks.md` - タスク分解と進捗管理
- `06_DeveloperGuide.md` - 開発者ガイド

### プロジェクト規則

プロジェクト全体のルール、ファイル構造、コーディング規則は `00-project-rule.md` を参照してください。

## 主な機能

### ✅ 完成した機能

- 銘柄一覧表示（179 銘柄、ページネーション対応）
- テクニカル指標自動計算（MA、RSI、MACD等）
- 買い/売り判定（複数指標ベース）
- リアルタイム分析結果表示（自動ポーリング）
- ポートフォリオ追跡機能
- Swagger API ドキュメント

### 🔄 使用技術

| レイヤー | 技術スタック |
|---------|-------------|
| **フロントエンド** | React 18 + Vite + TypeScript + Redux Toolkit + Material-UI |
| **バックエンド** | Node.js + Express.js + TypeScript + Prisma ORM |
| **データベース** | PostgreSQL 14+ |
| **分析エンジン** | Python 3.11 + yfinance + ta-lib |
| **実行環境** | ローカル（Windows/Mac/Linux）|

## コントリビューション

バグ報告や機能提案は GitHub Issues でお願いします。

## ライセンス

MIT License

## サポート

問題が発生した場合は、GitHub Issues で報告してください。

---

**最終更新**: 2025-11-01  
**プロジェクトステータス**: 開発フェーズ 5 進行中 ✅
