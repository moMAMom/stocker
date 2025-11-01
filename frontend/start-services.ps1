=== システム起動スクリプト ===
# PostgreSQL, バックエンド, Python分析エンジン, フロントエンドを順次起動

# 1. PostgreSQL 起動確認
netstat -ano | Select-String ':5432'

# 2. バックエンド起動
Start-Process powershell 'cd D:\code\PayPay\backend; npm start'

# 3. Python分析エンジン起動
Start-Process powershell 'cd D:\code\PayPay\analysis; .\venv\Scripts\Activate.ps1; python -m src.app'

# 4. フロントエンド起動（新規ターミナル推奨）
Start-Process powershell 'cd D:\code\PayPay\frontend; npm run dev -- --port 5174'
