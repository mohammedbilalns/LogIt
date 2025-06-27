import { Group, Avatar, Stack, Text, ActionIcon, Divider, Box } from '@mantine/core';
import { DotsVerticalIcons } from '@/components/icons/DotsVerticalIcons';
import React, { ReactNode } from 'react';

interface ChatHeaderProps {
  currentChat: any;
  chatName: ReactNode;
  avatarInitials: string;
  otherParticipant: any;
  isOnline: boolean;
  handleProfileClick: (userId: string) => void;
  participants: any[];
  isMobile: boolean;
  onlineCount?: number;
  onTitleClick?: () => void;
  hideCounts?: boolean;
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
  onTitleClick,
  hideCounts = false,
}) => (
  <>
    <Group justify="space-between" align="center" style={{ position: 'sticky', top: 0, zIndex: 2, background: 'inherit', paddingBottom: 12 }}>
      {currentChat?.isGroup ? (
        <Box
          onClick={onTitleClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            borderRadius: 8,
            padding: 4,
            transition: 'background 0.15s',
            ':hover': { background: 'rgba(0,0,0,0.04)' },
          }}
          tabIndex={0}
          role="button"
        >
          <Stack gap={0} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar
              radius="xl"
              size={48}
              color="blue"
              style={{ marginRight: 12 }}
            >
              {avatarInitials}
            </Avatar>
            <Stack gap={0}>
              <Text fw={600} size={isMobile ? 'md' : 'lg'}>{chatName}</Text>
              {!hideCounts && <Text size="xs" c="dimmed">{participants.length} members</Text>}
              {!hideCounts && <Text size="xs" c="green">{onlineCount ?? 0} online</Text>}
            </Stack>
          </Stack>
        </Box>
      ) : (
      <Group align="center">
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
        <Stack gap={0}>
          <Text fw={600} size={isMobile ? 'md' : 'lg'}>{chatName}</Text>
          <Text size="xs" c={isOnline ? 'green' : 'red'}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </Stack>
      </Group>
      )}
      <ActionIcon variant="subtle" color="gray" size="lg">
        <DotsVerticalIcons width={20} height={20} />
      </ActionIcon>
    </Group>
    <Divider mb={12} />
  </>
); 