import { Stack, Group, Avatar, Paper, Text, Loader, Button } from '@mantine/core';
import React from 'react';
import { formatMessageTime } from '../../hooks/useChat';

interface ChatMessagesProps {
  messages: any[];
  participants: any[];
  loggedInUser: any;
  messagesLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  handleProfileClick: (userId: string) => void;
  hasMore: boolean;
  fetchPreviousMessages: () => void;
  page: number;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  isRemovedOrLeft?: boolean;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  participants,
  loggedInUser,
  messagesLoading,
  messagesEndRef,
  handleProfileClick,
  hasMore,
  fetchPreviousMessages,
  page,
  messagesContainerRef,
  isRemovedOrLeft = false,
}) => {
  if (messagesLoading && page === 1 && messages.length === 0) {
    return (
      <Stack align="center" justify="center" style={{ height: '200px' }}>
        <Loader />
        <Text size="sm" c="dimmed">Loading messages...</Text>
      </Stack>
    );
  }
  return (
    <div ref={messagesContainerRef} style={{ overflowY: 'auto', maxHeight: '100%', minHeight: 0 }}>
      {messagesLoading && hasMore && page > 1 && (
        <Stack align="center" justify="center" style={{ height: '48px' }}>
          <Loader size="sm" />
          <Text size="xs" c="dimmed">Loading messages...</Text>
        </Stack>
      )}
      {hasMore && (
        <Button variant="subtle" size="xs" onClick={fetchPreviousMessages} loading={messagesLoading} style={{ margin: '0 auto 8px auto', display: 'block' }}>
          View More
        </Button>
      )}
      <Stack gap="xs">
        {messages.length > 0 ? (
          messages.map((msg) => {
            const isMine = msg.senderId === loggedInUser?._id;
            const sender = participants.find(p => p.userId === msg.senderId);
            return (
              <Group key={msg.id} id={`msg-${msg.id}`} align="flex-end" justify={isMine ? 'flex-end' : 'flex-start'}>
                {!isMine && (
                  <Avatar
                    size={32}
                    color="blue"
                    src={sender?.profileImage}
                    style={{ cursor: sender?.userId ? 'pointer' : undefined }}
                    onClick={() => sender?.userId && handleProfileClick(sender.userId)}
                  >
                    {sender ? (sender.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()) : 'U'}
                  </Avatar>
                )}
                <Paper
                  radius="lg"
                  p="sm"
                  withBorder
                  style={{
                    background: isMine ? '#e7f5ff' : '#f1f3f5',
                    maxWidth: 320,
                    boxShadow: isMine ? '0 2px 8px rgba(34,139,230,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
                    border: isMine ? '1px solid #4dabf7' : '1px solid #dee2e6',
                  }}
                >
                  <Text size="sm">{msg.content}</Text>
                  <Text size="xs" c="dimmed" ta={isMine ? 'right' : 'left'}>
                    {formatMessageTime(msg.createdAt)}
                  </Text>
                </Paper>
              </Group>
            );
          })
        ) : (
          <Text c="dimmed" ta="center" style={{ marginTop: '50px' }}>

            No messages yet.
          </Text>
        )}
        <div ref={messagesEndRef} />
      </Stack>
    </div>
  );
}; 