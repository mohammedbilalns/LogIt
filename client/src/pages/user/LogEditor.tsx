import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import LogEditorForm from '@components/log/LogEditorForm';
import SubscriptionUpgradeModal from '@/components/user/SubscriptionUpgradeModal';
import { useState } from 'react';

interface LogEditorProps {
  mode: 'create' | 'edit';
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  maxLogsPerMonth: number;
  maxArticlesPerMonth: number;
  description: string;
}

interface SubscriptionLimitError {
  currentPlan: SubscriptionPlan;
  nextPlans?: SubscriptionPlan[];
  currentUsage: number;
  limit: number;
  exceededResource: 'logs' | 'articles';
}

export default function LogEditor({ mode }: LogEditorProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const [subscriptionLimitError, setSubscriptionLimitError] = useState<SubscriptionLimitError | null>(null);

  const handleClose = () => {
    navigate('/logs');
  };

  const handleSubscriptionLimitError = (error: SubscriptionLimitError) => {
    setSubscriptionLimitError(error);
  };

  const handleCloseSubscriptionModal = () => {
    setSubscriptionLimitError(null);
  };

  const containerClassName = `editor-page-container ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`;

  return (
    <>
      <Box className={containerClassName}>
        <Container 
          size="xl" 
          style={{
            width: '100%',
            maxWidth: '1400px',
            padding: isMobile ? '0' : '0 24px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <LogEditorForm
            mode={mode}
            logId={id}
            onClose={handleClose}
            onSubscriptionLimitError={handleSubscriptionLimitError}
          />
        </Container>
      </Box>

      {subscriptionLimitError && (
        <SubscriptionUpgradeModal
          opened={!!subscriptionLimitError}
          onClose={handleCloseSubscriptionModal}
          currentPlan={subscriptionLimitError.currentPlan}
          nextPlans={subscriptionLimitError.nextPlans}
          exceededResource={subscriptionLimitError.exceededResource}
          currentUsage={subscriptionLimitError.currentUsage}
          limit={subscriptionLimitError.limit}
        />
      )}
    </>
  );
} 