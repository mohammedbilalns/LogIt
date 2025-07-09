import axiosInstance from '@/infrastructure/api/axios';
import { API_ROUTES } from '@/constants/routes';

export const chatService = {
  async fetchUserChats({ page = 1, limit = 10 }: { page?: number; limit?: number }) {
    const response = await axiosInstance.get(`${API_ROUTES.CHATS.BASE}?page=${page}&limit=${limit}`);
    return { ...response.data, page };
  },
  async createChat(data: { isGroup: boolean; name?: string; participants: string[] }) {
    const response = await axiosInstance.post(API_ROUTES.CHATS.BASE, data);
    return response.data;
  },
  async createGroupChat(data: { name: string; participants: string[] }) {
    const response = await axiosInstance.post(API_ROUTES.CHATS.GROUP, data);
    return response.data;
  },
  async fetchChatDetails({ chatId, page = 1, limit = 15 }: { chatId: string; page?: number; limit?: number }) {
    const response = await axiosInstance.get(`${API_ROUTES.CHATS.BY_ID(chatId)}?page=${page}&limit=${limit}`);
    return { ...response.data, page };
  },
  async sendMessage({ chatId, content, media }: { chatId: string; content?: string; media?: any }) {
    const payload: any = {};
    if (content) payload.content = content;
    if (media) payload.media = media;
    const response = await axiosInstance.post(API_ROUTES.CHATS.MESSAGES(chatId), payload);
    return response.data;
  },
  async getOrCreatePrivateChat(userId: string) {
    const response = await axiosInstance.get(API_ROUTES.CHATS.PRIVATE(userId));
    return response.data.id;
  },
  async fetchUserGroupChats({ page = 1, limit = 10 }: { page?: number; limit?: number }) {
    const response = await axiosInstance.get(`${API_ROUTES.CHATS.GROUP}?page=${page}&limit=${limit}`);
    return { ...response.data, page };
  },
  async removeParticipant({ chatId, userId }: { chatId: string; userId: string }) {
    await axiosInstance.delete(API_ROUTES.CHATS.PARTICIPANT(chatId, userId));
    return { userId };
  },
  async promoteParticipant({ chatId, userId }: { chatId: string; userId: string }) {
    await axiosInstance.patch(API_ROUTES.CHATS.PROMOTE_PARTICIPANT(chatId, userId));
    return { userId };
  },
  async leaveGroup(chatId: string) {
    await axiosInstance.post(API_ROUTES.CHATS.LEAVE(chatId));
    return { left: true };
  },
  async addParticipants({ chatId, participants }: { chatId: string; participants: string[] }) {
    const response = await axiosInstance.post(API_ROUTES.CHATS.PARTICIPANTS(chatId), { participants });
    return { participants: response.data };
  },
  async updateGroupName({ chatId, name }: { chatId: string; name: string }) {
    const response = await axiosInstance.patch(API_ROUTES.CHATS.GROUP_NAME(chatId), { name });
    return response.data;
  },
}; 