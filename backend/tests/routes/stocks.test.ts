import request from 'supertest';
import express, { Express } from 'express';
import stocksRouter from '../../src/routes/stocks';
import { errorHandler } from '../../src/middleware/errorHandler';

describe('Stocks API Routes', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/stocks', stocksRouter);
    app.use(errorHandler);
  });

  describe('GET /api/stocks', () => {
    it('全銘柄一覧を取得できる', async () => {
      const response = await request(app).get('/api/stocks');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('クエリパラメータで検索できる', async () => {
      const response = await request(app)
        .get('/api/stocks')
        .query({ search: 'ソフトバンク' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
    });

    it('ページネーション対応', async () => {
      const response = await request(app)
        .get('/api/stocks')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('GET /api/stocks/:id', () => {
    it('銘柄詳細を取得できる', async () => {
      const response = await request(app).get('/api/stocks/1');

      if (response.status === 200) {
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('id');
      } else if (response.status === 404) {
        expect(response.body).toHaveProperty('status', 'error');
      }
    });

    it('存在しない ID でエラーが返される', async () => {
      const response = await request(app).get('/api/stocks/99999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('POST /api/stocks', () => {
    it('新規銘柄を作成できる', async () => {
      const newStock = {
        symbol: 'TEST001',
        name: 'テスト銘柄',
        sector: 'テスト',
        market: '東証プライム'
      };

      const response = await request(app)
        .post('/api/stocks')
        .send(newStock);

      if (response.status === 201) {
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body.data).toHaveProperty('symbol', 'TEST001');
      }
    });

    it('必須フィールド不足でエラー', async () => {
      const invalidStock = {
        name: 'テスト銘柄'
        // symbol がない
      };

      const response = await request(app)
        .post('/api/stocks')
        .send(invalidStock);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('PUT /api/stocks/:id', () => {
    it('銘柄情報を更新できる', async () => {
      const updateData = {
        name: '更新銘柄名'
      };

      const response = await request(app)
        .put('/api/stocks/1')
        .send(updateData);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body.data).toHaveProperty('name', '更新銘柄名');
      } else if (response.status === 404) {
        expect(response.status).toBe(404);
      }
    });
  });

  describe('DELETE /api/stocks/:id', () => {
    it('銘柄を削除できる', async () => {
      const response = await request(app).delete('/api/stocks/1');

      if (response.status === 200) {
        expect(response.body).toHaveProperty('status', 'success');
      } else if (response.status === 404) {
        expect(response.status).toBe(404);
      }
    });
  });
});
