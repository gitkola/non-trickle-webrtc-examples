import { Button } from './ui/button';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  RefreshCw,
} from 'lucide-react';

export function ControlPanel({
  isMicEnabled,
  isCameraEnabled,
  toggleMic,
  toggleCamera,
  hangup,
}: {
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
  hangup: () => void;
}) {
  return (
    <div className="flex gap-2 p-2 bg-slate-800 justify-center">
      <Button
        size="icon"
        variant="secondary"
        onClick={() => window.location.reload()}
        title="Reload page"
        className="size-10"
      >
        <RefreshCw className="size-5" />
      </Button>
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
      >
        <PhoneOff className="size-5" />
      </Button>
    </div>
  );
}
