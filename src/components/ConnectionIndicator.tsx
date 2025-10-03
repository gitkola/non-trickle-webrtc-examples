import { Button } from './ui/button';

export function ConnectionIndicator({
  connectionState,
  iceConnectionState,
  hangup,
}: {
  connectionState: string;
  iceConnectionState: string;
  hangup?: () => void;
}) {
  // TODO: check wouldn't it be better to get the `connectionState`, `iceConnectionState` and `hangup` directly from useWebRTC instead of passing them as props?
  const canRetry = ['failed', 'disconnected'].includes(connectionState);

  return (
    <div
      className={`flex shrink-0 items-center justify-center gap-4 text-sm py-1 w-full font-medium ${
        connectionState === 'connected'
          ? 'bg-green-600'
          : connectionState === 'connecting'
          ? 'bg-yellow-600'
          : connectionState === 'failed'
          ? 'bg-red-600'
          : 'bg-slate-600'
      }`}
    >
      <span>
        {connectionState}{' '}
        {iceConnectionState !== 'new' && `(ICE: ${iceConnectionState})`}
      </span>
      {canRetry && connectionState === 'failed' && hangup && (
        <Button size="sm" variant="secondary" onClick={hangup}>
          Reset Connection
        </Button>
      )}
    </div>
  );
}
