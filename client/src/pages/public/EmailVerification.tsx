import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Text,
  Button,
  Stack,
} from '@mantine/core';
import { MailCheckIcon } from '@/components/icons/MailCheckIcon';
import { AppDispatch, RootState } from '@/store';
import {
  verifyEmail,
  clearError,
  resendOTP,
  setVerificationEmail,
} from '@slices/authSlice';
import { notifications } from '@mantine/notifications';

import AuthContainer from '@/components/auth/AuthContainer';
import AuthHeader from '@/components/auth/AuthHeader';
import OTPInput from '@/components/auth/OTPInput';
import SubmitButton from '@/components/auth/SubmitButton';
import ErrorDisplay from '@/components/auth/ErrorDisplay';

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
    <AuthContainer my={100} withBorder>
      <AuthHeader
        icon={<MailCheckIcon width={50} color="var(--mantine-color-blue-6)" />}
        title="Verify Your Email"
        description={
          <>
            We've sent a verification code to{' '}
            <Text span fw={500} c="blue">
              {verificationEmail}
            </Text>
          </>
        }
      />

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
    </AuthContainer>
  );
}
