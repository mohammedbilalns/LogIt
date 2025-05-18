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
} from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { IconLock } from '@tabler/icons-react';
import { AppDispatch, RootState } from '../store';
import { login, clearError } from '../store/slices/authSlice';
import { useEffect } from 'react';
import { GoogleButton } from '../components/user/GoogleButton';

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

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
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
        if (!passwordRegex.test(value)) {
          return 'Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from);
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, location.state?.from?.pathname, dispatch]);

  const handleSubmit = async (values: typeof form.values) => {
    await dispatch(login(values));
  };

  return (
    <Container size={580} my={40}>
      <Paper radius="lg" p="xl" withBorder>
        <Center mb="lg">
          <IconLock size={42} color="var(--mantine-color-blue-6)" />
        </Center>

        <Title order={2} ta="center" mb="xs">
          Welcome back to LogIt
        </Title>

        <Text c="dimmed" size="sm" ta="center" mb="lg">
          Enter your credentials to access your account
        </Text>

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
            />

            <Group grow wrap="wrap" gap="sm">
              <Button
                component={Link}
                to="/signup"
                variant="light"
                radius="xl"
                size="md"
                style={{ flex: '1 1 calc(50% - 8px)' }}
              >
                Create account
              </Button>

              <GoogleButton style={{ flex: '1 1 calc(50% - 8px)' }} />
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
} 