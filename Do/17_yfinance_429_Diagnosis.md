# yfinance 429エラー検証プロンプト

**作成日　25/10/31**
**目的**: yfinance の 429 Too Many Requests エラーの根本原因を特定し、解決策を実装する

---

## 前提条件

- **プロジェクトパス**: `d:\code\PayPay`
- **現在のブランチ**: `main`
- **Docker コンテナ**: `paypay-analysis` (Python分析エンジン)

---

## ステップ1: 問題の診断

### 1-1. 米国株でのテスト（日本株特異性の確認）

```bash
# Docker内でPython対話セッションを開く
docker exec -it paypay-analysis python
```

以下をPython内で実行：

```python
import yfinance as yf
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# User-Agent付きセッションを作成
session = requests.Session()
retry_strategy = Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
adapter = HTTPAdapter(max_retries=retry_strategy)
session.mount("http://", adapter)
session.mount("https://", adapter)
session.headers.update({'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'})

# 米国株でテスト
print("=== 米国株テスト ===")
stock = yf.Ticker("AAPL", session=session)
df = stock.history(period='1d')
print(f"AAPL: {len(df)} rows")

# 日本株でテスト
print("\n=== 日本株テスト ===")
stock = yf.Ticker("6869.T", session=session)
df = stock.history(period='1d')
print(f"6869.T: {len(df)} rows")

exit()
```

**期待される結果**:

- ✅ 米国株は取得成功、日本株は失敗 → **日本株特異問題**
- ❌ 両方失敗 → **yfinance API全体の問題**
- ✅ 両方成功 → **環境設定の問題**

---

### 1-2. yfinance バージョン確認と更新

```bash
# バージョン確認
docker exec paypay-analysis python -c "import yfinance; print(f'yfinance: {yfinance.__version__}')"

# 最新版に更新（必要な場合）
docker exec paypay-analysis pip install --upgrade yfinance

# 更新後バージョン確認
docker exec paypay-analysis python -c "import yfinance; print(f'yfinance: {yfinance.__version__}')"
```

---

### 1-3. ローカル環境での検証（Docker外）

```bash
# ローカルPython環境でテスト（Windows PowerShell）
python -c "
import yfinance as yf
stock = yf.Ticker('6869.T')
df = stock.history(period='1d')
print(f'ローカル環境: {len(df)} rows')
"
```

**結果の解釈**:

- ✅ ローカルで成功 → **Docker ネットワーク問題**
- ❌ ローカルで失敗 → **yfinance 全体の問題**

---

## ステップ2: 根本原因の特定

診断結果に基づいて以下を確認：

### パターンA: 日本株のみ失敗

```
→ 原因: Yahoo Finance が日本株アクセスを制限している可能性
→ 対策: 代替データソースの導入（Alpha Vantage, finnhub など）
```

### パターンB: 両方失敗（Docker内）、ローカルで成功

```
→ 原因: Docker ネットワーク設定またはDNS問題
→ 対策: docker-compose.yml のネットワーク設定を見直す
```

### パターンC: 全環境で失敗

```
→ 原因: yfinance ライブラリの仕様変更またはAPI廃止
→ 対策: yfinance を最新版に更新、または別のライブラリに切り替え
```

---

## ステップ3: 対策の実装

診断結果に基づいて、以下のいずれかを実施：

### 対策1: 代替データソース導入（推奨）

**Alpha Vantage API を使用する場合:**

```bash
# 1. API キーを取得（https://www.alphavantage.co/）
# 2. requirements.txt に追加
pip install alpha_vantage

# 3. 環境変数に設定
# docker-compose.yml に ALPHA_VANTAGE_KEY を追加
```

### 対策2: yfinance 更新

```bash
# requirements.txt を確認
cat analysis/requirements.txt

# yfinance を最新版に更新
# analysis/requirements.txt の yfinance==0.2.32 を削除
# 以下を実行
docker-compose down
docker-compose up -d --build
```

### 対策3: Docker DNS 設定

```bash
# docker-compose.yml に DNS 設定を追加
services:
  analysis:
    dns:
      - 8.8.8.8
      - 1.1.1.1
```

---

## ステップ4: テストと検証

```bash
# コンテナを再起動
cd d:\code\PayPay
docker-compose down
docker-compose up -d --build

# ヘルスチェック
docker exec paypay-analysis python -c "
from src.data_fetch import DataFetcher
fetcher = DataFetcher()
df = fetcher.fetch_stock_data('6869.T', period='1d')
if df is not None and len(df) > 0:
    print(f'✅ 成功: {len(df)} rows')
else:
    print('❌ 失敗: データなし')
"

# 複数ティッカーでテスト
docker exec paypay-analysis python -c "
from src.data_fetch import DataFetcher
fetcher = DataFetcher()
tickers = ['6869.T', '1926.T', '8306.T']
results = fetcher.fetch_multiple_stocks(tickers, period='1d')
for ticker, df in results.items():
    status = '✅' if df is not None else '❌'
    print(f'{status} {ticker}: {len(df) if df is not None else 0} rows')
"
```

---

## ステップ5: 結果の報告

以下の情報を報告してください：

| 項目 | 結果 |
|:---|:---|
| **yfinanceバージョン** | `_____` |
| **米国株テスト結果** | `成功 / 失敗 / 429エラー` |
| **日本株テスト結果** | `成功 / 失敗 / 429エラー` |
| **ローカルテスト結果** | `成功 / 失敗 / 実施なし` |
| **根本原因の推測** | `日本株特異 / API全体 / Docker設定 / その他` |
| **推奨される対策** | `代替ライブラリ / API更新 / DNS設定変更 / その他` |

---

## 追加: デバッグ用ログ収集

```bash
# 分析エンジンのログを確認
docker logs paypay-analysis --tail 100

# yfinance の詳細ログを出力
docker exec paypay-analysis python -c "
import logging
logging.basicConfig(level=logging.DEBUG)
import yfinance as yf
stock = yf.Ticker('6869.T')
df = stock.history(period='1d')
" 2>&1 | Select-String -Pattern "429|error|failed" -CaseSensitive
```

---

## 結論

**このドキュメントを別セッションで実行し、ステップ1の診断結果をお知らせください。**

根本原因が特定されれば、最適な対策を実装いたします。
