export function ConnectionIndicator({
  connectionState,
  iceConnectionState,
}: {
  connectionState: string;
  iceConnectionState: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center text-sm py-1 w-full font-medium ${
        connectionState === 'connected'
          ? 'bg-green-600'
          : connectionState === 'connecting'
          ? 'bg-yellow-600'
          : connectionState === 'failed'
          ? 'bg-red-600'
          : 'bg-slate-600'
      }`}
    >
      {connectionState}{' '}
      {iceConnectionState !== 'new' && `(ICE: ${iceConnectionState})`}
    </span>
  );
}
