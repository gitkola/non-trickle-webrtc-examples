import { useEffect, useState } from 'react';

/**
 * Custom hook to track when a media stream is ready (has tracks)
 */
export function useStreamReady(streamRef: React.RefObject<MediaStream | null>) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkStream = () => {
      const hasTracks =
        streamRef.current && streamRef.current.getTracks().length > 0;
      if (hasTracks) {
        setIsReady(true);
      }
    };

    // Check immediately
    checkStream();

    // Also check periodically until ready (for race conditions)
    if (!isReady) {
      const interval = setInterval(checkStream, 100);
      return () => clearInterval(interval);
    }
  }, [streamRef, isReady]);

  return isReady;
}
