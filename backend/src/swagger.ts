import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PayPay 投資判断支援 API',
      version: '1.0.0',
      description: 'テクニカル分析に基づいた株式投資判断支援システムの REST API',
      contact: {
        name: 'PayPay Investment Helper',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'ローカル開発環境',
      },
      {
        url: 'https://api.example.com',
        description: '本番環境',
      },
    ],
    components: {
      schemas: {
        Stock: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '銘柄 ID',
              example: 1,
            },
            code: {
              type: 'string',
              description: '銘柄コード',
              example: '9984',
            },
            name: {
              type: 'string',
              description: '銘柄名',
              example: 'ソフトバンクグループ',
            },
            sector: {
              type: 'string',
              description: '業種',
              example: '情報・通信',
            },
            market: {
              type: 'string',
              description: '市場',
              example: '東証プライム',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '作成日時',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '更新日時',
            },
          },
        },
        AnalysisResult: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '分析結果 ID',
            },
            stockId: {
              type: 'integer',
              description: '銘柄 ID',
            },
            analysisDate: {
              type: 'string',
              format: 'date',
              description: '分析日',
            },
            signal: {
              type: 'string',
              enum: ['買い', '売り', '保有'],
              description: '買い/売り信号',
            },
            signalScore: {
              type: 'number',
              format: 'float',
              description: 'スコア（0-1.0）',
            },
            confidence: {
              type: 'number',
              format: 'float',
              description: '信頼度（0-1.0）',
            },
            ma5: {
              type: 'number',
              format: 'float',
              description: '5 日移動平均',
            },
            ma20: {
              type: 'number',
              format: 'float',
              description: '20 日移動平均',
            },
            ma50: {
              type: 'number',
              format: 'float',
              description: '50 日移動平均',
            },
            rsi: {
              type: 'number',
              format: 'float',
              description: 'RSI 値',
            },
            macd: {
              type: 'number',
              format: 'float',
              description: 'MACD 値',
            },
          },
        },
        Portfolio: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ポートフォリオ ID',
            },
            entries: {
              type: 'array',
              description: 'ポートフォリオエントリ',
              items: {
                type: 'object',
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              description: 'エラーメッセージ',
            },
            code: {
              type: 'string',
              description: 'エラーコード',
            },
          },
        },
      },
    },
  },
  apis: [
    './src/routes/stocks.ts',
    './src/routes/analysis.ts',
    './src/routes/portfolio.ts',
  ],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: false,
    },
    customCss: `.topbar { display: none }`,
  }));

  // JSON フォーマットのドキュメントも提供
  app.get('/api-docs.json', (req, res) => {
    res.json(specs);
  });
};

export default setupSwagger;
