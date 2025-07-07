import { useParams, useNavigate } from 'react-router-dom';
import ArticleEditorForm from '@components/article/ArticleEditorForm';
import { Box, Container } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import SubscriptionLimitModal from '@/components/user/SubscriptionLimitModal';
import { useState } from 'react';

interface ArticleEditorProps {
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

export default function ArticleEditor({ mode }: ArticleEditorProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const [subscriptionLimitError, setSubscriptionLimitError] = useState<SubscriptionLimitError | null>(null);

  const handleClose = () => {
    navigate('/articles');
  };

  const handleSubscriptionLimitError = (error: SubscriptionLimitError) => {
    setSubscriptionLimitError(error);
  };

  const handleCloseSubscriptionModal = () => {
    setSubscriptionLimitError(null);
    navigate('/articles');
  };

  const containerClassName = `editor-page-container ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`;

  return (
    <>
      <div className={containerClassName}>
        <Container 
          size="xl" 
          style={{
            width: '100%',
            maxWidth: '1400px',
            padding: isMobile ? '0' : '0 24px',
            position: 'relative',
            zIndex: 0
          }}
        >
          <ArticleEditorForm
            mode={mode}
            articleId={id}
            onClose={handleClose}
            onSubscriptionLimitError={handleSubscriptionLimitError}
          />
        </Container>
      </div>

      {subscriptionLimitError && (
        <SubscriptionLimitModal
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