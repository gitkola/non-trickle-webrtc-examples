import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToggleCamera } from './ToggleCamera';
import { ToggleMic } from './ToggleMic';
import { ButtonHangUp } from './ButtonHangUp';

export function ControlPanel({
  toggleMic,
  toggleCamera,
  hangup,
}: {
  toggleMic: () => void;
  toggleCamera: () => void;
  hangup: () => void;
}) {
  return (
    <div className="flex justify-center">
      <Button
        size="icon"
        onClick={() => window.location.reload()}
        title="Reload page"
        className={cn(
          'size-12 flex items-center justify-center rounded-none',
          'bg-gray-500 hover:bg-gray-600 active:bg-gray-700'
        )}
      >
        <RefreshCw className="size-6" />
      </Button>
      <ToggleMic toggleMic={toggleMic} />
      <ToggleCamera toggleCamera={toggleCamera} />
      <ButtonHangUp hangup={hangup} />
    </div>
  );
}
