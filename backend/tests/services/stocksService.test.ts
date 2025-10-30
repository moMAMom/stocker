import { PrismaClient } from '@prisma/client';
import * as stocksService from '../../src/services/stocksService';
import { AppError } from '../../src/middleware/errorHandler';

jest.mock('@prisma/client');

describe('StocksService', () => {
  let prismaMock: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    prismaMock = new PrismaClient() as jest.Mocked<PrismaClient>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllStocks', () => {
    it('全銘柄を取得できる', async () => {
      const mockStocks = [
        {
          id: 1,
          code: '9984',
          name: 'ソフトバンクグループ',
          sector: '情報・通信',
          market: '東証プライム',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      prismaMock.stocks.findMany = jest.fn().mockResolvedValue(mockStocks);

      const result = await stocksService.getAllStocks({
        skip: 0,
        take: 10,
        search: '',
        sector: '',
        market: ''
      });

      expect(result).toEqual(mockStocks);
      expect(prismaMock.stocks.findMany).toHaveBeenCalled();
    });

    it('エラーが発生した場合、例外をスロー', async () => {
      prismaMock.stocks.findMany = jest.fn().mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        stocksService.getAllStocks({
          skip: 0,
          take: 10,
          search: '',
          sector: '',
          market: ''
        })
      ).rejects.toThrow();
    });
  });

  describe('getStockById', () => {
    it('指定された ID の銘柄を取得できる', async () => {
      const mockStock = {
        id: 1,
        code: '9984',
        name: 'ソフトバンクグループ',
        sector: '情報・通信',
        market: '東証プライム',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.stocks.findUnique = jest.fn().mockResolvedValue(mockStock);

      const result = await stocksService.getStockById(1);

      expect(result).toEqual(mockStock);
      expect(prismaMock.stocks.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });

    it('銘柄が見つからない場合、エラーをスロー', async () => {
      prismaMock.stocks.findUnique = jest.fn().mockResolvedValue(null);

      await expect(stocksService.getStockById(999)).rejects.toThrow(
        AppError
      );
    });
  });

  describe('createStock', () => {
    it('新規銘柄を作成できる', async () => {
      const mockStock = {
        id: 2,
        code: '7974',
        name: 'ニッポン放送',
        sector: '放送',
        market: '東証プライム',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.stocks.findUnique = jest.fn().mockResolvedValue(null);
      prismaMock.stocks.create = jest.fn().mockResolvedValue(mockStock);

      const result = await stocksService.createStock({
        code: '7974',
        name: 'ニッポン放送',
        sector: '放送',
        market: '東証プライム'
      });

      expect(result).toEqual(mockStock);
      expect(prismaMock.stocks.create).toHaveBeenCalled();
    });

    it('重複したコードで銘柄を作成しようとするとエラー', async () => {
      prismaMock.stocks.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        code: '9984'
      });

      await expect(
        stocksService.createStock({
          code: '9984',
          name: 'ソフトバンクグループ',
          sector: '情報・通信',
          market: '東証プライム'
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe('updateStock', () => {
    it('銘柄情報を更新できる', async () => {
      const updatedStock = {
        id: 1,
        code: '9984',
        name: 'SoftBank Group',
        sector: '情報・通信',
        market: '東証プライム',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.stocks.findUnique = jest.fn().mockResolvedValue({ id: 1 });
      prismaMock.stocks.update = jest.fn().mockResolvedValue(updatedStock);

      const result = await stocksService.updateStock(1, {
        name: 'SoftBank Group'
      });

      expect(result).toEqual(updatedStock);
      expect(prismaMock.stocks.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'SoftBank Group' }
      });
    });

    it('存在しない銘柄を更新しようとするとエラー', async () => {
      prismaMock.stocks.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        stocksService.updateStock(999, { name: 'Test' })
      ).rejects.toThrow(AppError);
    });
  });

  describe('deleteStock', () => {
    it('銘柄を削除できる', async () => {
      prismaMock.stocks.findUnique = jest.fn().mockResolvedValue({ id: 1 });
      prismaMock.$transaction = jest
        .fn()
        .mockResolvedValue([{ id: 1 }]);

      await stocksService.deleteStock(1);

      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it('存在しない銘柄を削除しようとするとエラー', async () => {
      prismaMock.stocks.findUnique = jest.fn().mockResolvedValue(null);

      await expect(stocksService.deleteStock(999)).rejects.toThrow(AppError);
    });
  });
});
