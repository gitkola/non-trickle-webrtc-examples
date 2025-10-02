import { useState, useEffect, useCallback } from 'react';
import { VideoComponent } from './components/VideoComponent';
import { AnswerPanel } from './components/AnswerPanel';
import { OfferPanel } from './components/OfferPanel';
import { Button } from './components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { useMediaStream } from './hooks/useMediaStream';
import { useWebRTC } from './hooks/useWebRTC';
import { useToast } from './components/ui/use-toast';

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
    remoteVideoRef,
    createOffer,
    createAnswer,
    handleApplyRemoteSDP,
    hangup,
  } = useWebRTC({
    localStreamRef,
    onError: handleError,
  });

  // Show media error as toast
  useEffect(() => {
    if (mediaError) {
      handleError(mediaError);
    }
  }, [mediaError, handleError]);

  // Handle window resize for landscape/portrait detection
  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Copy to clipboard helper
  const copyToClipboard = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: 'SDP copied to clipboard',
      });
    },
    [toast]
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
        createOffer={createOffer}
        copyToClipboard={copyToClipboard}
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
        handleApplyRemoteSDP={handleApplyRemoteSDP}
        createAnswer={createAnswer}
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
