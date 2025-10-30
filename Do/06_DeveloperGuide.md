开发者指南 - 簡潔版

**作成日　25/10/30**
**更新日　25/10/30**

## セットアップ

```bash
git clone https://github.com/moMAMom/stocker.git
cd stocker
cp .env.example .env
docker-compose up -d
```

### バックエンド

```bash
cd backend && npm install && npm run dev
```

### フロントエンド

```bash
cd frontend && npm install && npm run dev
```

### Python分析エンジン

```bash
cd analysis && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python src/app.py
```

## プロジェクト構造

- `backend/`: Express.js API + Prisma
- `frontend/`: React + TypeScript + Redux
- `analysis/`: Python + Flask テクニカル分析
- `Do/`: 設計ドキュメント

## 技術スタック

- バックエンド: Node.js + Express + TypeScript + Prisma
- フロントエンド: React + TypeScript + Redux + Material-UI
- DB: PostgreSQL
- 分析: Python + yfinance + pandas

## 開発ワークフロー

1. `git checkout -b feature/機能名`
2. コード実装
3. テスト追加・実行
4. `git commit -m "[feat] 説明"`
5. プッシュ・PR作成

## テスト実行

```bash
# バックエンド
cd backend && npm run test

# フロントエンド
cd frontend && npm run test

# E2E
cd frontend && npm run test:e2e

# Python
cd analysis && pytest
```

## 主要ファイル

| ファイル | 説明 |
|---------|------|
| `backend/src/index.ts` | バックエンド エントリーポイント |
| `frontend/src/App.tsx` | フロント メインアプリ |
| `analysis/src/app.py` | Python API サーバー |
| `prisma/schema.prisma` | DB スキーマ |

---

**最終更新**: 2025-10-30
