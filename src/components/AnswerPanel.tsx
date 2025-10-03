import { Button } from './ui/button';
import { ArrowDown } from 'lucide-react';
import { PANEL_BUTTON_STYLES } from '../lib/constants';
import { extractSDPFromText } from '../lib/url-utils';
import { useClipboardCopy } from '../hooks/useClipboardCopy';
import { cn } from '../lib/utils';

export const AnswerPanel = ({
  localSDP,
  isOfferer,
  handleSetRemoteSDP,
}: {
  localSDP: string;
  isOfferer: boolean | null;
  handleSetRemoteSDP: (sdp: string) => void;
}) => {
  const { markUserInitiated } = useClipboardCopy({
    localSDP,
    isOfferer,
  });
  const handlePaste = async () => {
    markUserInitiated();
    try {
      const text = await navigator.clipboard.readText();
      const sdp = extractSDPFromText(text);
      handleSetRemoteSDP(sdp);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  return (
    <Button
      variant="default"
      onClick={handlePaste}
      className={cn(PANEL_BUTTON_STYLES, 'flex flex-1 shrink-0')}
    >
      <ArrowDown className="size-6" />
      <span className="font-semibold">Paste Remote SDP</span>
    </Button>
  );
};
