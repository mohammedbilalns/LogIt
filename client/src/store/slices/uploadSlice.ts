import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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

export const uploadImage = createAsyncThunk(
  'upload/image',
  async (file: File) => {
    try {
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

      if (!uploadPreset || !cloudName) {
        throw new Error('Cloudinary configuration is missing');
      }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to upload image');
      }

    const data = await response.json();
      return data.secure_url;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload image');
    }
  }
);

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