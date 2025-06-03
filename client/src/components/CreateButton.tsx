import { Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { MouseEventHandler } from 'react';

interface CreateButtonProps {
  position?: 'right' | 'left';
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function CreateButton({ position = 'right', onClick }: CreateButtonProps) {
  const navigate = useNavigate();

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (onClick) {
      onClick(event);
    } else {
      navigate('/articles/create');
    }
  };

  return (
    <Button
      leftSection={<IconPlus size={20} />}
      size="lg"
      color="blue"
      radius="xl"
      style={{
        position: 'fixed',
        bottom: '2rem',
        [position]: '2rem',
        zIndex: 200,
        boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
      }}
      onClick={handleClick}
    >
      Create
    </Button>
  );
} 