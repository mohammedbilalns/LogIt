import api from '@axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AuthState } from '@type/auth.types';
import { AuthResponse, LoginRequest, SignupRequest } from '@type/user.types';
import { AxiosError } from 'axios';
import { API_ROUTES } from '@/constants/routes';

interface ApiErrorResponse {
  message: string;
}

type ApiError = AxiosError<ApiErrorResponse>;

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
      const response = await api.post<AuthResponse>(API_ROUTES.AUTH.SIGNUP, credentials);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      const message = apiError.response?.data?.message;
      return rejectWithValue(message);
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>(API_ROUTES.AUTH.VERIFY_OTP, { email, otp });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      const message = apiError.response?.data?.message;
      return rejectWithValue(message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, credentials);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.log('Error loging in:  ', apiError);
      const message = apiError.response?.data?.message;
      return rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post(API_ROUTES.AUTH.LOGOUT);
    return null;
  } catch (error) {
    const apiError = error as ApiError;
    const message = apiError.response?.data?.message;
    return rejectWithValue(message);
  }
});

export const checkAuth = createAsyncThunk('auth/check', async (_, { rejectWithValue }) => {
  try {
    const response = await api.post<AuthResponse>(API_ROUTES.AUTH.REFRESH);
    return response.data;
  } catch {
    return rejectWithValue(null);
  }
});

export const resendOTP = createAsyncThunk(
  'auth/resendOTP',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.post<{ message: string }>(API_ROUTES.AUTH.RESEND_OTP, { email });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      const message = apiError.response?.data?.message || 'Failed to resend OTP. Please try again.';
      return rejectWithValue(message);
    }
  }
);

export const googleAuth = createAsyncThunk(
  'auth/google',
  async (credential: string, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>(API_ROUTES.AUTH.GOOGLE, { credential });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;

      const message = apiError.response?.data?.message;
      return rejectWithValue(message);
    }
  }
);

export const initiatePasswordReset = createAsyncThunk(
  'auth/initiatePasswordReset',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ROUTES.AUTH.RESET_PASSWORD, { email });
      return { email, message: response.data.message };
    } catch (error) {
      const apiError = error as ApiError;
      const message = apiError.response?.data?.message;
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
    } catch (error) {
      const apiError = error as ApiError;
      const message = apiError.response?.data?.message;
      return rejectWithValue(message);
    }
  }
);

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (
    { email, otp, newPassword }: { email: string; otp: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(API_ROUTES.AUTH.UPDATE_PASSWORD, { email, otp, newPassword });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      const message = apiError.response?.data?.message;
      return rejectWithValue(message);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    { currentPassword, newPassword }: { currentPassword: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(API_ROUTES.AUTH.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      const message = apiError.response?.data?.message;
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
    updateUser: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload
        };
      }
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

export const { clearError, setVerificationEmail, resetAuthState, clearResetPasswordState, updateUser } =
  authSlice.actions;
export default authSlice.reducer;
