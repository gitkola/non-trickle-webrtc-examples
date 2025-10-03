import { useEffect, useState } from 'react';
import { VideoComponent } from './VideoComponent';

export function VideoGrid({
  localVideoRef,
  remoteVideoRef,
}: {
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
}) {
  const [isLandscape, setIsLandscape] = useState(
    window.innerWidth > window.innerHeight
  );

  // Handle window resize for landscape/portrait detection
  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className={`flex ${isLandscape ? 'flex-row' : 'flex-col'} flex-1 min-h-0`}
    >
      <VideoComponent videoElementRef={localVideoRef} isLocal />
      <VideoComponent videoElementRef={remoteVideoRef} isLocal={false} />
    </div>
  );
}
