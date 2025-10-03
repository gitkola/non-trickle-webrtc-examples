import { useEffect, useCallback } from 'react';
import { AnswerPanel } from './components/AnswerPanel';
import { OfferPanel } from './components/OfferPanel';
import { Button } from './components/ui/button';
import { useMediaStream } from './hooks/useMediaStream';
import { useWebRTC } from './hooks/useWebRTC';
import { useToast } from './components/ui/use-toast';
import { useUrlParams } from './hooks/useUrlParams';
import { useAutoAnswer } from './hooks/useAutoAnswer';
import { useClipboardCopy } from './hooks/useClipboardCopy';
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

  // Handle clipboard copying with user-initiated tracking
  const { copyToClipboard, markUserInitiated } = useClipboardCopy({
    localSDP,
    isOfferer,
    toast,
  });

  // Wrapper for user-initiated offer creation
  const handleCreateOffer = useCallback(() => {
    markUserInitiated();
    createOffer();
  }, [createOffer, markUserInitiated]);

  // Show reconnection option when failed
  const canRetry = ['failed', 'disconnected'].includes(connectionState);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-black/50">
      <ConnectionIndicator
        connectionState={connectionState}
        iceConnectionState={iceConnectionState}
      />
      <OfferPanel
        localSDP={localSDP}
        createOffer={handleCreateOffer}
        copyToClipboard={copyToClipboard}
        isCreatingOffer={isCreatingOffer}
      />
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
      <AnswerPanel
        remoteSDP={remoteSDP}
        handleSetRemoteSDP={setRemoteSDP}
        onPasteClick={markUserInitiated}
      />
      {canRetry && connectionState === 'failed' && (
        <div className="flex items-center justify-center p-4 bg-red-600">
          <span className="text-sm font-medium mr-4">Connection failed</span>
          <Button size="sm" variant="secondary" onClick={hangup}>
            Reset Connection
          </Button>
        </div>
      )}
    </div>
  );
}
