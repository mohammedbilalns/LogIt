import { Button } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { MouseEventHandler } from 'react';
import PlusIcon from '../icons/PlusIcon';

interface CreateButtonProps {
  position?: 'right' | 'left';
  onClick?: MouseEventHandler<HTMLButtonElement>;
  text?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  disabled?: boolean;
}

export default function CreateButton({ 
  position = 'right', 
  onClick, 
  text = 'Create',
  size = 'lg',
  color = 'blue',
  disabled = false
}: CreateButtonProps) {
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
      leftSection={<PlusIcon size={20} />}
      size={size}
      color={color}
      radius="xl"
      disabled={disabled}
      style={{
        position: 'fixed',
        bottom: '2rem',
        [position]: '2rem',
        zIndex: 200,
        boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
      }}
      onClick={handleClick}
    >
      {text}
    </Button>
  );
} 