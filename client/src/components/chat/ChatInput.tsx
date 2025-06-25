import { Box, Group, ActionIcon, Textarea, Button } from '@mantine/core';
import { IconSend, IconPhoto, IconFile } from '@tabler/icons-react';
import React from 'react';

interface ChatInputProps {
  message: string;
  setMessage: (msg: string) => void;
  handleSend: () => void;
  sending: boolean;
  socketConnected: boolean;
  isMobile: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  message,
  setMessage,
  handleSend,
  sending,
  socketConnected,
  isMobile,
}) => (
  <Box
    p={isMobile ? 'sm' : 'md'}
    style={{
      background: isMobile ? '#f1f3f5' : 'inherit',
      borderTop: isMobile ? '1px solid #dee2e6' : undefined,
    }}
  >
    <Group align="flex-end" gap="xs">
      <ActionIcon variant="subtle" color="blue" size="lg">
        <IconPhoto size={20} />
      </ActionIcon>
      <ActionIcon variant="subtle" color="blue" size="lg">
        <IconFile size={20} />
      </ActionIcon>
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
        placeholder="Type a message..."
        autosize
        minRows={1}
        maxRows={4}
        style={{ flex: 1, borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        disabled={!socketConnected || sending}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <Button
        onClick={handleSend}
        variant="filled"
        color="blue"
        radius="xl"
        leftSection={<IconSend size={18} />}
        loading={sending}
        disabled={!message.trim() || !socketConnected || sending}
        style={{ boxShadow: '0 2px 8px rgba(34,139,230,0.08)' }}
      >
        Send
      </Button>
    </Group>
  </Box>
); 