# 未実装事項・修正ガイド

**作成日　25/10/30**
**対象　本番デプロイ前の必須修正リスト**

---

## 🚨 必須修正 1: Swagger 統合の完了

### 現在の状態

Swagger ドキュメント設定は `backend/src/swagger.ts` で定義されていますが、`index.ts` で `setupSwagger(app)` が呼ばれていません。

### 修正方法

**ファイル**: `backend/src/index.ts`

**追加位置**: CORS 設定の直後、ミドルウェア設定セクション

```typescript
// 既存コード
import cors from 'cors';
dotenv.config();

const app: Express = express();
const PORT = process.env.API_PORT || 3000;

// ========================================
// ミドルウェア設定
// ========================================

// CORS 設定
app.use(cors(getCorsConfig()));

// 【ここに追加】Swagger 設定
import { setupSwagger } from './swagger';
setupSwagger(app);  // 👈 この行を追加

// JSON パーサー
app.use(express.json({ limit: '10mb' }));
```

### 確認方法

修正後、ブラウザで `http://localhost:3000/api-docs` にアクセスすると Swagger UI が表示されるはず。

---

## 🚨 必須修正 2: Python ↔ Express 同期メカニズムの完成

### 現在の状態

Python の分析エンジン（`analysis/src/app.py`）は独立した Flask アプリケーションで、分析結果を JSON で返すだけです。Express.js の PostgreSQL データベースに自動的に保存する機構が不完全です。

### 必要な実装

#### Step 1: Python 側での分析結果保存

**ファイル**: `analysis/src/app.py`

分析完了後、バックエンドの API エンドポイントに結果を POST で送信する処理を追加：

```python
@app.route("/analyze/<ticker>", methods=["GET"])
def analyze_stock(ticker: str):
    """
    単一銘柄を分析します。
    """
    try:
        period = request.args.get("period", "1y")

        # 分析を実行
        result = TechnicalAnalyzer.analyze_stock(ticker, period=period)

        if result is None:
            return jsonify({
                "error": "Failed to analyze stock",
                "ticker": ticker
            }), 400

        # 【新規追加】バックエンドに分析結果を保存
        try:
            save_response = requests.post(
                f"{BACKEND_URL}/api/analysis/save",
                json={
                    "ticker": ticker,
                    "analysis": result
                },
                timeout=10
            )
            if save_response.status_code != 201:
                logger.warning(f"Failed to save analysis to backend: {save_response.text}")
        except Exception as save_error:
            logger.error(f"Error saving analysis to backend: {str(save_error)}")
            # ここでは処理を続行（分析結果は返す）

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error analyzing stock {ticker}: {str(e)}")
        return jsonify({"error": str(e)}), 500
```

#### Step 2: Express.js 側での分析結果保存エンドポイント

**ファイル**: `backend/src/routes/analysis.ts` に追加

```typescript
/**
 * POST /api/analysis/save
 * Python 分析エンジンから分析結果を受け取って保存
 */
router.post('/save', analysisController.saveAnalysisResult);
```

#### Step 3: Controller に処理を追加

**ファイル**: `backend/src/controllers/analysisController.ts` に追加

```typescript
/**
 * POST /api/analysis/save
 * Python から送られてきた分析結果を DB に保存
 */
export const saveAnalysisResult = asyncHandler(async (req: Request, res: Response) => {
  const { ticker, analysis } = req.body;

  if (!ticker || !analysis) {
    throw new AppError('ticker と analysis は必須です。', 400);
  }

  try {
    // 銘柄を検索
    const stock = await prisma.stock.findUnique({
      where: { code: ticker }
    });

    if (!stock) {
      throw new AppError(`銘柄コード ${ticker} が見つかりません。`, 404);
    }

    // 分析結果を保存
    const result = await analysisService.saveAnalysisResult(stock.id, analysis);

    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    logger.error(`Error saving analysis for ${ticker}:`, error);
    throw error;
  }
});
```

#### Step 4: Service に処理を追加

**ファイル**: `backend/src/services/analysisService.ts` に追加

```typescript
/**
 * 分析結果を保存
 */
export async function saveAnalysisResult(stockId: number, analysis: any) {
  try {
    const result = await prisma.analysis_results.create({
      data: {
        stock_id: stockId,
        analysis_date: new Date().toISOString().split('T')[0], // 本日の日付
        signal: analysis.signal || 'hold',
        signal_score: analysis.composite_score || 0.5,
        confidence: analysis.confidence || 0.5,
        ma_5: analysis.ma_5,
        ma_20: analysis.ma_20,
        ma_50: analysis.ma_50,
        rsi: analysis.rsi,
        macd: analysis.macd,
        signal_line: analysis.signal_line,
        histogram: analysis.histogram,
      },
    });

    logger.info(`分析結果を保存しました: Stock ID ${stockId}`);
    return result;
  } catch (error) {
    logger.error('Error saving analysis result:', error);
    throw new AppError('分析結果の保存に失敗しました。', 500);
  }
}
```

---

## 🚨 必須修正 3: 手動分析実行エンドポイント（Express側）の完成

### 現在の状態

Python 側には `/analyze/batch` エンドポイントがありますが、Express.js 側から「分析を実行」ボタンをクリック時に呼び出すエンドポイントが未実装です。

### 修正方法

#### Step 1: Express.js に分析トリガーエンドポイントを追加

**ファイル**: `backend/src/routes/analysis.ts`

```typescript
/**
 * POST /api/analysis/trigger
 * ユーザーからの分析実行リクエストを受け付ける
 */
router.post('/trigger', analysisController.triggerAnalysis);
```

#### Step 2: Controller に実装

**ファイル**: `backend/src/controllers/analysisController.ts`

```typescript
/**
 * POST /api/analysis/trigger
 * Python 分析エンジンに分析を実行させる
 */
export const triggerAnalysis = asyncHandler(async (req: Request, res: Response) => {
  const { stockIds } = req.body; // 分析対象の銘柄 ID リスト

  if (!stockIds || !Array.isArray(stockIds) || stockIds.length === 0) {
    throw new AppError('stockIds は必須で、非空の配列である必要があります。', 400);
  }

  try {
    // 銘柄コードを取得
    const stocks = await prisma.stock.findMany({
      where: {
        id: {
          in: stockIds,
        },
      },
    });

    if (stocks.length === 0) {
      throw new AppError('指定された銘柄が見つかりません。', 404);
    }

    // Python に分析リクエストを送信
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';
    
    const tickers = stocks.map(stock => stock.code);
    
    const analysisResponse = await axios.post(
      `${pythonServiceUrl}/analyze/batch`,
      {
        tickers: tickers,
        period: '1y',
      },
      { timeout: 30000 } // 30 秒タイムアウト
    );

    logger.info(`分析リクエスト送信完了: ${tickers.join(', ')}`);

    res.json({
      status: 'success',
      message: '分析を開始しました。',
      analysis_count: stocks.length,
      results: analysisResponse.data,
    });

  } catch (error) {
    logger.error('Error triggering analysis:', error);
    if (axios.isAxiosError(error)) {
      throw new AppError('Python 分析エンジンへの接続に失敗しました。', 503);
    }
    throw error;
  }
});
```

#### Step 3: .env に Python サービスの URL を設定

**ファイル**: `.env`

```env
PYTHON_SERVICE_URL=http://python-analysis:5000
# または、開発環境ではローカルホスト
# PYTHON_SERVICE_URL=http://localhost:5000
```

---

## 🚨 必須修正 4: フロントエンドの分析実行ボタン実装

### 現在の状態

フロントエンドに「分析を実行」ボタンが配置されていないか、クリック時の処理が未実装です。

### 修正方法

#### Step 1: API サービスに分析トリガー関数を追加

**ファイル**: `frontend/src/services/api.ts`

```typescript
/**
 * 分析を実行
 */
export const triggerAnalysis = async (stockIds: number[]) => {
  try {
    const response = await axiosInstance.post('/analysis/trigger', {
      stockIds,
    });
    return {
      success: response.status === 200,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Unknown error',
    };
  }
};
```

#### Step 2: StocksPage にボタンを追加

**ファイル**: `frontend/src/pages/StocksPage.tsx`

```tsx
const StocksPage: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeAll = async () => {
    setIsAnalyzing(true);
    try {
      const response = await apiService.triggerAnalysis(items.map(item => item.id));
      if (response.success) {
        // 成功メッセージ表示
        alert('分析を開始しました。しばらく待ってから画面を更新してください。');
        // 自動更新（3秒後に再取得）
        setTimeout(() => {
          fetchStocks();
        }, 3000);
      } else {
        alert(`エラー: ${response.error}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAnalyzeAll}
        disabled={isAnalyzing || items.length === 0}
        sx={{ mb: 2 }}
      >
        {isAnalyzing ? '分析中...' : '全銘柄を分析'}
      </Button>
      {/* 既存のテーブル・フィルタ等 */}
    </Box>
  );
};
```

---

## 推奨修正 1: 自動スケジューラの実装

### 目的

定期的に全銘柄の分析を自動実行し、分析結果を更新する。

### 実装方法

#### Step 1: scheduler.ts を作成

**新規ファイル**: `backend/src/scheduler.ts`

```typescript
/**
 * 定期実行スケジューラー
 * node-cron を使用した自動分析実行
 */

import cron from 'node-cron';
import axios from 'axios';
import logger from './utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const initializeScheduler = () => {
  // 平日 15:30（日本の株式市場終了後）に実行
  cron.schedule('0 15 * * 1-5', async () => {
    logger.info('📊 定期分析を開始します...');

    try {
      // すべての銘柄を取得
      const stocks = await prisma.stock.findMany();

      if (stocks.length === 0) {
        logger.warn('分析対象の銘柄がありません。');
        return;
      }

      // Python に分析リクエストを送信
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';
      const tickers = stocks.map(stock => stock.code);

      const response = await axios.post(
        `${pythonServiceUrl}/analyze/batch`,
        {
          tickers,
          period: '1y',
        },
        { timeout: 60000 }
      );

      logger.info(`✅ 定期分析完了: ${stocks.length}銘柄を分析しました。`);

    } catch (error) {
      logger.error('❌ 定期分析でエラーが発生:', error);
    }
  });

  logger.info('🕐 スケジューラーを初期化しました (平日 15:30 に実行)');
};

export default initializeScheduler;
```

#### Step 2: index.ts でスケジューラーを初期化

**ファイル**: `backend/src/index.ts`

```typescript
import initializeScheduler from './scheduler';

// ... 既存コード ...

// サーバー起動
app.listen(PORT, () => {
  logger.info(`🚀 サーバーが起動しました: http://localhost:${PORT}`);
  
  // 【新規追加】スケジューラーを初期化
  if (process.env.NODE_ENV !== 'development' || process.env.ENABLE_SCHEDULER === 'true') {
    initializeScheduler();
  }
  
  logger.info(`📚 API ドキュメント: http://localhost:${PORT}/api-docs`);
});
```

#### Step 3: package.json で node-cron がインストール済みか確認

```bash
npm list node-cron
# インストール済みなら OK
# 未インストールなら: npm install node-cron @types/node-cron
```

---

## 推奨修正 2: JWT 認証・認可の実装

### 目的

シングルユーザーから複数ユーザー対応へ移行するための基盤。

### 実装方法

#### Step 1: 新規ミドルウェアファイルを作成

**新規ファイル**: `backend/src/middleware/auth.ts`

```typescript
/**
 * JWT 認証・認可ミドルウェア
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    throw new AppError('認証トークンが見つかりません。', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = (decoded as any).userId;
    req.user = decoded;
    next();
  } catch (error) {
    throw new AppError('無効なトークンです。', 401);
  }
};

/**
 * JWT トークンを生成
 */
export const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId, iat: Math.floor(Date.now() / 1000) },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};
```

#### Step 2: 認証エンドポイントを追加

**新規ファイル**: `backend/src/routes/auth.ts`

```typescript
import { Router } from 'express';
import { generateToken } from '../middleware/auth';

const router = Router();

/**
 * POST /api/auth/login
 * ユーザーログイン
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // 【簡易実装】本番環境では DB でユーザー検証が必須
  if (username === 'admin' && password === 'password') {
    const token = generateToken('admin');
    return res.json({
      status: 'success',
      token,
      message: 'ログインに成功しました。',
    });
  }

  return res.status(401).json({
    error: {
      status: 401,
      message: 'ユーザー名またはパスワードが間違っています。',
    },
  });
});

export default router;
```

---

## 推奨修正 3: Joi バリデーション統合

### 目的

バリデーションロジックを一元化し、保守性を向上。

### 実装方法

#### Step 1: Joi をインストール

```bash
npm install joi
npm install --save-dev @types/joi
```

#### Step 2: バリデーションスキーマを定義

**新規ファイル**: `backend/src/validators/schemas.ts`

```typescript
import Joi from 'joi';

export const stockCreateSchema = Joi.object({
  symbol: Joi.string().required().length(4).uppercase(),
  name: Joi.string().required().min(1).max(255),
  sector: Joi.string().optional().max(100),
  market: Joi.string().optional().max(50),
});

export const analysisQuerySchema = Joi.object({
  stockId: Joi.number().required().positive(),
  limit: Joi.number().optional().default(30).max(100),
  offset: Joi.number().optional().default(0),
});

export const portfolioEntrySchema = Joi.object({
  stock_id: Joi.number().required().positive(),
  entry_price: Joi.number().required().positive(),
  quantity: Joi.number().required().positive().integer(),
  entry_date: Joi.date().required(),
});
```

#### Step 3: バリデーションミドルウェアを作成

**新規ファイル**: `backend/src/middleware/validateSchema.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { AppError } from './errorHandler';

export const validateBody = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body);
      next();
    } catch (error: any) {
      throw new AppError(error.message, 400);
    }
  };
};

export const validateQuery = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.query);
      next();
    } catch (error: any) {
      throw new AppError(error.message, 400);
    }
  };
};
```

#### Step 4: ルートで使用

```typescript
import { validateBody } from '../middleware/validateSchema';
import { stockCreateSchema } from '../validators/schemas';

router.post('/', validateBody(stockCreateSchema), stocksController.createStock);
```

---

## チェックリスト

本番デプロイ前に以下の修正が完了しているか確認してください。

### 必須修正

- [ ] Swagger 統合の追加（修正1）
- [ ] Python ↔ Express 同期メカニズム（修正2）
- [ ] 手動分析実行エンドポイント（修正3）
- [ ] フロントエンド分析ボタン（修正4）

### 推奨修正

- [ ] 自動スケジューラ実装（推奨1）
- [ ] JWT 認証・認可（推奨2）
- [ ] Joi バリデーション（推奨3）

### テスト

- [ ] 全エンドポイントの統合テスト実行
- [ ] E2E テスト全シナリオ実行
- [ ] セキュリティテスト実施

---

**作成日**: 2025年10月30日
**修正ガイドバージョン**: 1.0

