FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci

# ソースコードをコピー
COPY . .

# ポートを公開
EXPOSE 5173

# 開発サーバーを起動
CMD ["npm", "run", "dev"]
