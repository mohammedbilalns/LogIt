import { useState, useMemo, useEffect } from 'react';
import { Box, Stack, Title, Tabs, Avatar, Group, Text, Paper, Badge, Loader } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchUserChats } from '@/store/slices/chatSlice';
import UserSidebar from '@/components/user/UserSidebar';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const dummyGroupChats = [
  { id: 'g1', name: 'Project Team', lastMessage: 'Deadline is next week!', avatar: '', members: 5, unread: 3 },
  { id: 'g2', name: 'Family', lastMessage: 'Dinner at 7?', avatar: '', members: 4, unread: 0 },
];

function ChatCard({ chat, isGroup }: { chat: any; isGroup?: boolean }) {
  const navigate = useNavigate();

  // For single chats, get the other participant's name and image
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const otherParticipant = chat.participants?.find((p: any) => String(p.userId) !== String(currentUser?._id));

  const getChatName = () => {
    if (isGroup) return chat.name;
    return otherParticipant?.name || 'Unknown User';
  };

  const getLastMessage = () => {
    if (chat.lastMessageDetails) {
      return chat.lastMessageDetails.content;
    }
    return isGroup ? chat.lastMessage : 'No messages yet';
  };

  const getLastMessageTime = () => {
    if (chat.lastMessageDetails?.createdAt) {
      return formatDistanceToNow(new Date(chat.lastMessageDetails.createdAt), { addSuffix: true });
    }
    return '';
  };

  const getUnreadCount = () => {
    return chat.unreadCount || 0;
  };

  const chatName = getChatName();
  const lastMessage = getLastMessage();
  const lastMessageTime = getLastMessageTime();
  const unreadCount = getUnreadCount();

  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      mb="sm"
      onClick={() => navigate(`/chats/${chat.id}`)}
      style={{ cursor: 'pointer', transition: 'box-shadow 0.2s', boxShadow: '0 0 0 rgba(0,0,0,0)' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 rgba(0,0,0,0)')}
    >
      <Group align="center">
        <Avatar
          src={isGroup ? chat.avatar : otherParticipant?.profileImage || undefined}
          radius="xl"
          size={48}
          color={isGroup ? 'teal' : 'blue'}
        >
          {chatName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
        </Avatar>
        <Stack gap={0} style={{ flex: 1 }}>
          <Group gap="xs" justify="space-between">
            <Text fw={600}>{chatName}</Text>
            {isGroup && <Badge color="teal" size="xs">Group</Badge>}
            {lastMessageTime && (
              <Text size="xs" c="dimmed">{lastMessageTime}</Text>
            )}
          </Group>
          <Text size="sm" c="dimmed" lineClamp={1}>{lastMessage}</Text>
        </Stack>
        {unreadCount > 0 && <Badge color="red" size="sm">{unreadCount}</Badge>}
      </Group>
    </Paper>
  );
}

export default function ChatsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const { chats, loading, error } = useSelector((state: RootState) => state.chat);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [tab, setTab] = useState<string | null>('single');
  const containerClassName = `page-container ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`;

  // Filter chats by type
  const singleChats = useMemo(() => chats.filter(chat => !chat.isGroup), [chats]);
  const groupChats = useMemo(() => dummyGroupChats, []);

  useEffect(() => {
    dispatch(fetchUserChats());
  }, [dispatch]);

  if (loading && chats.length === 0) {
    return (
      <>
        <UserSidebar />
        <Box className={containerClassName} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Loader size="lg" />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <UserSidebar />
        <Box className={containerClassName} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Text c="red">{error}</Text>
        </Box>
      </>
    );
  }

  return (
    <>
      <UserSidebar />
      <Box className={containerClassName}>
        <Stack gap="md">
          <Title order={2}>Chats</Title>
          <Tabs value={tab} onChange={setTab} variant="outline" radius="md">
            <Tabs.List>
              <Tabs.Tab value="single">Single Chats ({singleChats.length})</Tabs.Tab>
              <Tabs.Tab value="group">Group Chats ({groupChats.length})</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="single" pt="md">
              {singleChats.length > 0 ? singleChats.map((chat) => (
                <ChatCard key={chat.id} chat={chat} />
              )) : <Text c="dimmed">No single chats found.</Text>}
            </Tabs.Panel>
            <Tabs.Panel value="group" pt="md">
              {groupChats.length > 0 ? groupChats.map((chat) => (
                <ChatCard key={chat.id} chat={chat} isGroup />
              )) : <Text c="dimmed">No group chats found.</Text>}
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Box>
    </>
  );
} 