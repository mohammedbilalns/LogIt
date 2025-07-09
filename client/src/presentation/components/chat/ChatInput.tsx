import { Box, Group, Textarea, Button, ActionIcon, Tooltip, Text } from '@mantine/core';
import { SendIcon } from '../icons/SendIcon';
import { ImageIcon } from '../icons/ImageIcon';
import { MicrophoneIcon } from '../icons/MicrophoneIcon';
import { XIcon } from '../icons/XIcon';
import React, { useRef, useState, useEffect } from 'react';
import { MediaPreview } from './MediaPreview';

interface ChatInputProps {
  message: string;
  setMessage: (msg: string) => void;
  handleSend: () => void;
  handleMediaSelect: (file: File, type: 'image' | 'audio') => void;
  selectedMedia: { file: File; type: 'image' | 'audio' } | null;
  onRemoveMedia: () => void;
  sending: boolean;
  socketConnected: boolean;
  isMobile: boolean;
  isRemovedOrLeft?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  message,
  setMessage,
  handleSend,
  handleMediaSelect,
  selectedMedia,
  onRemoveMedia,
  sending,
  socketConnected,
  isMobile,
  isRemovedOrLeft = false,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_DURATION = 120;

  useEffect(() => {
    if (recording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev + 1 >= MAX_DURATION) {
            stopRecording();
            return MAX_DURATION;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [recording]);

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'image') => {
    const file = event.target.files?.[0];
    if (file) {
      handleMediaSelect(file, type);
    }
    event.target.value = '';
  };

  const startRecording = async () => {
    setRecordingTime(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new window.MediaRecorder(stream);
      setMediaRecorder(recorder);
      const localChunks: Blob[] = [];
      recorder.start();
      setRecording(true);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) localChunks.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);
        setMediaRecorder(null);
        if (localChunks.length > 0) {
          const audioBlob = new Blob(localChunks, { type: 'audio/webm' });
          const file = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
          handleMediaSelect(file, 'audio');
        }
      };
    } catch (err) {
      setRecording(false);
      setMediaRecorder(null);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setRecording(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <Box
      p={isMobile ? 'sm' : 'md'}
      style={{
        background: isMobile ? '#f1f3f5' : 'inherit',
        borderTop: isMobile ? '1px solid #dee2e6' : undefined,
      }}
    >
      {selectedMedia && (
        <MediaPreview media={selectedMedia} onRemove={onRemoveMedia} />
      )}
      <Group align="flex-end" gap="xs">
        <Tooltip label="Send image" position="top">
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={handleImageClick}
            disabled={!socketConnected || sending || isRemovedOrLeft || recording}
            size="lg"
          >
            <ImageIcon width={20} height={20} />
          </ActionIcon>
        </Tooltip>
        {!recording ? (
          <Tooltip label="Record audio" position="top">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={startRecording}
              disabled={!socketConnected || sending || isRemovedOrLeft}
              size="lg"
            >
              <MicrophoneIcon width={20} height={20} />
            </ActionIcon>
          </Tooltip>
        ) : (
          <Group gap={4} align="center" style={{ background: '#ffebee', borderRadius: 8, padding: '0 8px' }}>
            <span style={{ color: '#e03131', fontWeight: 700, fontSize: 18, marginRight: 4 }}>●</span>
            <Text size="sm" style={{ color: '#e03131', minWidth: 40 }}>{formatTime(recordingTime)}</Text>
            <Tooltip label="Stop recording" position="top">
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={stopRecording}
                size="md"
              >
                <XIcon width={16} height={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}
        {!recording && (
          <>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.currentTarget.value)}
              placeholder={isRemovedOrLeft ? "You can no longer send messages" : "Type a message..."}
              autosize
              minRows={1}
              maxRows={4}
              style={{ flex: 1, borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              disabled={!socketConnected || sending || isRemovedOrLeft || recording}
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
              leftSection={<SendIcon width={18} />}
              loading={sending}
              disabled={(!message.trim() && !sending) || !socketConnected || sending || isRemovedOrLeft || recording}
              style={{ boxShadow: '0 2px 8px rgba(34,139,230,0.08)' }}
            >
              Send
            </Button>
          </>
        )}
      </Group>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFileChange(e, 'image')}
      />
    </Box>
  );
}; 