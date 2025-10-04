export function ConnectionIndicator({
  connectionState,
  iceConnectionState,
}: {
  connectionState: string;
  iceConnectionState: string;
}) {
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
      <span className="text-background">
        {connectionState}{' '}
        {iceConnectionState !== 'new' && `(ICE: ${iceConnectionState})`}
      </span>
    </div>
  );
}
