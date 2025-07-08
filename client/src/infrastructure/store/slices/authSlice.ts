import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AuthState } from '@type/auth.types';
import { changePassword as changePasswordUsecase } from '@/domain/usecases/auth/changePassword';
import { checkAuth as checkAuthUsecase } from '@/domain/usecases/auth/checkAuth';
import { googleAuth as googleAuthUsecase } from '@/domain/usecases/auth/googleAuth';
import { initiatePasswordReset as initiatePasswordResetUsecase } from '@/domain/usecases/auth/initiatePasswordReset';
import { loginUser } from '@/domain/usecases/auth/login';
import { logoutUser } from '@/domain/usecases/auth/logout';
import { resendOTP as resendOTPUsecase } from '@/domain/usecases/auth/resendOTP';
import { signupUser } from '@/domain/usecases/auth/signup';
import { updatePassword as updatePasswordUsecase } from '@/domain/usecases/auth/updatePassword';
import { verifyEmail as verifyEmailUsecase } from '@/domain/usecases/auth/verifyEmail';
import { verifyResetOTP as verifyResetOTPUsecase } from '@/domain/usecases/auth/verifyResetOTP';

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
  async (credentials: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      return await signupUser(credentials.name, credentials.email, credentials.password);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Signup failed');
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      return await verifyEmailUsecase(email, otp);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Verification failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await loginUser(credentials.email, credentials.password);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    return await logoutUser();
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message || 'Logout failed');
  }
});

export const checkAuth = createAsyncThunk('auth/check', async (_, { rejectWithValue }) => {
  try {
    return await checkAuthUsecase();
  } catch (e: any) {
    return rejectWithValue(null);
  }
});

export const resendOTP = createAsyncThunk(
  'auth/resendOTP',
  async (email: string, { rejectWithValue }) => {
    try {
      return await resendOTPUsecase(email);
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || 'Failed to resend OTP. Please try again.'
      );
    }
  }
);

export const googleAuth = createAsyncThunk(
  'auth/google',
  async (credential: string, { rejectWithValue }) => {
    try {
      return await googleAuthUsecase(credential);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Google authentication failed');
    }
  }
);

export const initiatePasswordReset = createAsyncThunk(
  'auth/initiatePasswordReset',
  async (email: string, { rejectWithValue }) => {
    try {
      return await initiatePasswordResetUsecase(email);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to initiate password reset');
    }
  }
);

export const verifyResetOTP = createAsyncThunk(
  'auth/verifyResetOTP',
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      return await verifyResetOTPUsecase(email, otp);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to verify reset OTP');
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
      return await updatePasswordUsecase(email, otp, newPassword);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to update password');
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
      return await changePasswordUsecase(currentPassword, newPassword);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to change password');
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
          ...action.payload,
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
        if (action.payload === 'Maximum OTP retry attempts exceeded') {
          state.resetPasswordEmail = null;
          state.resetPasswordVerified = false;
        }
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

export const {
  clearError,
  setVerificationEmail,
  resetAuthState,
  clearResetPasswordState,
  updateUser,
} = authSlice.actions;
export default authSlice.reducer;
