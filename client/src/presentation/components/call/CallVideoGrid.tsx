import React, { useEffect, useRef, memo } from 'react';
import { useCallManagerContext } from '@/application/hooks/CallManagerContext';
import { MicrophoneIcon } from '../icons/MicrophoneIcon';
import { MicrophoneOffIcon } from '../icons/MicrophoneOffIcon';
import { VideoIcon } from '../icons/VideoIcon';
import { VideoOffIcon } from '../icons/VideoOffIcon';

const StatusOverlay = memo(({ mic, camera, callType }: { mic: boolean; camera: boolean; callType: 'audio' | 'video' | null }) => (
  <div style={{ position: 'absolute', top: 8, right: 32, display: 'flex', flexDirection: 'row', zIndex: 20, gap: 4 }}>
    {mic ? (
      <span style={{ color: 'green' }}><MicrophoneIcon width={22} height={22} /></span>
    ) : (
      <span style={{ color: 'red' }}><MicrophoneOffIcon width={22} height={22} /></span>
    )}
    {callType === 'video' && (camera ? (
      <span style={{ color: 'green' }}><VideoIcon width={22} height={22} /></span>
    ) : (
      <span style={{ color: 'red' }}><VideoOffIcon width={22} height={22} /></span>
    ))}
  </div>
));

const RemoteVideo = memo(
  ({ peerId, stream, mic, camera, callType }: { peerId: string; stream: MediaStream; mic: boolean; camera: boolean; callType: 'audio' | 'video' | null }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
      if (videoRef.current && stream) {
        if (videoRef.current.srcObject !== stream) {
          videoRef.current.srcObject = stream;
        }
      }
    }, [stream]);
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'black' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            objectFit: 'contain',
            maxWidth: '100vw',
            maxHeight: '100vh',
            width: '100%',
            height: '100%',
            background: 'black'
          }}
        />
        <StatusOverlay mic={mic} camera={camera} callType={callType} />
      </div>
    );
  }
);

export const CallVideoGrid = () => {
  const { localStream, remoteStreams, callType, remoteStatus } = useCallManagerContext();
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const remoteStreamsArray = Object.entries(remoteStreams) as [string, MediaStream][];

  // Fallback UI if no stream
  if (!localStream && remoteStreamsArray.length === 0) {
    return (
      <div style={{ color: 'white', textAlign: 'center', marginTop: 40 }}>
        No video stream available
      </div>
    );
  }

  if (callType === 'audio') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">📞</div>
          <div className="text-xl">Audio Call</div>
          <div className="text-sm text-gray-400 mt-2">
            {remoteStreamsArray.length} participant(s)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'black' }}>
      {/* Remote videos */}
      {remoteStreamsArray.length > 0 ? (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'black' }}>
          {remoteStreamsArray.map(([peerId, stream]) => (
            <RemoteVideo
              key={peerId}
              peerId={peerId}
              stream={stream}
              mic={remoteStatus?.[peerId]?.mic ?? true}
              camera={remoteStatus?.[peerId]?.camera ?? true}
              callType={callType}
            />
          ))}
        </div>
      ) : (
        <div style={{ width: '100vw', height: '100vh', background: 'black' }} />
      )}
      {localStream && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, width: 160, height: 120, background: 'black', borderRadius: 8, overflow: 'hidden', border: '2px solid #fff', zIndex: 10001, boxShadow: '0 2px 12px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'black' }}
          />
        </div>
      )}
    </div>
  );
}; 