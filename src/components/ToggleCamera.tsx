import { Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAtomValue } from 'jotai';
import { isCameraEnabledAtom } from '@/components/store';

export function ToggleCamera({ toggleCamera }: { toggleCamera: () => void }) {
  const isCameraEnabled = useAtomValue(isCameraEnabledAtom);
  return (
    <Button
      size="icon"
      variant={isCameraEnabled ? 'default' : 'destructive'}
      onClick={toggleCamera}
      title={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
      className={cn(
        'size-12 flex items-center justify-center rounded-none',
        'bg-gray-500 hover:bg-gray-600 active:bg-gray-700'
      )}
    >
      {isCameraEnabled ? (
        <Video className="size-6" />
      ) : (
        <VideoOff className="size-6" />
      )}
    </Button>
  );
}
