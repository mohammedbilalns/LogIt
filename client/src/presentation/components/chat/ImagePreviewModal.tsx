import React from 'react';
import { Modal, Image, useMantineColorScheme } from '@mantine/core';

interface ImagePreviewModalProps {
  opened: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ opened, onClose, src, alt }) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      zIndex={4000}
      lockScroll
      radius="md"
      withCloseButton
      size="auto"
      padding={0}
      styles={{
        body: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: isDark ? '#23272e' : '#fff',
          minWidth: 320,
          minHeight: 320,
          padding: 24,
        },
        content: {
          background: isDark ? '#23272e' : '#fff',
          boxShadow: 'none',
          minWidth: 320,
          minHeight: 320,
        },
        close: {
          marginRight: 24,
        },
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
        <Image
          src={src}
          alt={alt || 'Image preview'}
          fit="contain"
          style={{ maxHeight: '70vh', maxWidth: '90vw', borderRadius: 12, display: 'block', margin: '0 auto' }}
        />
      </div>
    </Modal>
  );
}; 