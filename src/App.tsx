import { useState, useEffect, useCallback, useRef } from 'react';
import { AnswerPanel } from './components/AnswerPanel';
import { OfferPanel } from './components/OfferPanel';
import { Button } from './components/ui/button';
import { useMediaStream } from './hooks/useMediaStream';
import { useWebRTC } from './hooks/useWebRTC';
import { useToast } from './components/ui/use-toast';
import { parseUrlParams, createSDPUrl } from './lib/url-utils';
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

  // Track if we've already initialized from URL params
  const initializedFromUrl = useRef(false);
  // Track if the current SDP generation was user-initiated (for clipboard access)
  const userInitiatedAction = useRef(false);
  // Track if local media stream is ready
  const [isLocalStreamReady, setIsLocalStreamReady] = useState(false);

  // Check if local stream is ready
  useEffect(() => {
    const checkStream = () => {
      const hasLocalTracks =
        localStreamRef.current && localStreamRef.current.getTracks().length > 0;
      if (hasLocalTracks) {
        setIsLocalStreamReady(true);
      }
    };

    // Check immediately
    checkStream();

    // Also check periodically until ready (for race conditions)
    if (!isLocalStreamReady) {
      const interval = setInterval(checkStream, 100);
      return () => clearInterval(interval);
    }
  }, [localStreamRef, isLocalStreamReady]);

  // Show media error as toast
  useEffect(() => {
    if (mediaError) {
      handleError(mediaError);
    }
  }, [mediaError, handleError]);

  // Parse URL params on mount and populate remote SDP
  useEffect(() => {
    if (!initializedFromUrl.current) {
      const { offer, answer } = parseUrlParams();
      if (offer) {
        setRemoteSDP(offer);
      } else if (answer) {
        setRemoteSDP(answer);
      }
      initializedFromUrl.current = true;
    }
  }, [setRemoteSDP]);

  // Auto-generate answer when offer is pasted/received
  const hasAutoAnswered = useRef(false);
  useEffect(() => {
    // Only auto-answer if we have remote SDP, no local SDP yet, and haven't answered yet
    // AND local stream is ready (has tracks)
    if (
      remoteSDP &&
      !localSDP &&
      !hasAutoAnswered.current &&
      isOfferer === null &&
      isLocalStreamReady
    ) {
      hasAutoAnswered.current = true;
      // Don't set userInitiatedAction - this is automatic
      createAnswer();
    }
  }, [remoteSDP, localSDP, isOfferer, createAnswer, isLocalStreamReady]);

  // Reset auto-answer flag when hanging up
  useEffect(() => {
    if (connectionState === 'disconnected') {
      hasAutoAnswered.current = false;
    }
  }, [connectionState]);

  // Auto-copy offer/answer URL when generated
  const previousLocalSDP = useRef('');
  useEffect(() => {
    if (localSDP && localSDP !== previousLocalSDP.current) {
      previousLocalSDP.current = localSDP;

      // Determine type based on isOfferer
      const type = isOfferer ? 'offer' : 'answer';
      const url = createSDPUrl(localSDP, type);

      // Only auto-copy if this was a user-initiated action
      if (userInitiatedAction.current) {
        userInitiatedAction.current = false; // Reset flag
        navigator.clipboard
          .writeText(url)
          .then(() => {
            toast({
              title: 'Copied!',
              description: `${
                type === 'offer' ? 'Offer' : 'Answer'
              } URL copied to clipboard`,
            });
          })
          .catch((err) => {
            console.error('Failed to auto-copy to clipboard:', err);
            toast({
              title: `${type === 'offer' ? 'Offer' : 'Answer'} generated`,
              description: 'Click the copy button to copy to clipboard',
            });
          });
      } else {
        // Auto-generated (not user-initiated) - just show notification
        toast({
          title: `${type === 'offer' ? 'Offer' : 'Answer'} generated`,
          description: 'Click the copy button to copy to clipboard',
        });
      }
    }
  }, [localSDP, isOfferer, toast]);

  // Wrapper for user-initiated offer creation
  const handleCreateOffer = useCallback(() => {
    userInitiatedAction.current = true;
    createOffer();
  }, [createOffer]);

  // Handler for when user clicks paste button
  const handlePasteClick = useCallback(() => {
    userInitiatedAction.current = true;
  }, []);

  // Copy to clipboard helper (for manual copy button)
  const copyToClipboard = useCallback(
    (sdp: string) => {
      if (!sdp) return;
      const type = isOfferer ? 'offer' : 'answer';
      const url = createSDPUrl(sdp, type);
      navigator.clipboard.writeText(url);
      toast({
        title: 'Copied!',
        description: `${
          type === 'offer' ? 'Offer' : 'Answer'
        } URL copied to clipboard`,
      });
    },
    [isOfferer, toast]
  );

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
        onPasteClick={handlePasteClick}
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
