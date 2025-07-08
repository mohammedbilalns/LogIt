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
  size = 'md',
  color = 'blue',
  disabled = false
}: CreateGroupButtonProps) {
  return (
    <Button
      leftSection={<UsersIcon width={16} />}
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
      onClick={onClick}
    >
      {text}
    </Button>
  );
} 