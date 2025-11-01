/**
 * 分析ジョブ管理サービス
 * バックグラウンド分析のステータス追跡
 */

import { randomUUID } from 'crypto';
import logger from '../utils/logger';
import prisma, { ensureUtf8Encoding } from '../utils/prismaClient';

export interface AnalysisJobData {
  stockIds: number[];
  tickers: string[];
}

export interface AnalysisJobStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalCount: number;
  processedCount: number;
  successCount: number;
  failedCount: number;
  errorMessage?: string;
  startedAt: Date;
  completedAt?: Date;
}

/**
 * 新しい分析ジョブを作成
 */
export async function createAnalysisJob(data: AnalysisJobData): Promise<string> {
  const jobId = randomUUID();
  
  await prisma.analysisJob.create({
    data: {
      job_id: jobId,
      status: 'pending',
      stock_ids: data.stockIds.join(','),
      tickers: data.tickers.join(','),
      total_count: data.stockIds.length,
      processed_count: 0,
      success_count: 0,
      failed_count: 0,
    },
  });

  logger.info(`分析ジョブ作成: ${jobId} (${data.stockIds.length}銘柄)`);
  return jobId;
}

/**
 * ジョブステータスを更新
 */
export async function updateAnalysisJobStatus(
  jobId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  updates?: {
    processedCount?: number;
    successCount?: number;
    failedCount?: number;
    errorMessage?: string;
  }
): Promise<void> {
  const updateData: any = {
    status,
    updated_at: new Date(),
  };

  if (updates?.processedCount !== undefined) {
    updateData.processed_count = updates.processedCount;
  }
  if (updates?.successCount !== undefined) {
    updateData.success_count = updates.successCount;
  }
  if (updates?.failedCount !== undefined) {
    updateData.failed_count = updates.failedCount;
  }
  if (updates?.errorMessage) {
    updateData.error_message = updates.errorMessage;
  }
  if (status === 'completed' || status === 'failed') {
    updateData.completed_at = new Date();
  }

  await prisma.analysisJob.update({
    where: { job_id: jobId },
    data: updateData,
  });

  logger.info(`分析ジョブ更新: ${jobId} - ${status}`);
}

/**
 * ジョブステータスを取得
 */
export async function getAnalysisJobStatus(jobId: string): Promise<AnalysisJobStatus | null> {
  const job = await prisma.analysisJob.findUnique({
    where: { job_id: jobId },
  });

  if (!job) {
    return null;
  }

  return {
    jobId: job.job_id,
    status: job.status as any,
    totalCount: job.total_count,
    processedCount: job.processed_count,
    successCount: job.success_count,
    failedCount: job.failed_count,
    errorMessage: job.error_message || undefined,
    startedAt: job.started_at,
    completedAt: job.completed_at || undefined,
  };
}

/**
 * 進捗を更新
 */
export async function updateAnalysisJobProgress(
  jobId: string,
  processedCount: number,
  successCount: number,
  failedCount: number
): Promise<void> {
  await prisma.analysisJob.update({
    where: { job_id: jobId },
    data: {
      processed_count: processedCount,
      success_count: successCount,
      failed_count: failedCount,
      updated_at: new Date(),
    },
  });
}

export default {
  createAnalysisJob,
  updateAnalysisJobStatus,
  getAnalysisJobStatus,
  updateAnalysisJobProgress,
};
