import { Stack, Group, Avatar, Paper, Text, Loader, Button, Badge, Image, Box } from '@mantine/core';
import React from 'react';
import { useMantineColorScheme } from '@mantine/core';
import { formatMessageTime, formatMessageDate, groupMessagesByDate } from '@/application/utils/chatUtils';
import { ImagePreviewModal } from './ImagePreviewModal';
import { useState } from 'react';
import { AudioPlayer } from './AudioPlayer';

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
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(147, 197, 253, 0.22) 100%)'
                      : 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 197, 253, 0.12) 100%)',
                    color: isDark ? '#90caf9' : 'rgb(59, 130, 246)',
                    border: isDark ? '1px solid #1971c2' : '1px solid rgba(59, 130, 246, 0.2)',
                    boxShadow: isDark
                      ? '0 4px 16px rgba(59, 130, 246, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
                      : '0 4px 16px rgba(59, 130, 246, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                    textTransform: 'none',
                    letterSpacing: '0.4px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backdropFilter: 'blur(12px)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'default',
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
                          background: isMine
                            ? (isDark ? 'linear-gradient(135deg, #1971c2 0%, #228be6 100%)' : '#e7f5ff')
                            : (isDark ? 'linear-gradient(135deg, #23272e 0%, #2c2e33 100%)' : '#f1f3f5'),
                          color: isDark
                            ? (isMine ? '#fff' : '#e0e0e0')
                            : '#222',
                          maxWidth: 320,
                          minWidth: 120,
                          boxShadow: isMine
                            ? (isDark ? '0 2px 8px rgba(25,113,194,0.18)' : '0 2px 8px rgba(34,139,230,0.08)')
                            : (isDark ? '0 2px 8px rgba(44,46,51,0.18)' : '0 2px 8px rgba(0,0,0,0.04)'),
                          border: isMine
                            ? (isDark ? '1.5px solid #4dabf7' : '1px solid #4dabf7')
                            : (isDark ? '1px solid #343a40' : '1px solid #dee2e6'),
                        }}
                      >
                        <Text size="sm" style={{ lineHeight: 1.4, color: isDark ? (isMine ? '#fff' : '#e0e0e0') : '#222' }}>{msg.content}</Text>
                        {msg.media && (
                          <Box mt="xs">
                            {msg.media.type === 'image' ? (
                              <Image
                                src={msg.media.url}
                                alt="Shared image"
                                radius="md"
                                style={{ maxWidth: '100%', maxHeight: 200, cursor: 'pointer' }}
                                fit="cover"
                                onClick={() => setPreviewImage(msg.media.url)}
                              />
                            ) : msg.media.type === 'audio' ? (
                              <Box
                                style={{
                                  background: isDark ? '#343a40' : '#f8f9fa',
                                  borderRadius: 8,
                                  padding: 12,
                                  border: `1px solid ${isDark ? '#495057' : '#dee2e6'}`,
                                }}
                              >
                                <AudioPlayer src={msg.media.url} fileName={msg.media.id} size={msg.media.size} />
                              </Box>
                            ) : null}
                          </Box>
                        )}
                        <Text size="xs" ta={isMine ? 'right' : 'left'} mt={4} style={{ color: isDark ? '#fff' : undefined }}>
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
      <ImagePreviewModal
        opened={!!previewImage}
        onClose={() => setPreviewImage(null)}
        src={previewImage || ''}
      />
    </div>
  );
}; 