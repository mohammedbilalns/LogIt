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
import CustomGoogleButton from '@/components/user/CustomGoogleButton';

import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
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
    <AuthSplitLayout
      rightHeading="Welcome back to LogIt!"
      rightDescription={
        'Log, share, connect, and grow. Your personal digital journal and knowledge hub.'
      }
    >
      <Group justify="center" mb="md">
        <LockIcon width={36} height={36} color="var(--mantine-color-blue-6)" />
      </Group>
      <Stack gap={4} mb="lg" align="center">
        <h2 style={{ fontWeight: 700, fontSize: 28, margin: 0 }}>Login</h2>
        <div style={{ color: '#888', fontSize: 15, textAlign: 'center' }}>
          See your growth and get consulting support!
        </div>
      </Stack>
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
        <Stack gap="sm">
          <CustomGoogleButton style={{ width: '100%' }} />
          <Divider label="or Sign in with Email" labelPosition="center" my="xs" color="gray" />
          <TextField
            label="Email"
            placeholder="mail@website.com"
            {...form.getInputProps('email')}
          />
          <PasswordField
            label="Password"
            placeholder="Min. 8 character"
            {...form.getInputProps('password')}
          />
          <Group justify="flex-end" align="center" mt={-8} mb={-4}>
            <Button
              component={Link}
              to="/reset-password"
              variant="subtle"
              size="sm"
              color="blue"
              style={{ fontWeight: 500 }}
            >
              Forgot password?
            </Button>
          </Group>
          <ErrorDisplay error={error} />
          <SubmitButton loading={loading} style={{ width: '100%' }}>
            Login
          </SubmitButton>
          <Group justify="center" mt={4}>
            <span style={{ fontSize: 14, color: '#888' }}>Not registered yet?</span>
            <Button
              component={Link}
              to="/signup"
              variant="subtle"
              size="sm"
              color="blue"
              style={{ fontWeight: 500 }}
            >
              Create an Account
            </Button>
          </Group>
        </Stack>
      </form>
    </AuthSplitLayout>
  );
}
