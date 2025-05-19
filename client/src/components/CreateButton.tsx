import { Button, ActionIcon, Group } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

export default function CreateButton({ onClick }: { onClick?: () => void }) {
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
      onClick={onClick}
    >
      Create
    </Button>
  );
} 