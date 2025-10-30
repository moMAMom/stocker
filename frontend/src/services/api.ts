/**
 * API サービス層
 * バックエンド API への通信を担当
 */

import axios, { AxiosInstance } from 'axios';
import type { ApiResponse, PaginatedResponse, Stock, AnalysisResult } from '../types';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // ============ 銘柄管理 API ============

  /**
   * 全銘柄を取得
   */
  async getStocks(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sector?: string;
    market?: string;
  }): Promise<PaginatedResponse<Stock>> {
    const response = await this.client.get<PaginatedResponse<Stock>>('/stocks', {
      params,
    });
    return response.data;
  }

  /**
   * 単一銘柄を取得
   */
  async getStock(id: number): Promise<ApiResponse<Stock>> {
    const response = await this.client.get<ApiResponse<Stock>>(`/stocks/${id}`);
    return response.data;
  }

  /**
   * 銘柄を作成
   */
  async createStock(data: {
    symbol: string;
    name: string;
    market: string;
    sector?: string;
  }): Promise<ApiResponse<Stock>> {
    const response = await this.client.post<ApiResponse<Stock>>('/stocks', data);
    return response.data;
  }

  /**
   * 銘柄を更新
   */
  async updateStock(
    id: number,
    data: {
      name?: string;
      sector?: string;
      market?: string;
    }
  ): Promise<ApiResponse<Stock>> {
    const response = await this.client.put<ApiResponse<Stock>>(`/stocks/${id}`, data);
    return response.data;
  }

  /**
   * 銘柄を削除
   */
  async deleteStock(id: number): Promise<ApiResponse<void>> {
    const response = await this.client.delete<ApiResponse<void>>(`/stocks/${id}`);
    return response.data;
  }

  // ============ 分析結果 API ============

  /**
   * 銘柄の最新分析結果を取得
   */
  async getAnalysis(stockId: number): Promise<ApiResponse<AnalysisResult>> {
    const response = await this.client.get<ApiResponse<AnalysisResult>>(
      `/analysis/${stockId}`
    );
    return response.data;
  }

  /**
   * 銘柄の分析履歴を取得
   */
  async getAnalysisHistory(
    stockId: number,
    params?: { days?: number }
  ): Promise<ApiResponse<AnalysisResult[]>> {
    const response = await this.client.get<ApiResponse<AnalysisResult[]>>(
      `/analysis/${stockId}/history`,
      { params }
    );
    return response.data;
  }

  // ============ ポートフォリオ API ============

  /**
   * 全ポートフォリオを取得
   */
  async getPortfolios(): Promise<ApiResponse<any[]>> {
    const response = await this.client.get<ApiResponse<any[]>>('/portfolio');
    return response.data;
  }

  /**
   * ポートフォリオエントリを作成
   */
  async createPortfolioEntry(data: {
    portfolio_id: number;
    stock_id: number;
    quantity: number;
    purchase_price: number;
    purchase_date: string;
  }): Promise<ApiResponse<any>> {
    const response = await this.client.post<ApiResponse<any>>(
      `/portfolio/${data.portfolio_id}/entries`,
      data
    );
    return response.data;
  }

  /**
   * ポートフォリオエントリを更新
   */
  async updatePortfolioEntry(
    entryId: number,
    data: {
      quantity?: number;
      purchase_price?: number;
      purchase_date?: string;
    }
  ): Promise<ApiResponse<any>> {
    const response = await this.client.put<ApiResponse<any>>(
      `/portfolio/entries/${entryId}`,
      data
    );
    return response.data;
  }

  /**
   * ポートフォリオエントリを削除
   */
  async deletePortfolioEntry(entryId: number): Promise<ApiResponse<void>> {
    const response = await this.client.delete<ApiResponse<void>>(
      `/portfolio/entries/${entryId}`
    );
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
