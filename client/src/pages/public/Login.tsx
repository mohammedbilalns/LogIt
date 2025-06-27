import { useEffect } from 'react';
import { useForm } from '@mantine/form';
import {
  Button,
  Stack,
  Group,
  Divider,
  Alert,
} from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LockIcon } from '@/components/icons/LockIcon';
import { AlertCircleIcon } from '@/components/icons/AlertCircleIcon';
import { AppDispatch, RootState } from '@/store';
import { login, clearError } from '@slices/authSlice';
import { GoogleButton } from '@components/user/GoogleButton';

import AuthContainer from '@/components/auth/AuthContainer';
import AuthHeader from '@/components/auth/AuthHeader';
import { TextField } from '@/components/auth/FormField';
import { PasswordField } from '@/components/auth/FormField';
import SubmitButton from '@/components/auth/SubmitButton';
import ErrorDisplay from '@/components/auth/ErrorDisplay';

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
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
    <AuthContainer>
      <AuthHeader
        icon={<LockIcon width={42} height={42} color="var(--mantine-color-blue-6)" />}
        title="Welcome back to LogIt"
        description="Enter your credentials to access your account"
      />

      {isBlocked && (
        <Alert
          icon={<AlertCircleIcon width={16} height={16} />}
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
          <TextField
            label="Email"
            placeholder="your@email.com"
            {...form.getInputProps('email')}
          />

          <PasswordField
            label="Password"
            placeholder="Your password"
            {...form.getInputProps('password')}
          />

          <ErrorDisplay error={error} />

          <SubmitButton loading={loading}>
            Sign in
          </SubmitButton>

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
    </AuthContainer>
  );
}
