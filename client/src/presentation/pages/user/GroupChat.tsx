import UserSidebar from '@/presentation/components/user/UserSidebar';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Loader, Text } from '@mantine/core';
import { useChat } from '@/application/hooks/useChat';
import { ChatHeader } from '@/presentation/components/chat/ChatHeader';
import { ChatMessages } from '@/presentation/components/chat/ChatMessages';
import { ChatInput } from '../../components/chat/ChatInput';
import { useState } from 'react';
import GroupDetailsModal from '@/presentation/components/chat/GroupDetailsModal';
import { useMediaQuery } from '@mantine/hooks';
import { useSelector } from 'react-redux';
import { RootState } from '@/infrastructure/store';

export default function GroupChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const chat = useChat(id);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);
  
  const { isRemovedOrLeft, myParticipant } = chat;
  const myRole = myParticipant?.role;

  const handleBackToChats = () => {
    navigate('/chats?tab=group');
  };

  const containerClassName = `chat-page-container ${!isMobile && isSidebarOpen ? 'sidebar-open' : ''}`;

  if (chat.loading && chat.page === 1 && chat.messages.length === 0) {
    return (
      <>
        <UserSidebar />
        <Box className={containerClassName} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Loader size="lg" />
        </Box>
      </>
    );
  }
  
  if (chat.error) {
    return (
      <>
        <UserSidebar />
        <Box className={containerClassName} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Text c="red">{chat.error}</Text>
        </Box>
      </>
    );
  }
  
  return (
    <>
      <UserSidebar />
      <Box className={containerClassName}>
        <ChatHeader
          {...chat}
          onlineCount={isRemovedOrLeft ? undefined : chat.onlineCount}
          hideCounts={isRemovedOrLeft}
          onTitleClick={() => !isRemovedOrLeft && setDetailsOpen(true)}
          onBackClick={handleBackToChats}
          isRemovedOrLeft={isRemovedOrLeft}
          myParticipant={myParticipant}
        />
        <Box style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <ChatMessages {...chat} />
        </Box>
        {isRemovedOrLeft ? (
          <Box p="sm" style={{ textAlign: 'center', color: '#888', background: '#fffbe6', borderTop: '1px solid #ffe066' }}>
            <Text size="sm">
            {myRole === 'removed-user' && 'You have been removed from this group. You can no longer send messages.'}
            {myRole === 'left-user' && 'You have left this group. You can no longer send messages.'}
            </Text>
          </Box>
        ) : (
          <ChatInput {...chat} />
        )}
      </Box>
      <GroupDetailsModal
        opened={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        chat={chat.currentChat}
        participants={chat.participants}
        isAdmin={chat.currentChat?.participants?.find((p: any) => p.userId === chat.loggedInUser?._id)?.role === 'admin'}
        loggedInUser={chat.loggedInUser}
        isRemovedOrLeft={isRemovedOrLeft}
      />
    </>
  );
} 