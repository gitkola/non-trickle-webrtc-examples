import { Button } from './ui/button';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAtomValue } from 'jotai';
import { isMicEnabledAtom } from '@/components/store';

export function ToggleMic({ toggleMic }: { toggleMic: () => void }) {
  const isMicEnabled = useAtomValue(isMicEnabledAtom);
  return (
    <Button
      size="icon"
      variant={isMicEnabled ? 'default' : 'destructive'}
      onClick={toggleMic}
      title={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
      className={cn(
        'size-12 flex items-center justify-center rounded-none',
        'bg-gray-500 hover:bg-gray-600 active:bg-gray-700'
      )}
    >
      {isMicEnabled ? (
        <Mic className="size-6" />
      ) : (
        <MicOff className="size-6" />
      )}
    </Button>
  );
}
