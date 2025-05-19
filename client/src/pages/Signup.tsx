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
import { useNavigate, Link } from 'react-router-dom';
import { IconUserPlus } from '@tabler/icons-react';
import { AppDispatch, RootState } from '../store';
import { signup, clearError } from '../store/slices/authSlice';
import { useEffect } from 'react';
import { GoogleButton } from '../components/user/GoogleButton';

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
        if (!value.trim()) {
          return 'Name is required';
        }
        return value.length < 2 || value.length > 20 ? 'Name must have at least 2 characters and less than 20 characters' : null;
      },
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
      confirmPassword: (value, values) => {
        if (value !== values.password) {
          return 'Passwords do not match';
        }
        return null;
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
    <Container size={580} my={20} mt={100}>
      <Paper radius="lg" p="xl" withBorder>
        <Center mb="lg">
          <IconUserPlus size={42} color="var(--mantine-color-blue-6)" />
        </Center>

        <Title order={2} ta="center" mb="xs">
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
              placeholder="your@email.com"
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
              placeholder="Confirm your password"
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
            >
              Create account
            </Button>

            <Divider
              label="Already have an account?"
              labelPosition="center"
              my="xs"
            />

            <Group grow wrap="wrap" gap="sm">
              <Button
                component={Link}
                to="/login"
                variant="light"
                radius="xl"
                size="md"
                style={{ flex: '1 1 calc(50% - 8px)' }}
              >
                Sign in
              </Button>

              <GoogleButton style={{ flex: '1 1 calc(50% - 8px)' }} />
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
} 