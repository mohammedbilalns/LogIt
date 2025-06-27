import { useState, useMemo, useEffect } from 'react';
import { Box, Stack, Title, Tabs, Avatar, Group, Text, Paper, Badge, Loader } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchUserChats, fetchUserGroupChats } from '@/store/slices/chatSlice';
import UserSidebar from '@/components/user/UserSidebar';
import CreateGroupButton from '@/components/user/CreateGroupButton';
import CreateGroupModal from '@/components/chat/CreateGroupModal';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useDisclosure } from '@mantine/hooks';
import GroupChatListSkeleton from '@/components/skeletons/GroupChatListSkeleton';

function ChatCard({ chat, isGroup }: { chat: any; isGroup?: boolean }) {
  const navigate = useNavigate();


  const currentUser = useSelector((state: RootState) => state.auth.user);
  const otherParticipant = chat.participants?.find((p: any) => String(p.userId) !== String(currentUser?._id));

  const getChatName = () => {
    if (isGroup) return chat.name || 'Group';
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
      onClick={() => isGroup ? navigate(`/group-chats/${chat.id}`) : navigate(`/chats/${chat.id}`)}
      style={{ cursor: 'pointer', transition: 'box-shadow 0.2s', boxShadow: '0 0 0 rgba(0,0,0,0)' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 rgba(0,0,0,0)')}
    >
      <Group align="center">
        <Avatar
          src={isGroup ? chat.avatar : otherParticipant?.profileImage || undefined}
          radius="xl"
          size={48}
          color={isGroup ? 'blue' : 'blue'}
        >
          {(chatName || 'Chat').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
        </Avatar>
        <Stack gap={0} style={{ flex: 1 }}>
          <Group gap="xs" justify="space-between">
            <Text fw={600}>{chatName}</Text>
            {lastMessageTime && (
              <Text size="xs" c="dimmed">{lastMessageTime}</Text>
            )}
          </Group>
          <Text size="sm" c="dimmed" lineClamp={1}>{lastMessage}</Text>
        </Stack>
        {unreadCount > 0 && <Badge color="blue" size="sm">{unreadCount}</Badge>}
      </Group>
    </Paper>
  );
}

export default function ChatsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const { singleChats, groupChats, loading, error, hasMore, page } = useSelector((state: RootState) => state.chat);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [tab, setTab] = useState<string | null>('single');
  const [groupModalOpened, { open: openGroupModal, close: closeGroupModal }] = useDisclosure(false);
  const containerClassName = `page-container ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`;
  const [singlePage, setSinglePage] = useState(1);
  const [groupPage, setGroupPage] = useState(1);

  useEffect(() => {
    if (tab === 'single') {
      dispatch(fetchUserChats({ page: 1, limit: 10 }));
      setSinglePage(1);
    } else if (tab === 'group') {
      dispatch(fetchUserGroupChats({ page: 1, limit: 10 }));
      setGroupPage(1);
    }
  }, [dispatch, tab]);

  const handleViewMore = () => {
    if (tab === 'single') {
      const nextPage = singlePage + 1;
      dispatch(fetchUserChats({ page: nextPage, limit: 10 }));
      setSinglePage(nextPage);
    } else if (tab === 'group') {
      const nextPage = groupPage + 1;
      dispatch(fetchUserGroupChats({ page: nextPage, limit: 10 }));
      setGroupPage(nextPage);
    }
  };

  if (loading && ((tab === 'single' && singleChats.length === 0))) {
    return (
      <>
        <UserSidebar isModalOpen={groupModalOpened} />
        <Box className={containerClassName} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Loader size="lg" />
        </Box>
      </>
    );
  }

  if (loading && tab === 'group' && groupChats.length === 0) {
    return (
      <>
        <UserSidebar isModalOpen={groupModalOpened} />
        <Box className={containerClassName}>
          <Stack gap="md">
            <Title order={2}>Chats</Title>
            <Tabs value={tab} onChange={setTab} variant="outline" radius="md">
              <Tabs.List>
                <Tabs.Tab value="single">Single Chats ({singleChats.length})</Tabs.Tab>
                <Tabs.Tab value="group">Group Chats ({groupChats.length})</Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="group" pt="md">
                <GroupChatListSkeleton />
              </Tabs.Panel>
            </Tabs>
          </Stack>
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <UserSidebar isModalOpen={groupModalOpened} />
        <Box className={containerClassName} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Text c="red">{error}</Text>
        </Box>
      </>
    );
  }

  return (
    <>
      <UserSidebar isModalOpen={groupModalOpened} />
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
              {tab === 'single' && hasMore && (
                <Box style={{ textAlign: 'center', marginTop: 16 }}>
                  <button onClick={handleViewMore} style={{ padding: '8px 16px', borderRadius: 4, border: '1px solid #ccc', background: '#f8f9fa', cursor: 'pointer' }}>View More</button>
                </Box>
              )}
            </Tabs.Panel>
            <Tabs.Panel value="group" pt="md">
              {groupChats.length > 0 ? groupChats.map((chat) => (
                <ChatCard key={chat.id} chat={chat} isGroup />
              )) : <Text c="dimmed">No group chats found.</Text>}
              {tab === 'group' && hasMore && (
                <Box style={{ textAlign: 'center', marginTop: 16 }}>
                  <button onClick={handleViewMore} style={{ padding: '8px 16px', borderRadius: 4, border: '1px solid #ccc', background: '#f8f9fa', cursor: 'pointer' }}>View More</button>
                </Box>
              )}
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Box>

      {/* Create Group Button */}
      {tab === 'group' && (
        <CreateGroupButton onClick={openGroupModal} />
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        opened={groupModalOpened}
        onClose={closeGroupModal}
      />
    </>
  );
} 