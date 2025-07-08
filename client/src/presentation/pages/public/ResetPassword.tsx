import { useForm } from '@mantine/form';
import {
  Text,
  Button,
  Stack,
  Group,
} from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LockIcon } from '@/presentation/components/icons/LockIcon';
import { MailCheckIcon } from '@/presentation/components/icons/MailCheckIcon';
import { AppDispatch, RootState } from '@/infrastructure/store';
import {
  initiatePasswordReset,
  verifyResetOTP,
  updatePassword,
  clearResetPasswordState,
  clearError,
} from '@/infrastructure/store/slices/authSlice';
import { useEffect, useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';

import AuthSplitLayout from '@/presentation/components/auth/AuthSplitLayout';
import { TextField } from '@/presentation/components/auth/FormField';
import OTPInput from '@/presentation/components/auth/OTPInput';
import { PasswordField } from '@/presentation/components/auth/FormField';
import SubmitButton from '@/presentation/components/auth/SubmitButton';
import ErrorDisplay from '@/presentation/components/auth/ErrorDisplay';

const OTP_EXPIRY_TIME = 5 * 60;
const RESEND_COOLDOWN = 60;

export default function ResetPassword() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading, error, resetPasswordEmail, resetPasswordVerified } = useSelector(
    (state: RootState) => state.auth
  );

  const [otp, setOtp] = useState('');
  const [otpExpiryTime, setOtpExpiryTime] = useState(OTP_EXPIRY_TIME);
  const [resendCooldown, setResendCooldown] = useState(0);

  const emailForm = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => {
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? null : 'Invalid email address';
      },
    },
  });

  const passwordForm = useForm({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      newPassword: (value) => {
        if (!value.trim()) return 'Password is required';
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
        return strongRegex.test(value)
          ? null
          : 'Password must be 8+ chars with uppercase, lowercase, number, and special char';
      },
      confirmPassword: (value, values) =>
        value !== values.newPassword ? 'Passwords do not match' : null,
    },
  });

  const startResendCooldown = useCallback(() => setResendCooldown(RESEND_COOLDOWN), []);
  const resetOtpExpiry = useCallback(() => setOtpExpiryTime(OTP_EXPIRY_TIME), []);

  useEffect(() => {
    return () => {
      dispatch(clearResetPasswordState());
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => {
      setOtpExpiryTime((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (otpExpiryTime === 0 && resetPasswordEmail && !resetPasswordVerified) {
      setOtp('');
      notifications.show({
        title: 'OTP Expired',
        message: 'The OTP has expired. Please try again.',
        color: 'red',
      });
      navigate('/login');
    }
  }, [otpExpiryTime, resetPasswordEmail, resetPasswordVerified, navigate]);

  useEffect(() => {
    if (error === 'Maximum OTP retry attempts exceeded') {
      notifications.show({
        title: 'Maximum OTP Attempts Exceeded',
        message: 'Please try again later.',
        color: 'red',
      });
      navigate('/login');
    }
  }, [error, navigate]);

  const handleEmailSubmit = async (values: typeof emailForm.values) => {
    const result = await dispatch(initiatePasswordReset(values.email));
    if (result.meta.requestStatus === 'fulfilled') {
      resetOtpExpiry();
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPasswordEmail && otp.length === 6 && otpExpiryTime > 0) {
      await dispatch(verifyResetOTP({ email: resetPasswordEmail, otp }));
    }
  };

  const handleOTPChange = (value: string) => {
    setOtp(value);
    if (error) dispatch(clearError());
  };

  const handlePasswordSubmit = async (values: typeof passwordForm.values) => {
    if (resetPasswordEmail && otp) {
      const result = await dispatch(
        updatePassword({ email: resetPasswordEmail, otp, newPassword: values.newPassword })
      );
      if (result.meta.requestStatus === 'fulfilled') {
        notifications.show({
          title: 'Password updated',
          message: 'Your password has been updated',
          color: 'green',
        });
        navigate('/login');
      }
    }
  };

  const handleResendOTP = async () => {
    if (resetPasswordEmail && resendCooldown === 0) {
      const result = await dispatch(initiatePasswordReset(resetPasswordEmail));
      if (result.meta.requestStatus === 'fulfilled') {
        resetOtpExpiry();
        startResendCooldown();
        setOtp('');
      } else if (result.meta.requestStatus === 'rejected' && result.payload === 'Maximum OTP retry attempts exceeded') {
        notifications.show({
          title: 'Maximum OTP Attempts Exceeded',
          message: 'Please try again later.',
          color: 'red',
        });
        navigate('/login');
      }
    }
  };

  const getHeaderContent = () => {
    if (!resetPasswordEmail) {
      return {
        icon: <LockIcon width={50} color="var(--mantine-color-blue-6)" />,
        title: 'Reset Password',
        description: 'Enter your email to reset your password',
      };
    }
    
    if (!resetPasswordVerified) {
      return {
        icon: <MailCheckIcon width={50} color="var(--mantine-color-blue-6)" />,
        title: 'Verify OTP',
        description: (
          <>
            We've sent a verification code to{' '}
            <Text span fw={500} c="blue">
              {resetPasswordEmail}
            </Text>
          </>
        ),
      };
    }
    
    return {
      icon: <LockIcon width={50} color="var(--mantine-color-blue-6)" />,
      title: 'Create New Password',
      description: 'Enter your new password',
    };
  };

  const renderStep = () => {
    if (!resetPasswordEmail) {
      return (
        <form onSubmit={emailForm.onSubmit(handleEmailSubmit)}>
          <Stack gap="md">
            <TextField
              label="Email"
              placeholder="your@email.com"
              {...emailForm.getInputProps('email')}
            />
            <SubmitButton loading={loading}>
              Send Reset OTP
            </SubmitButton>
            <ErrorDisplay error={error} />
          </Stack>
        </form>
      );
    }

    if (!resetPasswordVerified) {
      return (
        <form onSubmit={handleOTPSubmit}>
          <Stack>
            <OTPInput
              value={otp}
              onChange={handleOTPChange}
              error={Boolean(error)}
              disabled={otpExpiryTime === 0}
              expiryTime={otpExpiryTime}
              resendCooldown={resendCooldown}
              onResend={handleResendOTP}
              onResendLoading={loading}
            />

            <ErrorDisplay error={error} />

            <SubmitButton
              loading={loading}
              disabled={otp.length !== 6 || otpExpiryTime === 0}
            >
              Verify OTP
            </SubmitButton>
          </Stack>
        </form>
      );
    }

    return (
      <form onSubmit={passwordForm.onSubmit(handlePasswordSubmit)}>
        <Stack gap="md">
          <PasswordField
            label="New Password"
            placeholder="Enter new password"
            {...passwordForm.getInputProps('newPassword')}
          />
          <PasswordField
            label="Confirm Password"
            placeholder="Confirm new password"
            {...passwordForm.getInputProps('confirmPassword')}
          />
          <SubmitButton loading={loading}>
            Update Password
          </SubmitButton>
        </Stack>
      </form>
    );
  };

  const headerContent = getHeaderContent();

  return (
    <AuthSplitLayout>
      <Group justify="center" mb="md">
        {headerContent.icon}
      </Group>
      <Stack gap={4} mb="lg" align="center">
        <h2 style={{ fontWeight: 700, fontSize: 26, margin: 0 }}>{headerContent.title}</h2>
        <div style={{ color: '#888', fontSize: 15, textAlign: 'center' }}>{headerContent.description}</div>
      </Stack>
      {renderStep()}
      <Button variant="subtle" fullWidth mt="md" onClick={() => navigate('/login')} style={{ marginTop: 16 }}>
        Back to Login
      </Button>
      <div style={{ marginTop: 32, fontSize: 12, color: '#bbb', textAlign: 'center' }}>
        ©2024 LogIt. All rights reserved.
      </div>
    </AuthSplitLayout>
  );
}