import UserSidebar from '@/components/user/UserSidebar';
import { useParams } from 'react-router-dom';
import { Box, Loader } from '@mantine/core';
import { useChat } from '@/hooks/useChat';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '../../components/chat/ChatInput';
import { useState } from 'react';
import GroupDetailsModal from '@/components/chat/GroupDetailsModal';

export default function GroupChatPage() {
  const { id } = useParams();
  const chat = useChat(id);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const myParticipant = chat.participants.find((p: any) => p.userId === chat.loggedInUser?._id);
  const myRole = myParticipant?.role as string | undefined;
  const isRemovedOrLeft = myRole === 'removed-user' || myRole === 'left-user';
  if (chat.loading && chat.page === 1 && chat.messages.length === 0) {
    return <><UserSidebar /><Box className={chat.containerClassName} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Loader size="lg" /></Box></>;
  }
  if (chat.error) {
    return <><UserSidebar /><Box className={chat.containerClassName} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><span style={{ color: 'red' }}>{chat.error}</span></Box></>;
  }
  return (
    <>
      <UserSidebar />
      <Box
        className={chat.containerClassName}
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <ChatHeader
          {...chat}
          onlineCount={isRemovedOrLeft ? undefined : chat.onlineCount}
          hideCounts={isRemovedOrLeft}
          onTitleClick={() => setDetailsOpen(true)}
        />
        <Box style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <ChatMessages {...chat} />
        </Box>
        {isRemovedOrLeft ? (
          <Box p="md" style={{ textAlign: 'center', color: '#888', background: '#fffbe6', borderTop: '1px solid #ffe066' }}>
            {myRole === 'removed-user' && 'You have been removed from this group. You can no longer send messages.'}
            {myRole === 'left-user' && 'You have left this group. You can no longer send messages.'}
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
      />
    </>
  );
} 