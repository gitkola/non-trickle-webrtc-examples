import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '../lib/utils';
import { Clipboard } from 'lucide-react';
import {
  PANEL_BUTTON_STYLES,
  PANEL_INPUT_STYLES,
} from '../lib/constants';
import { extractSDPFromText } from '../lib/url-utils';

export const AnswerPanel = ({
  remoteSDP,
  handleSetRemoteSDP,
}: {
  remoteSDP: string;
  handleSetRemoteSDP: (sdp: string) => void;
}) => {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const sdp = extractSDPFromText(text);
      handleSetRemoteSDP(sdp);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  return (
    <div className="flex items-center w-full shrink-0">
      <Button
        variant="default"
        onClick={handlePaste}
        className={PANEL_BUTTON_STYLES}
      >
        <Clipboard className="size-6" />
        <span className="font-semibold">Paste Remote SDP</span>
      </Button>
      <Input
        value={remoteSDP}
        onChange={(e) => {
          const sdp = extractSDPFromText(e.target.value);
          handleSetRemoteSDP(sdp);
        }}
        className={PANEL_INPUT_STYLES}
        placeholder="Paste remote SDP here..."
      />
    </div>
  );
};
