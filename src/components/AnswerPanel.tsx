import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '../lib/utils';
import { ArrowDown, Clipboard } from 'lucide-react';

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
        className="shrink-0 h-12 border-0 rounded-none bg-teal-500 hover:bg-teal-600 active:bg-teal-700"
      >
        <ArrowDown className="size-6" />
        <span className="font-semibold">Create Answer</span>
      </Button>
      <Input
        value={remoteSDP}
        onChange={(e) => handleSetRemoteSDP(e.target.value)}
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
        placeholder="Paste remote SDP here..."
      />
      <Button
        variant="default"
        onClick={handleApplyRemoteSDP}
        title="Apply remote SDP"
        className="shrink-0 size-12 border-0 rounded-none bg-teal-500 hover:bg-teal-600 active:bg-teal-700"
      >
        <Clipboard className="size-6" />
      </Button>
    </div>
  );
};
