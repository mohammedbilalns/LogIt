// components/GoogleButton.tsx
import { IconBrandGoogle } from '@tabler/icons-react';
import { Button } from '@mantine/core';

interface GoogleButtonProps {
  onClick?: () => void;
  fullWidth?: boolean;
}

export function GoogleButton({ onClick, fullWidth = true }: GoogleButtonProps) {
  return (
    <Button
      leftSection={<IconBrandGoogle size={18} />}
      variant="default"
      color="gray"
      fullWidth={fullWidth}
      onClick={onClick}
    >
      Sign up with Google
    </Button>
  );
}
