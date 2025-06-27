import { Button } from '@mantine/core';
import { MouseEventHandler } from 'react';
import { UsersIcon } from '../icons/UsersIcon';

interface CreateGroupButtonProps {
  position?: 'right' | 'left';
  onClick?: MouseEventHandler<HTMLButtonElement>;
  text?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  disabled?: boolean;
}

export default function CreateGroupButton({ 
  position = 'right', 
  onClick, 
  text = 'Create Group',
  size = 'lg',
  color = 'blue',
  disabled = false
}: CreateGroupButtonProps) {
  return (
    <Button
      leftSection={<UsersIcon width={20} />}
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
      onClick={onClick}
    >
      {text}
    </Button>
  );
} 