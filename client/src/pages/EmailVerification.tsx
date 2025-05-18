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
  Notification,
} from '@mantine/core';
import { IconMailCheck } from '@tabler/icons-react';
import { AppDispatch, RootState } from '../store';
import { verifyEmail, clearError, resendOTP } from '../store/slices/authSlice';
import { notifications } from '@mantine/notifications';

const OTP_EXPIRY_TIME = 5 * 60; 
const RESEND_COOLDOWN = 60; 

export function EmailVerification() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [otpExpiryTime, setOtpExpiryTime] = useState(OTP_EXPIRY_TIME);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { loading, resendLoading, error, isAuthenticated, verificationEmail } = useSelector(
    (state: RootState) => state.auth
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startResendCooldown = useCallback(() => {
    setResendCooldown(RESEND_COOLDOWN);
  }, []);

  const resetOtpExpiry = useCallback(() => {
    setOtpExpiryTime(OTP_EXPIRY_TIME);
  }, []);

  useEffect(() => {
    if (!verificationEmail) {
      navigate('/signup');
    }
    if (isAuthenticated) {
      navigate('/');
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch, verificationEmail]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (otpExpiryTime > 0) {
        setOtpExpiryTime(prev => prev - 1);
      }
      if (resendCooldown > 0) {
        setResendCooldown(prev => prev - 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [otpExpiryTime, resendCooldown]);

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
          title: 'Maximum OTP retry attempts exceeded',
          message: 'Please sign up again',
          color: 'red',
        });
        navigate('/signup');
      }
    }
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
    <Container size={420} my={40}>
      <Paper radius="lg" p="xl" withBorder>
        <Center mb="xl">
          <IconMailCheck size={50} color="var(--mantine-color-blue-6)" />
        </Center>
        
        <Title order={2} ta="center" mb="sm">
          Verify your email
        </Title>
        
        <Text c="dimmed" size="sm" ta="center" mb="xl">
          We've sent a verification code to{' '}
          <Text span fw={500} c="blue">
            {verificationEmail}
          </Text>
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack>
            <Box ta="center">
              <PinInput
                length={6}
                size="lg"
                value={otp}
                onChange={setOtp}
                error={Boolean(error) || otpExpiryTime === 0}
                type="number"
                oneTimeCode
                aria-label="Verification code"
                disabled={otpExpiryTime === 0}
              />
            </Box>

            <Text c={otpExpiryTime < 60 ? "red" : "dimmed"} size="sm" ta="center" fw={500}>
              OTP expires in: {formatTime(otpExpiryTime)}
            </Text>

            {error && (
              <Notification color="red" onClose={() => dispatch(clearError())}>
                {error}
              </Notification>
            )}

            {otpExpiryTime === 0 && (
              <Notification color="yellow">
                OTP has expired. Please request a new one.
              </Notification>
            )}

            <Button
              type="submit"
              radius="xl"
              loading={loading}
              disabled={otp.length !== 6 || otpExpiryTime === 0}
              fullWidth
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
                {resendCooldown > 0 ? `Resend in ${formatTime(resendCooldown)}` : 'Resend'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
} 