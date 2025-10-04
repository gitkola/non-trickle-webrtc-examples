import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { ArrowUp, Copy, Check, Loader2, Share } from 'lucide-react';
import { PANEL_BUTTON_STYLES } from '@/lib/constants';

export const OfferButton = ({
  localSDP,
  onPress,
  isCreatingOffer,
  copied,
}: {
  localSDP: string;
  onPress: () => void;
  isCreatingOffer: boolean;
  copied: boolean;
}) => {
  const hasOffer = !!localSDP;

  return (
    <Button
      variant="default"
      onClick={onPress}
      disabled={isCreatingOffer}
      className={cn(
        PANEL_BUTTON_STYLES,
        'flex flex-1',
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
          <Share
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
        {hasOffer ? 'Share Offer URL' : 'Create Offer'}
      </span>
    </Button>
  );
};
