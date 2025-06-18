import { PinInput, Text, Group, Button, Box } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
  expiryTime: number;
  resendCooldown: number;
  onResend: () => void;
  loading?: boolean;
  onResendLoading?: boolean;
}

export default function OTPInput({
  value,
  onChange,
  error = false,
  disabled = false,
  expiryTime,
  resendCooldown,
  onResend,
  loading = false,
  onResendLoading = false,
}: OTPInputProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Box ta="center">
        <PinInput
          length={6}
          size={isMobile ? 'md' : 'lg'}
          value={value}
          onChange={onChange}
          error={error}
          type="number"
          oneTimeCode
          aria-label="OTP code"
          disabled={disabled}
        />
      </Box>

      <Text c={expiryTime < 60 ? 'red' : 'dimmed'} size="sm" ta="center" fw={500}>
        OTP expires in: {formatTime(expiryTime)}
      </Text>

      {expiryTime === 0 && (
        <Text c="yellow" size="sm" ta="center">
          OTP has expired. Please request a new one.
        </Text>
      )}

      <Group justify="center" gap="xs">
        <Text size="sm" c="dimmed">
          Didn't receive the code?
        </Text>
        <Button
          variant="subtle"
          size="sm"
          onClick={onResend}
          loading={onResendLoading}
          disabled={resendCooldown > 0}
        >
          {resendCooldown > 0 ? `Resend in ${formatTime(resendCooldown)}` : 'Resend'}
        </Button>
      </Group>
    </>
  );
} 