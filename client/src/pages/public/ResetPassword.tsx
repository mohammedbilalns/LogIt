import { useForm } from '@mantine/form';
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Button,
  Stack,
  Container,
  Title,
  Center,
  PinInput,
  Group,
  Box,
} from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { IconLock, IconMailCheck } from '@tabler/icons-react';
import { AppDispatch, RootState } from '@/store';
import {
  initiatePasswordReset,
  verifyResetOTP,
  updatePassword,
  clearResetPasswordState,
  clearError,
} from '@slices/authSlice';
import { useEffect, useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';

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
        if (!value.trim()) {
          return 'Email is required';
        }
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(value)) {
          return 'Please enter a valid email address';
        }
        return null;
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
        if (!value.trim()) {
          return 'Password is required';
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
        if (!passwordRegex.test(value)) {
          return 'Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
        }
        return null;
      },
      confirmPassword: (value, values) => {
        if (value !== values.newPassword) {
          return 'Passwords do not match';
        }
        return null;
      },
    },
  });

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
    return () => {
      dispatch(clearResetPasswordState());
      dispatch(clearError());
    };
  }, [dispatch]);

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
    if (error) {
      dispatch(clearError());
    }
  };

  const handlePasswordSubmit = async (values: typeof passwordForm.values) => {
    if (resetPasswordEmail && otp) {
      const result = await dispatch(
        updatePassword({
          email: resetPasswordEmail,
          otp,
          newPassword: values.newPassword,
        })
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
      }
    }
  };

  const renderStep = () => {
    if (!resetPasswordEmail) {
      return (
        <form onSubmit={emailForm.onSubmit(handleEmailSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="your@email.com"
              radius="md"
              size="md"
              withAsterisk
              {...emailForm.getInputProps('email')}
            />
            <Button type="submit" radius="xl" loading={loading} fullWidth size="md">
              Send Reset Otp
            </Button>
            {error && (
              <Text c="red" size="sm" ta="center">
                {error}
              </Text>
            )}
          </Stack>
        </form>
      );
    }

    if (!resetPasswordVerified) {
      return (
        <form onSubmit={handleOTPSubmit}>
          <Stack>
            <Box ta="center">
              <PinInput
                length={6}
                size="lg"
                value={otp}
                onChange={handleOTPChange}
                error={Boolean(error)}
                type="number"
                oneTimeCode
                aria-label="Reset password code"
                disabled={otpExpiryTime === 0}
              />
            </Box>

            <Text c={otpExpiryTime < 60 ? "red" : "dimmed"} size="sm" ta="center" fw={500}>
              OTP expires in: {formatTime(otpExpiryTime)}
            </Text>

            {error && (
              <Text c="red" size="sm" ta="center">
                {error}
              </Text>
            )}

            {otpExpiryTime === 0 && (
              <Text c="yellow" size="sm" ta="center">
                OTP has expired. Please request a new one.
              </Text>
            )}

            <Button
              type="submit"
              radius="xl"
              loading={loading}
              disabled={otp.length !== 6 || otpExpiryTime === 0}
              fullWidth
            >
              Verify OTP
            </Button>

            <Group justify="center" gap="xs">
              <Text size="sm" c="dimmed">
                Didn't receive the code?
              </Text>
              <Button 
                variant="subtle" 
                size="sm" 
                onClick={handleResendOTP}
                loading={loading}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Resend in ${formatTime(resendCooldown)}` : 'Resend'}
              </Button>
            </Group>
          </Stack>
        </form>
      );
    }

    return (
      <form onSubmit={passwordForm.onSubmit(handlePasswordSubmit)}>
        <Stack gap="md">
          <PasswordInput
            label="New Password"
            placeholder="Enter new password"
            radius="md"
            size="md"
            withAsterisk
            {...passwordForm.getInputProps('newPassword')}
          />
          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm new password"
            radius="md"
            size="md"
            withAsterisk
            {...passwordForm.getInputProps('confirmPassword')}
          />
          <Button type="submit" radius="xl" loading={loading} fullWidth size="md">
            Update Password
          </Button>
        </Stack>
      </form>
    );
  };

  return (
    <Container size={470} my={40} mt={200}>
      <Paper radius="lg" p="xl" withBorder>
        <Center mb="lg">
          {!resetPasswordEmail ? (
            <IconLock size={50} color="var(--mantine-color-blue-6)" />
          ) : !resetPasswordVerified ? (
            <IconMailCheck size={50} color="var(--mantine-color-blue-6)" />
          ) : (
            <IconLock size={50} color="var(--mantine-color-blue-6)" />
          )}
        </Center>

        <Title order={2} ta="center" mb="xs">
          {!resetPasswordEmail
            ? 'Reset Password'
            : !resetPasswordVerified
            ? 'Verify OTP'
            : 'Create New Password'}
        </Title>

        <Text c="dimmed" size="sm" ta="center" mb="lg">
          {!resetPasswordEmail ? (
            'Enter your email to reset your password'
          ) : !resetPasswordVerified ? (
            <>
              We've sent a verification code to{' '}
              <Text span fw={500} c="blue">
                {resetPasswordEmail}
              </Text>
            </>
          ) : (
            'Enter your new password'
          )}
        </Text>

        {renderStep()}

        <Button
          variant="subtle"
          fullWidth
          mt="md"
          onClick={() => navigate('/login')}
        >
          Back to Login
        </Button>
      </Paper>
    </Container>
  );
} 