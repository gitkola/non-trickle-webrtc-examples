import { useCallback, useState } from 'react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { ArrowUp, Copy, Check, Loader2 } from 'lucide-react';
import { PANEL_BUTTON_STYLES } from '../lib/constants';
import { useClipboardCopy } from '@/hooks/useClipboardCopy';

export const OfferPanel = ({
  localSDP,
  createOffer,
  isOfferer,
  isCreatingOffer,
}: {
  localSDP: string;
  createOffer: () => void;
  isOfferer: boolean | null;
  isCreatingOffer: boolean;
}) => {
  // Handle clipboard copying with user-initiated tracking
  const { copyToClipboard, markUserInitiated } = useClipboardCopy({
    localSDP,
    isOfferer,
  });
  // TODO: check wouldn't it be better to get the `localSDP`, `createOffer`, `isOfferer`, `isCreatingOffer` directly from useWebRTC instead of passing it as a prop?
  const [copied, setCopied] = useState(false);

  // Wrapper for user-initiated offer creation
  const handleCreateOffer = useCallback(() => {
    markUserInitiated();
    createOffer();
  }, [createOffer, markUserInitiated]);

  const handleCopyOffer = () => {
    copyToClipboard(localSDP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasOffer = !!localSDP;

  return (
    <Button
      variant="default"
      onClick={hasOffer ? handleCopyOffer : handleCreateOffer}
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
