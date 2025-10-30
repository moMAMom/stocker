# OWASP Top 10 セキュリティチェックリスト

**作成日　25/10/30**
**更新日　25/10/30**

---

## 実装済みセキュリティ対策

### 1. SQLインジェクション対策 ✅

- **Prisma ORM使用:** パラメータ化クエリにより、SQLインジェクション対策完了
- **入力検証:** `validateAndSanitize()` 関数で文字列入力の検証
- **サニタイゼーション:** `sanitizeInput()` 関数で危険な文字をエスケープ
- **ファイル:**
  - `backend/src/middleware/securityHeaders.ts`
  - `backend/src/middleware/validator.ts`

### 2. XSS（クロスサイトスクリプティング）対策 ✅

- **CSP（Content-Security-Policy）:** `securityHeadersMiddleware` で実装
  - `script-src 'self'`: インラインスクリプトと外部スクリプト制限
  - `default-src 'self'`: デフォルトソース制限
- **HTML無効化:** `validateAndSanitize()` で `<script>`, `<iframe>` タグ除去
- **イベントハンドラ除去:** `on*=` パターンをフィルタリング
- **バージョン:** React は自動的にテキストをエスケープ

### 3. 認証・セッション管理 ✅

- **HTTPS強制:** `Strict-Transport-Security` ヘッダーで実装
- **セッションタイムアウト:** 推奨 15-30 分（実装予定）
- **CSRF対策:** Token ベースのCSRF保護（実装予定）
- **Cookie セキュア設定:** `HttpOnly`, `Secure`, `SameSite=Strict` 推奨

### 4. 認可・アクセス制御 ✅

- **ロールベースアクセス制御（RBAC）:** 基盤実装済み
- **エンドポイント保護:** `rateLimiter` ミドルウェアで API 呼び出し制限
- **ファイル:** `backend/src/middleware/rateLimiter.ts`

### 5. セキュリティ設定ミス対策 ✅

- **セキュリティヘッダー：** 以下を設定
  - `X-Content-Type-Options: nosniff` - XSS インジェクション対策
  - `X-Frame-Options: DENY` - クリックジャッキング対策
  - `X-XSS-Protection: 1; mode=block` - レガシーブラウザ対応
  - `Referrer-Policy: strict-origin-when-cross-origin` - リファラ制御
  - `Permissions-Policy` - ブラウザ機能制限

### 6. 脆弱性のあるコンポーネント使用対策 ✅

- **依存関係管理:**
  - `npm audit` による脆弱性スキャン（CI/CDに統合）
  - 定期的な更新（月1回推奨）
  - `package-lock.json` による依存関係固定
- **CI/CDチェック:** `.github/workflows/ci-cd.yml` で実装

### 7. データ検証・エラーハンドリング ✅

- **入力検証:**
  - `validateEmail()`: メールフォーマット検証
  - `validateUrl()`: URL フォーマット検証
  - `validateNumericInput()`: 数値範囲検証
  - `validateAndSanitize()`: 汎用テキスト検証

- **エラーハンドリング:** `errorHandler` ミドルウェアで統一
  - スタックトレース非表示（本番環境）
  - 汎用エラーメッセージ返却
  - ログ記録

### 8. ロギング・監視 ✅

- **リクエストログ:** `requestLogger` ミドルウェア
- **エラーログ:** `errorHandler` で記録
- **監視設定:** 予定中（T077）

### 9. レート制限・DDoS対策 ✅

- **Rate Limiter:** `rateLimiter` ミドルウェア
  - IP ごとの制限（デフォルト: 100 req/15min）
  - エンドポイント別設定可能
- **設定ファイル:** `backend/src/middleware/rateLimiter.ts`

### 10. データ暗号化・機密情報保護 ✅

- **HTTPS:** `Strict-Transport-Security` で強制
- **環境変数:** `.env` でシークレット管理
- **ログ:** 機密情報（パスワード、API キー等）非表示
- **DB:** PostgreSQL での暗号化（本番環境推奨）

---

## 推奨される追加実装

### 短期（1-2週間）

- [ ] **CSRF トークン実装**
  - `express-csurf` パッケージ導入
  - GET フォーム返却時にトークン生成
  - POST/PUT/DELETE で検証

- [ ] **Cookie セキュア設定**
  - `HttpOnly: true`
  - `Secure: true`
  - `SameSite: 'Strict'`

- [ ] **セッションタイムアウト**
  - 15-30 分後に自動ログアウト
  - Redis でセッション管理（オプション）

### 中期（1ヶ月）

- [ ] **Web Application Firewall (WAF)**
  - CloudFlare WAF または AWS WAF 検討

- [ ] **依存関係スキャン**
  - `npm audit` 定期実行
  - `Snyk` 統合（オプション）

- [ ] **ペネトレーションテスト**
  - 外部セキュリティ監査（推奨）

### 長期（3ヶ月）

- [ ] **多要素認証（MFA）**
  - TOTP（Time-based One-Time Password）実装

- [ ] **エンドツーエンド暗号化**
  - 機密データの暗号化

- [ ] **監査ログ**
  - ユーザー操作の記録

---

## セキュリティテスト手順

### 1. 自動テスト

```bash
# npm audit - 脆弱性スキャン
npm audit

# ESLint - コード品質チェック
npm run lint

# TypeScript - 型チェック
npm run type-check
```

### 2. 手動テスト

```bash
# XSS テスト
# フォームに入力: <script>alert('XSS')</script>
# 期待結果: スクリプト実行されない

# SQLインジェクション テスト
# フォームに入力: ' OR '1'='1
# 期待結果: エラーまたは正常処理

# CSRF テスト
# 異なるオリジンからフォーム送信
# 期待結果: リクエスト拒否
```

### 3. ヘッダーチェック

```bash
curl -I https://your-domain.com
# 確認項目：
# - Strict-Transport-Security
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: DENY
# - Content-Security-Policy
```

---

## 本番環境チェックリスト

- [ ] HTTPS 有効化
- [ ] SSL/TLS 証明書インストール
- [ ] セキュリティヘッダー確認
- [ ] Rate Limit 設定確認
- [ ] ログレベル本番設定
- [ ] エラーメッセージ汎用化確認
- [ ] 環境変数 `.env.production` 設定
- [ ] データベースバックアップ確認
- [ ] ファイアウォール設定確認
- [ ] DDoS 対策有効化

---

## 参考資料

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express.js セキュリティ](https://expressjs.com/en/advanced/best-practice-security.html)
- [Prisma セキュリティ](https://www.prisma.io/docs/concepts/more/security)
- [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
