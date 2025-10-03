import { useEffect, useCallback } from 'react';
import { AnswerPanel } from './components/AnswerPanel';
import { OfferPanel } from './components/OfferPanel';
import { useMediaStream } from './hooks/useMediaStream';
import { useWebRTC } from './hooks/useWebRTC';
import { useToast } from './components/ui/use-toast';
import { useUrlParams } from './hooks/useUrlParams';
import { useAutoAnswer } from './hooks/useAutoAnswer';
import { useStreamReady } from './hooks/useStreamReady';
import { ConnectionIndicator } from './components/ConnectionIndicator';
import { ControlPanel } from './components/ControlPanel';
import { VideoGrid } from './components/VideoGrid';

export function App() {
  const { toast } = useToast();

  // Handle errors with toast notifications
  const handleError = useCallback(
    (message: string) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      });
    },
    [toast]
  );

  // Media stream hook
  const {
    localStreamRef,
    localVideoRef,
    isMicEnabled,
    isCameraEnabled,
    toggleMic,
    toggleCamera,
    error: mediaError,
  } = useMediaStream();

  // WebRTC hook
  const {
    localSDP,
    remoteSDP,
    setRemoteSDP,
    connectionState,
    iceConnectionState,
    isOfferer,
    isCreatingOffer,
    remoteVideoRef,
    createOffer,
    createAnswer,
    hangup,
  } = useWebRTC({
    localStreamRef,
    onError: handleError,
  });

  // Track if local media stream is ready
  const isLocalStreamReady = useStreamReady(localStreamRef);

  // Show media error as toast
  useEffect(() => {
    if (mediaError) {
      handleError(mediaError);
    }
  }, [mediaError, handleError]);

  // Parse URL params on mount and populate remote SDP
  useUrlParams(setRemoteSDP);

  // Auto-generate answer when offer is pasted/received
  useAutoAnswer({
    remoteSDP,
    localSDP,
    isOfferer,
    isLocalStreamReady,
    createAnswer,
    connectionState,
  });

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-black/50">
      <ConnectionIndicator
        connectionState={connectionState}
        iceConnectionState={iceConnectionState}
        hangup={hangup}
      />
      <div className="flex items-center w-full shrink-0">
        <OfferPanel
          localSDP={localSDP}
          createOffer={createOffer}
          isOfferer={isOfferer}
          isCreatingOffer={isCreatingOffer}
        />
        <AnswerPanel
          localSDP={localSDP}
          isOfferer={isOfferer}
          handleSetRemoteSDP={setRemoteSDP}
        />
      </div>
      <ControlPanel
        isMicEnabled={isMicEnabled}
        isCameraEnabled={isCameraEnabled}
        toggleMic={toggleMic}
        toggleCamera={toggleCamera}
        hangup={hangup}
      />
      <VideoGrid
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
      />
    </div>
  );
}
