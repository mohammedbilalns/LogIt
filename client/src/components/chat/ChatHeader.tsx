import { Group, Avatar, Stack, Text, ActionIcon, Divider, Box } from '@mantine/core';
import { DotsVerticalIcons } from '@/components/icons/DotsVerticalIcons';
import { ChevronLeftIcon } from '@/components/icons/ChevronLeftIcon';
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
  onBackClick?: () => void;
  isRemovedOrLeft?: boolean;
  myParticipant?: any;
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
  onBackClick,
  isRemovedOrLeft = false,
  myParticipant,
}) => (
  <>
    <Group justify="space-between" align="center" style={{ position: 'sticky', top: 0, zIndex: 2, background: 'inherit', paddingBottom: 12 }}>
      <Group align="center">
        {onBackClick && (
          <ActionIcon 
            variant="subtle" 
            color="gray" 
            size="lg" 
            onClick={onBackClick}
            style={{ marginRight: 8 }}
          >
            <ChevronLeftIcon width={20} height={20} />
          </ActionIcon>
        )}
        {currentChat?.isGroup ? (
          <Box
            onClick={!isRemovedOrLeft ? onTitleClick : undefined}
            title={isRemovedOrLeft ? "You cannot access group details as you are no longer a member" : "Click to view group details"}
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: !isRemovedOrLeft ? 'pointer' : 'default',
              borderRadius: 8,
              padding: 4,
              transition: 'background 0.15s',
              opacity: isRemovedOrLeft ? 0.7 : 1,
              ':hover': !isRemovedOrLeft ? { background: 'rgba(0,0,0,0.04)' } : {},
            }}
            tabIndex={!isRemovedOrLeft ? 0 : -1}
            role={!isRemovedOrLeft ? "button" : undefined}
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
                {isRemovedOrLeft && (
                  <Text size="xs" c="red" style={{ fontStyle: 'italic' }}>
                    {myParticipant?.role === 'removed-user' ? 'Removed from group' : 'Left group'}
                  </Text>
                )}
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
      </Group>
      <ActionIcon variant="subtle" color="gray" size="lg">
        <DotsVerticalIcons width={20} height={20} />
      </ActionIcon>
    </Group>
    <Divider mb={12} />
  </>
); 