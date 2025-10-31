# フロントエンド真っ白画面のトラブルシューティング

**作成日　25/10/31**

## 問題

- `http://localhost:5173/` にアクセスしても真っ白で何も見えない

## 診断手順

### Step 1: ブラウザのコンソールを確認

ブラウザで `http://localhost:5173` にアクセスし、**F12** キーを押して開発者ツールを開きます。

**「コンソール」タブで以下を確認:**

1. **エラーメッセージがあるか?**
   ```
   Uncaught Error: ...
   TypeError: ...
   CORS error: ...
   ```

2. **`console.log('App component rendered')` が表示されているか?**
   - 表示されていれば → React コンポーネントは正常にレンダリングされている
   - 表示されていなければ → React コンポーネントがレンダリングされていない

### Step 2: ネットワークリクエストを確認

**「ネットワーク」タブで以下を確認:**

1. **API リクエストの一覧:**
   - `http://localhost:3000/api/stocks` のステータスコードを確認
   - 200 OK ならバックエンド API は正常
   - 403/CORS error なら CORS 設定に問題あり
   - 500 ならバックエンド API に問題あり

2. **スタイルシート（CSS）の読み込み:**
   - `index.css` がロードされているか確認

### Step 3: 一般的な原因と対処法

#### 原因 1: Redux ストアの初期化エラー

**症状:**
- コンソールに Redux 関連のエラーが表示される
- `root` DOM ノードが見つからない

**対処法:**
```bash
# キャッシュをクリアして再起動
docker-compose down -v
docker-compose up -d
```

#### 原因 2: API の CORS エラー

**症状:**
- コンソールに CORS エラーが表示される
- ネットワークタブで `http://localhost:3000/api/stocks` が 403 を返す

**確認方法:**
```bash
# バックエンド API が正常に応答しているか確認
curl -s http://localhost:3000/api/stocks?limit=3
```

**対処法:**
- CORS 設定を確認: `backend/src/middleware/corsConfig.ts`
- `localhost:5173` がホワイトリストに含まれているか確認

#### 原因 3: JavaScript エラー

**症状:**
- コンソールに JavaScript エラーが表示される
- React コンポーネントがレンダリングされない

**確認方法:**
- コンソール内で以下を実行:
  ```javascript
  console.log(document.getElementById('root'))
  ```
  - `<div id="root"></div>` が返されれば DOM ノードは存在
  - `null` が返されれば HTML に `root` ノードがない

**対処法:**
- `frontend/index.html` の `<div id="root"></div>` を確認
- `frontend/src/main.tsx` の `ReactDOM.createRoot()` を確認

#### 原因 4: フロントエンドビルドエラー

**症状:**
- コンソールに Vite エラーが表示される
- フロントエンドコンテナのログにビルドエラーが表示される

**確認方法:**
```bash
# フロントエンドのログを確認
docker-compose logs frontend --tail=50
```

**対処法:**
```bash
# キャッシュをクリアして再ビルド
docker-compose down -v
docker system prune -a --volumes -f
docker-compose up -d --build
```

### Step 4: ブラウザリロード

上記の確認後、以下を実行:

1. **ブラウザのキャッシュをクリア**
   - Ctrl + Shift + Delete

2. **ページをリロード**
   - F5 または Ctrl + R

3. **ハードリロード（キャッシュを無視してリロード）**
   - Ctrl + Shift + R

## デバッグコマンド

### フロントエンドのビルドを確認
```bash
docker-compose exec frontend npm run build
```

### コンポーネントレンダリング確認
コンソールで以下を実行:
```javascript
// React DevTools がインストール済みなら
console.log(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)

// 現在のルート DOM ノードを確認
console.log(document.getElementById('root'))

// Redux ストアを確認（Redux DevTools がインストール済みなら）
console.log(window.__REDUX_DEVTOOLS_EXTENSION__)
```

### API 疎通確認
```bash
curl -v http://localhost:3000/api/stocks?limit=1
```

応答ヘッダーの確認:
- `Access-Control-Allow-Origin: http://localhost:5173` があるか

## 予想される症状別診断表

| 症状 | 原因候補 | 確認方法 |
|-----|--------|--------|
| 白い画面 + コンソールエラーなし | キャッシュ問題 | ハードリロード試行 |
| 白い画面 + Redux エラー | ストア初期化失敗 | `docker-compose down -v` 実行 |
| 白い画面 + CORS エラー | API へのアクセス拒否 | API CORS ヘッダー確認 |
| 白い画面 + JavaScript エラー | コンポーネント エラー | コンソール内容確認 |
| 白い画面 + Vite ビルドエラー | ビルド失敗 | フロントエンドログ確認 |
| Material-UI が表示されない | CSS 読み込み失敗 | ネットワークタブで CSS 確認 |

## よくある解決策

### すべてをクリアして再起動
```bash
# Docker をクリア
docker-compose down -v
docker system prune -a --volumes -f

# 再起動
docker-compose up -d

# ブラウザキャッシュをクリア
# (Ctrl + Shift + Delete を使用)

# ページにアクセス
# http://localhost:5173
```

### Vite デバッグモード
```bash
docker-compose logs frontend -f
```

### API 通信デバッグ
```bash
# ブラウザコンソールで実行
fetch('http://localhost:3000/api/stocks?limit=3', {
  headers: { 'Accept': 'application/json' }
})
.then(r => r.json())
.then(data => console.log(data))
.catch(err => console.error(err))
```

## ユーザー向け確認項目

**1. Docker が正常に起動しているか確認:**
```bash
docker-compose ps
```
すべてのコンテナが「Up」状態であることを確認

**2. ブラウザキャッシュをクリア:**
- Ctrl + Shift + Delete で キャッシュをクリア

**3. ページをハードリロード:**
- Ctrl + Shift + R で キャッシュを無視してリロード

**4. 開発者ツールのコンソールを確認:**
- F12 で開発者ツール を開く
- 「コンソール」タブでエラーメッセージを確認

**5. 以下を開発者ツールコンソールで実行:**
```javascript
// React コンポーネントが正常にレンダリングされているか確認
console.log(document.getElementById('root')?.innerHTML)

// API 疎通確認
fetch('http://localhost:3000/api/stocks?limit=1')
  .then(r => r.json())
  .then(d => console.log('API OK:', d))
  .catch(e => console.error('API Error:', e))
```

---

**最終更新**: 2025-10-31

