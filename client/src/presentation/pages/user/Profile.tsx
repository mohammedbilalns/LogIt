import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Avatar,
  Box,
  Button,
  Group,
  Stack,
  Text,
  Title,
  Badge,
  Paper,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import ArticleRow from '@/presentation/components/article/ArticleRow';
import ArticleRowSkeleton from '@/presentation/components/skeletons/ArticleRowSkeleton';
import ChangePasswordModal from '@/presentation/components/user/ChangePasswordModal';
import UpdateProfileModal from '@/presentation/components/user/UpdateProfileModal';
import UserSidebar from '@/presentation/components/user/UserSidebar';
import CreateButton from '@/presentation/components/user/CreateButton';
import { AppDispatch, RootState } from '@/infrastructure/store';
import { fetchUserArticles } from '@/infrastructure/store/slices/articleSlice';
import { fetchUserStats } from '@/infrastructure/store/slices/userManagementSlice';
import { changePassword } from '@/infrastructure/store/slices/userManagementSlice';
import { updateProfile } from '@/infrastructure/store/slices/userManagementSlice';
import UserStats from '@/presentation/components/user/UserStats';
import { fetchNextPlans } from '@/infrastructure/store/slices/subscriptionSlice';
import SubscriptionUpgradeModal from '@/presentation/components/user/SubscriptionUpgradeModal';
import { useInfiniteScroll } from '@/application/hooks/useInfiniteScroll';

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UpdateProfileForm {
  name: string;
  profession: string;
  bio: string;
  profileImage: File | string | null;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  maxLogsPerMonth: number;
  maxArticlesPerMonth: number;
  description: string;
}

interface UserStats {
  followersCount: number;
  followingCount: number;
  articlesCount: number;
  currentPlan: SubscriptionPlan;
  activeSubscription: any;
  monthlyArticles?: number;
  monthlyLogs?: number;
}

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const [page, setPage] = useState(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  const { user } = useSelector((state: RootState) => state.auth);
  const { userArticles, loading, userArticlesHasMore } = useSelector(
    (state: RootState) => state.articles
  );
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);

  const [passwordOpened, { open: openPassword, close: closePassword }] = useDisclosure(false);
  const [profileOpened, { open: openProfile, close: closeProfile }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [stats, setStats] = useState<UserStats | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [nextPlans, setNextPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    dispatch(fetchUserArticles({ page, limit: 5 }));
  }, [dispatch, page]);

  useInfiniteScroll({
    targetRef: observerTarget,
    loading,
    hasMore: userArticlesHasMore,
    onLoadMore: () => setPage((prev) => prev + 1),
  });

  useEffect(() => {
    dispatch(fetchUserStats())
      .unwrap()
      .then((data) => setStats(data))
      .catch(() => setStats(null));
  }, [dispatch]);

  const handleChangePassword = async (values: ChangePasswordForm) => {
    try {
      await dispatch(
        changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        })
      ).unwrap();

      notifications.show({
        title: 'Success',
        message: 'Password changed successfully',
        color: 'green',
      });
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error || 'Failed to change password',
        color: 'red',
      });
    } finally {
      closePassword();
    }
  };

  const handleUpdateProfile = async (values: UpdateProfileForm) => {
    try {
      const result = await dispatch(
        updateProfile({
          name: values.name,
          profession: values.profession,
          bio: values.bio,
          profileImage: typeof values.profileImage === 'string' ? values.profileImage : null,
        })
      ).unwrap();

      notifications.show({
        title: 'Success',
        message: 'Profile updated successfully',
        color: 'green',
      });
      
      closeProfile();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error || 'Failed to update profile',
        color: 'red',
      });
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.map(p => p[0]).join('').slice(0, 2).toUpperCase();
  };

  const renderSkeletons = () =>
    Array.from({ length: 3 }, (_, i) => <ArticleRowSkeleton key={i} />);

  const handleOpenUpgradeModal = async () => {
    if (!stats?.currentPlan) return;
    try {
      const [nextArticlePlans, nextLogPlans] = await Promise.all([
        dispatch(fetchNextPlans({ resource: 'articles', currentLimit: stats.currentPlan.maxArticlesPerMonth })).unwrap(),
        dispatch(fetchNextPlans({ resource: 'logs', currentLimit: stats.currentPlan.maxLogsPerMonth })).unwrap(),
      ]);
      const plans = [...(nextArticlePlans || []), ...(nextLogPlans || [])];
      const uniquePlans = Array.from(new Map(plans.map(p => [p.id, p])).values());
      setNextPlans(uniquePlans);
      setUpgradeModalOpen(true);
    } catch (e) {
      notifications.show({ title: 'Error', message: 'Failed to fetch upgrade plans', color: 'red' });
    }
  };

  const getUpgradeButton = () => (
    <Button variant="outline" size="sm" onClick={handleOpenUpgradeModal}>
      Upgrade Plan
    </Button>
  );

  const handleUpgradeModalClose = async () => {
    setUpgradeModalOpen(false);
      const data = await dispatch(fetchUserStats()).unwrap();
      setStats(data);
    
  };

  const getPlanInfo = () => {
    if (!stats?.currentPlan) return null;

    const plan = stats.currentPlan;
    const isActive = stats.activeSubscription?.isActive;
    const expiryDate = stats.activeSubscription?.expiryDate;

    return (
      <Stack gap="xs" align="center">
        <Badge 
          color={plan.name.toLowerCase() === 'pro' ? 'green' : plan.name.toLowerCase() === 'plus' ? 'blue' : 'gray'} 
          size="sm"
        >
          {plan.name} Plan
        </Badge>
        {isActive && expiryDate && (
          <Text size="xs" c="dimmed">
            Expires: {new Date(expiryDate).toLocaleDateString()}
          </Text>
        )}
        <Text size="xs" c="dimmed" ta="center">
          {plan.maxLogsPerMonth === -1 ? 'Unlimited' : plan.maxLogsPerMonth} logs/month • {' '}
          {plan.maxArticlesPerMonth === -1 ? 'Unlimited' : plan.maxArticlesPerMonth} articles/month
        </Text>
      </Stack>
    );
  };

  const renderUsage = () => {
    if (!stats) return null;
    return (
      <Group gap="md" justify="center" wrap="wrap">
        <Paper shadow="sm" radius="md" p="sm">
          <Text size="sm" fw={500}>Articles this month:</Text>
          <Text size="lg">{stats.monthlyArticles ?? 0} / {stats.currentPlan.maxArticlesPerMonth === -1 ? 'Unlimited' : stats.currentPlan.maxArticlesPerMonth}</Text>
        </Paper>
        <Paper shadow="sm" radius="md" p="sm">
          <Text size="sm" fw={500}>Logs this month:</Text>
          <Text size="lg">{stats.monthlyLogs ?? 0} / {stats.currentPlan.maxLogsPerMonth === -1 ? 'Unlimited' : stats.currentPlan.maxLogsPerMonth}</Text>
        </Paper>
      </Group>
    );
  };

  const containerClassName = `user-page-container ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`;

  return (
    <>
      <UserSidebar isModalOpen={passwordOpened || profileOpened} />
      <Box className={containerClassName}>
        <Stack gap="lg">
          {/* Profile Header */}
          <Paper shadow="sm" radius="md" p="md">
            <Stack align="center" gap="sm">
              <Avatar src={user?.profileImage} size={isMobile ? 80 : 100} radius="xl">
              {getInitials(user?.name)}
            </Avatar>
            <Title order={3}>{user?.name}</Title>
              <Text c="dimmed" size="sm">{user?.email}</Text>
              {user?.profession && (
                <Text size="sm" fw={500}>{user?.profession}</Text>
              )}
              {user?.bio && (
                <Text size="sm" ta="center" maw={500} c="dimmed">
              {user?.bio}
            </Text>
              )}
            </Stack>
          </Paper>

          {/* Stats and Plan Info */}
          <Group gap="md" justify="center" wrap="wrap">
            {stats && (
              <Paper shadow="sm" radius="md" p="sm">
                <UserStats 
                  followersCount={stats.followersCount} 
                  followingCount={stats.followingCount} 
                  articlesCount={stats.articlesCount} 
                />
              </Paper>
            )}
            {getPlanInfo() && (
              <Paper shadow="sm" radius="md" p="sm">
            {getPlanInfo()}
              </Paper>
            )}
          </Group>

          {renderUsage()}

          {/* Action Buttons */}
          <Group justify="center" wrap="wrap" gap="sm">
            <Button size="sm" onClick={openProfile}>Edit Profile</Button>
            <Button variant="default" size="sm" onClick={openPassword}>
                Change Password
              </Button>
              {getUpgradeButton()}
            </Group>

          {/* Recent Articles */}
        <Box>
            <Title order={4} mb="sm">
            Recent Articles
          </Title>
            <Stack gap="sm">
            {loading && page === 1 ? (
              renderSkeletons()
            ) : userArticles.length > 0 ? (
              <>
                {userArticles.map((article) => (
                  <ArticleRow key={article._id} article={article} />
                ))}
                <div ref={observerTarget} style={{ height: 20 }} />
                {loading && page > 1 && renderSkeletons()}
              </>
            ) : (
                <Text c="dimmed" ta="center" size="sm">
                No articles found
              </Text>
            )}
          </Stack>
        </Box>
        </Stack>

        <Box pos="fixed" bottom={24} right={24}>
          <CreateButton />
        </Box>

        <ChangePasswordModal
          opened={passwordOpened}
          onClose={closePassword}
          onSubmit={handleChangePassword}
        />
        <UpdateProfileModal
          opened={profileOpened}
          onClose={closeProfile}
          onSubmit={handleUpdateProfile}
        />
        {stats && stats.currentPlan && (
          <SubscriptionUpgradeModal
            opened={upgradeModalOpen}
            onClose={handleUpgradeModalClose}
            currentPlan={stats.currentPlan}
            nextPlans={nextPlans}
          />
        )}
      </Box>
    </>
  );
}
