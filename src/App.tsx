import { useWebRTC } from '@/hooks/useWebRTC';
import { useMediaStream } from '@/hooks/useMediaStream';
import { useUrlParams } from '@/hooks/useUrlParams';
import { useAutoAnswer } from '@/hooks/useAutoAnswer';
import { ConnectionIndicator } from '@/components/ConnectionIndicator';
import { AnswerPanel } from '@/components/AnswerPanel';
import { OfferPanel } from '@/components/OfferPanel';
import { ControlPanel } from '@/components/ControlPanel';
import { VideoGrid } from '@/components/VideoGrid';
import { ConnectPanel } from '@/components/ConnectPanel';

export function App() {
  const {
    localStreamRef,
    localVideoRef,
    toggleCamera,
    toggleMic,
    isLocalStreamReady,
  } = useMediaStream();

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
    hangup,
  } = useWebRTC({
    localStreamRef,
  });

  useUrlParams(setRemoteSDP);

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
      />
      <ConnectPanel
        localSDP={localSDP}
        createOffer={createOffer}
        isCreatingOffer={isCreatingOffer}
        isCreatingAnswer={isCreatingAnswer}
        setRemoteSDP={setRemoteSDP}
      />
      <ControlPanel
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
