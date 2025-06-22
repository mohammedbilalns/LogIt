import { useState, useMemo } from 'react';
import { Box, Stack, Title, Tabs, Avatar, Group, Text, Paper, Button, Badge } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import UserSidebar from '@/components/user/UserSidebar';
import { useNavigate } from 'react-router-dom';

const dummySingleChats = [
  { id: 'c1', name: 'Alice Johnson', lastMessage: 'Hey, how are you?', avatar: '', unread: 2 },
  { id: 'c2', name: 'Bob Smith', lastMessage: "Let's catch up tomorrow.", avatar: '', unread: 0 },
  { id: 'c3', name: 'Charlie Brown', lastMessage: 'Sent you the files.', avatar: '', unread: 1 },
];

const dummyGroupChats = [
  { id: 'g1', name: 'Project Team', lastMessage: 'Deadline is next week!', avatar: '', members: 5, unread: 3 },
  { id: 'g2', name: 'Family', lastMessage: 'Dinner at 7?', avatar: '', members: 4, unread: 0 },
];

function ChatCard({ chat, isGroup }: { chat: any; isGroup?: boolean }) {
  const navigate = useNavigate();
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
        <Avatar src={chat.avatar} radius="xl" size={48} color={isGroup ? 'teal' : 'blue'}>
          {chat.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
        </Avatar>
        <Stack gap={0} style={{ flex: 1 }}>
          <Group gap="xs">
            <Text fw={600}>{chat.name}</Text>
            {isGroup && <Badge color="teal" size="xs">Group</Badge>}
          </Group>
          <Text size="sm" c="dimmed" lineClamp={1}>{chat.lastMessage}</Text>
        </Stack>
        {chat.unread > 0 && <Badge color="red" size="sm">{chat.unread}</Badge>}
      </Group>
    </Paper>
  );
}

export default function ChatsPage() {
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [tab, setTab] = useState<string | null>('single');
  const containerClassName = `page-container ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`;

  const singleChats = useMemo(() => dummySingleChats, []);
  const groupChats = useMemo(() => dummyGroupChats, []);

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