import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { callService } from '@/application/services/callService';
import { CallEvent, CallLog, CallState, IncomingCall } from '@/types/call.types';

const initialState: CallState = {
  isInCall: false,
  isCallActive: false,
  callType: null,
  callId: null,
  chatId: null,
  participants: [],
  incomingCall: null,
  callHistory: [],
  loading: false,
  error: null,
};

// Async thunks
export const createCallLog = createAsyncThunk(
  'call/createLog',
  async (callData: { type: 'audio' | 'video'; chatId: string; participants: string[] }) => {
    return await callService.createCallLog(callData);
  }
);

export const updateCallLog = createAsyncThunk(
  'call/updateLog',
  async ({ callId, updateData }: { callId: string; updateData: any }) => {
    return await callService.updateCallLog(callId, updateData);
  }
);

export const getCallHistory = createAsyncThunk(
  'call/getHistory',
  async ({ chatId, page, limit }: { chatId?: string; page?: number; limit?: number }) => {
    return await callService.getCallHistory(chatId, page, limit);
  }
);

export const emitCallEvent = createAsyncThunk('call/emitEvent', async (event: CallEvent) => {
  await callService.emitCallEvent(event);
  return event;
});

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    setIncomingCall: (state, action: PayloadAction<IncomingCall | null>) => {
      state.incomingCall = action.payload;
    },
    setCallActive: (state, action: PayloadAction<boolean>) => {
      state.isCallActive = action.payload;
    },
    setCallType: (state, action: PayloadAction<'audio' | 'video' | null>) => {
      state.callType = action.payload;
    },
    setCallId: (state, action: PayloadAction<string | null>) => {
      state.callId = action.payload;
    },
    setChatId: (state, action: PayloadAction<string | null>) => {
      state.chatId = action.payload;
    },
    setParticipants: (state, action: PayloadAction<string[]>) => {
      state.participants = action.payload;
    },

    startCall: (
      state,
      action: PayloadAction<{
        callId: string;
        chatId: string;
        type: 'audio' | 'video';
        participants: string[];
      }>
    ) => {
      state.isInCall = true;
      state.isCallActive = true;
      state.callId = action.payload.callId;
      state.chatId = action.payload.chatId;
      state.callType = action.payload.type;
      state.participants = action.payload.participants;
    },
    endCall: (state) => {
      state.isInCall = false;
      state.isCallActive = false;
      state.callType = null;
      state.callId = null;
      state.chatId = null;
      state.participants = [];
      state.incomingCall = null;
      state.callHistory = [];
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCallLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCallLog.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createCallLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create call log';
      })
      .addCase(updateCallLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCallLog.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateCallLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update call log';
      })
      .addCase(getCallHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCallHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.callHistory = action.payload.calls;
      })
      .addCase(getCallHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch call history';
      });
  },
});

export const {
  setIncomingCall,
  setCallActive,
  setCallType,
  setCallId,
  setChatId,
  setParticipants,
  startCall,
  endCall,
  clearError,
} = callSlice.actions;

export default callSlice.reducer;
