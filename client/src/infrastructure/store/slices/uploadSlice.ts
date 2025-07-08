import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { uploadImage as uploadImageUsecase } from '@/domain/usecases/upload/uploadImage';

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
    return await uploadImageUsecase(file);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to upload image');
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
