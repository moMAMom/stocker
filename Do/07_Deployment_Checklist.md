# デプロイメント・本番環境チェックリスト

**作成日　25/10/30**
**更新日　25/10/30**

---

## 1. セキュリティチェック（T068: OWASP Top 10対策）

### ✅ 実装済み

- [x] **A01:2021 - Broken Access Control**
  - CORS設定: 本番環境で許可オリジン制限
  - 認証・認可: JWT検証ミドルウェア実装
  - APIレート制限: IP/エンドポイント別制限

- [x] **A02:2021 - Cryptographic Failures**
  - HTTPS強制: Strict-Transport-Security設定
  - SSL/TLS証明書: 本番用設定完備
  - 環境変数: シークレット管理推奨

- [x] **A03:2021 - Injection**
  - SQLインジェクション対策: Prisma ORM使用（パラメータ化クエリ）
  - XSS対策: セキュリティヘッダー（Content-Security-Policy）
  - コマンドインジェクション対策: シェルコマンド不使用

- [x] **A04:2021 - Insecure Design**
  - セキュアデザイン原則: レイヤード・モノリスアーキテクチャ
  - エラーハンドリング: 詳細エラー情報は開発環境のみ

- [x] **A05:2021 - Security Misconfiguration**
  - セキュリティヘッダー実装: X-Frame-Options、X-Content-Type-Options等
  - デバッグモード: 本番環境で無効化
  - ログレベル: 本番環境でwarn以上

- [x] **A06:2021 - Vulnerable and Outdated Components**
  - npm audit: CI/CDパイプラインで定期実行
  - 依存ライブラリ更新: 月次確認予定

- [x] **A07:2021 - Identification and Authentication Failures**
  - JWT実装: 有効期限・リフレッシュトークン対応
  - パスワード管理: bcryptハッシング推奨

- [x] **A08:2021 - Software and Data Integrity Failures**
  - 環境変数管理: .env.productionで機密情報管理
  - ビルド検証: GitHub Actionsで自動テスト実行

- [x] **A09:2021 - Logging and Monitoring Failures**
  - ロギング実装: winston/pino設定完備
  - 外部ログ送信: Sentry/CloudWatch設定可能

- [x] **A10:2021 - Server-Side Request Forgery (SSRF)**
  - URLバリデーション: validateUrl関数実装
  - 外部API呼び出し: リスト制限・タイムアウト設定

---

## 2. パフォーマンス最適化（T065-T067）

### 🔧 実装予定項目

#### T065: バックエンド APIレスポンス時間最適化

**目標:**

- GET /api/stocks: < 500ms
- GET /api/analysis/:stockId: < 300ms

**実装方法:**

- [ ] DBクエリ最適化（N+1クエリ問題排除）
- [ ] インデックス追加（以下参照）
- [ ] キャッシング層（Redis）導入検討

**チェック方法:**

```bash
# ローカルテスト
time curl http://localhost:3000/api/stocks

# Lighthouse/Chrome DevTools
# パフォーマンス分析
```

#### T066: フロントエンドバンドルサイズ最適化

**目標:**

- Initial JS bundle: < 300KB（gzip）
- Total JS: < 500KB（gzip）

**実装方法:**

- [ ] 不要なライブラリ削除（npm audit fix）
- [ ] コード分割（React.lazy）
- [ ] Tree-shaking有効化

**チェック方法:**

```bash
# バンドルサイズ確認
npm run build
ls -lh dist/assets/

# webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer
```

#### T067: データベースインデックス最適化

**推奨インデックス:**

```sql
-- 銘柄マスタ
CREATE INDEX idx_stocks_code ON stocks(code);
CREATE INDEX idx_stocks_created_at ON stocks(created_at DESC);

-- 分析結果
CREATE INDEX idx_analysis_results_stock_id_date 
  ON analysis_results(stock_id, analysis_date DESC);
CREATE INDEX idx_analysis_results_signal 
  ON analysis_results(signal, analysis_date DESC);

-- テクニカル指標キャッシュ
CREATE INDEX idx_technical_indicators_stock_date 
  ON technical_indicators(stock_id, indicator_date DESC);

-- ポートフォリオ
CREATE INDEX idx_portfolio_stock_id ON portfolio(stock_id);
CREATE INDEX idx_portfolio_entry_date ON portfolio(entry_date DESC);
CREATE INDEX idx_portfolio_open_positions 
  ON portfolio(stock_id) WHERE exit_date IS NULL;
```

**検証コマンド:**

```bash
# インデックス確認
\d stocks  # PostgreSQL

# クエリプラン確認
EXPLAIN ANALYZE SELECT * FROM analysis_results 
  WHERE stock_id = 1 ORDER BY analysis_date DESC LIMIT 1;
```

---

## 3. デプロイメント準備（T072-T075）

### T072: デプロイメント環境変数設定

**必須設定:**

```bash
# AWS Secrets Manager / HashiCorp Vault での管理
SECURE_DB_PASSWORD=****
SECURE_JWT_SECRET=****
SECURE_JWT_REFRESH_SECRET=****
SENTRY_DSN=****
```

**チェックリスト:**

- [ ] 本番DB認証情報設定
- [ ] JWT シークレット生成（強力な値）
- [ ] SSL証明書取得・設定
- [ ] CDN設定（CloudFront/Cloudflare）

### T073: CI/CDパイプライン設定

**既に実装済み**: `.github/workflows/ci-cd.yml`

**実行内容:**

- [x] バックエンドテスト（npm test）
- [x] フロントエンドテスト（npm test）
- [x] Pythonテスト（pytest）
- [x] E2Eテスト（Playwright）
- [x] セキュリティスキャン（npm audit）

### T074: 本番DBマイグレーション計画

**ステップ:**

1. **バックアップ実行**

   ```bash
   pg_dump paypay_prod_db > backup_25_10_30.sql
   aws s3 cp backup_25_10_30.sql s3://backups/
   ```

2. **マイグレーション実行**

   ```bash
   npx prisma migrate deploy --skip-generate
   ```

3. **動作確認**

   ```bash
   SELECT COUNT(*) FROM stocks;
   SELECT COUNT(*) FROM analysis_results;
   ```

4. **ロールバック手順**（失敗時）

   ```bash
   # 事前バックアップから復元
   psql paypay_prod_db < backup_25_10_30.sql
   ```

### T075: 本番環境へのデプロイ

**デプロイ方法（複数の選択肢）:**

#### Option 1: Heroku

```bash
heroku login
heroku create paypay-api
git push heroku main
heroku run npx prisma migrate deploy
heroku ps:scale web=1
```

#### Option 2: AWS EC2 + Docker

```bash
# ECRにイメージ登録
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.ap-northeast-1.amazonaws.com
docker tag paypay-api:latest <account>.dkr.ecr.ap-northeast-1.amazonaws.com/paypay-api:latest
docker push <account>.dkr.ecr.ap-northeast-1.amazonaws.com/paypay-api:latest

# EC2インスタンスで実行
docker pull <account>.dkr.ecr.ap-northeast-1.amazonaws.com/paypay-api:latest
docker-compose -f docker-compose.prod.yml up -d
```

#### Option 3: Google Cloud Run

```bash
gcloud builds submit --tag gcr.io/PROJECT/paypay-api
gcloud run deploy paypay-api \
  --image gcr.io/PROJECT/paypay-api \
  --platform managed \
  --region asia-northeast1
```

---

## 4. 本番環境確認（T076）

### リグレッションテスト

```bash
# 1. ヘルスチェック
curl https://api.example.com/health

# 2. API動作確認
curl https://api.example.com/api/stocks
curl https://api.example.com/api/analysis/1

# 3. E2Eテスト実行
npx playwright test --project=chromium

# 4. パフォーマンス確認
artillery quick -d 60 -r 10 https://api.example.com/api/stocks
```

### エラーログ確認

```bash
# Sentry/CloudWatch ダッシュボード確認
# - エラー発生有無
# - レスポンスタイム
# - エラー率（< 0.1%目標）
```

---

## 5. 運用・監視設定（T077-T078）

### T077: 監視・アラート設定

**CloudWatch メトリクス:**

```bash
# AWS CloudWatch でモニタリング設定
- CPUUtilization > 80% → アラート
- DatabaseConnections > 18 → アラート
- API Response Time > 1000ms → ワーニング
- Error Rate > 1% → 即座アラート
```

**通知先設定:**

- [ ] Slack統合（デプロイ・エラー通知）
- [ ] メール通知（Critical エラー）
- [ ] PagerDuty（オンコール）

### T078: ログ集約・分析設定

**ログ送信先:**

```bash
# Sentry（エラー追跡）
SENTRY_DSN=https://<key>@sentry.io/<project>

# CloudWatch Logs（ログ集約）
LOG_GROUP=/aws/paypay/api
LOG_RETENTION_DAYS=30

# Datadog（メトリクス・ログ）
DATADOG_API_KEY=****
DATADOG_APP_KEY=****
```

**ダッシュボード作成:**

- [ ] エラーレート推移
- [ ] レスポンスタイム分布
- [ ] DBクエリ実行時間
- [ ] ユーザーアクティビティ

---

## 6. 本番環境向けセキュリティチェック

### 事前確認項目

- [ ] **HTTPS有効化**: SSL/TLS証明書確認（有効期限等）
- [ ] **CORS設定**: 本番オリジンのみ許可
- [ ] **認証トークン**: JWT有効期限・リフレッシュ対応
- [ ] **ログローテーション**: ディスク容量管理
- [ ] **バックアップ**: 定期実行確認（毎日）
- [ ] **Secrets管理**: 環境変数を`.env.production`（Vault推奨）で一元管理
- [ ] **脆弱性スキャン**: npm audit完了

### 定期確認（月次）

- [ ] 依存ライブラリのセキュリティアップデート
- [ ] ログレビュー（異常なアクセスパターン等）
- [ ] バックアップ復元テスト
- [ ] ディザスタリカバリー計画の確認

---

## 7. ロールバック手順

### DB マイグレーション失敗時

```bash
# 1. バックアップから復元
pg_restore paypay_prod_db < backup_25_10_30.sql

# 2. Prisma スキーマをロールバック
git revert <migration-commit>
npx prisma migrate resolve --rolled-back migration_name

# 3. アプリケーション再起動
docker-compose restart api
```

### アプリケーションデプロイ失敗時

```bash
# 1. 前回の動作版に戻す
git revert HEAD
docker-compose rebuild api
docker-compose up -d api

# 2. ヘルスチェック確認
curl https://api.example.com/health
```

---

## 8. 承認・サインオフ

| 項目 | 責任者 | 完了日 |
|------|--------|--------|
| セキュリティレビュー | セキュリティチーム | ___________ |
| パフォーマンステスト | 開発チーム | ___________ |
| インフラ構築 | DevOps | ___________ |
| 最終確認 | プロジェクトマネージャー | ___________ |

---

## 9. 参考資料

- **OWASP Top 10**: <https://owasp.org/www-project-top-ten/>
- **AWS セキュリティベストプラクティス**: <https://docs.aws.amazon.com/>
- **Node.js セキュリティベストプラクティス**: <https://nodejs.org/en/docs/guides/security/>
- **Prisma マイグレーション**: <https://www.prisma.io/docs/concepts/components/prisma-migrate>
