import { Modal, Text, Button, Stack, Group, Badge, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  maxLogsPerMonth: number;
  maxArticlesPerMonth: number;
  description: string;
}

interface SubscriptionLimitModalProps {
  opened: boolean;
  onClose: () => void;
  currentPlan: SubscriptionPlan;
  nextPlan?: SubscriptionPlan;
  exceededResource: 'logs' | 'articles';
  currentUsage: number;
  limit: number;
}

export default function SubscriptionLimitModal({
  opened,
  onClose,
  currentPlan,
  nextPlan,
  exceededResource,
  currentUsage,
  limit
}: SubscriptionLimitModalProps) {
  const navigate = useNavigate();

  const getResourceText = () => {
    return exceededResource === 'logs' ? 'logs' : 'articles';
  };

  const getLimitText = () => {
    return limit === -1 ? 'unlimited' : limit.toString();
  };

  const handleUpgrade = () => {
    // navigate('/subscription');
    onClose();
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

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Plan Limit Reached"
      size="md"
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
        },
      }}
    >
      <Stack gap="lg">
        <div>
          <Title order={4} mb="xs">
            You've reached your {currentPlan.name} plan limit
          </Title>
          <Text c="dimmed" size="sm">
            You've used {currentUsage} {getResourceText()} this month, but your {currentPlan.name} plan only allows {getLimitText()} {getResourceText()} per month.
          </Text>
        </div>

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
              ${currentPlan.price}/month
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            {currentPlan.maxLogsPerMonth === -1 ? 'Unlimited' : currentPlan.maxLogsPerMonth} logs/month • {' '}
            {currentPlan.maxArticlesPerMonth === -1 ? 'Unlimited' : currentPlan.maxArticlesPerMonth} articles/month
          </Text>
        </Stack>

        {nextPlan && (
          <Stack gap="xs">
            <Text fw={500} size="sm">Upgrade to {nextPlan.name}:</Text>
            <Group gap="xs">
              <Badge 
                color={nextPlan.name.toLowerCase() === 'pro' ? 'green' : 'blue'} 
                size="md"
              >
                {nextPlan.name}
              </Badge>
              <Text size="sm" c="dimmed">
                ${nextPlan.price}/month
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              {nextPlan.maxLogsPerMonth === -1 ? 'Unlimited' : nextPlan.maxLogsPerMonth} logs/month • {' '}
              {nextPlan.maxArticlesPerMonth === -1 ? 'Unlimited' : nextPlan.maxArticlesPerMonth} articles/month
            </Text>
            <Text size="xs" c="dimmed">
              {getNextPlanDescription()}
            </Text>
          </Stack>
        )}

        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose}>
            Maybe Later
          </Button>
          {nextPlan && (
            <Button onClick={handleUpgrade} color="blue">
              Upgrade to {nextPlan.name}
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
} 