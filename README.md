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
├── backend/                 # バックエンド（Node.js + Express.js）
├── frontend/                # フロントエンド（React + Vite）
├── analysis/                # 分析エンジン（Python）
├── Do/                      # 設計ドキュメント
├── docker-compose.yml       # Docker Compose 設定
├── .env.example             # 環境変数テンプレート
├── 00-project-rule.md       # プロジェクトルール
├── 01-project-progress.md   # 進捗管理
└── README.md                # このファイル
```

## セットアップ方法

### 前提条件

- Docker & Docker Compose
- Git
- Node.js 18+ （ローカル開発用）
- Python 3.11 （ローカル開発用）

### クイックスタート

1. **リポジトリをクローン**

```bash
git clone <repository-url>
cd PayPay
```

2. **環境変数を設定**

```bash
cp .env.example .env
# .env ファイルを編集して必要な値を設定
```

3. **Docker Compose で起動**

```bash
docker-compose up -d
```

4. **ブラウザで確認**

- フロントエンド: `http://localhost:5173`
- バックエンド API: `http://localhost:3000/api`
- API ドキュメント: `http://localhost:3000/api-docs`

## 開発ガイド

### ローカル開発環境での起動

#### バックエンド

```bash
cd backend
npm install
npm run dev
```

#### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

#### Python 分析エンジン

```bash
cd analysis
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m src.analyzer
```

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
pytest
```

### コード品質チェック

```bash
# バックエンド Lint
cd backend
npm run lint

# フロントエンド Lint
cd frontend
npm run lint
```

## API ドキュメント

API の詳細仕様は、以下のエンドポイントで Swagger UI として参照できます：

```
http://localhost:3000/api-docs
```

## データベーススキーマ

Prisma を使用してスキーマを管理しています。マイグレーションは以下で実行します：

```bash
cd backend
npx prisma migrate dev
```

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

### Docker コンテナが起動しない

```bash
# ログを確認
docker-compose logs

# コンテナを再起動
docker-compose restart

# クリーンアップして再起動
docker-compose down -v
docker-compose up -d
```

### データベース接続エラー

1. `.env` ファイルの `DATABASE_URL` が正しいか確認
2. PostgreSQL コンテナが起動しているか確認
3. 以下でマイグレーションを実行

```bash
cd backend
npx prisma migrate dev
```

### Python パッケージ不足エラー

```bash
cd analysis
pip install -r requirements.txt --upgrade
```

## ライセンス

MIT License

## サポート

問題が発生した場合は、GitHub Issues で報告してください。

---

**最終更新**: 2025-10-30
