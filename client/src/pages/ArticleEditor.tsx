import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArticleEditorForm from '@components/ArticleEditorForm';
import { Box, Container } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface ArticleEditorProps {
  mode: 'create' | 'edit';
}

export default function ArticleEditor({ mode }: ArticleEditorProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);

  const handleClose = () => {
    navigate('/articles');
  };

  return (
    <Box 
      style={{
        marginLeft: isMobile ? '16px' : (isSidebarOpen ? '290px' : '16px'),
        marginRight: isMobile ? '16px' : '30px',
        paddingLeft: isMobile ? '0' : '16px',
        paddingTop: isMobile ? '60px' : '80px',
        paddingBottom: '100px',
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 0
      }}
    >
      <Container 
        size="xl" 
        style={{
          width: '100%',
          maxWidth: '1400px',
          padding: isMobile ? '0' : '0 24px',
          position: 'relative',
          zIndex: 0
        }}
      >
        <ArticleEditorForm
          mode={mode}
          articleId={id}
          onClose={handleClose}
        />
      </Container>
    </Box>
  );
} 