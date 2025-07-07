import {
  Modal,
  TextInput,
  NumberInput,
  Button,
  Group,
  Stack,
  rem,
  Switch,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { CreateSubscriptionData, UpdateSubscriptionData } from '@/store/slices/subscriptionSlice';
import { useEffect } from 'react';

interface SubscriptionModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: CreateSubscriptionData | UpdateSubscriptionData) => Promise<void>;
  initialValues: CreateSubscriptionData;
  loading?: boolean;
  editMode?: boolean;
}

export default function SubscriptionSettingsModal({
  opened,
  onClose,
  onSubmit,
  initialValues,
  loading = false,
  editMode = false,
}: SubscriptionModalProps) {
  const isPro = initialValues.name.toLowerCase() === 'pro';
  const isBase = initialValues.name.toLowerCase() === 'base';
  const form = useForm<CreateSubscriptionData>({
    initialValues,
    validate: {
      name: (value) => (!value.trim() ? 'Name is required' : null),
      description: (value) => (!value.trim() ? 'Description is required' : null),
      price: (value) => (value < 0 ? 'Price must be non-negative' : null),
      maxLogsPerMonth: (value) => (value < -1 ? 'Must be -1 (unlimited) or non-negative' : null),
      maxArticlesPerMonth: (value) => (value < -1 ? 'Must be -1 (unlimited) or non-negative' : null),
    },
  });

  useEffect(() => {
    if (opened) form.setValues(initialValues);
  }, [opened, initialValues]);

  const handleSubmit = async (values: CreateSubscriptionData) => {
    try {
      await onSubmit(values);
    } catch (err: any) {
      onClose();
      let message = 'Failed to save subscription';
      if (err?.response?.data?.message) message = err.response.data.message;
      else if (typeof err === 'string') message = err;
      else if (err?.message) message = err.message;
      if (typeof window !== 'undefined' && (window as any).notifications) {
        (window as any).notifications.show({ title: 'Error', message, color: 'red' });
      } else if (typeof window !== 'undefined') {
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
      title={editMode ? 'Edit Subscription' : 'New Subscription'}
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
            disabled={isBase}
            description={isBase ? 'Base plan name cannot be changed' : undefined}
          />
          <TextInput
            label="Description"
            {...form.getInputProps('description')}
            required
          />
          <Switch
            label="Active"
            {...form.getInputProps('isActive', { type: 'checkbox' })}
            disabled={isBase}
            description={isBase ? 'Base plan cannot be deactivated' : undefined}
          />
          <NumberInput
            label="Price"
            {...form.getInputProps('price')}
            min={0}
            required
            prefix="$"
            disabled={isBase}
            description={isBase ? 'Base plan price cannot be changed' : undefined}
          />
          <NumberInput
            label="Max Logs Per Month"
            {...form.getInputProps('maxLogsPerMonth')}
            min={isPro ? -1 : 0}
            required
            disabled={isPro}
            placeholder={isPro ? 'Unlimited' : undefined}
            description={isPro ? 'Pro plans have unlimited logs' : undefined}
          />
          <NumberInput
            label="Max Articles Per Month"
            {...form.getInputProps('maxArticlesPerMonth')}
            min={isPro ? -1 : 0}
            required
            disabled={isPro}
            placeholder={isPro ? 'Unlimited' : undefined}
            description={isPro ? 'Pro plans have unlimited articles' : undefined}
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