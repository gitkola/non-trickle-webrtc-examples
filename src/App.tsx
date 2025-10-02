import { useState, useEffect, useCallback, useRef } from 'react';
import { VideoComponent } from './components/VideoComponent';
import { AnswerPanel } from './components/AnswerPanel';
import { OfferPanel } from './components/OfferPanel';
import { Button } from './components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, RefreshCw } from 'lucide-react';
import { useMediaStream } from './hooks/useMediaStream';
import { useWebRTC } from './hooks/useWebRTC';
import { useToast } from './components/ui/use-toast';
import { parseUrlParams, createSDPUrl } from './lib/url-utils';

export function App() {
  const [isLandscape, setIsLandscape] = useState(
    window.innerWidth > window.innerHeight
  );
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
    isCreatingAnswer,
    remoteVideoRef,
    createOffer,
    createAnswer,
    handleApplyRemoteSDP,
    hangup,
  } = useWebRTC({
    localStreamRef,
    onError: handleError,
  });

  // Track if we've already initialized from URL params
  const initializedFromUrl = useRef(false);
  // Track if the current SDP generation was user-initiated (for clipboard access)
  const userInitiatedAction = useRef(false);

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
    if (remoteSDP && !localSDP && !hasAutoAnswered.current && isOfferer === null) {
      hasAutoAnswered.current = true;
      // Don't set userInitiatedAction - this is automatic
      createAnswer();
    }
  }, [remoteSDP, localSDP, isOfferer, createAnswer]);

  // Reset auto-answer flag when hanging up
  useEffect(() => {
    if (connectionState === 'disconnected') {
      hasAutoAnswered.current = false;
    }
  }, [connectionState]);

  // Handle window resize for landscape/portrait detection
  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
              description: `${type === 'offer' ? 'Offer' : 'Answer'} URL copied to clipboard`,
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
        description: `${type === 'offer' ? 'Offer' : 'Answer'} URL copied to clipboard`,
      });
    },
    [isOfferer, toast]
  );

  // Show reconnection option when failed
  const canRetry =
    connectionState === 'failed' || connectionState === 'disconnected';

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-black/50">
      <span
        className={`flex shrink-0 items-center justify-center text-sm py-1 w-full font-medium ${
          connectionState === 'connected'
            ? 'bg-green-600'
            : connectionState === 'connecting'
            ? 'bg-yellow-600'
            : connectionState === 'failed'
            ? 'bg-red-600'
            : 'bg-slate-600'
        }`}
      >
        {connectionState}{' '}
        {iceConnectionState !== 'new' && `(ICE: ${iceConnectionState})`}
      </span>
      <OfferPanel
        localSDP={localSDP}
        createOffer={handleCreateOffer}
        copyToClipboard={copyToClipboard}
        isCreatingOffer={isCreatingOffer}
      />
      <div className="flex gap-2 p-2 bg-slate-800 justify-center">
        <Button
          size="icon"
          variant={isMicEnabled ? 'default' : 'destructive'}
          onClick={toggleMic}
          title={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
          className="size-10"
        >
          {isMicEnabled ? (
            <Mic className="size-5" />
          ) : (
            <MicOff className="size-5" />
          )}
        </Button>
        <Button
          size="icon"
          variant={isCameraEnabled ? 'default' : 'destructive'}
          onClick={toggleCamera}
          title={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
          className="size-10"
        >
          {isCameraEnabled ? (
            <Video className="size-5" />
          ) : (
            <VideoOff className="size-5" />
          )}
        </Button>
        <Button
          size="icon"
          variant="destructive"
          onClick={hangup}
          title="Hang up and close connection"
          className="size-10"
          disabled={connectionState === 'disconnected'}
        >
          <PhoneOff className="size-5" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={() => window.location.reload()}
          title="Reload page"
          className="size-10"
        >
          <RefreshCw className="size-5" />
        </Button>
      </div>
      <div
        className={`flex ${
          isLandscape ? 'flex-row' : 'flex-col'
        } flex-1 min-h-0`}
      >
        <VideoComponent videoElementRef={localVideoRef} isLocal />
        <VideoComponent videoElementRef={remoteVideoRef} isLocal={false} />
      </div>
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
