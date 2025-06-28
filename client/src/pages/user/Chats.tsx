import { useState, useMemo, useEffect } from 'react';
import { Box, Stack, Title, Tabs, Avatar, Group, Text, Paper, Badge, Loader, Button } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchUserChats, fetchUserGroupChats } from '@/store/slices/chatSlice';
import UserSidebar from '@/components/user/UserSidebar';
import CreateGroupButton from '@/components/user/CreateGroupButton';
import CreateGroupModal from '@/components/chat/CreateGroupModal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useDisclosure } from '@mantine/hooks';
import GroupChatListSkeleton from '@/components/skeletons/GroupChatListSkeleton';

function ChatCard({ chat, isGroup }: { chat: any; isGroup?: boolean }) {
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const otherParticipant = chat.participants?.find((p: any) => String(p.userId) !== String(currentUser?._id));
  const myParticipant = chat.participants?.find((p: any) => String(p.userId) === String(currentUser?._id));
  const isRemovedOrLeft = myParticipant?.role === 'removed-user' || myParticipant?.role === 'left-user';

  const getChatName = () => {
    if (isGroup) return chat.name || 'Group';
    return otherParticipant?.name || 'Unknown User';
  };

  const getLastMessage = () => {
    if (isRemovedOrLeft) {
      return myParticipant?.role === 'removed-user' ? 'You were removed from this group' : 'You left this group';
    }
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
      style={{ 
        cursor: 'pointer', 
        transition: 'box-shadow 0.2s', 
        boxShadow: '0 0 0 rgba(0,0,0,0)',
        opacity: isRemovedOrLeft ? 0.7 : 1,
        borderColor: isRemovedOrLeft ? '#ff6b6b' : undefined
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 rgba(0,0,0,0)')}
    >
      <Group align="center">
        <Avatar
          src={isGroup ? chat.avatar : otherParticipant?.profileImage || undefined}
          radius="xl"
          size={48}
          color={isRemovedOrLeft ? 'red' : 'blue'}
        >
          {(chatName || 'Chat').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
        </Avatar>
        <Stack gap={0} style={{ flex: 1 }}>
          <Group gap="xs" justify="space-between">
            <Text fw={600} style={{ color: isRemovedOrLeft ? '#ff6b6b' : undefined }}>
              {chatName}
              {isRemovedOrLeft && (
                <Badge size="xs" color="red" variant="light" style={{ marginLeft: 8 }}>
                  {myParticipant?.role === 'removed-user' ? 'Removed' : 'Left'}
                </Badge>
              )}
            </Text>
            {lastMessageTime && !isRemovedOrLeft && (
              <Text size="xs" c="dimmed">{lastMessageTime}</Text>
            )}
          </Group>
          <Text size="sm" c={isRemovedOrLeft ? 'red' : 'dimmed'} lineClamp={1}>{lastMessage}</Text>
        </Stack>
        {unreadCount > 0 && !isRemovedOrLeft && <Badge color="blue" size="sm">{unreadCount}</Badge>}
      </Group>
    </Paper>
  );
}

export default function ChatsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const { singleChats, groupChats, loading, error, singleHasMore, groupHasMore, page, singleTotal, groupTotal } = useSelector((state: RootState) => state.chat);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const searchParams = useSearchParams()[0];
  const initialTab = searchParams.get('tab') === 'group' ? 'group' : 'single';
  const [tab, setTab] = useState<string | null>(initialTab);
  const [groupModalOpened, { open: openGroupModal, close: closeGroupModal }] = useDisclosure(false);
  const containerClassName = `page-container ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`;
  const [singlePage, setSinglePage] = useState(1);
  const [groupPage, setGroupPage] = useState(1);
  const [singleLoading, setSingleLoading] = useState(false);
  const [groupLoading, setGroupLoading] = useState(false);

  // Handle tab changes and update URL
  const handleTabChange = (newTab: string | null) => {
    setTab(newTab);
    if (newTab === 'group') {
      navigate('/chats?tab=group', { replace: true });
    } else {
      navigate('/chats?tab=single', { replace: true });
    }
  };

  // Refresh data when component mounts
  useEffect(() => {
    dispatch(fetchUserChats({ page: 1, limit: 10 }));
    dispatch(fetchUserGroupChats({ page: 1, limit: 10 }));
  }, [dispatch]);

  useEffect(() => {
    if (tab === 'single') {
      setSingleLoading(true);
      dispatch(fetchUserChats({ page: 1, limit: 10 })).finally(() => {
        setSingleLoading(false);
      });
      setSinglePage(1);
    } else if (tab === 'group') {
      setGroupLoading(true);
      dispatch(fetchUserGroupChats({ page: 1, limit: 10 })).finally(() => {
        setGroupLoading(false);
      });
      setGroupPage(1);
    }
  }, [dispatch, tab]);

  const handleViewMore = () => {
    if (tab === 'single') {
      const nextPage = singlePage + 1;
      setSingleLoading(true);
      dispatch(fetchUserChats({ page: nextPage, limit: 10 })).finally(() => {
        setSingleLoading(false);
      });
      setSinglePage(nextPage);
    } else if (tab === 'group') {
      const nextPage = groupPage + 1;
      setGroupLoading(true);
      dispatch(fetchUserGroupChats({ page: nextPage, limit: 10 })).finally(() => {
        setGroupLoading(false);
      });
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
            <Tabs value={tab} onChange={handleTabChange} variant="outline" radius="md">
              <Tabs.List>
                <Tabs.Tab value="single">Single Chats ({singleTotal || 0})</Tabs.Tab>
                <Tabs.Tab value="group">Group Chats ({groupTotal || 0})</Tabs.Tab>
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
          <Tabs value={tab} onChange={handleTabChange} variant="outline" radius="md">
            <Tabs.List>
              <Tabs.Tab value="single">Single Chats ({singleTotal || 0})</Tabs.Tab>
              <Tabs.Tab value="group">Group Chats ({groupTotal || 0})</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="single" pt="md">
              {singleChats.length > 0 ? singleChats.map((chat) => (
                <ChatCard key={chat.id} chat={chat} />
              )) : <Text c="dimmed">No single chats found.</Text>}
              {tab === 'single' && singleHasMore && (
                <Box style={{ textAlign: 'center', marginTop: 16 }}>
                  <Button onClick={handleViewMore} variant="subtle" size="xs" loading={singleLoading}>
                    View More
                  </Button>
                </Box>
              )}
            </Tabs.Panel>
            <Tabs.Panel value="group" pt="md">
              {groupChats.length > 0 ? groupChats.map((chat) => (
                <ChatCard key={chat.id} chat={chat} isGroup />
              )) : <Text c="dimmed">No group chats found.</Text>}
              {tab === 'group' && groupHasMore && (
                <Box style={{ textAlign: 'center', marginTop: 16 }}>
                  <Button onClick={handleViewMore} variant="subtle" size="xs" loading={groupLoading}>
                    View More
                  </Button>
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