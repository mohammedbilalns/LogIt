import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from '@/api/axios';

export interface Chat {
  id: string;
  isGroup: boolean;
  name?: string;
  creator?: string;
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
  participants: Array<{
    id: string;
    userId: string;
    name: string;
    profileImage?: string;
    role: string;
  }>;
  lastMessageDetails?: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    createdAt: string;
  };
  unreadCount?: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content?: string;
  media?: string;
  log?: string;
  replyTo?: string;
  deletedFor: string[];
  seenBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatParticipant {
  id: string;
  chatId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
  isMuted?: boolean;
  isBlocked?: boolean;
  leftAt?: string;
  name: string;
  profileImage?: string;
}

interface ChatState {
  singleChats: Chat[];
  groupChats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  participants: ChatParticipant[];
  loading: boolean;
  messagesLoading: boolean;
  error: string | null;
  socketConnected: boolean;
  page: number;
  hasMore: boolean;
  limit: number;
  total: number;
}

const initialState: ChatState = {
  singleChats: [],
  groupChats: [],
  currentChat: null,
  messages: [],
  participants: [],
  loading: false,
  messagesLoading: false,
  error: null,
  socketConnected: false,
  page: 1,
  hasMore: true,
  limit: 15,
  total: 0,
};

// Async thunks
export const fetchUserChats = createAsyncThunk(
  'chat/fetchUserChats',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/chats?page=${page}&limit=${limit}`);
      return { ...response.data, page };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chats');
    }
  }
);

export const createChat = createAsyncThunk(
  'chat/createChat',
  async (
    data: { isGroup: boolean; name?: string; participants: string[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post('/chats', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create chat');
    }
  }
);

export const createGroupChat = createAsyncThunk(
  'chat/createGroupChat',
  async (data: { name: string; participants: string[] }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/chats/group', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create group chat');
    }
  }
);

export const fetchChatDetails = createAsyncThunk(
  'chat/fetchChatDetails',
  async ({ chatId, page = 1, limit = 15 }: { chatId: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/chats/${chatId}?page=${page}&limit=${limit}`);
      return { ...response.data, page };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chat details');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, content }: { chatId: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/chats/${chatId}/messages`, { content });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const getOrCreatePrivateChat = createAsyncThunk(
  'chat/getOrCreatePrivateChat',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/chats/private/${userId}`);
      return response.data.id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get or create private chat'
      );
    }
  }
);

export const fetchUserGroupChats = createAsyncThunk(
  'chat/fetchUserGroupChats',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/chats/group?page=${page}&limit=${limit}`);
      return { ...response.data, page };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch group chats');
    }
  }
);

export const removeParticipant = createAsyncThunk(
  'chat/removeParticipant',
  async ({ chatId, userId }: { chatId: string; userId: string }, { rejectWithValue }) => {
    try {
      await axios.delete(`/chats/${chatId}/participants/${userId}`);
      return { userId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove user');
    }
  }
);

export const promoteParticipant = createAsyncThunk(
  'chat/promoteParticipant',
  async ({ chatId, userId }: { chatId: string; userId: string }, { rejectWithValue }) => {
    try {
      await axios.patch(`/chats/${chatId}/participants/${userId}/promote`);
      return { userId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to promote user');
    }
  }
);

export const leaveGroup = createAsyncThunk(
  'chat/leaveGroup',
  async (chatId: string, { rejectWithValue }) => {
    try {
      await axios.post(`/chats/${chatId}/leave`);
      return { left: true };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to leave group');
    }
  }
);

export const addParticipants = createAsyncThunk(
  'chat/addParticipants',
  async ({ chatId, participants }: { chatId: string; participants: string[] }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/chats/${chatId}/participants`, { participants });
      return { participants: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add members');
    }
  }
);

export const updateGroupName = createAsyncThunk(
  'chat/updateGroupName',
  async ({ chatId, name }: { chatId: string; name: string }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/chats/${chatId}/name`, { name });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update group name');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.socketConnected = action.payload;
    },
    setCurrentChat: (state, action: PayloadAction<Chat | null>) => {
      state.currentChat = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    updateChatLastMessage: (
      state,
      action: PayloadAction<{ chatId: string; messageId: string }>
    ) => {
      let chat = state.singleChats.find((c) => c.id === action.payload.chatId);
      if (!chat) {
        chat = state.groupChats.find((c) => c.id === action.payload.chatId);
      }
      if (chat) {
        chat.lastMessage = action.payload.messageId;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user chats
      .addCase(fetchUserChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserChats.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.page > 1) {
          state.singleChats = [...state.singleChats, ...action.payload.data];
        } else {
          state.singleChats = action.payload.data;
        }
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
        state.total = action.payload.total;
      })
      .addCase(fetchUserChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create chat
      .addCase(createChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.isGroup) {
          const existingGroup = state.groupChats.find((c) => c.id === action.payload.id);
          if (!existingGroup) {
            state.groupChats.push(action.payload);
          }
        } else {
          const existingSingle = state.singleChats.find((c) => c.id === action.payload.id);
          if (!existingSingle) {
            state.singleChats.push(action.payload);
          }
        }
        state.currentChat = action.payload;
      })
      .addCase(createChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create group chat
      .addCase(createGroupChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroupChat.fulfilled, (state, action) => {
        state.loading = false;
        const existingGroup = state.groupChats.find((c) => c.id === action.payload.id);
        if (!existingGroup) {
          state.groupChats.push(action.payload);
        }
        state.currentChat = action.payload;
      })
      .addCase(createGroupChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch chat details
      .addCase(fetchChatDetails.pending, (state) => {
        state.messagesLoading = true;
        state.error = null;
      })
      .addCase(fetchChatDetails.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.currentChat = action.payload;
        state.participants = action.payload.participants;
        if (action.payload.page > 1) {
          state.messages = [...action.payload.messages, ...state.messages];
        } else {
          state.messages = action.payload.messages;
        }
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchChatDetails.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload as string;
      })
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {})
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch user group chats
      .addCase(fetchUserGroupChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserGroupChats.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.page > 1) {
          state.groupChats = [...state.groupChats, ...action.payload.data];
        } else {
          state.groupChats = action.payload.data;
        }
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
        state.total = action.payload.total;
      })
      .addCase(fetchUserGroupChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateGroupName.fulfilled, (state, action) => {
        if (state.currentChat && state.currentChat.id === action.payload.id) {
          state.currentChat.name = action.payload.name;
        }
      });
  },
});

export const {
  setSocketConnected,
  setCurrentChat,
  addMessage,
  clearMessages,
  clearError,
  updateChatLastMessage,
} = chatSlice.actions;

export default chatSlice.reducer; 
