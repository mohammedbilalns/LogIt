import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  SubscriptionPlan,
} from '@/store/slices/subscriptionSlice';
import {
  Table,
  Button,
  Stack,
  ActionIcon,
  Card,
  Paper,
  Text,
  Title,
  useMantineTheme,
  useMantineColorScheme,
  ScrollArea,
  Group,
} from '@mantine/core';
import { EditIcon } from '@/components/icons/EditIcon';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import AdminPageContainer from '@/components/admin/AdminPageContainer';
import LoadingState from '@/components/admin/LoadingState';
import EmptyState from '@/components/admin/EmptyState';
import ErrorState from '@/components/admin/ErrorState';
import SubscriptionSettingsModal from './SubscriptionSettingsModal';

const emptyForm: Omit<SubscriptionPlan, 'id'> = {
  name: '',
  description: '',
  price: 0,
  maxLogsPerMonth: 0,
  maxArticlesPerMonth: 0,
};

export default function SubscriptionSettings() {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);

  const { subscriptions, loading, error } = useSelector((state: RootState) => state.subscriptions);

  // Fetch subscriptions on mount
  useEffect(() => {
    dispatch(fetchSubscriptions());
  }, [dispatch]);

  const handleOpenCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (sub: SubscriptionPlan) => {
    setEditId(sub.id);
    setForm({ ...sub });
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditId(null);
    setForm(emptyForm);
  };

  // Modal submit handler
  const handleModalSubmit = async (values: Omit<SubscriptionPlan, 'id'>) => {
    try {
      if (editId) {
        await dispatch(updateSubscription({ ...values, id: editId })).unwrap();
        notifications.show({ title: 'Success', message: 'Subscription updated', color: 'green' });
      } else {
        await dispatch(createSubscription(values)).unwrap();
        notifications.show({ title: 'Success', message: 'Subscription created', color: 'green' });
      }
      handleClose();
    } catch (err: any) {
      handleClose();
      let message = 'Failed to save subscription';
      if (typeof err === 'string') message = err;
      else if (err?.message) message = err.message;
      notifications.show({ title: 'Error', message, color: 'red' });
    }
  };

  const handleDelete = async (id: string) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!toDeleteId) return;
    try {
      await dispatch(deleteSubscription(toDeleteId)).unwrap();
      notifications.show({ title: 'Success', message: 'Subscription deleted', color: 'green' });
    } catch (err: any) {
      notifications.show({ title: 'Error', message: err.message || 'Failed to delete subscription', color: 'red' });
    } finally {
      setConfirmOpen(false);
      setToDeleteId(null);
    }
  };

  // Table/Card rendering
  const renderMobileCard = (sub: SubscriptionPlan) => {
    const isBase = sub.name.toLowerCase() === 'base';
    const isPlus = sub.name.toLowerCase() === 'plus';
    const isPro = sub.name.toLowerCase() === 'pro';
    return (
      <Card key={sub.id} shadow="xs" p="md" withBorder mb="sm">
        <Stack gap="sm">
          <Text fw={600} size="md">{sub.name}</Text>
          <Text size="sm" c="dimmed">{sub.description}</Text>
          <Group gap="xs">
            <Text size="sm">Price:</Text>
            <Text size="sm" fw={500}>{sub.price}</Text>
          </Group>
          <Group gap="xs">
            <Text size="sm">Max Logs/Month:</Text>
            <Text size="sm" fw={500}>{sub.maxLogsPerMonth === -1 ? 'Unlimited' : sub.maxLogsPerMonth}</Text>
          </Group>
          <Group gap="xs">
            <Text size="sm">Max Articles/Month:</Text>
            <Text size="sm" fw={500}>{sub.maxArticlesPerMonth === -1 ? 'Unlimited' : sub.maxArticlesPerMonth}</Text>
          </Group>
          <Group gap="xs">
            <Button size="xs" leftSection={<EditIcon width={16} />} onClick={() => handleOpenEdit(sub)}>
              Edit
            </Button>
          </Group>
        </Stack>
      </Card>
    );
  };

  return (
    <AdminPageContainer>
      <Stack gap="lg">
        <Paper shadow="xs" p="md" withBorder>
          <Group justify="space-between" align="center">
            <Title order={3} fw={600}>
              Subscription Settings
            </Title>
          </Group>
        </Paper>
        <Paper shadow="xs" p="md" withBorder>
          {loading && <LoadingState message="Loading subscriptions..." />}
          {error && <ErrorState message={error} />}
          {!loading && !error && subscriptions.length === 0 && <EmptyState message="No subscriptions found" />}
          {isMobile ? (
            <Stack gap="md">
              {subscriptions.map((sub) => {
                const isBase = sub.name.toLowerCase() === 'base';
                const isPlus = sub.name.toLowerCase() === 'plus';
                const isPro = sub.name.toLowerCase() === 'pro';
                return (
                  <Card key={sub.id} shadow="xs" p="md" withBorder mb="sm">
                    <Stack gap="sm">
                      <Text fw={600} size="md">{sub.name}</Text>
                      <Text size="sm" c="dimmed">{sub.description}</Text>
                      <Group gap="xs">
                        <Text size="sm">Price:</Text>
                        <Text size="sm" fw={500}>{sub.price}</Text>
                      </Group>
                      <Group gap="xs">
                        <Text size="sm">Max Logs/Month:</Text>
                        <Text size="sm" fw={500}>{sub.maxLogsPerMonth === -1 ? 'Unlimited' : sub.maxLogsPerMonth}</Text>
                      </Group>
                      <Group gap="xs">
                        <Text size="sm">Max Articles/Month:</Text>
                        <Text size="sm" fw={500}>{sub.maxArticlesPerMonth === -1 ? 'Unlimited' : sub.maxArticlesPerMonth}</Text>
                      </Group>
                      <Group gap="xs">
                        <Button size="xs" leftSection={<EditIcon width={16} />} onClick={() => handleOpenEdit(sub)}>
                          Edit
                        </Button>
                      </Group>
                    </Stack>
                  </Card>
                );
              })}
            </Stack>
          ) : (
            <ScrollArea>
              <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Description</Table.Th>
                    <Table.Th>Price</Table.Th>
                    <Table.Th>Max Logs/Month</Table.Th>
                    <Table.Th>Max Articles/Month</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {subscriptions.map((sub) => {
                    const isBase = sub.name.toLowerCase() === 'base';
                    const isPlus = sub.name.toLowerCase() === 'plus';
                    const isPro = sub.name.toLowerCase() === 'pro';
                    return (
                      <Table.Tr key={sub.id}>
                        <Table.Td>{sub.name}</Table.Td>
                        <Table.Td>{sub.description}</Table.Td>
                        <Table.Td>{sub.price}</Table.Td>
                        <Table.Td>{sub.maxLogsPerMonth === -1 ? 'Unlimited' : sub.maxLogsPerMonth}</Table.Td>
                        <Table.Td>{sub.maxArticlesPerMonth === -1 ? 'Unlimited' : sub.maxArticlesPerMonth}</Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon color="blue" onClick={() => handleOpenEdit(sub)}>
                              <EditIcon width={18} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          )}
        </Paper>
        <SubscriptionSettingsModal
          opened={modalOpen}
          onClose={handleClose}
          onSubmit={handleModalSubmit}
          initialValues={form}
          loading={loading}
          editMode={!!editId}
          isBase={editId ? (subscriptions.find(s => s.id === editId)?.name.toLowerCase() === 'base') : false}
        />
      </Stack>
    </AdminPageContainer>
  );
} 