import { Modal, Text, Button, Stack, Group, Badge, Title, SimpleGrid, Paper } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '@/infrastructure/store';
import { notifications } from '@mantine/notifications';
import {  startRazorpayPayment } from '@/infrastructure/store/slices/paymentSlice';
import { useEffect } from 'react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  maxLogsPerMonth: number;
  maxArticlesPerMonth: number;
  description: string;
}

interface SubscriptionUpgradeModalProps {
  opened: boolean;
  onClose: () => void;
  currentPlan: SubscriptionPlan;
  nextPlans?: SubscriptionPlan[];
  exceededResource?: 'logs' | 'articles';
  currentUsage?: number;
  limit?: number;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscriptionUpgradeModal({
  opened,
  onClose,
  currentPlan,
  nextPlans,
  exceededResource,
  currentUsage,
  limit
}: SubscriptionUpgradeModalProps) {
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();

  // Dynamically load Razorpay script
  useEffect(() => {
    if (!(window as any).Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  const getResourceText = () => {
    if (!exceededResource) return '-';
    return exceededResource === 'logs' ? 'logs' : 'articles';
  };

  const getLimitText = () => {
    if (typeof limit !== 'number') return '-';
    return limit === -1 ? 'unlimited' : limit.toString();
  };

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    try {
      const result = await dispatch(startRazorpayPayment({ plan, user })).unwrap();
      if (result && typeof result === 'object' && 'valid' in result && result.valid) {
        notifications.show({ title: 'Success', message: 'Subscription upgraded!', color: 'green' });
        onClose();
      } else {
        notifications.show({ title: 'Payment Failed', message: 'Could not verify payment.', color: 'red' });
      }
    } catch (err) {
      notifications.show({ title: 'Error', message: typeof err === 'string' ? err : 'Could not initiate payment.', color: 'red' });
    }
  };

  const getNextPlanName = () => {
    const currentPlanName = currentPlan.name.toLowerCase();
    if (currentPlanName === 'base') return 'Plus';
    if (currentPlanName === 'plus') return 'Pro';
    return null;
  };

  const getNextPlanDescription = () => {
    const currentPlanName = currentPlan.name.toLowerCase();
    if (currentPlanName === 'base') {
      return 'Upgrade to Plus for more logs and articles per month';
    }
    if (currentPlanName === 'plus') {
      return 'Upgrade to Pro for unlimited logs and articles';
    }
    return '';
  };

  // Context-aware title and warning
  const isWarning = typeof exceededResource === 'string' && typeof currentUsage === 'number' && typeof limit === 'number';
  const modalTitle = isWarning ? 'Plan Limit Reached' : 'Upgrade Your Plan';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={modalTitle}
      size="xl"
      centered
      overlayProps={{
        blur: 6,
        backgroundOpacity: 0.35,
        color: '#000',
        zIndex: 3000,
      }}
      zIndex={3100}
      styles={{
        content: {
          borderRadius: '1rem',
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(8px)',
          minWidth: '600px',
          maxWidth: '900px',
        },
      }}
    >
      <Stack gap="lg">
        {isWarning && (
          <div>
            <Title order={4} mb="xs">
              You've reached your {currentPlan.name} plan limit
            </Title>
            <Text c="dimmed" size="sm">
              You've used {currentUsage} {getResourceText()} this month, but your {currentPlan.name} plan only allows {getLimitText()} {getResourceText()} per month.
            </Text>
          </div>
        )}

        <Stack gap="xs">
          <Text fw={500} size="sm">Current Plan:</Text>
          <Group gap="xs">
            <Badge
              color={currentPlan.name.toLowerCase() === 'pro' ? 'green' : currentPlan.name.toLowerCase() === 'plus' ? 'blue' : 'gray'}
              size="md"
            >
              {currentPlan.name}
            </Badge>
            <Text size="sm" c="dimmed">
              ₹{currentPlan.price}/month
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            {currentPlan.maxLogsPerMonth === -1 ? 'Unlimited' : currentPlan.maxLogsPerMonth} logs/month • {' '}
            {currentPlan.maxArticlesPerMonth === -1 ? 'Unlimited' : currentPlan.maxArticlesPerMonth} articles/month
          </Text>
        </Stack>

        {nextPlans && nextPlans.length > 0 && (
          <Stack gap="xs">
            <Text fw={500} size="sm">Upgrade Options:</Text>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {nextPlans.map((plan) => (
                <Paper key={plan.id} shadow="sm" p="md" radius="md" withBorder style={{ minWidth: 220, textAlign: 'center' }}>
                  <Badge
                    color={plan.name.toLowerCase() === 'pro' ? 'green' : 'blue'}
                    size="md"
                    mb="xs"
                  >
                    {plan.name}
                  </Badge>
                  <Text size="lg" fw={700} mb={4}>
                    ₹{plan.price}/month
                  </Text>
                  <Text size="sm" c="dimmed" mb={2}>
                    {plan.maxLogsPerMonth === -1 ? 'Unlimited' : plan.maxLogsPerMonth} logs/month
                  </Text>
                  <Text size="sm" c="dimmed">
                    {plan.maxArticlesPerMonth === -1 ? 'Unlimited' : plan.maxArticlesPerMonth} articles/month
                  </Text>
                  <Button mt="md" fullWidth color="blue" onClick={() => handleUpgrade(plan)}>
                    Upgrade to {plan.name}
                  </Button>
                </Paper>
              ))}
            </SimpleGrid>
          </Stack>
        )}

        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose}>
            Maybe Later
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
