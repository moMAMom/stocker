"""
PayPay Investment Helper - テクニカル分析エンジン メインエントリーポイント

このスクリプトはFlaskアプリケーションを起動します。
"""

import os
import sys
import logging

# ロギング設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    """メイン関数: Flask アプリケーションを起動"""
    try:
        from src.app import app
        
        port = int(os.getenv('PYTHON_SERVICE_PORT', 5000))
        
        logger.info(f"Starting PayPay Analysis Engine on port {port}")
        app.run(host='0.0.0.0', port=port, debug=False)
        
    except ImportError as e:
        logger.error(f"Failed to import app module: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Error starting application: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
