import { useEffect, useRef, useState, memo } from 'react';
import {
  Avatar,
  Box,
  Button,
  Group,
  Stack,
  Text,
  Title,
  Loader,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import ArticleRowSkeleton from '@/presentation/components/skeletons/ArticleRowSkeleton';
import ArticleRow from '@/presentation/components/article/ArticleRow';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/infrastructure/store';
import UserSidebar from '@/presentation/components/user/UserSidebar';
import axios from '@/infrastructure/api/axios';
import { fetchArticles } from '@/infrastructure/store/slices/articleSlice';
import { UserPlusIcon } from '@/presentation/components/icons/UserPlusIcon';
import { UserMinusIcon } from '@/presentation/components/icons/UserMinusIcon';
import { MessageIcon } from '@/presentation/components/icons/MessageIcon';
import { BanIcon } from '@/presentation/components/icons/BanIcon';
import { followUser, unfollowUser, blockUser, unblockUser, clearConnectionState } from '@/infrastructure/store/slices/connectionSlice';
import UserStats from '@/presentation/components/user/UserStats';
import { ConfirmModal } from '@/presentation/components/confirm';
import {  getOrCreatePrivateChat } from '@/infrastructure/store/slices/chatSlice';

export const FollowButton = memo(function FollowButton({ userId, isLoading, onSuccess }: { userId: string, isLoading: boolean, onSuccess?: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    await dispatch(followUser(userId));
    dispatch(clearConnectionState());
    setLoading(false);
    onSuccess?.();
  };
  return (
    <Button color="blue" leftSection={<UserPlusIcon width={18} />} onClick={handleFollow} loading={isLoading || loading} disabled={isLoading || loading}>
      Follow
    </Button>
  );
});

export const UnfollowButton = memo(function UnfollowButton({ userId, isLoading, onSuccess }: { userId: string, isLoading: boolean, onSuccess?: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const handleUnfollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    await dispatch(unfollowUser(userId));
    dispatch(clearConnectionState());
    setLoading(false);
    onSuccess?.();
  };
  return (
    <Button color="blue" leftSection={<UserMinusIcon width={18} />} onClick={handleUnfollow} loading={isLoading || loading} disabled={isLoading || loading}>
      Unfollow
    </Button>
  );
});

export default function UserPublicProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [page, setPage] = useState(1);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const dispatch = useDispatch<AppDispatch>();
  const { articles, loading, hasMore } = useSelector((state: RootState) => state.articles);
  const { user: loggedInUser } = useSelector((state: RootState) => state.auth);
  const { loading: connLoading, error: connError } = useSelector((state: RootState) => state.connection);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);

  // Fetch user info
  useEffect(() => {
    if (!id) return;
    setUserLoading(true);
    setUserError(null);
    axios.get(`/user/info/${id}`)
      .then(res => setUserInfo(res.data))
      .catch(err => setUserError(err?.response?.data?.message || 'Failed to fetch user info'))
      .finally(() => setUserLoading(false));
  }, [id]);

  // Fetch articles by this user
  useEffect(() => {
    if (!id) return;
    dispatch(fetchArticles({
      page,
      limit: 5,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      filters: JSON.stringify({ authorId: id, isActive: true })
    }));
  }, [dispatch, id, page]);

  // Infinite scroll for articles
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loading) {
        setPage((prev) => prev + 1);
      }
    }, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    });
    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
  }, [hasMore, loading]);

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  };

  const renderSkeletons = () =>
    Array.from({ length: 2 }, (_, i) => <ArticleRowSkeleton key={i} />);

  const containerClassName = `page-container ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`;

  // Button logic
  const isOwnProfile = loggedInUser?._id === id;
  const isFollowed = userInfo?.isFollowed;
  const isFollowingBack = userInfo?.isFollowingBack;
  const isBlocked = userInfo?.isBlocked;
  const isBlockedByYou = userInfo?.isBlockedByYou;

  const handleBlock = async () => {
    setActionLoading('block');
    await dispatch(blockUser(id!));
    setUserInfo((prev: any) => prev ? {
      ...prev,
      isBlockedByYou: true,
      isFollowed: false,
      followersCount: prev.isFollowed ? Math.max(0, (prev.followersCount || 1) - 1) : prev.followersCount
    } : prev);
    dispatch(clearConnectionState());
    setActionLoading(null);
    setBlockModalOpen(false);
  };

  const handleUnblock = async () => {
    setActionLoading('unblock');
    await dispatch(unblockUser(id!));
    setUserInfo((prev: any) => prev ? {
      ...prev,
      isBlockedByYou: false
    } : prev);
    dispatch(clearConnectionState());
    setActionLoading(null);
  };

  const handleChatClick = async () => {
    if (!id || !loggedInUser?._id) return;
    try {
      const chatId = await dispatch(getOrCreatePrivateChat(id)).unwrap();
      navigate(`/chats/${chatId}`);
    } catch (error) {
      console.error('Failed to get or create chat:', error);
    }
  };

  return (
    <>
      <UserSidebar />
      <Box className={containerClassName}>
        <Box mb={40}>
          <Stack align="center" gap="xs">
            {userLoading ? (
              <Loader size="lg" />
            ) : userError ? (
              <Text c="red">{userError}</Text>
            ) : userInfo ? (
              <>
                <Avatar src={userInfo.profileImage} size={isMobile ? 80 : 120} radius="xl">
                  {getInitials(userInfo.name)}
                </Avatar>
                <Title order={3}>{userInfo.name}</Title>
                <Text c="dimmed">{userInfo.email}</Text>
                <Text size="sm">{userInfo.profession}</Text>
                <Text size="sm" ta="center" maw={600}>
                  {userInfo.bio}
                </Text>
                <UserStats 
                  followersCount={userInfo.followersCount}
                  followingCount={userInfo.followingCount}
                  articlesCount={userInfo.articlesCount}
                />
                <Group mt="sm" wrap="wrap" justify="center">
                  {!isOwnProfile && !isBlockedByYou && !isBlocked && (
                    isFollowed ? (
                      <UnfollowButton userId={id!} isLoading={actionLoading === 'unfollow'} onSuccess={() => setUserInfo((prev: any) => prev ? {
                        ...prev,
                        isFollowed: false,
                        followersCount: Math.max(0, (prev.followersCount || 1) - 1)
                      } : prev)} />
                    ) : (
                      <FollowButton userId={id!} isLoading={actionLoading === 'follow'} onSuccess={() => setUserInfo((prev: any) => prev ? {
                        ...prev,
                        isFollowed: true,
                        followersCount: (prev.followersCount || 0) + 1
                      } : prev)} />
                    )
                  )}
                  {!isOwnProfile && !isBlockedByYou && !isBlocked && (
                    <Button 
                      variant="outline" 
                      leftSection={<MessageIcon width={18} />} 
                      onClick={handleChatClick}
                      loading={actionLoading === 'chat'}
                      disabled={actionLoading !== null}
                    >
                      Chat
                    </Button>
                  )}
                  {!isOwnProfile && !isBlockedByYou && !isBlocked && (
                    <Button color="red" leftSection={<BanIcon width={18} />} onClick={() => setBlockModalOpen(true)} loading={actionLoading === 'block'} disabled={actionLoading !== null}>
                      Block
                    </Button>
                  )}
                  {!isOwnProfile && isBlockedByYou && (
                    <Button color="gray" leftSection={<BanIcon width={18} />} onClick={handleUnblock} loading={actionLoading === 'unblock'} disabled={actionLoading !== null}>
                      Unblock
                    </Button>
                  )}
                  {!isOwnProfile && !isBlockedByYou && !isBlocked && (
                    <Button variant="outline" color="gray">Report</Button>
                  )}
                  {isBlocked && <Text c="red">You are blocked by this user.</Text>}
                  {isBlockedByYou && !isBlocked && <Text c="red">You have blocked this user.</Text>}
                  {connError && <Text c="red">{connError}</Text>}
                </Group>
              </>
            ) : null}
          </Stack>
        </Box>

        <Box>
          <Title order={4} mb="md">
            Recent Articles
          </Title>
          <Stack gap="md">
            {loading && page === 1 ? (
              renderSkeletons()
            ) : articles.length > 0 ? (
              <>
                {articles.map((article) => (
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
      </Box>
      <ConfirmModal
        opened={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        onConfirm={handleBlock}
        title="Block User"
        message="Are you sure you want to block this user? They will not be able to interact with you."
        confirmLabel="Block"
        confirmColor="red"
        loading={actionLoading === 'block'}
      />
    </>
  );
}
