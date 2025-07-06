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
  size = 'md',
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
      leftSection={<PlusIcon size={16} />}
      size={size}
      color={color}
      radius="md"
      disabled={disabled}
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        [position]: '1.5rem',
        zIndex: 200,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={handleClick}
    >
      {text}
    </Button>
  );
} 