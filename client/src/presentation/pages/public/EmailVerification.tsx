import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Text,
  Button,
  Stack,
  Group,
} from '@mantine/core';
import { MailCheckIcon } from '@/presentation/components/icons/MailCheckIcon';
import { AppDispatch, RootState } from '@/infrastructure/store';
import {
  verifyEmail,
  clearError,
  resendOTP,
  setVerificationEmail,
} from '@/infrastructure/store/slices/authSlice';
import { notifications } from '@mantine/notifications';

import AuthSplitLayout from '@/presentation/components/auth/AuthSplitLayout';
import OTPInput from '@/presentation/components/auth/OTPInput';
import SubmitButton from '@/presentation/components/auth/SubmitButton';
import ErrorDisplay from '@/presentation/components/auth/ErrorDisplay';

const OTP_EXPIRY_TIME = 5 * 60;
const RESEND_COOLDOWN = 60;

export default function EmailVerification() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [otpExpiryTime, setOtpExpiryTime] = useState(OTP_EXPIRY_TIME);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { loading, resendLoading, error, isAuthenticated, verificationEmail } = useSelector(
    (state: RootState) => state.auth
  );

  const startResendCooldown = useCallback(() => setResendCooldown(RESEND_COOLDOWN), []);
  const resetOtpExpiry = useCallback(() => setOtpExpiryTime(OTP_EXPIRY_TIME), []);

  useEffect(() => {
    if (!verificationEmail) {
      navigate('/signup');
    }
    if (isAuthenticated) {
      navigate('/home');
    }
    return () => {
      dispatch(clearError());
    };
  }, [verificationEmail, isAuthenticated, navigate, dispatch]);

  useEffect(() => {
    const timer = setInterval(() => {
      setOtpExpiryTime(prev => Math.max(prev - 1, 0));
      setResendCooldown(prev => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (otpExpiryTime === 0) {
      setOtp('');
    }
  }, [otpExpiryTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationEmail && otp.length === 6 && otpExpiryTime > 0) {
      const result = await dispatch(verifyEmail({ email: verificationEmail, otp }));

      if (verifyEmail.rejected.match(result) && result.payload === 'Maximum OTP retry attempts exceeded') {
        notifications.show({
          title: 'Maximum OTP Attempts Exceeded',
          message: 'Please sign up again.',
          color: 'red',
        });
        navigate('/signup');
      } else if (verifyEmail.fulfilled.match(result)) {
        notifications.show({
          title: 'Email Verified',
          message: 'Welcome to LogIt!',
          color: 'green',
        });
      }
    }
  };

  const handleOTPChange = (value: string) => {
    if (error) {
      dispatch(clearError());
    }
    setOtp(value);
  };

  const handleResendOTP = async () => {
    if (verificationEmail && resendCooldown === 0) {
      const result = await dispatch(resendOTP(verificationEmail));
      if (resendOTP.fulfilled.match(result)) {
        resetOtpExpiry();
        startResendCooldown();
        setOtp('');
      }
    }
  };

  return (
    <AuthSplitLayout>
      <Group justify="center" mb="md">
        <MailCheckIcon width={36} color="var(--mantine-color-blue-6)" />
      </Group>
      <Stack gap={4} mb="lg" align="center">
        <h2 style={{ fontWeight: 700, fontSize: 26, margin: 0 }}>Verify Your Email</h2>
        <div style={{ color: '#888', fontSize: 15, textAlign: 'center' }}>
            We've sent a verification code to{' '}
          <span style={{ fontWeight: 500, color: 'var(--mantine-color-blue-6)' }}>{verificationEmail}</span>
        </div>
      </Stack>
      <form onSubmit={handleSubmit}>
        <Stack>
          <OTPInput
            value={otp}
            onChange={handleOTPChange}
            error={Boolean(error)}
            disabled={otpExpiryTime === 0}
            expiryTime={otpExpiryTime}
            resendCooldown={resendCooldown}
            onResend={handleResendOTP}
            onResendLoading={resendLoading}
          />
          <ErrorDisplay error={error} />
          {otpExpiryTime === 0 && (
            <Text c="orange" size="sm" ta="center">
              OTP expired. Please resend.
            </Text>
          )}
          <SubmitButton
            loading={loading}
            disabled={otp.length !== 6 || otpExpiryTime === 0}
            style={{ boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}
          >
            Verify Email
          </SubmitButton>
          <Button
            variant="subtle"
            fullWidth
            mt="md"
            radius="md"
            onClick={() => {
              dispatch(setVerificationEmail(null));
              navigate('/signup');
            }}
          >
            Back to Signup
          </Button>
        </Stack>
      </form>
      <div style={{ marginTop: 32, fontSize: 12, color: '#bbb', textAlign: 'center' }}>
        ©2024 LogIt. All rights reserved.
      </div>
    </AuthSplitLayout>
  );
}
