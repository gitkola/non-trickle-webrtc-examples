import { useCallback } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { ArrowUp, Copy, Check, Loader2 } from 'lucide-react';
import { PANEL_BUTTON_STYLES } from '@/lib/constants';
import { useClipboard } from '@/hooks/useClipboard';
import { createSDPUrl } from '@/lib/url-utils';

export const OfferPanel = ({
  localSDP,
  createOffer,
  isCreatingOffer,
}: {
  localSDP: string;
  createOffer: () => void;
  isCreatingOffer: boolean;
}) => {
  const { copyToClipboard, copied } = useClipboard();
  // TODO: check wouldn't it be better to get the `localSDP`, `createOffer`, `isCreatingOffer` directly from useWebRTC instead of passing it as a prop?

  const handleCopyOffer = useCallback(() => {
    copyToClipboard(createSDPUrl(localSDP, 'offer'));
  }, [localSDP]);

  const hasOffer = !!localSDP;

  return (
    <Button
      variant="default"
      onClick={hasOffer ? handleCopyOffer : createOffer}
      disabled={isCreatingOffer}
      className={cn(
        PANEL_BUTTON_STYLES,
        'flex flex-1 shrink-0',
        'bg-sky-500 hover:bg-sky-600 active:bg-sky-700'
      )}
    >
      {isCreatingOffer ? (
        <Loader2 className="size-6 animate-spin" />
      ) : hasOffer ? (
        <div className="relative size-6">
          <Check
            className={cn(
              'absolute',
              'size-6',
              'transition-transform ease-in-out',
              'duration-500',
              copied ? 'scale-100' : 'scale-0'
            )}
          />
          <Copy
            className={cn(
              'absolute',
              'size-6',
              'transition-transform ease-in-out',
              'duration-500',
              copied ? 'scale-0' : 'scale-100'
            )}
          />
        </div>
      ) : (
        <ArrowUp className="size-6" />
      )}
      <span className="font-semibold">
        {hasOffer ? 'Copy Offer URL' : 'Create Offer'}
      </span>
    </Button>
  );
};
