# Docker移行計画書

**作成日：** 2025-11-01  
**作成者：** PayPay Investment Helper 開発チーム  
**最終更新：** 2025-11-01  

---

## 1. 序文

### 1.1 目的

本計画書は、PayPay Investment Helperプロジェクトをローカル実行環境からDockerコンテナ環境へ移行するための詳細な計画を記述する。移行により、以下の目標を達成する：

- **環境の一貫性確保：** 開発・テスト・本番環境間の差異を最小化
- **開発効率の向上：** セットアップ時間の短縮とチーム開発の容易化
- **デプロイメントの簡素化：** コンテナイメージによる本番環境への移行準備
- **スケーラビリティの基盤：** マイクロサービスアーキテクチャへの将来拡張

### 1.2 背景

現在のプロジェクトは、ローカルPostgreSQLインストールと4つのターミナルによる手動起動を前提とした構成である。この構成では、以下の課題が存在する：

- **環境依存性の問題：** Windows/Mac/Linux間での環境差異
- **セットアップの複雑さ：** 新規開発者参加時の環境構築負担
- **再現性の欠如：** ローカル環境での動作保証が困難
- **デプロイの難しさ：** 本番環境への移行が手動作業中心

機能面の動作確認が完了した現時点で、Docker移行を実施することで、これらの課題を解決しつつ、既存のふるまいを損なわない移行を実現する。

### 1.3 範囲と前提条件

**移行範囲：**

- バックエンドAPI（Node.js + Express + TypeScript）
- フロントエンド（React + Vite + TypeScript）
- 分析エンジン（Python 3.11 + Flask）
- データベース（PostgreSQL）
- 関連する設定ファイルとドキュメント

**前提条件：**

- Docker Engine 20.10+ がインストール済み
- Docker Compose v2.0+ が利用可能
- 既存の機能テストが全て通過している
- プロジェクトのソースコードがGitで管理されている

---

## 2. 現在の環境分析

### 2.1 アーキテクチャ概要

```
現在のローカル実行構成：
├── PostgreSQL (ローカルインストール)
├── バックエンド API (localhost:3000)
├── Python分析エンジン (localhost:5000)
├── フロントエンド (ビルド後静的配信 localhost:4173)
└── 手動起動 (4ターミナル)
```

### 2.2 各サービスの詳細

| サービス | 技術スタック | 現在の実行方法 | ポート | 依存関係 |
|---------|-------------|---------------|-------|---------|
| **バックエンド** | Node.js 18 + Express + TypeScript + Prisma | `npm run dev` | 3000 | PostgreSQL |
| **フロントエンド** | React 18 + Vite + TypeScript | `npm run build` → `python -m http.server 4173` | 4173 | バックエンドAPI |
| **分析エンジン** | Python 3.11 + Flask + yfinance + ta-lib | `python src/app.py` | 5000 | バックエンドAPI |
| **データベース** | PostgreSQL 14+ | ローカルサービス起動 | 5432 | なし |

### 2.3 既知の課題

- **環境差異：** Windows PowerShell vs Bashでのコマンド差異
- **依存関係管理：** Python venv, Node.js npmの個別管理
- **起動順序：** PostgreSQL → バックエンド → 分析エンジン → フロントエンド
- **レート制限：** yfinance APIの429エラー対策（内部リトライ実装済み）
- **ホットリロード：** 開発時の即時反映がローカル実行に依存

---

## 3. Docker移行の利点と課題

### 3.1 利点

#### 技術的利点

- **環境の一貫性：** 全環境で同一のコンテナイメージを使用
- **依存関係の分離：** 各サービスが独立したコンテナで実行
- **リソース管理：** CPU/メモリ制限、ネットワーク分離
- **バージョン管理：** Dockerイメージによるアプリケーションのバージョン固定

#### 開発・運用利点

- **セットアップ簡素化：** `docker-compose up` 一コマンドで全サービス起動
- **チーム開発効率：** 新規参加者の環境構築が数分で完了
- **CI/CD統合：** コンテナイメージによる自動デプロイ
- **スケーリング準備：** Kubernetes等への移行基盤

#### ビジネス的利点

- **デプロイ速度向上：** 本番環境への移行が迅速
- **障害復旧：** コンテナ再作成による迅速なリカバリ
- **コスト最適化：** リソース使用の最適化

### 3.2 課題と対策

#### 技術的課題

- **初回ビルド時間：** イメージビルドに時間がかかる
  - **対策：** マルチステージビルド、レイヤーキャッシュ活用
- **ホットリロード：** 開発時のファイル変更反映
  - **対策：** ボリュームマウント + nodemon/polling設定
- **パフォーマンス：** コンテナオーバーヘッド
  - **対策：** 適切なリソース制限、ネイティブ実行との比較検証

#### 運用課題

- **ログ管理：** 分散したコンテナログの集約
  - **対策：** docker-compose logs、ELKスタック検討
- **デバッグ難易度：** コンテナ内デバッグ
  - **対策：** docker exec、VS Code Dev Containers
- **ストレージ：** DBデータの永続化
  - **対策：** Docker volumes、バックアップ戦略

#### 既存ふるまいの維持

- **レート制限対策：** yfinanceの429エラーハンドリングを維持
- **API連携：** サービス間通信をコンテナネットワークで実現
- **環境変数：** 既存の.env設定をコンテナ環境に適応

---

## 4. 移行戦略

### 4.1 全体アーキテクチャ

```
Docker移行後の構成：
├── docker-compose.yml (オーケストレーション)
├── backend/ (Node.jsコンテナ)
├── frontend/ (Nginxコンテナ)
├── analysis/ (Pythonコンテナ)
└── postgres/ (PostgreSQLコンテナ)
    └── volumes/ (データ永続化)
```

### 4.2 コンテナ設計原則

- **1サービス1コンテナ：** 各マイクロサービスを独立コンテナ化
- **最小権限：** 各コンテナに必要な最小限の権限のみ付与
- **環境分離：** 開発/テスト/本番で異なるイメージを使用
- **ボリューム活用：** コード変更時はボリュームマウント、DBは永続ボリューム

### 4.3 ネットワーク設計

- **内部ネットワーク：** サービス間通信用（backend, analysis, postgres）
- **外部公開：** フロントエンド（ポート4173）、バックエンド（ポート3000）
- **セキュリティ：** 不要なポートは公開しない

### 4.4 データ移行戦略

- **DBデータ：** 既存ローカルDBからDockerコンテナへダンプ/リストア
- **設定ファイル：** .envファイルをコンテナ環境変数に変換
- **ログ：** コンテナログをホストボリュームにマウント

---

## 5. 必要なファイルと設定

### 5.1 Dockerfile（各サービス）

#### backend/Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 依存関係インストール
COPY package*.json ./
RUN npm ci --only=production

# ソースコードコピー
COPY . .

# Prisma生成
RUN npx prisma generate

# ポート公開
EXPOSE 3000

# 起動コマンド
CMD ["npm", "run", "start"]
```

#### frontend/Dockerfile

```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 本番用Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 4173
```

#### analysis/Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "src/app.py"]
```

#### postgres/Dockerfile（カスタム初期化用）

```dockerfile
FROM postgres:14-alpine

COPY init-tables.sql /docker-entrypoint-initdb.d/
COPY init.sql /docker-entrypoint-initdb.d/

EXPOSE 5432
```

### 5.2 docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    build: ./postgres
    environment:
      POSTGRES_USER: paypay
      POSTGRES_PASSWORD: paypay_password
      POSTGRES_DB: paypay_investment_helper
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./logs/postgres:/var/log/postgresql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U paypay"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://paypay:paypay_password@postgres:5432/paypay_investment_helper
      BACKEND_URL: http://localhost:3000
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run dev

  analysis:
    build: ./analysis
    environment:
      BACKEND_URL: http://backend:3000
    ports:
      - "5000:5000"
    depends_on:
      - backend
    volumes:
      - ./analysis:/app
    command: python src/app.py

  frontend:
    build: ./frontend
    ports:
      - "4173:4173"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 5.3 .dockerignore

```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.cache
logs/
onetime/
```

### 5.4 nginx.conf（フロントエンド用）

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 4173;
        server_name localhost;

        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://backend:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

---

## 6. 移行ステップ

### フェーズ 1：準備（1-2日）

1. **Docker環境確認**
   - Docker Desktopインストール・起動確認
   - docker-compose version確認

2. **既存データバックアップ**
   - ローカルPostgreSQLのダンプ取得
   - 設定ファイルのバックアップ

3. **Dockerfile作成**
   - 各サービスのDockerfile作成
   - マルチステージビルドの最適化

### フェーズ 2：設定ファイル作成（1日）

4. **docker-compose.yml作成**
   - サービス定義
   - ネットワーク設定
   - ボリューム設定

5. **環境変数調整**
   - .envファイルのコンテナ用修正
   - DATABASE_URLのホスト名変更（localhost → postgres）

6. **Nginx設定**
   - フロントエンド用nginx.conf作成
   - APIプロキシ設定

### フェーズ 3：ビルド・テスト（2-3日）

7. **イメージビルド**
   - docker-compose build実行
   - ビルド時間・サイズ確認

8. **単体起動テスト**
   - 各サービス個別起動確認
   - ログ確認・エラー修正

9. **統合テスト**
   - docker-compose up実行
   - 全サービス起動確認
   - 相互通信確認

### フェーズ 4：データ移行・検証（1-2日）

10. **データ移行**
    - PostgreSQLデータ移行
    - Prismaマイグレーション実行

11. **機能テスト**
    - APIエンドポイントテスト
    - 分析機能テスト
    - UI操作テスト

12. **パフォーマンス検証**
    - レスポンスタイム比較
    - リソース使用量確認

### フェーズ 5：ドキュメント更新・本番移行準備（1日）

13. **README更新**
    - Docker実行手順追加
    - トラブルシューティング更新

14. **プロジェクトルール更新**
    - Docker環境のフォルダ構造追加
    - 開発ワークフロー更新

15. **CI/CD準備**
    - GitHub Actionsワークフロー更新
    - イメージビルド自動化

---

## 7. テストと検証

### 7.1 テスト項目

#### 機能テスト

- [ ] PostgreSQLコンテナ起動・接続確認
- [ ] バックエンドAPI起動・ヘルスチェック
- [ ] 分析エンジン起動・API連携
- [ ] フロントエンドビルド・配信確認
- [ ] 全銘柄データ取得・表示
- [ ] 分析実行機能（手動トリガー）
- [ ] ポートフォリオ機能

#### パフォーマンステスト

- [ ] APIレスポンスタイム（< 2秒）
- [ ] 分析実行時間（< 30秒/銘柄）
- [ ] メモリ使用量（各コンテナ < 500MB）
- [ ] DBクエリ実行時間

#### 互換性テスト

- [ ] 既存.env設定の維持
- [ ] ローカル開発時のホットリロード
- [ ] ログ出力の継続性
- [ ] エラーハンドリングの維持

### 7.2 テスト環境

- **開発環境：** ローカルDocker実行
- **テスト環境：** Docker Compose + テストデータ
- **検証ツール：** Postman（API）、Playwright（E2E）

### 7.3 成功基準

- 全機能テスト100%通過
- パフォーマンス劣化 < 10%
- 起動時間 < 5分
- メモリ使用量 < 2GB（全コンテナ合計）

---

## 8. ロールバック計画

### 8.1 ロールバック条件

- 機能テスト失敗率 > 5%
- パフォーマンス劣化 > 20%
- クリティカルなセキュリティ問題発見
- 開発効率の大幅低下

### 8.2 ロールバック手順

1. **Dockerサービス停止**

   ```bash
   docker-compose down -v
   ```

2. **ローカル環境復元**
   - PostgreSQLサービス起動
   - バックアップデータリストア
   - 各サービス個別起動

3. **設定ファイル復元**
   - .envファイルのlocalhost復元
   - ローカル実行用スクリプト有効化

4. **動作確認**
   - 全機能テスト再実行
   - パフォーマンス確認

### 8.3 復旧時間目標

- **RTO（Recovery Time Objective）：** 4時間以内
- **RPO（Recovery Point Objective）：** 最新バックアップまで

---

## 9. リスク評価と対策

| リスク | 影響度 | 確率 | 対策 |
|-------|-------|------|------|
| コンテナビルド失敗 | 高 | 中 | ローカルテスト済みベースイメージ使用 |
| サービス間通信失敗 | 高 | 低 | Dockerネットワーク検証、ヘルスチェック実装 |
| DBデータ損失 | 極高 | 低 | 定期バックアップ、ボリューム永続化 |
| パフォーマンス劣化 | 中 | 中 | リソース制限設定、プロファイリング |
| 開発効率低下 | 中 | 中 | ホットリロード維持、開発用composeファイル |

---

## 10. 移行後の運用計画

### 10.1 開発ワークフロー

```bash
# 開発開始
docker-compose up -d

# コード変更（ホットリロード自動反映）
# テスト実行
docker-compose exec backend npm test
docker-compose exec analysis python -m pytest

# ログ確認
docker-compose logs -f backend
```

### 10.2 監視・保守

- **ログ集約：** docker-compose logs、ファイル出力
- **ヘルスチェック：** /healthエンドポイント実装
- **バックアップ：** PostgreSQL自動バックアップ
- **更新手順：** イメージリビルド + compose up

### 10.3 本番デプロイメント

- **イメージビルド：** `docker build -t paypay-app .`
- **レジストリ：** Docker HubまたはAWS ECR
- **オーケストレーション：** docker-compose（小規模）、Kubernetes（将来）

---

## 11. 結論

Docker移行により、PayPay Investment Helperプロジェクトは以下の改善を実現する：

- **開発効率：** セットアップ時間の90%削減
- **環境一貫性：** チーム間差異の完全解消
- **デプロイスピード：** 本番移行の自動化
- **保守性：** コンテナ化による運用簡素化

移行期間を2週間以内に抑え、既存機能の完全維持を前提として実施する。移行完了後は、マイクロサービス拡張やクラウドネイティブ化の基盤が整う。

---

## 12. 現在の進捗状況

**最終更新：** 2025-11-01  

### 完了したステップ

#### フェーズ 1：準備（完了）

1. **Docker環境確認**
   - Docker Engine 28.5.1 インストール済み ✓
   - Docker Compose v2.40.3 利用可能 ✓

2. **既存データバックアップ**
   - ローカルPostgreSQLが存在しないため、バックアップ不要 ✓

3. **Dockerfile作成**
   - backend/Dockerfile 作成 ✓
   - frontend/Dockerfile 作成 ✓
   - analysis/Dockerfile 作成 ✓
   - postgres/Dockerfile 作成 ✓

#### フェーズ 2：設定ファイル作成（完了）

4. **docker-compose.yml作成**
   - サービス定義、ネットワーク、ボリューム設定 ✓

5. **環境変数調整**
   - .envファイルのコンテナ用修正（DATABASE_URL: localhost → postgres） ✓

6. **Nginx設定**
   - frontend/nginx.conf 作成 ✓

#### フェーズ 3：ビルド・テスト（部分完了）

7. **イメージビルド**
   - docker-compose build 実行成功 ✓

8. **単体起動テスト**
   - PostgreSQLコンテナ起動成功 ✓
   - バックエンドコンテナ：Prisma OpenSSL問題で起動失敗 ✗
   - 分析エンジンコンテナ：未テスト
   - フロントエンドコンテナ：未テスト

### 残っているステップ

#### フェーズ 3：ビルド・テスト（継続中）

1. **単体起動テスト**
   - バックエンドのPrisma問題解決
   - 分析エンジン起動確認
   - フロントエンド起動確認

2. **統合テスト**
   - 全サービス起動確認
   - 相互通信確認

#### フェーズ 4：データ移行・検証

1. **データ移行**
   - PostgreSQLデータ移行（初期スキーマ適用）

2. **機能テスト**
   - APIエンドポイントテスト
   - 分析機能テスト
   - UI操作テスト

#### フェーズ 5：ドキュメント更新・本番移行準備

1. **README更新**
2. **プロジェクトルール更新**
3. **CI/CD準備**

### 発生している問題

#### バックエンドPrisma問題

- **問題：** Prisma ClientがOpenSSLライブラリを正しく検知できず、Query Engineの実行に失敗
- **エラー：** "Prisma Client could not locate the Query Engine for runtime "debian-openssl-1.1.x""
- **原因：** Node.js 20-slimコンテナ内でPrismaがOpenSSL 1.1.xを要求しているが、実際はOpenSSL 3.0.xがインストールされている
- **対策中：**
  - Prisma 6.18.0にアップデート済み
  - binaryTargetsを"debian-openssl-3.0.x"に設定
  - 環境変数PRISMA_CLI_BINARY_TARGETS設定
  - 引き続き解決策を模索中

#### その他の課題

- ローカルPostgreSQLが存在しないため、データ移行の検証ができない
- バックエンド問題解決後、統合テストを実施する必要がある

---

**承認：**  
プロジェクトマネージャー： _______________ 日付： _______________  

**実施者：**  
開発リーダー： _______________ 日付： _______________
