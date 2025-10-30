/**
 * レスポンスフォーマットヘルパー
 * API レスポンスの一貫性を保つ
 */

import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}

/**
 * 成功レスポンス
 */
export const successResponse = <T>(
  res: Response,
  data?: T,
  message?: string,
  pagination?: ApiResponse['pagination'],
  status: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(status).json(response);
};

/**
 * エラーレスポンス
 */
export const errorResponse = (
  res: Response,
  error: string,
  status: number = 500
): Response => {
  return res.status(status).json({
    success: false,
    error,
  });
};

/**
 * ページネーション付きレスポンス
 */
export const paginationResponse = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): Response => {
  const pages = Math.ceil(total / limit);

  return successResponse(
    res,
    data,
    message,
    {
      page,
      limit,
      total,
      pages,
    }
  );
};
