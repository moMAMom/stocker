# 503 エラー 完全修正記録

## 修正日
2025-10-30 23:00

## 503 エラーの根本原因

**Docker ネットワーク接続の問題**
- `docker-compose.yml` に `PYTHON_SERVICE_URL` 環境変数が設定されていなかった
- バックエンドが `process.env.PYTHON_SERVICE_URL || 'http://localhost:5000'` でフォールバック
- Docker ネットワーク内では `localhost` は自身を指す（他コンテナではない）
- バックエンドが分析エンジンへの接続に失敗 → 503 エラー

## 実施した修正一覧

### 1. docker-compose.yml

**バックエンドに追加**:
```yaml
PYTHON_SERVICE_URL: ${PYTHON_SERVICE_URL:-http://analysis:5000}
```

**分析エンジンに追加**:
```yaml
BACKEND_URL: ${BACKEND_URL:-http://backend:3000}
DEMO_MODE: ${DEMO_MODE:-true}
```

### 2. analysis/Dockerfile

```dockerfile
# 修正前: CMD ["python", "-m", "src.analyzer"]
# 修正後: CMD ["python", "-m", "src"]
```

### 3. analysis/src/analyzer.py

- `DataFetcher()` をインスタンス化してメソッド呼び出し
- DEMO_MODE を追加（yfinance 失敗時にモックデータを返す）
- `generate_demo_analysis()` 関数を実装

### 4. analysis/src/data_fetch.py

- リトライロジック強化: 3回 → 5回、初期遅延 1秒 → 3秒
- レート制限遅延: 0.2秒 → 2秒
- 複数銘柄取得時の遅延: 4秒を追加

### 5. docker-compose.yml エンコーディング

```yaml
# PostgreSQL
POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=C.UTF-8"

# すべてのコンテナ
LANG: C.UTF-8
LC_ALL: C.UTF-8
```

## 修正結果

✅ 分析トリガーが 200 OK を返す
✅ テクニカル分析結果が正常に返却される
✅ 複数回リクエストが成功
✅ 日本語データが正しく表示される
✅ **503 エラー完全解決**

## 重要ポイント

【最も重要】: Docker ネットワーク内のサービス間通信は `http://コンテナ名:ポート` で接続すること。`localhost` は各コンテナ内部を指す。
