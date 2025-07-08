import { useForm } from '@mantine/form';
import {
  Button,
  Stack,
  Divider,
  Group,
} from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlusIcon } from '@/presentation/components/icons/UserPlusIcon';
import { AppDispatch, RootState } from '@/infrastructure/store';
import { signup } from '@/infrastructure/store/slices/authSlice';
import { useEffect } from 'react';
import CustomGoogleButton from '@/presentation/components/user/CustomGoogleButton';

import AuthSplitLayout from '@/presentation/components/auth/AuthSplitLayout';
import { TextField } from '@/presentation/components/auth/FormField';
import { PasswordField } from '@/presentation/components/auth/FormField';
import SubmitButton from '@/presentation/components/auth/SubmitButton';
import ErrorDisplay from '@/presentation/components/auth/ErrorDisplay';

export default function Signup() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, verificationEmail } = useSelector((state: RootState) => state.auth);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      name: (value) => {
        if (!value.trim()) return 'Name is required';
        return value.length < 2 || value.length > 20
          ? 'Name must be 2–20 characters'
          : null;
      },
      email: (value) => {
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return !emailRegex.test(value)
          ? 'Please enter a valid email address'
          : null;
      },
      password: (value) => {
        if (!value.trim()) return 'Password is required';
        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
        return !passwordRegex.test(value)
          ? 'Password must be 8+ characters with uppercase, lowercase, number & symbol'
          : null;
      },
      confirmPassword: (value, values) => {
        return value !== values.password ? 'Passwords do not match' : null;
      },
    },
  });

  useEffect(() => {
    if (verificationEmail) {
      navigate('/verify-email', { state: { email: verificationEmail } });
    }
  
  }, [verificationEmail, loading, error, navigate, dispatch]);

  const handleSubmit = async (values: typeof form.values) => {
    const result = await dispatch(signup(values));
  };

  return (
    <AuthSplitLayout
      rightHeading="Join LogIt today!"
      rightDescription={
        'Start your journey. Log, share, connect, and grow with your personal digital journal and knowledge hub.'
      }
    >
      <Group justify="center" mb="md">
        <UserPlusIcon width={36} color="var(--mantine-color-blue-6)" />
      </Group>
      <Stack gap={4} mb="lg" align="center">
        <h2 style={{ fontWeight: 700, fontSize: 28, margin: 0 }}>Create Account</h2>
        <div style={{ color: '#888', fontSize: 15, textAlign: 'center' }}>
          Start your journey with LogIt today!
        </div>
      </Stack>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <CustomGoogleButton style={{ width: '100%' }} />
          <Divider label="or Sign up with Email" labelPosition="center" my="xs" color="gray" />
          <TextField
            label="Name"
            placeholder="Your name"
            {...form.getInputProps('name')}
          />
          <TextField
            label="Email"
            placeholder="you@example.com"
            {...form.getInputProps('email')}
          />
          <PasswordField
            label="Password"
            placeholder="Create a strong password"
            {...form.getInputProps('password')}
          />
          <PasswordField
            label="Confirm Password"
            placeholder="Repeat your password"
            {...form.getInputProps('confirmPassword')}
          />
          <ErrorDisplay error={error} />
          <SubmitButton loading={loading} style={{ width: '100%' }}>
            Create account
          </SubmitButton>
          <Group justify="center" mt={4}>
            <span style={{ fontSize: 14, color: '#888' }}>Already have an account?</span>
            <Button
              component={Link}
              to="/login"
              variant="subtle"
              size="sm"
              color="blue"
              style={{ fontWeight: 500 }}
            >
              Sign in
            </Button>
          </Group>
        </Stack>
      </form>
    </AuthSplitLayout>
  );
}
