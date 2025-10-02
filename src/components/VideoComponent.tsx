import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { Minimize, Maximize } from 'lucide-react';
import { useState } from 'react';

export const VideoComponent = ({
  videoElementRef,
  isLocal,
}: {
  videoElementRef: React.RefObject<HTMLVideoElement>;
  isLocal: boolean;
}) => {
  const [resizeMode, setResizeMode] = useState<
    'object-cover' | 'object-contain'
  >('object-contain');
  return (
    <div
      className={cn(
        'relative',
        'flex',
        'flex-1',
        'shrink-0',
        'h-1/2',
        'w-1/2',
        'overflow-hidden',
        'bg-foreground/50',
        'border-2',
        isLocal ? 'border-blue-500' : 'border-violet-500'
      )}
    >
      <video
        ref={videoElementRef}
        autoPlay
        muted
        playsInline
        className={cn(
          'flex',
          'flex-1',
          'h-full',
          'w-full',
          'bg-foreground/50',
          resizeMode,
          isLocal && 'scale-x-[-1]'
        )}
      />

      <Button
        size="icon"
        variant="default"
        onClick={() =>
          setResizeMode(
            resizeMode === 'object-cover' ? 'object-contain' : 'object-cover'
          )
        }
        title="Toggle video size mode"
        className={cn(
          'absolute',
          'bottom-0',
          'left-0',
          'shrink-0',
          'size-12',
          'flex',
          'items-center',
          'justify-center',
          'rounded-none',
          'bg-foreground/50',
          'hover:foreground/70',
          'active:bg-foreground/20'
        )}
      >
        {resizeMode === 'object-contain' ? (
          <Maximize className="size-9" />
        ) : (
          <Minimize className="size-9" />
        )}
      </Button>
    </div>
  );
};
