import {
    Modal,
    PasswordInput,
    Button,
    Group,
    Stack,
    rem,
  } from '@mantine/core';
  import { useForm } from '@mantine/form';
  
  interface ChangePasswordForm {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
  
  interface ChangePasswordModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: ChangePasswordForm) => void;
  }
  
  export default function ChangePasswordModal({
    opened,
    onClose,
    onSubmit,
  }: ChangePasswordModalProps) {
    const form = useForm<ChangePasswordForm>({
      initialValues: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
  
      validate: {
        currentPassword: (value) =>
          !value ? 'Current password is required' : null,
  
        newPassword: (value) => {
          if (!value) return 'New password is required';
          if (value.length < 8) return 'Password must be at least 8 characters';
          if (!/[A-Z]/.test(value)) return 'Must contain at least one uppercase letter';
          if (!/[a-z]/.test(value)) return 'Must contain at least one lowercase letter';
          if (!/[0-9]/.test(value)) return 'Must contain at least one number';
          if (!/[!@#$%^&*]/.test(value)) return 'Must contain at least one special character';
          return null;
        },
  
        confirmPassword: (value, values) =>
          value !== values.newPassword ? 'Passwords do not match' : null,
      },
    });
  
    const handleSubmit = (values: ChangePasswordForm) => {
      onSubmit(values);
      form.reset(); // reset only after submission
    };
  
    return (
      <Modal
        opened={opened}
        onClose={onClose}
        title="Change Password"
        centered
        size="md"
        overlayProps={{
          blur: 6,
          backgroundOpacity: 0.35,
          color: '#000',
          zIndex: 3000,
        }}
        zIndex={3100}
        styles={{
          content: {
            borderRadius: rem(16),
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(8px)',
          },
          header: {
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            marginBottom: rem(10),
          },
        }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <PasswordInput
              label="Current Password"
              placeholder="Enter your current password"
              {...form.getInputProps('currentPassword')}
            />
            <PasswordInput
              label="New Password"
              placeholder="Enter your new password"
              {...form.getInputProps('newPassword')}
            />
            <PasswordInput
              label="Confirm New Password"
              placeholder="Confirm your new password"
              {...form.getInputProps('confirmPassword')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Change Password</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    );
  }
  