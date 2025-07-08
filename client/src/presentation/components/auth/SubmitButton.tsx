import { Button, ButtonProps } from '@mantine/core';

interface SubmitButtonProps extends Omit<ButtonProps, 'variant' | 'gradient'> {
  children: React.ReactNode;
}

export default function SubmitButton({ children, ...props }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      radius="xl"
      fullWidth
      size="md"
      variant="gradient"
      gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
      {...props}
    >
      {children}
    </Button>
  );
} 