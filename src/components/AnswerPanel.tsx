import { useCallback } from 'react';
import { Button } from './ui/button';
import { ArrowDown, Loader2 } from 'lucide-react';
import { PANEL_BUTTON_STYLES } from '@/lib/constants';
import { extractSDPFromText } from '@/lib/url-utils';
import { useClipboard } from '@/hooks/useClipboard';
import { cn } from '@/lib/utils';

export const AnswerPanel = ({
  isCreatingAnswer,
  handleSetRemoteSDP,
}: {
  isCreatingAnswer: boolean;
  handleSetRemoteSDP: (sdp: string) => void;
}) => {
  const { pasteFromClipboard } = useClipboard();

  const handlePaste = useCallback(async () => {
    try {
      const text = await pasteFromClipboard();
      const sdp = extractSDPFromText(text);
      handleSetRemoteSDP(sdp);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  }, [pasteFromClipboard, handleSetRemoteSDP]);

  return (
    <Button
      variant="default"
      onClick={handlePaste}
      disabled={isCreatingAnswer}
      className={cn(PANEL_BUTTON_STYLES, 'flex flex-1 shrink-0')}
    >
      {isCreatingAnswer ? (
        <Loader2 className="size-6 animate-spin" />
      ) : (
        <>
          <ArrowDown className="size-6" />
          <span className="font-semibold">Paste Remote SDP</span>
        </>
      )}
    </Button>
  );
};
