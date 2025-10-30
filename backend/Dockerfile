FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# システムパッケージをインストール（OpenSSL を含む）
RUN apk add --no-cache openssl libssl3

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci

# ソースコードをコピー
COPY . .

# TypeScriptをビルド
RUN npm run build

# ポートを公開
EXPOSE 3000

# アプリケーションを起動
CMD ["npm", "start"]
