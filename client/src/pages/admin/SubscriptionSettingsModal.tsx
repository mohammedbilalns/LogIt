import {
  Modal,
  TextInput,
  NumberInput,
  Button,
  Group,
  Stack,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { SubscriptionPlan } from '@/store/slices/subscriptionSlice';
import { useEffect } from 'react';

interface SubscriptionModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<SubscriptionPlan, 'id'>) => Promise<void>;
  initialValues: Omit<SubscriptionPlan, 'id'>;
  loading?: boolean;
  editMode?: boolean;
  isBase?: boolean;
}

export default function SubscriptionSettingsModal({
  opened,
  onClose,
  onSubmit,
  initialValues,
  loading = false,
  editMode = false,
  isBase = false,
}: SubscriptionModalProps) {
  const isPro = initialValues.name.toLowerCase() === 'pro';
  const form = useForm<Omit<SubscriptionPlan, 'id'>>({
    initialValues,
    validate: {
      name: (value) => (!value.trim() ? 'Name is required' : null),
      description: (value) => (!value.trim() ? 'Description is required' : null),
      price: (value) => (value < 0 ? 'Price must be non-negative' : null),
      maxLogsPerMonth: (value) => (value < -1 ? 'Must be -1 (unlimited) or non-negative' : null),
      maxArticlesPerMonth: (value) => (value < -1 ? 'Must be -1 (unlimited) or non-negative' : null),
    },
  });

  // Reset form when modal opens/closes or initialValues change
  useEffect(() => {
    if (opened) form.setValues(initialValues);
  }, [opened, initialValues]);

  const handleSubmit = async (values: Omit<SubscriptionPlan, 'id'>) => {
    try {
      await onSubmit(values);
    } catch (err: any) {
      onClose();
      let message = 'Failed to save subscription';
      if (err?.response?.data?.message) message = err.response.data.message;
      else if (typeof err === 'string') message = err;
      else if (err?.message) message = err.message;
      // Use window.notifications if available, else fallback
      if (typeof window !== 'undefined' && (window as any).notifications) {
        (window as any).notifications.show({ title: 'Error', message, color: 'red' });
      } else if (typeof window !== 'undefined') {
        // fallback for Mantine notifications
        import('@mantine/notifications').then(({ notifications }) => {
          notifications.show({ title: 'Error', message, color: 'red' });
        });
      }
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editMode ? (isBase ? 'Edit Base Plan' : isPro ? 'Edit Pro Plan' : 'Edit Subscription') : 'New Subscription'}
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
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Name"
            {...form.getInputProps('name')}
            required
            disabled
          />
          <TextInput
            label="Description"
            {...form.getInputProps('description')}
            required
            disabled
          />
          <NumberInput
            label="Price"
            {...form.getInputProps('price')}
            min={0}
            required
          />
          <NumberInput
            label="Max Logs Per Month"
            {...form.getInputProps('maxLogsPerMonth')}
            min={isPro ? -1 : 0}
            required
            disabled={isPro}
            placeholder={isPro ? 'Unlimited' : undefined}
          />
          <NumberInput
            label="Max Articles Per Month"
            {...form.getInputProps('maxArticlesPerMonth')}
            min={isPro ? -1 : 0}
            required
            disabled={isPro}
            placeholder={isPro ? 'Unlimited' : undefined}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editMode ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
} 