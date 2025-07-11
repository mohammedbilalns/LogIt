import { Modal, Button, Group, Text, Avatar, Stack } from '@mantine/core';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/infrastructure/store';
import { setIncomingCall } from '@/infrastructure/store/slices/callSlice';
import { useCallManagerContext } from '@/application/hooks/CallManagerContext';
import { PhoneIcon } from '../icons/PhoneIcon';
import { PhoneOffIcon } from '../icons/PhoneOffIcon';

export const IncomingCallModal = () => {
  const dispatch = useDispatch();
  const { incomingCall } = useSelector((state: RootState) => state.calls);
  const { acceptCall, rejectCall } = useCallManagerContext();

  const handleAccept = () => {
    acceptCall();
    dispatch(setIncomingCall(null));
  };

  const handleReject = () => {
    rejectCall();
    dispatch(setIncomingCall(null));
  };

  if (!incomingCall) return null;

  return (
    <Modal
      opened={!!incomingCall}
      onClose={handleReject}
      title="Incoming Call"
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
      zIndex={4000}
    >
      <Stack align="center" gap="lg">
        <Avatar size="xl" radius="xl" color="blue">
          {incomingCall.fromName?.charAt(0) || 'U'}
        </Avatar>
        <Text size="lg" fw={500}>
          {incomingCall.fromName || 'Unknown Caller'}
        </Text>
        <Text size="sm" c="dimmed">
          Incoming {incomingCall.type} call
        </Text>
        <Group gap="md">
          <Button
            color="green"
            size="lg"
            radius="xl"
            onClick={handleAccept}
            leftSection={<PhoneIcon width={20} height={20} />}
          >
            Accept
          </Button>
          <Button
            color="red"
            size="lg"
            radius="xl"
            onClick={handleReject}
            leftSection={<PhoneOffIcon width={20} height={20} />}
          >
            Decline
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}; 