import { Group, Avatar, Stack, Text, ActionIcon, Divider } from '@mantine/core';
import { DotsVerticalIcons } from '@/components/icons/DotsVerticalIcons';
import React from 'react';

interface ChatHeaderProps {
  currentChat: any;
  chatName: string;
  avatarInitials: string;
  otherParticipant: any;
  isOnline: boolean;
  handleProfileClick: (userId: string) => void;
  participants: any[];
  isMobile: boolean;
  onlineCount?: number;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  currentChat,
  chatName,
  avatarInitials,
  otherParticipant,
  isOnline,
  handleProfileClick,
  participants,
  isMobile,
  onlineCount,
}) => (
  <>
    <Group justify="space-between" align="center" style={{ position: 'sticky', top: 0, zIndex: 2, background: 'inherit', paddingBottom: 12 }}>
      <Group align="center">
        {!currentChat?.isGroup && (
          <Avatar
            src={otherParticipant?.profileImage}
            radius="xl"
            size={48}
            color="blue"
            style={{ cursor: otherParticipant?.userId ? 'pointer' : undefined }}
            onClick={() => otherParticipant?.userId && handleProfileClick(otherParticipant.userId)}
          >
            {avatarInitials}
          </Avatar>
        )}
        <Stack gap={0}>
          <Text fw={600} size={isMobile ? 'md' : 'lg'}>{chatName}</Text>
          {currentChat?.isGroup && <Text size="xs" c="dimmed">{participants.length} members</Text>}
          {currentChat?.isGroup ? (
            <Text size="xs" c="green">{onlineCount ?? 0} online</Text>
          ) : (
            <Text size="xs" c={isOnline ? 'green' : 'red'}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          )}
        </Stack>
      </Group>
      <ActionIcon variant="subtle" color="gray" size="lg">
        <DotsVerticalIcons width={20} height={20} />
      </ActionIcon>
    </Group>
    <Divider mb={12} />
  </>
); 