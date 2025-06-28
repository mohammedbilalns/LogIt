import { useNavigate, useParams } from 'react-router-dom';
import { Box, Loader } from '@mantine/core';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessages } from '@/components/chat/ChatMessages';
import UserSidebar from '@/components/user/UserSidebar';
import { useChat } from '@/hooks/useChat';
import { ChatInput } from '../../components/chat/ChatInput';

export default function SingleChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const chat = useChat(id);

  const handleBackToChats = () => {
    navigate('/chats?tab=single');
  };

  if (chat.loading && chat.page === 1 && chat.messages.length === 0) {
    return (
      <>
        <UserSidebar />
        <Box
          className={chat.containerClassName}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <Loader size="lg" />
        </Box>
      </>
    );
  }
  if (chat.error) {
    return (
      <>
        <UserSidebar />
        <Box
          className={chat.containerClassName}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <span style={{ color: 'red' }}>{chat.error}</span>
        </Box>
      </>
    );
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
        <ChatHeader {...chat} onBackClick={handleBackToChats} />
        <Box
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ChatMessages {...chat} />
        </Box>
        <ChatInput {...chat} />
      </Box>
      Add commentMore actions
    </>
  );
}
