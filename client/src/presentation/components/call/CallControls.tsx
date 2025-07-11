import { Group, ActionIcon, Tooltip } from '@mantine/core';
import { PhoneOffIcon } from '../icons/PhoneOffIcon';
import { MicrophoneIcon } from '../icons/MicrophoneIcon';
import { MicrophoneOffIcon } from '../icons/MicrophoneOffIcon';
import { VideoIcon } from '../icons/VideoIcon';
import { VideoOffIcon } from '../icons/VideoOffIcon';
import { useCallManagerContext } from '@/application/hooks/CallManagerContext';

interface CallControlsProps {
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  callType: 'audio' | 'video' | null;
}

export const CallControls = ({ 
  onEndCall, 
  onToggleMute, 
  onToggleVideo, 
  callType 
}: CallControlsProps) => {
  const { isMuted, isVideoEnabled } = useCallManagerContext();


  return (
    <Group justify="center" gap="lg">
      <Tooltip label={isMuted ? 'Unmute' : 'Mute'}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <ActionIcon
            size="xl"
            radius="xl"
            variant="filled"
            color={isMuted ? 'red' : 'gray'}
            onClick={onToggleMute}
          >
            {isMuted ? <MicrophoneOffIcon width={24} height={24} /> : <MicrophoneIcon width={20} height={20} />}
            {isMuted && (
              <span style={{
                position: 'absolute',
                bottom: 6,
                right: 6,
                width: 10,
                height: 10,
                background: 'red',
                borderRadius: '50%',
                border: '2px solid white',
                zIndex: 2
              }} />
            )}
          </ActionIcon>
        </div>
      </Tooltip>

      {/* Video Toggle Button  */}
      {callType === 'video' && (
        <Tooltip label={isVideoEnabled ? 'Turn off video' : 'Turn on video'}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <ActionIcon
              size="xl"
              radius="xl"
              variant="filled"
              color={isVideoEnabled ? 'gray' : 'red'}
              onClick={onToggleVideo}
            >
              {isVideoEnabled ? <VideoIcon width={24} height={24} /> : <VideoOffIcon width={24} height={24} />}
              {!isVideoEnabled && (
                <span style={{
                  position: 'absolute',
                  bottom: 6,
                  right: 6,
                  width: 10,
                  height: 10,
                  background: 'red',
                  borderRadius: '50%',
                  border: '2px solid white',
                  zIndex: 2
                }} />
              )}
            </ActionIcon>
          </div>
        </Tooltip>
      )}

      {/* End Call Button */}
      <Tooltip label="End call">
        <ActionIcon
          size="xl"
          radius="xl"
          variant="filled"
          color="red"
          onClick={onEndCall}
        >
          <PhoneOffIcon width={24} height={24} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}; 