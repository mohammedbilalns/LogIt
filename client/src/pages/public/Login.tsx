import { useEffect } from 'react';
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
  Divider,
  Group,
  Alert,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { IconLock, IconAlertCircle } from '@tabler/icons-react';
import { AppDispatch, RootState } from '@/store';
import { login, clearError } from '@slices/authSlice';
import { GoogleButton } from '@components/user/GoogleButton';

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const searchParams = new URLSearchParams(location.search);
  const isBlocked = searchParams.get('error') === 'blocked';

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
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
      password: (value) => {
        if (!value.trim()) {
          return 'Password is required';
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, location.state?.from?.pathname, dispatch]);

  const handleSubmit = async (values: typeof form.values) => {
    await dispatch(login(values));
  };

  return (
    <Container size={580} my={40} mt={140} px={isMobile ? 'xs' : 'md'}>
      <Paper
        radius="lg"
        p={isMobile ? 'md' : 'xl'}
        withBorder={false}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Center mb="lg">
          <IconLock size={42} color="var(--mantine-color-blue-6)" />
        </Center>

        <Title order={2} ta="center" mb="xs" fw={700}>
          Welcome back to LogIt
        </Title>

        <Text c="dimmed" size="sm" ta="center" mb="lg">
          Enter your credentials to access your account
        </Text>

        {isBlocked && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Account Blocked"
            color="red"
            mb="lg"
            variant="filled"
          >
            Your account has been blocked. Please contact support for assistance.
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="your@email.com"
              radius="md"
              size="md"
              withAsterisk
              {...form.getInputProps('email')}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              radius="md"
              size="md"
              withAsterisk
              {...form.getInputProps('password')}
            />

            {error && (
              <Text c="red" size="sm" ta="center">
                {error}
              </Text>
            )}

            <Button
              type="submit"
              radius="xl"
              loading={loading}
              fullWidth
              size="md"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
            >
              Sign in
            </Button>

            <Group justify="flex-end">
              <Button
                component={Link}
                to="/reset-password"
                variant="subtle"
                size="sm"
                color="gray"
              >
                Forgot password?
              </Button>
            </Group>

            <Divider
              label="Don't have an account?"
              labelPosition="center"
              my="xs"
              color="gray"
            />

            <Stack gap="sm">
              <Button
                component={Link}
                to="/signup"
                variant="light"
                radius="xl"
                size="md"
                fullWidth
              >
                Create account
              </Button>

              <GoogleButton style={{ width: '100%' }} />
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
