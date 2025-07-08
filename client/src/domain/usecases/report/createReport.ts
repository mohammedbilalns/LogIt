import { reportService } from '@/application/services/reportService';

export async function createReport({ targetType, targetId, reason }: { targetType: 'article' | 'user'; targetId: string; reason: string }) {
  return await reportService.createReport({ targetType, targetId, reason });
} 