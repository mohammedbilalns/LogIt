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
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import ArticleRow from '@components/article/ArticleRow';
import ArticleRowSkeleton from '@components/skeletons/ArticleRowSkeleton';
import ChangePasswordModal from '@components/user/ChangePasswordModal';
import UpdateProfileModal from '@components/user/UpdateProfileModal';
import UserSidebar from '@components/user/UserSidebar';
import CreateButton from '@/components/user/CreateButton';
import { AppDispatch, RootState } from '@/store';
import { fetchUserArticles } from '@slices/articleSlice';
import { changePassword } from '@/store/slices/authSlice';
import { updateProfile } from '@/store/slices/userManagementSlice';
import UserStats from '@/components/user/UserStats';
import axios from '@/api/axios';

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

  const [stats, setStats] = useState<{ followersCount: number, followingCount: number, articlesCount: number } | null>(null);

  useEffect(() => {
    dispatch(fetchUserArticles({ page: 1, limit: 5 }));
  }, [dispatch]);

  useEffect(() => {
    if (page > 1) {
      dispatch(fetchUserArticles({ page, limit: 5 }));
    }
  }, [page, dispatch]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && userArticlesHasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [userArticlesHasMore, loading]);

  useEffect(() => {
    axios.get('/user/stats').then(res => setStats(res.data)).catch(() => setStats(null));
  }, []);

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

  return (
    <>
      <UserSidebar isModalOpen={passwordOpened || profileOpened} />
      <Box className={`page-container ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Box mb={40}>
          <Stack align="center" gap="xs">
            <Avatar src={user?.profileImage} size={isMobile ? 80 : 120} radius="xl">
              {getInitials(user?.name)}
            </Avatar>
            <Title order={3}>{user?.name}</Title>
            <Text c="dimmed">{user?.email}</Text>
            <Text size="sm">{user?.profession}</Text>
            <Text size="sm" ta="center" maw={600}>
              {user?.bio}
            </Text>
            {stats && <UserStats {...stats} />}
            <Group mt="sm" wrap="wrap" justify="center">
              <Button onClick={openProfile}>Edit Profile</Button>
              <Button variant="default" onClick={openPassword}>
                Change Password
              </Button>
              <Button variant="outline" leftSection={<Avatar size={18} radius="xl" />}>
                Upgrade to Pro
              </Button>
            </Group>
          </Stack>
        </Box>

        <Box>
          <Title order={4} mb="md">
            Recent Articles
          </Title>
          <Stack gap="md">
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
              <Text c="dimmed" ta="center">
                No articles found
              </Text>
            )}
          </Stack>
        </Box>

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
      </Box>
    </>
  );
}
