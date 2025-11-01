FROM node:20-slim

WORKDIR /app

# 依存関係インストール
COPY package*.json ./
RUN npm ci

# Prisma binary targets
ENV PRISMA_CLI_BINARY_TARGETS="debian-openssl-3.0.x"

# ソースコードコピー
COPY . .

# Prisma生成
RUN npx prisma generate

# ポート公開
EXPOSE 3000

# 起動コマンド
CMD ["npm", "run", "start"]