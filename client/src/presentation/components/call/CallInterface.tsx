import { useEffect, useRef, useState } from 'react';
import { useCallManagerContext } from '@/application/hooks/CallManagerContext';
import { CallControls } from './CallControls';
import { CallVideoGrid } from './CallVideoGrid';
import { createPortal } from 'react-dom';
import { ConfirmModal } from '../confirm';

export const CallInterface = () => {
  const { isInCall, callType, endCurrentCall, toggleMute, toggleVideo, localStream, remoteStreams } = useCallManagerContext();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  if (!isInCall) {
    return null;
  }


  return createPortal(
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 3000,
          background: 'rgba(0,0,0,0.92)', 
          overflow: 'hidden', 
          display: 'flex',
          flexDirection: 'column',
          width: '100vw',
          height: '100vh',
          maxHeight: '100vh',
          maxWidth: '100vw',
        }}
      >
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CallVideoGrid />
        </div>
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
        }}>
          <CallControls
            onEndCall={() => setShowConfirm(true)}
            onToggleMute={toggleMute}
            onToggleVideo={toggleVideo}
            callType={callType}
          />
        </div>
      </div>
      <ConfirmModal
        opened={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={async () => {
          setLeaving(true);
          await endCurrentCall();
          setLeaving(false);
          setShowConfirm(false);
        }}
        title="Leave Call"
        message="Are you sure you want to leave the call?"
        confirmLabel="Leave"
        confirmColor="red"
        loading={leaving}
      />
    </>,
    document.body
  );
}; 