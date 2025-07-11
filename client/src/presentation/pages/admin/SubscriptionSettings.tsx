import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/infrastructure/store';
import {
  fetchSubscriptions,
  createSubscription,
  updateSubscription,
  deactivateSubscription,
  CreateSubscriptionData,
  UpdateSubscriptionData,
} from '@/infrastructure/store/slices/subscriptionSlice';
import { SubscriptionPlan } from '@/types/subscription.types';
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
  Badge,
} from '@mantine/core';
import { EditIcon } from '@/presentation/components/icons/EditIcon';
import { BanIcon } from '@/presentation/components/icons/BanIcon';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import AdminPageContainer from '@/presentation/components/admin/AdminPageContainer';
import LoadingState from '@/presentation/components/admin/LoadingState';
import EmptyState from '@/presentation/components/admin/EmptyState';
import ErrorState from '@/presentation/components/admin/ErrorState';
import SubscriptionSettingsModal from './SubscriptionSettingsModal';
import { ConfirmModal } from '@/presentation/components/confirm';

const emptyForm: CreateSubscriptionData = {
  name: '',
  description: '',
  isActive: true,
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
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);
  const [toDeactivateId, setToDeactivateId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { subscriptions, loading, error } = useSelector((state: RootState) => state.subscriptions);

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
  const handleModalSubmit = async (values: CreateSubscriptionData | UpdateSubscriptionData) => {
    try {
      if (editId) {
        await dispatch(updateSubscription({ ...values, id: editId })).unwrap();
        notifications.show({ title: 'Success', message: 'Subscription updated', color: 'green' });
      } else {
        await dispatch(createSubscription(values as CreateSubscriptionData)).unwrap();
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

  const handleDeactivate = async (id: string) => {
    const subscription = subscriptions.find(s => s.id === id);
    if (subscription?.name.toLowerCase() === 'base') {
      notifications.show({ 
        title: 'Error', 
        message: 'Cannot deactivate the base plan', 
        color: 'red' 
      });
      return;
    }
    setToDeactivateId(id);
    setDeactivateConfirmOpen(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!toDeactivateId) return;
    setActionLoading(true);
    try {
      await dispatch(deactivateSubscription(toDeactivateId)).unwrap();
      notifications.show({ title: 'Success', message: 'Subscription deactivated', color: 'green' });
      setDeactivateConfirmOpen(false);
      setToDeactivateId(null);
    } catch (err: any) {
      notifications.show({ title: 'Error', message: err.message || 'Failed to deactivate subscription', color: 'red' });
    } finally {
      setActionLoading(false);
    }
  };

  // Table/Card rendering
  const renderMobileCard = (sub: SubscriptionPlan) => {
    const isBase = sub.name.toLowerCase() === 'base';
    return (
      <Card key={sub.id} shadow="xs" p="md" withBorder mb="sm">
        <Stack gap="sm">
          <Group justify="space-between">
            <Text fw={600} size="md">{sub.name}</Text>
            <Badge color={sub.isActive ? 'green' : 'red'}>
              {sub.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </Group>
          <Text size="sm" c="dimmed">{sub.description}</Text>
          <Group gap="xs">
            <Text size="sm">Price:</Text>
            <Text size="sm" fw={500}>₹{sub.price}</Text>
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
            {sub.isActive && !isBase && (
              <Button 
                size="xs" 
                color="orange" 
                leftSection={<BanIcon width={16} />} 
                onClick={() => handleDeactivate(sub.id)}
              >
                Deactivate
              </Button>
            )}
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
            <Button onClick={handleOpenCreate}>
              Create Subscription
            </Button>
          </Group>
        </Paper>
        <Paper shadow="xs" p="md" withBorder>
          {loading && <LoadingState message="Loading subscriptions..." />}
          {error && <ErrorState message={error} />}
          {!loading && !error && subscriptions.length === 0 && <EmptyState message="No subscriptions found" />}
          {!loading && !error && subscriptions.length > 0 && (
            isMobile ? (
              <Stack gap="md">
                {subscriptions.map(renderMobileCard)}
              </Stack>
            ) : (
              <ScrollArea>
                <Table striped highlightOnHover withTableBorder withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Description</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Price</Table.Th>
                      <Table.Th>Max Logs/Month</Table.Th>
                      <Table.Th>Max Articles/Month</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {subscriptions.map((sub) => {
                      const isBase = sub.name.toLowerCase() === 'base';
                      return (
                        <Table.Tr key={sub.id}>
                          <Table.Td>{sub.name}</Table.Td>
                          <Table.Td>{sub.description}</Table.Td>
                          <Table.Td>
                            <Badge color={sub.isActive ? 'green' : 'red'}>
                              {sub.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </Table.Td>
                          <Table.Td>₹{sub.price}</Table.Td>
                          <Table.Td>{sub.maxLogsPerMonth === -1 ? 'Unlimited' : sub.maxLogsPerMonth}</Table.Td>
                          <Table.Td>{sub.maxArticlesPerMonth === -1 ? 'Unlimited' : sub.maxArticlesPerMonth}</Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <ActionIcon color="blue" onClick={() => handleOpenEdit(sub)}>
                                <EditIcon width={18} />
                              </ActionIcon>
                              {sub.isActive && !isBase && (
                                <ActionIcon color="orange" onClick={() => handleDeactivate(sub.id)}>
                                  <BanIcon width={18} />
                                </ActionIcon>
                              )}
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            )
          )}
        </Paper>
        <SubscriptionSettingsModal
          opened={modalOpen}
          onClose={handleClose}
          onSubmit={handleModalSubmit}
          initialValues={form}
          loading={loading}
          editMode={!!editId}
        />
        
        {/* Deactivate Confirmation  */}
        <ConfirmModal
          opened={deactivateConfirmOpen}
          onClose={() => setDeactivateConfirmOpen(false)}
          onConfirm={handleConfirmDeactivate}
          title="Deactivate Subscription"
          message="Are you sure you want to deactivate this subscription plan?"
          confirmLabel="Deactivate"
          confirmColor="orange"
          loading={actionLoading}
        />
      </Stack>
    </AdminPageContainer>
  );
} 