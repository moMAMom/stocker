/**
 * ロギング ユーティリティ
 * Winston を使用した構造化ログ
 */

import winston from 'winston';

// ログレベルの定義
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// ログレベルの色設定
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// ログフォーマットの定義
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// トランスポート設定
const transports = [
  // コンソール出力
  new winston.transports.Console(),
  // ファイル出力
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  new winston.transports.File({
    filename: 'logs/all.log',
  }),
];

// ロガーの初期化
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  levels,
  format,
  transports,
});

export default logger;
