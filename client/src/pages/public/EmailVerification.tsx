import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Text,
  Paper,
  Group,
  Button,
  Container,
  Stack,
  PinInput,
  Center,
  Title,
  Box,
} from '@mantine/core';
import { IconMailCheck } from '@tabler/icons-react';
import { AppDispatch, RootState } from '@/store';
import {
  verifyEmail,
  clearError,
  resendOTP,
  setVerificationEmail,
} from '@slices/authSlice';
import { notifications } from '@mantine/notifications';
import { useMediaQuery } from '@mantine/hooks';

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

  const isMobile = useMediaQuery('(max-width: 768px)');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
    <Container size={580} my={100} px={isMobile ? 'xs' : 'md'}>
      <Paper
        radius="md"
        p={isMobile ? 'md' : 'xl'}
        withBorder
        style={{
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Center mb="xl">
          <IconMailCheck size={50} color="var(--mantine-color-blue-6)" />
        </Center>

        <Title order={2} ta="center" mb="sm">
          Verify Your Email
        </Title>

        <Text c="dimmed" size="sm" ta="center" mb="xl">
          We've sent a verification code to{' '}
          <Text span fw={500} c="blue">
            {verificationEmail}
          </Text>
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack>
            <Center>
              <PinInput
                length={6}
                size={isMobile ? 'md' : 'lg'}
                value={otp}
                onChange={handleOTPChange}
                error={Boolean(error)}
                type="number"
                oneTimeCode
                autoFocus
                disabled={otpExpiryTime === 0}
              />
            </Center>

            <Text
              c={otpExpiryTime < 60 ? 'red' : 'dimmed'}
              size="sm"
              ta="center"
              fw={500}
            >
              OTP expires in: {formatTime(otpExpiryTime)}
            </Text>

            {error && (
              <Text c="red" size="sm" ta="center">
                {error}
              </Text>
            )}

            {otpExpiryTime === 0 && (
              <Text c="orange" size="sm" ta="center">
                OTP expired. Please resend.
              </Text>
            )}

            <Button
              type="submit"
              radius="md"
              loading={loading}
              disabled={otp.length !== 6 || otpExpiryTime === 0}
              fullWidth
              style={{ boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}
            >
              Verify Email
            </Button>

            <Group justify="center" gap="xs">
              <Text size="sm" c="dimmed">
                Didn't receive the code?
              </Text>
              <Button
                variant="subtle"
                size="sm"
                onClick={handleResendOTP}
                loading={resendLoading}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? `Resend in ${formatTime(resendCooldown)}`
                  : 'Resend'}
              </Button>
            </Group>

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
      </Paper>
    </Container>
  );
}
