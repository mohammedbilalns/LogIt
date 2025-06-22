import { useState, useRef, useEffect } from 'react';
import { Box, Stack, Title, Group, Avatar, Text, Paper, Button, Textarea, ActionIcon, Input, Divider, ScrollArea } from '@mantine/core';
import { IconSend, IconPhoto, IconFile, IconDotsVertical } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import UserSidebar from '@/components/user/UserSidebar';
import { useParams } from 'react-router-dom';

const dummyChat = {
  id: 'c1',
  name: 'Alice Johnson',
  avatar: '',
  isGroup: false,
  members: 2,
};

const dummyMessages = [
  { id: 'm1', sender: 'Alice Johnson', content: 'Hey, how are you?', time: '10:00 AM', mine: false },
  { id: 'm2', sender: 'You', content: 'I am good! How about you?', time: '10:01 AM', mine: true },
  { id: 'm3', sender: 'Alice Johnson', content: 'Doing well, thanks!', time: '10:02 AM', mine: false },
  { id: 'm4', sender: 'You', content: 'Sent you the files.', time: '10:03 AM', mine: true },
];

export default function SingleChatPage() {
  const { id } = useParams();
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(dummyMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerClassName = `page-container ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      setMessages((prev) => [
        ...prev,
        { id: `m${prev.length + 1}`, sender: 'You', content: message, time: 'Now', mine: true },
      ]);
      setMessage('');
    }
  };

  return (
    <>
      <UserSidebar />
      <Box className={containerClassName} style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Chat Header */}
        <Paper withBorder radius="md" p="md" mb="sm" style={{ position: 'sticky', top: 0, zIndex: 2 }}>
          <Group align="center" justify="space-between">
            <Group align="center">
              <Avatar src={dummyChat.avatar} radius="xl" size={48} color={dummyChat.isGroup ? 'teal' : 'blue'}>
                {dummyChat.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </Avatar>
              <Stack gap={0}>
                <Text fw={600}>{dummyChat.name}</Text>
                {dummyChat.isGroup && <Text size="xs" c="dimmed">{dummyChat.members} members</Text>}
              </Stack>
            </Group>
            <ActionIcon variant="subtle" color="gray" size="lg">
              <IconDotsVertical size={20} />
            </ActionIcon>
          </Group>
        </Paper>
        <Divider />
        {/* Chat Messages */}
        <ScrollArea style={{ flex: 1, minHeight: 0, maxHeight: 'calc(100vh - 220px)' }} px="md" py="sm">
          <Stack gap="xs">
            {messages.map((msg) => (
              <Group key={msg.id} align="flex-end" justify={msg.mine ? 'flex-end' : 'flex-start'}>
                {!msg.mine && (
                  <Avatar size={32} color="blue">{msg.sender[0]}</Avatar>
                )}
                <Paper radius="lg" p="sm" withBorder style={{ background: msg.mine ? 'var(--mantine-color-blue-1)' : 'var(--mantine-color-gray-1)', maxWidth: 320 }}>
                  <Text size="sm">{msg.content}</Text>
                  <Text size="xs" c="dimmed" ta={msg.mine ? 'right' : 'left'}>{msg.time}</Text>
                </Paper>
                {msg.mine && (
                  <Avatar size={32} color="gray">Y</Avatar>
                )}
              </Group>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
        </ScrollArea>
        <Divider />
        {/* Chat Input */}
        <Box p="md" style={{ position: 'sticky', bottom: 0, background: 'var(--mantine-color-body)' }}>
          <Group align="flex-end" gap="xs">
            <ActionIcon variant="subtle" color="blue" size="lg">
              <IconPhoto size={20} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="blue" size="lg">
              <IconFile size={20} />
            </ActionIcon>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.currentTarget.value)}
              placeholder="Type a message..."
              autosize
              minRows={1}
              maxRows={4}
              style={{ flex: 1 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button onClick={handleSend} variant="filled" color="blue" radius="xl" leftSection={<IconSend size={18} />}>
              Send
            </Button>
          </Group>
        </Box>
      </Box>
    </>
  );
} 