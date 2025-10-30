/**
 * CORS 設定
 * 本番環境と開発環境で異なる設定を適用
 * 作成日　25/10/30
 */

import { CorsOptions } from 'cors';

// ========================================
// CORS ホワイトリスト設定
// ========================================

const allowedOrigins = {
  development: ['*', 'http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  production: [
    'https://paypay-investment-helper.example.com',
    'https://www.paypay-investment-helper.example.com',
  ],
};

// ========================================
// CORS 設定オプション
// ========================================

export const corsOptions: CorsOptions = {
  // オリジン設定
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const currentAllowedOrigins =
      process.env.NODE_ENV === 'development' ? allowedOrigins.development : allowedOrigins.production;

    // リクエストにオリジンがない場合（例：Postman、curl など）
    if (!origin) {
      return callback(null, true);
    }

    // オリジンがホワイトリストに存在するかチェック
    if (
      currentAllowedOrigins.includes('*') ||
      currentAllowedOrigins.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },

  // 許可するメソッド
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  // 許可するヘッダー
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],

  // レスポンスヘッダーに含める
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Number',
    'X-Page-Size',
    'X-Request-ID',
    'Content-Length',
  ],

  // 認証情報を含めるか
  credentials: true,

  // プリフライトリクエストのキャッシュ時間（秒）
  maxAge: 86400, // 24時間

  // プリフライトリクエストの成功時のステータスコード
  optionsSuccessStatus: 200,
};

// ========================================
// 環境別 CORS 設定
// ========================================

export const getCorsConfig = (): CorsOptions => {
  if (process.env.NODE_ENV === 'production') {
    return {
      ...corsOptions,
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || allowedOrigins.production.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('CORS policy violation'));
        }
      },
    };
  }

  return corsOptions;
};
