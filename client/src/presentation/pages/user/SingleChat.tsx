import { useNavigate, useParams } from 'react-router-dom';
import { Box, Loader, Text } from '@mantine/core';
import { ChatHeader } from '@/presentation/components/chat/ChatHeader';
import { ChatMessages } from '@/presentation/components/chat/ChatMessages';
import UserSidebar from '@/presentation/components/user/UserSidebar';
import { useChat } from '@/application/hooks/useChat';
import { ChatInput } from '../../components/chat/ChatInput';
import { useMediaQuery } from '@mantine/hooks';
import { useSelector } from 'react-redux';
import { RootState } from '@/infrastructure/store';

export default function SingleChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const chat = useChat(id);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);

  const handleBackToChats = () => {
    navigate('/chats?tab=single');
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
        <ChatHeader {...chat} onBackClick={handleBackToChats} />
        <Box style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <ChatMessages {...chat} />
        </Box>
        <ChatInput {...chat} />
      </Box>
    </>
  );
}
