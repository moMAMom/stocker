# 本番DBマイグレーション計画

**作成日　25/10/30**
**更新日　25/10/30**

---

## マイグレーション概要

本番環境へのデータベース適用計画です。ダウンタイムを最小化しながら、安全かつ確実にスキーマ変更を適用します。

---

## 前提条件

- [ ] 本番DBのバックアップ完了
- [ ] テスト環境での検証完了
- [ ] ロールバック計画の策定完了
- [ ] 関係者への事前通知完了
- [ ] メンテナンスウィンドウの確保（夜間推奨）

---

## マイグレーション実行手順

### 1. 事前確認フェーズ

```bash
# データベース接続確認
psql postgresql://user:password@prod-db.example.com:5432/paypay_db -c "SELECT version();"

# 現在のスキーマバージョン確認
psql postgresql://user:password@prod-db.example.com:5432/paypay_db -c "\d"

# バックアップ確認
pg_dump -h prod-db.example.com -U user -d paypay_db -F c -f backup_$(date +%Y%m%d_%H%M%S).dump
```

### 2. 本番環境マイグレーション

#### ステップ 2-1: Prismaマイグレーション実行（ダウンタイム最小化）

```bash
# 本番環境用環境変数設定
export NODE_ENV=production
export DATABASE_URL="postgresql://user:secure_password@prod-db.example.com:5432/paypay_db"

# マイグレーション実行
npm run prisma:migrate:prod

# またはDocker経由
docker exec paypay-backend npx prisma migrate deploy
```

#### ステップ 2-2: インデックス作成（オンライン実行）

```sql
-- 非ロック型インデックス作成（CONCURRENTLY オプション使用）
CREATE INDEX CONCURRENTLY idx_stock_symbol ON "Stock"(symbol);
CREATE INDEX CONCURRENTLY idx_stock_market ON "Stock"(market);
CREATE INDEX CONCURRENTLY idx_analysis_result_stock_id ON "AnalysisResult"(stock_id);
CREATE INDEX CONCURRENTLY idx_analysis_result_signal ON "AnalysisResult"(signal);
CREATE INDEX CONCURRENTLY idx_analysis_result_date ON "AnalysisResult"(analysis_date);
CREATE INDEX CONCURRENTLY idx_technical_indicator_stock_id ON "TechnicalIndicator"(stock_id);
CREATE INDEX CONCURRENTLY idx_technical_indicator_date ON "TechnicalIndicator"(date);
CREATE INDEX CONCURRENTLY idx_portfolio_entry_portfolio_id ON "PortfolioEntry"(portfolio_id);
CREATE INDEX CONCURRENTLY idx_portfolio_entry_stock_id ON "PortfolioEntry"(stock_id);
CREATE INDEX CONCURRENTLY idx_portfolio_entry_purchase_date ON "PortfolioEntry"(purchase_date);
```

#### ステップ 2-3: データベース統計更新

```sql
-- テーブル統計を更新（クエリプラン最適化）
ANALYZE "Stock";
ANALYZE "AnalysisResult";
ANALYZE "TechnicalIndicator";
ANALYZE "Portfolio";
ANALYZE "PortfolioEntry";
```

### 3. 検証フェーズ

#### 3-1: マイグレーション成功確認

```bash
# Prismaスキーマバージョン確認
npx prisma migrate status

# テーブル構造確認
psql $DATABASE_URL -c "\d"

# インデックス確認
psql $DATABASE_URL -c "SELECT indexname FROM pg_indexes WHERE schemaname='public';"
```

#### 3-2: データ完全性チェック

```sql
-- レコード数確認
SELECT tablename, (SELECT COUNT(*) FROM table_name) as record_count 
FROM information_schema.tables 
WHERE table_schema='public';

-- 外部キー制約検証
SELECT * FROM information_schema.table_constraints 
WHERE constraint_type='FOREIGN KEY' AND table_schema='public';

-- ユニーク制約検証
SELECT * FROM information_schema.table_constraints 
WHERE constraint_type='UNIQUE' AND table_schema='public';
```

#### 3-3: アプリケーション接続テスト

```bash
# バックエンドAPI接続テスト
curl -X GET https://your-domain.com/api/stocks

# データベース応答時間測定
time curl -X GET https://your-domain.com/api/stocks?limit=100
```

### 4. パフォーマンス検証

```sql
-- スロークエリログ確認
SELECT query, calls, mean_exec_time, max_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- インデックス使用状況確認
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch 
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- テーブルスキャン数確認
SELECT schemaname, tablename, seq_scan, seq_tup_read, idx_scan, idx_tup_fetch 
FROM pg_stat_user_tables 
ORDER BY seq_scan DESC;
```

---

## ロールバック手順

### 緊急時のロールバック

```bash
# 前回のバックアップから復旧
pg_restore -h prod-db.example.com -U user -d paypay_db -c backup_YYYYMMDD_HHMMSS.dump

# または、Prismaマイグレーション巻き戻し
npx prisma migrate resolve --rolled-back "migration_name"
```

### Prismaマイグレーション巻き戻し

```bash
# 最後のマイグレーションを巻き戻し
npx prisma migrate resolve --rolled-back

# 特定のマイグレーションを巻き戻し
npx prisma migrate resolve --rolled-back "20250101000000_initial_migration"
```

---

## マイグレーション前チェックリスト

| 項目 | 確認内容 | 状態 |
|------|--------|------|
| バックアップ | 本番DBの完全バックアップ完了 | [ ] |
| テスト環境 | テスト環境でのマイグレーション成功 | [ ] |
| ロールバック計画 | ロールバック手順ドキュメント作成 | [ ] |
| 通知 | 関係者への事前通知完了 | [ ] |
| スケジュール | メンテナンスウィンドウ確保 | [ ] |
| 監視設定 | モニタリングツール動作確認 | [ ] |
| アラート設定 | エラーアラート設定完了 | [ ] |

---

## マイグレーション後チェックリスト

| 項目 | 確認内容 | 状態 |
|------|--------|------|
| スキーマ | 新しいテーブル構造確認 | [ ] |
| インデックス | 全インデックス作成完了 | [ ] |
| パフォーマンス | クエリ応答時間正常 | [ ] |
| アプリケーション | API動作確認 | [ ] |
| データ | レコード数検証 | [ ] |
| ログ | エラーログ確認 | [ ] |
| ユーザー機能 | 主要機能の動作確認 | [ ] |

---

## 本番適用予定

| フェーズ | 実行日時 | 担当者 | 状態 |
|---------|--------|------|------|
| 事前準備 | 2025-11-XX 18:00 | DevOps | [ ] |
| マイグレーション実行 | 2025-11-XX 20:00 | DBA | [ ] |
| 検証・テスト | 2025-11-XX 20:30 | QA | [ ] |
| 本番適用完了 | 2025-11-XX 21:00 | DevOps | [ ] |
| 監視・待機 | 2025-11-XX 21:00-23:00 | 全チーム | [ ] |

---

## トラブルシューティング

### 問題: マイグレーション時間が長い

**原因:** 大量データの処理、ロック競合

**解決方法:**

```bash
# バッチサイズ調整（Prismaの場合）
# ステップバイステップマイグレーション実行
npx prisma migrate deploy --skip-generate
```

### 問題: インデックス作成エラー

**原因:** 既存インデックスとの競合

**解決方法:**

```sql
-- 既存インデックス確認
SELECT * FROM pg_indexes WHERE schemaname='public' AND tablename='Stock';

-- 古いインデックス削除
DROP INDEX IF EXISTS idx_old_index;

-- 新しいインデックス再作成
CREATE INDEX CONCURRENTLY idx_stock_symbol ON "Stock"(symbol);
```

### 問題: 外部キー制約エラー

**原因:** データ参照整合性の問題

**解決方法:**

```sql
-- 不正な外部キーレコード確認
SELECT * FROM "AnalysisResult" 
WHERE stock_id NOT IN (SELECT id FROM "Stock");

-- 不正レコード削除
DELETE FROM "AnalysisResult" 
WHERE stock_id NOT IN (SELECT id FROM "Stock");
```

---

## 参考資料

- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [PostgreSQL Migration Guide](https://www.postgresql.org/docs/current/sql-altertable.html)
- [Zero Downtime Deployment](https://www.postgresql.org/docs/current/sql-createindex.html#SQL-CREATEINDEX-CONCURRENTLY)
