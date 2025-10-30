FROM python:3.11-slim

# 作業ディレクトリを設定
WORKDIR /app

# システムパッケージをインストール
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 依存関係ファイルをコピー
COPY requirements.txt .

# Python依存関係をインストール
RUN pip install --no-cache-dir -r requirements.txt

# ソースコードをコピー
COPY . .

# ポートを公開
EXPOSE 5000

# 分析エンジンを起動
CMD ["python", "-m", "src"]
