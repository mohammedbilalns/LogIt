import axiosInstance from '@/infrastructure/api/axios';
import { API_ROUTES } from '@/constants/routes';
import { CallLog, CallEvent } from '@/types/call.types';

export const callService = {
  async createCallLog(callData: {
    type: 'audio' | 'video';
    chatId: string;
    participants: string[];
  }): Promise<CallLog> {
    const response = await axiosInstance.post(API_ROUTES.CALLS.CREATE_LOG, callData);
    return response.data;
  },

  async updateCallLog(callId: string, updateData: {
    endedAt?: Date;
    endedBy?: string;
    status: 'ended' | 'missed' | 'rejected';
    duration?: number;
  }): Promise<CallLog> {
    const response = await axiosInstance.patch(API_ROUTES.CALLS.UPDATE_LOG(callId), updateData);
    return response.data;
  },

  async getCallHistory(chatId?: string, page = 1, limit = 20): Promise<{
    calls: CallLog[];
    total: number;
  }> {
    const params = new URLSearchParams();
    if (chatId) params.append('chatId', chatId);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await axiosInstance.get(`${API_ROUTES.CALLS.HISTORY}?${params}`);
    return response.data;
  },

  async emitCallEvent(event: CallEvent): Promise<void> {
    await axiosInstance.post(API_ROUTES.CALLS.EVENT, event);
  },
}; 