import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import LogEditorForm from '@components/LogEditorForm';

interface LogEditorProps {
  mode: 'create' | 'edit';
}

export default function LogEditor({ mode }: LogEditorProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);

  const handleClose = () => {
    navigate('/logs');
  };

  return (
    <Box 
      style={{
        marginLeft: isMobile ? '16px' : (isSidebarOpen ? '290px' : '16px'),
        marginRight: isMobile ? '16px' : '30px',
        paddingLeft: isMobile ? '0' : '16px',
        marginTop: '100px',
        paddingBottom: '100px',
        transition: 'margin-left 0.3s ease',
        height: 'calc(100vh - 100px)',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Container 
        size="xl" 
        style={{
          width: '100%',
          maxWidth: '1400px',
          padding: isMobile ? '0' : '0 24px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <LogEditorForm
          mode={mode}
          logId={id}
          onClose={handleClose}
        />
      </Container>
    </Box>
  );
} 