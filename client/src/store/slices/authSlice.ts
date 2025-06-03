import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@axios';
import { AuthResponse, LoginRequest, SignupRequest } from '@type/user.types';
import { AuthState } from '@type/auth.types';


const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  profileImage: null,
  verificationEmail: null,
  isInitialized: false,
  resendLoading: false,
  resetPasswordEmail: null,
  resetPasswordVerified: false,
};

export const signup = createAsyncThunk(
  'auth/signup',
  async (credentials: SignupRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/signup', credentials);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Signup failed. Please try again.';
      return rejectWithValue(message);
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/verify-otp', { email, otp });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Email verification failed. Please try again.';
      return rejectWithValue(message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
    return null;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Logout failed. Please try again.';
    return rejectWithValue(message);
  }
});

export const checkAuth = createAsyncThunk('auth/check', async (_, { rejectWithValue }) => {
  try {
    const response = await api.post<AuthResponse>('/auth/refresh');

    return response.data;
  } catch (error: any) {
    
    return rejectWithValue(null);
  }
});

export const resendOTP = createAsyncThunk(
  'auth/resendOTP',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.post<{ message: string }>('/auth/resend-otp', { email });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to resend OTP. Please try again.';
      return rejectWithValue(message);
    }
  }
);

export const googleAuth = createAsyncThunk(
  'auth/google',
  async (credential: string, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/google', { credential });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Google authentication failed. Please try again.';
      return rejectWithValue(message);
    }
  }
);

export const initiatePasswordReset = createAsyncThunk(
  'auth/initiatePasswordReset',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/reset-password', { email });
      return { email, message: response.data.message };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to initiate password reset. Please try again.';
      return rejectWithValue(message);
    }
  }
);

export const verifyResetOTP = createAsyncThunk(
  'auth/verifyResetOTP',
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verify-resetotp', { email, otp });
      return { email, message: response.data.message };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to verify OTP. Please try again.';
      return rejectWithValue(message);
    }
  }
);

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async ({ email, otp, newPassword }: { email: string; otp: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/update-password', { email, otp, newPassword });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update password. Please try again.';
      return rejectWithValue(message);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await api.put('/user/change-password', { currentPassword, newPassword });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to change password. Please try again.';
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setVerificationEmail: (state, action) => {
      state.verificationEmail = action.payload;
    },
    resetAuthState: (state) => {
      Object.assign(state, initialState);
    },
    clearResetPasswordState: (state) => {
      state.resetPasswordEmail = null;
      state.resetPasswordVerified = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.verificationEmail = action.payload.user.email;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Email Verification
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.verificationEmail = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        if (action.payload === 'Maximum OTP retry attempts exceeded') {
          state.verificationEmail = null;
        }
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.isInitialized = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.isInitialized = true;
      })
      // Resend OTP
      .addCase(resendOTP.pending, (state) => {
        state.resendLoading = true;
        state.error = null;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.resendLoading = false;
        state.error = null;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.resendLoading = false;
        state.error = action.payload as string;
      })
      // Google Auth
      .addCase(googleAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Password Reset Initiation
      .addCase(initiatePasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiatePasswordReset.fulfilled, (state, action) => {
        state.loading = false;
        state.resetPasswordEmail = action.payload.email;
      })
      .addCase(initiatePasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reset OTP Verification
      .addCase(verifyResetOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyResetOTP.fulfilled, (state) => {
        state.loading = false;
        state.resetPasswordVerified = true;
      })
      .addCase(verifyResetOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Password
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.loading = false;
        state.resetPasswordEmail = null;
        state.resetPasswordVerified = false;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setVerificationEmail, resetAuthState, clearResetPasswordState } = authSlice.actions;
export default authSlice.reducer; 