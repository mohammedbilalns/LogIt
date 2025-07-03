import { Box, Group, Textarea, Button, ActionIcon, Tooltip, Image, Loader, Text, rem, Progress } from '@mantine/core';
import { SendIcon } from '../icons/SendIcon';
import { PhotoIcon } from '../icons/PhotoIcon';
import { VideoIcon } from '../icons/VideoIcon';
import { AudioIcon } from '../icons/AudioIcon';
import React, { useRef, useState } from 'react';
import axios from '@/api/axios';

interface ChatInputProps {
  message: string;
  setMessage: (msg: string) => void;
  handleSend: (media?: { url: string; mediaType: string; name: string; size: number }) => void;
  sending: boolean;
  socketConnected: boolean;
  isMobile: boolean;
  isRemovedOrLeft?: boolean;
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_AUDIO_SIZE = 25 * 1024 * 1024;

const getUploadEndpoint = (type: string) => {
  if (type === 'image') return '/api/upload/upload-image';
  if (type === 'video') return '/api/upload/upload-video';
  if (type === 'audio') return '/api/upload/upload-audio';
  return '/api/upload/upload-image';
};

export const ChatInput: React.FC<ChatInputProps> = ({
  message,
  setMessage,
  handleSend,
  sending,
  socketConnected,
  isMobile,
  isRemovedOrLeft = false,
}) => {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (type: 'image' | 'video' | 'audio') => {
    setMediaType(type);
    fileInputRef.current?.setAttribute('accept',
      type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'audio/*'
    );
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith('image/') && file.size > MAX_IMAGE_SIZE) {
      alert('Image size must be less than 10MB');
      return;
    }
    if (file.type.startsWith('video/') && file.size > MAX_VIDEO_SIZE) {
      alert('Video size must be less than 100MB');
      return;
    }
    if (file.type.startsWith('audio/') && file.size > MAX_AUDIO_SIZE) {
      alert('Audio size must be less than 25MB');
      return;
    }
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setMediaType(file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'audio');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.type.startsWith('image/') && file.size > MAX_IMAGE_SIZE) {
      alert('Image size must be less than 10MB');
      return;
    }
    if (file.type.startsWith('video/') && file.size > MAX_VIDEO_SIZE) {
      alert('Video size must be less than 100MB');
      return;
    }
    if (file.type.startsWith('audio/') && file.size > MAX_AUDIO_SIZE) {
      alert('Audio size must be less than 25MB');
      return;
    }
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setMediaType(file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'audio');
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    setUploadProgress(0);
  };

  const onSend = async () => {
    if (mediaFile && mediaType) {
      setUploading(true);
      setUploadProgress(0);
      try {
        const formData = new FormData();
        formData.append('file', mediaFile);
        const response = await axios.post(getUploadEndpoint(mediaType), formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
            }
          },
        });
        handleSend({ url: response.data.url, mediaType, name: mediaFile.name, size: mediaFile.size });
        handleRemoveMedia();
      } catch (e) {
        alert('Failed to upload media');
      } finally {
        setUploading(false);
      }
    } else {
      handleSend();
    }
  };

  return (
    <Box
      p={isMobile ? 'sm' : 'md'}
      style={{
        background: isMobile ? '#f1f3f5' : 'inherit',
        borderTop: isMobile ? '1px solid #dee2e6' : undefined,
      }}
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
    >
      <Group align="flex-end" gap="xs">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.currentTarget.value)}
          placeholder={isRemovedOrLeft ? "You can no longer send messages" : "Type a message..."}
          autosize
          minRows={1}
          maxRows={4}
          style={{ flex: 1, borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          disabled={!socketConnected || sending || isRemovedOrLeft || uploading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <Tooltip label="Attach Image">
          <ActionIcon
            color="blue"
            variant="light"
            onClick={() => handleFileSelect('image')}
            disabled={!!mediaFile || !socketConnected || sending || isRemovedOrLeft || uploading}
            size="lg"
          >
            <PhotoIcon width={20} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Attach Video">
          <ActionIcon
            color="blue"
            variant="light"
            onClick={() => handleFileSelect('video')}
            disabled={!!mediaFile || !socketConnected || sending || isRemovedOrLeft || uploading}
            size="lg"
          >
            <VideoIcon width={20} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Attach Audio">
          <ActionIcon
            color="blue"
            variant="light"
            onClick={() => handleFileSelect('audio')}
            disabled={!!mediaFile || !socketConnected || sending || isRemovedOrLeft || uploading}
            size="lg"
          >
            <AudioIcon width={20} />
          </ActionIcon>
        </Tooltip>
        <Button
          onClick={onSend}
          variant="filled"
          color="blue"
          radius="xl"
          leftSection={<SendIcon width={18} />}
          loading={sending || uploading}
          disabled={(!message.trim() && !mediaFile) || !socketConnected || sending || isRemovedOrLeft || uploading}
          style={{ boxShadow: '0 2px 8px rgba(34,139,230,0.08)' }}
        >
          Send
        </Button>
      </Group>
      {mediaFile && (
        <Box mt="xs" style={{ position: 'relative', maxWidth: 220 }}>
          {mediaType === 'image' && mediaPreview && (
            <Image src={mediaPreview} alt={mediaFile.name} radius="md" w={120} h={120} fit="cover" />
          )}
          {mediaType === 'video' && mediaPreview && (
            <video src={mediaPreview} controls width={180} height={120} style={{ borderRadius: rem(8) }} />
          )}
          {mediaType === 'audio' && mediaPreview && (
            <audio src={mediaPreview} controls style={{ width: 180 }} />
          )}
          <Button
            size="xs"
            color="red"
            variant="subtle"
            onClick={handleRemoveMedia}
            style={{ position: 'absolute', top: 0, right: 0 }}
          >
            Remove
          </Button>
          {uploading && (
            <Progress value={uploadProgress} size="sm" color="blue" style={{ marginTop: 8 }} />
          )}
          <Text size="xs" mt={4} c="dimmed">{mediaFile.name} ({(mediaFile.size / 1024 / 1024).toFixed(2)} MB)</Text>
        </Box>
      )}
    </Box>
  );
}; 