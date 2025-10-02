import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '../lib/utils';
import { ArrowUp, Copy, Check } from 'lucide-react';
import {
  PANEL_BUTTON_STYLES,
  PANEL_INPUT_STYLES,
  ICON_BUTTON_SIZE,
} from '../lib/constants';

export const OfferPanel = ({
  localSDP,
  createOffer,
  copyToClipboard,
}: {
  localSDP: string;
  createOffer: () => void;
  copyToClipboard: (text: string) => void;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyToClipboard(localSDP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center w-full shrink-0">
      <Button
        variant="default"
        onClick={createOffer}
        className={PANEL_BUTTON_STYLES}
      >
        <ArrowUp className="size-6" />
        <span className="font-semibold">Create Offer</span>
      </Button>
      <Input
        value={localSDP}
        readOnly
        className={PANEL_INPUT_STYLES}
        placeholder="Your SDP will appear here..."
      />
      <Button
        variant="default"
        disabled={!localSDP}
        onClick={handleCopy}
        title="Copy to clipboard"
        className={cn(PANEL_BUTTON_STYLES, ICON_BUTTON_SIZE)}
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
