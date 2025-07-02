import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '@/api/axios';

interface UploadState {
  loading: boolean;
  error: string | null;
  uploadedUrl: string | null;
}

const initialState: UploadState = {
  loading: false,
  error: null,
  uploadedUrl: null,
};

export const uploadImage = createAsyncThunk('upload/image', async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('/upload/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to upload image');
  }
});

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    clearUploadState: (state) => {
      state.loading = false;
      state.error = null;
      state.uploadedUrl = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadImage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadedUrl = null;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadedUrl = action.payload;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to upload image';
      });
  },
});

export const { clearUploadState } = uploadSlice.actions;
export default uploadSlice.reducer;
