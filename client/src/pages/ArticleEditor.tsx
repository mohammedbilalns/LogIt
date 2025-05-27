import { useParams, useNavigate } from 'react-router-dom';
import ArticleEditorForm from '../components/ArticleEditorForm';
import { Box } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

interface ArticleEditorProps {
  mode: 'create' | 'edit';
}

export default function ArticleEditor({ mode }: ArticleEditorProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleClose = () => {
    navigate('/articles');
  };

  return (
    <Box 
      ml={isMobile ? 16 : 290} 
      mt={100} 
      mr={isMobile ? 16 : 30} 
      pl={isMobile ? 0 : "md"} 
      pb={100}
      style={{
        maxWidth: '1200px',
        margin: isMobile ? '100px 16px 100px 16px' : '100px auto 100px auto',
        padding: isMobile ? '0' : '0 16px'
      }}
    >
      <ArticleEditorForm
        mode={mode}
        articleId={id}
        onClose={handleClose}
      />
    </Box>
  );
} 