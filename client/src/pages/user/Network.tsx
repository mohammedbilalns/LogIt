import { useState, useRef, useEffect, useMemo } from 'react';
import { Box, Stack, Title, Tabs, Avatar, Group, Text, Paper, Button } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useNavigate } from 'react-router-dom';
import { fetchFollowers, fetchFollowing } from '@/store/slices/connectionSlice';
import { FollowButton, UnfollowButton } from './UserPublicProfile';

const PAGE_SIZE = 10;

function UserCard({ user, actionButton }: { user: any; actionButton?: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      mb="sm"
      onClick={() => navigate(`/user/${user._id}`)}
      style={{ cursor: 'pointer', transition: 'box-shadow 0.2s', boxShadow: '0 0 0 rgba(0,0,0,0)' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 rgba(0,0,0,0)')}
    >
      <Group align="center">
        <Avatar src={user.profileImage} radius="xl" size={48} color="blue">
          {user.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
        </Avatar>
        <Stack gap={0} style={{ flex: 1 }}>
          <Text fw={600}>{user.name}</Text>
          <Text size="sm" c="dimmed">{user.profession}</Text>
          <Text size="xs" c="dimmed">{user.email}</Text>
        </Stack>
        {actionButton}
      </Group>
    </Paper>
  );
}

function SkeletonCard() {
  return (
    <Paper withBorder radius="md" p="md" mb="sm" style={{ opacity: 0.5 }}>
      <Group align="center">
        <Avatar radius="xl" size={48} color="gray" />
        <Stack gap={0} style={{ flex: 1 }}>
          <Text fw={600} style={{ background: '#eee', width: 80, height: 16, borderRadius: 4 }} />
          <Text size="sm" c="dimmed" style={{ background: '#eee', width: 60, height: 12, borderRadius: 4 }} />
          <Text size="xs" c="dimmed" style={{ background: '#eee', width: 100, height: 10, borderRadius: 4 }} />
        </Stack>
        <Button variant="outline" size="xs" radius="xl" disabled style={{ width: 70, background: '#eee' }} />
      </Group>
    </Paper>
  );
}

export default function NetworkPage() {
  const dispatch = useDispatch<AppDispatch>();
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    followers,
    following,
    followersLoading,
    followingLoading,
    followersError,
    followingError,
  } = useSelector((state: RootState) => state.connection);
  const [tab, setTab] = useState<string | null>('followers');
  const [followersPage, setFollowersPage] = useState(1);
  const [followingPage, setFollowingPage] = useState(1);
  const followersTarget = useRef<HTMLDivElement>(null);
  const followingTarget = useRef<HTMLDivElement>(null);
  const [localFollowing, setLocalFollowing] = useState<any[]>([]);

  useEffect(() => {
    setLocalFollowing(following);
  }, [following]);

  useEffect(() => {
    if (!user?._id) return;
    if (tab === 'followers') dispatch(fetchFollowers(user._id));
    if (tab === 'following') dispatch(fetchFollowing(user._id));
  }, [dispatch, user?._id, tab]);

  useEffect(() => {
    if (tab !== 'followers') return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && followers.length > followersPage * PAGE_SIZE) {
          setFollowersPage((prev) => prev + 1);
        }
      },
      { root: null, rootMargin: '100px', threshold: 0.1 }
    );
    const target = followersTarget.current;
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
  }, [tab, followers.length, followersPage]);

  useEffect(() => {
    if (tab !== 'following') return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && localFollowing.length > followingPage * PAGE_SIZE) {
          setFollowingPage((prev) => prev + 1);
        }
      },
      { root: null, rootMargin: '100px', threshold: 0.1 }
    );
    const target = followingTarget.current;
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
  }, [tab, localFollowing.length, followingPage]);

  const followersVisible = useMemo(() => followers.slice(0, followersPage * PAGE_SIZE), [followers, followersPage]);
  const followingVisible = useMemo(() => localFollowing.slice(0, followingPage * PAGE_SIZE), [localFollowing, followingPage]);

  const handleUnfollow = (userId: string) => {
    setLocalFollowing((prev) => prev.filter((u) => u._id !== userId));
  };

  const containerClassName = `user-page-container ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`;

  return (
    <Box className={containerClassName}>
      <Stack gap="md">
        <Title order={2}>Network</Title>
        <Tabs value={tab} onChange={setTab} variant="outline" radius="md">
          <Tabs.List>
            <Tabs.Tab value="followers">
              Followers{tab === 'followers' ? ` (${followers.length})` : ''}
            </Tabs.Tab>
            <Tabs.Tab value="following">
              Following{tab === 'following' ? ` (${localFollowing.length})` : ''}
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="followers" pt="md">
            {followersError && <Text c="red">{followersError}</Text>}
            {followersVisible.length > 0 ? followersVisible.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                actionButton={user.isFollowedByMe === false ? <FollowButton userId={user._id} isLoading={false} /> : null}
              />
            )) : followersLoading ? <SkeletonCard /> : <Text c="dimmed">No followers found.</Text>}
            <div ref={followersTarget} style={{ height: 20 }} />
            {followersLoading && <SkeletonCard />}
          </Tabs.Panel>
          <Tabs.Panel value="following" pt="md">
            {followingError && <Text c="red">{followingError}</Text>}
            {followingVisible.length > 0 ? followingVisible.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                actionButton={<UnfollowButton userId={user._id} isLoading={false} onSuccess={() => handleUnfollow(user._id)} />}
              />
            )) : followingLoading ? <SkeletonCard /> : <Text c="dimmed">Not following anyone.</Text>}
            <div ref={followingTarget} style={{ height: 20 }} />
            {followingLoading && <SkeletonCard />}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Box>
  );
} 
