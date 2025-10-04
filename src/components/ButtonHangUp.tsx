import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { PhoneOff } from 'lucide-react';

export function ButtonHangUp({ hangup }: { hangup: () => void }) {
  return (
    <Button
      size="icon"
      onClick={hangup}
      title="Hang up and close connection"
      className={cn(
        'size-12 flex items-center justify-center rounded-none',
        'bg-rose-500 hover:bg-rose-600 active:bg-rose-700'
      )}
    >
      <PhoneOff className="size-6" />
    </Button>
  );
}
