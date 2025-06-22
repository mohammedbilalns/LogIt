import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Box, Stack, Title, Tabs, Avatar, Group, Text, Paper, Button, Center } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useNavigate } from 'react-router-dom';

const allDummyFollowers = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', avatar: '', profession: 'Writer' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', avatar: '', profession: 'Engineer' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', avatar: '', profession: 'Designer' },
  { id: '6', name: 'Frank Ocean', email: 'frank@example.com', avatar: '', profession: 'Musician' },
  { id: '7', name: 'Grace Hopper', email: 'grace@example.com', avatar: '', profession: 'Scientist' },
  { id: '8', name: 'Henry Ford', email: 'henry@example.com', avatar: '', profession: 'Entrepreneur' },
];

const allDummyFollowing = [
  { id: '4', name: 'Diana Prince', email: 'diana@example.com', avatar: '', profession: 'Journalist' },
  { id: '5', name: 'Eve Adams', email: 'eve@example.com', avatar: '', profession: 'Developer' },
  { id: '9', name: 'Isaac Newton', email: 'isaac@example.com', avatar: '', profession: 'Physicist' },
  { id: '10', name: 'Jane Austen', email: 'jane@example.com', avatar: '', profession: 'Author' },
  { id: '11', name: 'Karl Marx', email: 'karl@example.com', avatar: '', profession: 'Philosopher' },
  { id: '12', name: 'Leonardo da Vinci', email: 'leo@example.com', avatar: '', profession: 'Artist' },
];

const PAGE_SIZE = 3;

function UserCard({ user, onUnfollow }: { user: typeof allDummyFollowing[0]; onUnfollow?: () => void }) {
  const navigate = useNavigate();
  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      mb="sm"
      onClick={() => navigate(`/user/${user.id}`)}
      style={{ cursor: 'pointer', transition: 'box-shadow 0.2s', boxShadow: '0 0 0 rgba(0,0,0,0)' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 rgba(0,0,0,0)')}
    >
      <Group align="center">
        <Avatar src={user.avatar} radius="xl" size={48} color="blue">
          {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
        </Avatar>
        <Stack gap={0} style={{ flex: 1 }}>
          <Text fw={600}>{user.name}</Text>
          <Text size="sm" c="dimmed">{user.profession}</Text>
          <Text size="xs" c="dimmed">{user.email}</Text>
        </Stack>
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
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [tab, setTab] = useState<string | null>('followers');
  const [followersPage, setFollowersPage] = useState(1);
  const [followingPage, setFollowingPage] = useState(1);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const followersTarget = useRef<HTMLDivElement>(null);
  const followingTarget = useRef<HTMLDivElement>(null);
  const [following, setFollowing] = useState(allDummyFollowing);

  const followers = useMemo(() => allDummyFollowers.slice(0, followersPage * PAGE_SIZE), [followersPage]);
  const followingVisible = useMemo(() => following.slice(0, followingPage * PAGE_SIZE), [following, followingPage]);
  const hasMoreFollowers = followers.length < allDummyFollowers.length;
  const hasMoreFollowing = followingVisible.length < following.length;

  // Infinite scroll for followers
  useEffect(() => {
    if (tab !== 'followers') return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMoreFollowers && !loadingFollowers) {
          setLoadingFollowers(true);
          setTimeout(() => {
            setFollowersPage((prev) => prev + 1);
            setLoadingFollowers(false);
          }, 600);
        }
      },
      { root: null, rootMargin: '100px', threshold: 0.1 }
    );
    const target = followersTarget.current;
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
  }, [tab, hasMoreFollowers, loadingFollowers]);

  // Infinite scroll for following
  useEffect(() => {
    if (tab !== 'following') return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMoreFollowing && !loadingFollowing) {
          setLoadingFollowing(true);
          setTimeout(() => {
            setFollowingPage((prev) => prev + 1);
            setLoadingFollowing(false);
          }, 600);
        }
      },
      { root: null, rootMargin: '100px', threshold: 0.1 }
    );
    const target = followingTarget.current;
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
  }, [tab, hasMoreFollowing, loadingFollowing]);

  const handleUnfollow = useCallback((id: string) => {
    setFollowing((prev) => prev.filter((user) => user.id !== id));
  }, []);

  const containerClassName = `page-container ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`;

  return (
    <Box className={containerClassName}>
      <Stack gap="md">
        <Title order={2}>Network</Title>
        <Tabs value={tab} onChange={setTab} variant="outline" radius="md">
          <Tabs.List>
            <Tabs.Tab value="followers">Followers ({allDummyFollowers.length})</Tabs.Tab>
            <Tabs.Tab value="following">Following ({following.length})</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="followers" pt="md">
            {followers.length > 0 ? followers.map((user) => (
              <UserCard key={user.id} user={user} />
            )) : <Text c="dimmed">No followers found.</Text>}
            <div ref={followersTarget} style={{ height: 20 }} />
            {loadingFollowers && <SkeletonCard />}
          </Tabs.Panel>
          <Tabs.Panel value="following" pt="md">
            {followingVisible.length > 0 ? followingVisible.map((user) => (
              <UserCard key={user.id} user={user} onUnfollow={() => handleUnfollow(user.id)} />
            )) : <Text c="dimmed">Not following anyone.</Text>}
            <div ref={followingTarget} style={{ height: 20 }} />
            {loadingFollowing && <SkeletonCard />}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Box>
  );
} 