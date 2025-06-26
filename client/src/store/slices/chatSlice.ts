import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
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
  chats: Chat[];
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
}

const initialState: ChatState = {
  chats: [],
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
};

// Async thunks
export const fetchUserChats = createAsyncThunk(
  'chat/fetchUserChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/chats');
      console.log("Fetched chats", response.data)
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chats');
    }
  }
);

export const createChat = createAsyncThunk(
  'chat/createChat',
  async (data: { isGroup: boolean; name?: string; participants: string[] }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/chats', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create chat');
    }
  }
);

export const fetchChatDetails = createAsyncThunk(
  'chat/fetchChatDetails',
  async (chatId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/chats/${chatId}`);
      return response.data;
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

export const fetchChatMessages = createAsyncThunk(
  'chat/fetchChatMessages',
  async (
    { chatId, page = 1, limit = 15 }: { chatId: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get(`/chats/${chatId}/messages?page=${page}&limit=${limit}`);
      return { data: response.data, page };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
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
      return rejectWithValue(error.response?.data?.message || 'Failed to get or create private chat');
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
    updateChatLastMessage: (state, action: PayloadAction<{ chatId: string; messageId: string }>) => {
      const chat = state.chats.find(c => c.id === action.payload.chatId);
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
        state.chats = action.payload;
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
        const existingChat = state.chats.find(c => c.id === action.payload.id);
        if (!existingChat) {
          state.chats.push(action.payload);
        }
        state.currentChat = action.payload;
      })
      .addCase(createChat.rejected, (state, action) => {
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
        state.messages = action.payload.messages;
      })
      .addCase(fetchChatDetails.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload as string;
      })
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        // Do nothing here; message will be added via socket event
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch chat messages
      .addCase(fetchChatMessages.pending, (state) => {
        state.messagesLoading = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        const { data, page } = action.payload;
        if (page > 1) {
          // Prepend older messages
          state.messages = [...data, ...state.messages];
        } else {
          // First page, replace
          state.messages = data;
        }
        state.page = page;
        state.hasMore = data.length === state.limit;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload as string;
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