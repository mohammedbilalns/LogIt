import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chat, ChatState, Message } from '@/types/chat.types';
import { fetchUserChats as fetchUserChatsUsecase } from '@/domain/usecases/chat/fetchUserChats';
import { createChat as createChatUsecase } from '@/domain/usecases/chat/createChat';
import { createGroupChat as createGroupChatUsecase } from '@/domain/usecases/chat/createGroupChat';
import { fetchChatDetails as fetchChatDetailsUsecase } from '@/domain/usecases/chat/fetchChatDetails';
import { sendMessage as sendMessageUsecase } from '@/domain/usecases/chat/sendMessage';
import { getOrCreatePrivateChat as getOrCreatePrivateChatUsecase } from '@/domain/usecases/chat/getOrCreatePrivateChat';
import { fetchUserGroupChats as fetchUserGroupChatsUsecase } from '@/domain/usecases/chat/fetchUserGroupChats';
import { removeParticipant as removeParticipantUsecase } from '@/domain/usecases/chat/removeParticipant';
import { promoteParticipant as promoteParticipantUsecase } from '@/domain/usecases/chat/promoteParticipant';
import { leaveGroup as leaveGroupUsecase } from '@/domain/usecases/chat/leaveGroup';
import { addParticipants as addParticipantsUsecase } from '@/domain/usecases/chat/addParticipants';
import { updateGroupName as updateGroupNameUsecase } from '@/domain/usecases/chat/updateGroupName';

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
  singleHasMore: true,
  groupHasMore: true,
  limit: 15,
  total: 0,
  singleTotal: 0,
  groupTotal: 0,
};

export const fetchUserChats = createAsyncThunk(
  'chat/fetchUserChats',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      return await fetchUserChatsUsecase({ page, limit });
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch chats');
    }
  }
);

export const createChat = createAsyncThunk(
  'chat/createChat',
  async (data: { isGroup: boolean; name?: string; participants: string[] }, { rejectWithValue }) => {
    try {
      return await createChatUsecase(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create chat');
    }
  }
);

export const createGroupChat = createAsyncThunk(
  'chat/createGroupChat',
  async (data: { name: string; participants: string[] }, { rejectWithValue }) => {
    try {
      return await createGroupChatUsecase(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create group chat');
    }
  }
);

export const fetchChatDetails = createAsyncThunk(
  'chat/fetchChatDetails',
  async (
    { chatId, page = 1, limit = 15 }: { chatId: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      return await fetchChatDetailsUsecase({ chatId, page, limit });
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch chat details');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, content }: { chatId: string; content: string }, { rejectWithValue }) => {
    try {
      return await sendMessageUsecase({ chatId, content });
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send message');
    }
  }
);

export const getOrCreatePrivateChat = createAsyncThunk(
  'chat/getOrCreatePrivateChat',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await getOrCreatePrivateChatUsecase(userId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get or create private chat');
    }
  }
);

export const fetchUserGroupChats = createAsyncThunk(
  'chat/fetchUserGroupChats',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      return await fetchUserGroupChatsUsecase({ page, limit });
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch group chats');
    }
  }
);

export const removeParticipant = createAsyncThunk(
  'chat/removeParticipant',
  async ({ chatId, userId }: { chatId: string; userId: string }, { rejectWithValue }) => {
    try {
      return await removeParticipantUsecase({ chatId, userId });
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove user');
    }
  }
);

export const promoteParticipant = createAsyncThunk(
  'chat/promoteParticipant',
  async ({ chatId, userId }: { chatId: string; userId: string }, { rejectWithValue }) => {
    try {
      return await promoteParticipantUsecase({ chatId, userId });
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to promote user');
    }
  }
);

export const leaveGroup = createAsyncThunk(
  'chat/leaveGroup',
  async (chatId: string, { rejectWithValue }) => {
    try {
      return await leaveGroupUsecase(chatId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to leave group');
    }
  }
);

export const addParticipants = createAsyncThunk(
  'chat/addParticipants',
  async (
    { chatId, participants }: { chatId: string; participants: string[] },
    { rejectWithValue }
  ) => {
    try {
      return await addParticipantsUsecase({ chatId, participants });
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add members');
    }
  }
);

export const updateGroupName = createAsyncThunk(
  'chat/updateGroupName',
  async ({ chatId, name }: { chatId: string; name: string }, { rejectWithValue }) => {
    try {
      return await updateGroupNameUsecase({ chatId, name });
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update group name');
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
    handleUserRemoved: (
      state,
      action: PayloadAction<{ chatId: string; removedUserId: string }>
    ) => {
      const { chatId, removedUserId } = action.payload;

      // Update participants in current chat
      if (state.currentChat?.id === chatId) {
        const participant = state.participants.find((p) => p.userId === removedUserId);
        if (participant) {
          participant.role = 'removed-user';
        }
      }

      // Update the specific chat in groupChats list
      const groupChat = state.groupChats.find((chat) => chat.id === chatId);
      if (groupChat) {
        const participant = groupChat.participants.find((p) => p.userId === removedUserId);
        if (participant) {
          participant.role = 'removed-user';
        }
      }
    },
    handleUserLeft: (state, action: PayloadAction<{ chatId: string; leftUserId: string }>) => {
      const { chatId, leftUserId } = action.payload;

      // Update participants in current chat
      if (state.currentChat?.id === chatId) {
        const participant = state.participants.find((p) => p.userId === leftUserId);
        if (participant) {
          participant.role = 'left-user';
        }
      }

      // Update the specific chat in groupChats list
      const groupChat = state.groupChats.find((chat) => chat.id === chatId);
      if (groupChat) {
        const participant = groupChat.participants.find((p) => p.userId === leftUserId);
        if (participant) {
          participant.role = 'left-user';
        }
      }
    },
    resetChatState: (state) => {
      state.currentChat = null;
      state.messages = [];
      state.participants = [];
      state.page = 1;
      state.hasMore = true;
      state.error = null;
      state.messagesLoading = false;
    },
    addNewChat: (state, action: PayloadAction<Chat>) => {
      const newChat = action.payload;
      if (newChat.isGroup) {
        const existingGroup = state.groupChats.find((c) => c.id === newChat.id);
        if (!existingGroup) {
          state.groupChats.unshift(newChat);
          state.groupTotal += 1;
        }
      } else {
        const existingSingle = state.singleChats.find((c) => c.id === newChat.id);
        if (!existingSingle) {
          state.singleChats.unshift(newChat);
          state.singleTotal += 1;
        }
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
        state.singleHasMore = action.payload.hasMore;
        state.singleTotal = action.payload.total;
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
            state.groupChats.unshift(action.payload);
            state.groupTotal += 1;
          }
        } else {
          const existingSingle = state.singleChats.find((c) => c.id === action.payload.id);
          if (!existingSingle) {
            state.singleChats.unshift(action.payload);
            state.singleTotal += 1;
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
          state.groupChats.unshift(action.payload);
          state.groupTotal += 1;
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

        if (!state.currentChat && !state.participants.length) {
          state.error = action.payload as string;
        }
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
        state.groupHasMore = action.payload.hasMore;
        state.groupTotal = action.payload.total;
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
  handleUserRemoved,
  handleUserLeft,
  resetChatState,
  addNewChat,
} = chatSlice.actions;

export default chatSlice.reducer;
