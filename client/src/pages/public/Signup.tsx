import { useForm } from '@mantine/form';
import {
  Text,
  Button,
  Stack,
  Divider,
} from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { IconUserPlus } from '@tabler/icons-react';
import { AppDispatch, RootState } from '@/store';
import { signup } from '@slices/authSlice';
import { useEffect } from 'react';
import { GoogleButton } from '@components/user/GoogleButton';

import AuthContainer from '@/components/auth/AuthContainer';
import AuthHeader from '@/components/auth/AuthHeader';
import { TextField } from '@/components/auth/FormField';
import { PasswordField } from '@/components/auth/FormField';
import SubmitButton from '@/components/auth/SubmitButton';
import ErrorDisplay from '@/components/auth/ErrorDisplay';

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
    <AuthContainer my={20} mt={100}>
      <AuthHeader
        icon={<IconUserPlus size={42} color="var(--mantine-color-blue-6)" />}
        title="Create your account"
        description="Fill in your details to get started with LogIt"
      />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
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

          <SubmitButton loading={loading}>
            Create account
          </SubmitButton>

          <Divider
            label="Already have an account?"
            labelPosition="center"
            my="xs"
            color="gray"
          />

          <Stack gap="sm">
            <Button
              component={Link}
              to="/login"
              variant="light"
              radius="xl"
              size="md"
              fullWidth
            >
              Sign in
            </Button>

            <GoogleButton style={{ width: '100%' }} />
          </Stack>
        </Stack>
      </form>
    </AuthContainer>
  );
}
