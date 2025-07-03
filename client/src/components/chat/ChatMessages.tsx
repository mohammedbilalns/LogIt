import { Stack, Group, Avatar, Paper, Text, Loader, Button, Badge } from '@mantine/core';
import React from 'react';
import { formatMessageTime } from '../../hooks/useChat';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';

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

const formatMessageDate = (date: Date): string => {
  if (isToday(date)) {
    return 'Today';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'EEEE, MMMM d, yyyy');
  }
};

//group messages by date
const groupMessagesByDate = (messages: any[]) => {
  const groups: { date: string; messages: any[] }[] = [];
  let currentDate = '';
  let currentGroup: any[] = [];

  messages.forEach((message) => {
    try {
      const messageDate = new Date(message.createdAt);
      if (isNaN(messageDate.getTime())) {
        return;
      }
      const dateKey = format(messageDate, 'yyyy-MM-dd');

      if (dateKey !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = dateKey;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    } catch (error) {
      console.warn('Invalid message date:', message.createdAt);
    }
  });

  if (currentGroup.length > 0) {
    groups.push({ date: currentDate, messages: currentGroup });
  }

  return groups;
};

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

  const messageGroups = groupMessagesByDate(messages);

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
          messageGroups.map((group, groupIndex) => (
            <div key={group.date}>
              {/* Date Badge */}
              <Group justify="center" mb="xs" mt="md">
                <Badge
                  variant="filled"
                  color="blue"
                  size="sm"
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '10px 24px',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 197, 253, 0.12) 100%)',
                    color: 'rgb(59, 130, 246)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                    textTransform: 'none',
                    letterSpacing: '0.4px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backdropFilter: 'blur(12px)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'default'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(147, 197, 253, 0.16) 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 197, 253, 0.12) 100%)';
                  }}
                >
                  {formatMessageDate(new Date(group.date))}
                </Badge>
              </Group>

              <Stack gap="lg">
                {group.messages.map((msg) => {
                  const isMine = msg.senderId === loggedInUser?._id;
                  const sender = participants.find(p => p.userId === msg.senderId);
                  return (
                    <Group key={msg.id} id={`msg-${msg.id}`} align="flex-end" justify={isMine ? 'flex-end' : 'flex-start'} style={{ padding: '0 16px' }}>
                      {!isMine && (
                        <Avatar
                          size={36}
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
                          minWidth: 120,
                          boxShadow: isMine ? '0 2px 8px rgba(34,139,230,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
                          border: isMine ? '1px solid #4dabf7' : '1px solid #dee2e6',
                        }}
                      >
                        {/* Media rendering */}
                        {msg.media && msg.media.url && (
                          <div style={{ marginBottom: 8 }}>
                            {msg.media.mediaType === 'image' && (
                              <img src={msg.media.url} alt={msg.media.name || 'image'} style={{ maxWidth: 200, borderRadius: 8 }} />
                            )}
                            {msg.media.mediaType === 'video' && (
                              <video src={msg.media.url} controls style={{ maxWidth: 200, borderRadius: 8 }} />
                            )}
                            {msg.media.mediaType === 'audio' && (
                              <audio src={msg.media.url} controls style={{ width: 180 }} />
                            )}
                            <Text size="xs" c="dimmed" mt={2}>{msg.media.name} {msg.media.size ? `(${(msg.media.size / 1024 / 1024).toFixed(2)} MB)` : ''}</Text>
                          </div>
                        )}
                        <Text size="sm" style={{ lineHeight: 1.4 }}>{msg.content}</Text>
                        <Text size="xs" c="dimmed" ta={isMine ? 'right' : 'left'} mt={4}>
                          {formatMessageTime(msg.createdAt)}
                        </Text>
                      </Paper>
                    </Group>
                  );
                })}
              </Stack>
            </div>
          ))
        ) : (
          <Text c="dimmed" ta="center" style={{ marginTop: '50px' }}>
            {isRemovedOrLeft
              ? 'No messages available. You can no longer send messages in this chat.'
              : 'No messages yet. Start the conversation!'
            }
          </Text>
        )}
        <div ref={messagesEndRef} />
      </Stack>
    </div>
  );
}; 