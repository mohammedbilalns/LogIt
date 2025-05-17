import { useEffect, useState } from 'react';
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
import { AppDispatch, RootState } from '../store';
import { verifyEmail, clearError } from '../store/slices/authSlice';

export function EmailVerification() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const { loading, error, isAuthenticated, verificationEmail } = useSelector(
    (state: RootState) => state.auth
  );

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationEmail && otp.length === 6) {
      await dispatch(verifyEmail({ email: verificationEmail, otp }));
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
                error={Boolean(error)}
                type="number"
                oneTimeCode
                aria-label="Verification code"
              />
            </Box>

            {error && (
              <Text c="red" size="sm" ta="center">
                {error}
              </Text>
            )}

            <Button
              type="submit"
              radius="xl"
              loading={loading}
              disabled={otp.length !== 6}
              fullWidth
            >
              Verify Email
            </Button>

            <Group justify="center" gap="xs">
              <Text size="sm" c="dimmed">
                Didn't receive the code?
              </Text>
              <Button variant="subtle" size="sm" onClick={() => setOtp('')}>
                Resend
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
} 