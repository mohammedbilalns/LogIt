import { Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export default function CreateButton() {
  const navigate = useNavigate();

  return (
    <Button
      leftSection={<IconPlus size={20} />}
      size="lg"
      color="blue"
      radius="xl"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 200,
        boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
      }}
      onClick={() => navigate('/articles/create')}
    >
      Create
    </Button>
  );
} 