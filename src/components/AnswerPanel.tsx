import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '../lib/utils';
import { ArrowDown, Clipboard } from 'lucide-react';
import {
  PANEL_BUTTON_STYLES,
  PANEL_INPUT_STYLES,
  ICON_BUTTON_SIZE,
} from '../lib/constants';

export const AnswerPanel = ({
  remoteSDP,
  handleSetRemoteSDP,
  handleApplyRemoteSDP,
  createAnswer,
}: {
  remoteSDP: string;
  handleSetRemoteSDP: (sdp: string) => void;
  handleApplyRemoteSDP: () => void;
  createAnswer: () => void;
}) => {
  return (
    <div className="flex items-center w-full shrink-0">
      <Button
        variant="default"
        onClick={createAnswer}
        className={PANEL_BUTTON_STYLES}
      >
        <ArrowDown className="size-6" />
        <span className="font-semibold">Create Answer</span>
      </Button>
      <Input
        value={remoteSDP}
        onChange={(e) => handleSetRemoteSDP(e.target.value)}
        className={PANEL_INPUT_STYLES}
        placeholder="Paste remote SDP here..."
      />
      <Button
        variant="default"
        onClick={handleApplyRemoteSDP}
        title="Apply remote SDP"
        className={cn(PANEL_BUTTON_STYLES, ICON_BUTTON_SIZE)}
      >
        <Clipboard className="size-6" />
      </Button>
    </div>
  );
};
