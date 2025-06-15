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
} from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { IconUserPlus } from '@tabler/icons-react';
import { AppDispatch, RootState } from '@/store';
import { signup, clearError } from '@slices/authSlice';
import { useEffect } from 'react';
import { GoogleButton } from '@components/user/GoogleButton';
import { useMediaQuery } from '@mantine/hooks';

export default function Signup() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, verificationEmail } = useSelector((state: RootState) => state.auth);
  const isMobile = useMediaQuery('(max-width: 768px)');

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
      navigate('/verify-email');
    }
    return () => {
      dispatch(clearError());
    };
  }, [verificationEmail, navigate, dispatch]);

  const handleSubmit = async (values: typeof form.values) => {
    await dispatch(signup(values));
  };

  return (
    <Container size={580} my={20} mt={100} px={isMobile ? 'xs' : 'md'}>
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
          <IconUserPlus size={42} color="var(--mantine-color-blue-6)" />
        </Center>

        <Title order={2} ta="center" mb="xs" fw={700}>
          Create your account
        </Title>

        <Text c="dimmed" size="sm" ta="center" mb="lg">
          Fill in your details to get started with LogIt
        </Text>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Name"
              placeholder="Your name"
              radius="md"
              size="md"
              withAsterisk
              {...form.getInputProps('name')}
            />

            <TextInput
              label="Email"
              placeholder="you@example.com"
              radius="md"
              size="md"
              withAsterisk
              {...form.getInputProps('email')}
            />

            <PasswordInput
              label="Password"
              placeholder="Create a strong password"
              radius="md"
              size="md"
              withAsterisk
              {...form.getInputProps('password')}
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Repeat your password"
              radius="md"
              size="md"
              withAsterisk
              {...form.getInputProps('confirmPassword')}
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
              Create account
            </Button>

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
      </Paper>
    </Container>
  );
}
