import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '../lib/utils';
import { ArrowUp } from 'lucide-react';
import { Copy, Check } from 'lucide-react';

export const OfferPanel = ({
  localSDP,
  createOffer,
  copyToClipboard,
  copied,
}: {
  localSDP: string;
  createOffer: () => void;
  copyToClipboard: (text: string) => void;
  copied: boolean;
}) => {
  return (
    <div className="flex items-center w-full shrink-0">
      <Button
        variant="default"
        onClick={createOffer}
        className={cn(
          'shrink-0',
          'h-12',
          'border-0',
          'rounded-none',
          'bg-teal-500',
          'hover:bg-teal-600',
          'active:bg-teal-700'
        )}
      >
        <ArrowUp className="size-6" />
        <span className="font-semibold">Create Offer</span>
      </Button>
      <Input
        value={localSDP}
        readOnly
        className={cn(
          'h-12',
          'w-full',
          'px-2',
          'font-mono',
          'text-background',
          'bg-foreground',
          'rounded-none',
          'border-none'
        )}
        placeholder="Your SDP will appear here..."
      />
      <Button
        variant="default"
        disabled={!localSDP}
        onClick={() => copyToClipboard(localSDP)}
        title="Copy to clipboard"
        className="shrink-0 size-12 border-0 rounded-none bg-teal-500 hover:bg-teal-600 active:bg-teal-700"
      >
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
      </Button>
    </div>
  );
};
