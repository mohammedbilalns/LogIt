import { Group, Avatar, Stack, Text, ActionIcon, Divider, Box, Tooltip } from '@mantine/core';
import { DotsVerticalIcons } from '@/presentation/components/icons/DotsVerticalIcons';
import { ChevronLeftIcon } from '@/presentation/components/icons/ChevronLeftIcon';
import { PhoneIcon } from '@/presentation/components/icons/PhoneIcon';
import { VideoIcon } from '@/presentation/components/icons/VideoIcon';
import React, { ReactNode } from 'react';
import { useCallManagerContext } from '@/application/hooks/CallManagerContext';
import { useSelector } from 'react-redux';
import { RootState } from '@/infrastructure/store';

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
  hideAudioCallButton?: boolean;
  hideCallButtons?: boolean;
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
  hideAudioCallButton = false,
  hideCallButtons = false,
}) => {
  const { startCall } = useCallManagerContext();
  const { isInCall } = useSelector((state: RootState) => state.calls);
  const { user } = useSelector((state: RootState) => state.auth);

  const shouldShowCallButtons = !isRemovedOrLeft && !isInCall;

  const handleAudioCall = () => {
    if (!currentChat || isInCall) return;
    
    const callId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const targetPeerId = currentChat.isGroup 
      ? participants.find(p => p.userId !== user?._id)?.userId 
      : otherParticipant?.userId;
    
    if (targetPeerId) {
      startCall(targetPeerId, 'audio', currentChat.id, callId);
    }
  };

  const handleVideoCall = () => {
    if (!currentChat || isInCall) return;
    
    const callId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const targetPeerId = currentChat.isGroup 
      ? participants.find(p => p.userId !== user?._id)?.userId 
      : otherParticipant?.userId;
    
    if (targetPeerId) {
      startCall(targetPeerId, 'video', currentChat.id, callId);
    }
  };

  return (
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
      <Group gap="xs">
        {!hideCallButtons && (
          <>
            {!hideAudioCallButton && (
              <Tooltip label="Audio call">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  onClick={handleAudioCall}
                  disabled={!isOnline && !currentChat?.isGroup}
                >
                  <PhoneIcon width={20} height={20} />
                </ActionIcon>
              </Tooltip>
            )}
            <Tooltip label="Video call">
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                onClick={handleVideoCall}
                disabled={!isOnline && !currentChat?.isGroup}
              >
                <VideoIcon width={20} height={20} />
              </ActionIcon>
            </Tooltip>
          </>
        )}
      <ActionIcon variant="subtle" color="gray" size="lg">
        <DotsVerticalIcons width={20} height={20} />
      </ActionIcon>
      </Group>
    </Group>
    <Divider mb={12} />
  </>
); 
}; 