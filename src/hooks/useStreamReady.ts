import { useEffect, useState } from 'react';

/**
 * Custom hook to track when a media stream is ready (has tracks)
 */
// export function useStreamReady(streamRef: React.RefObject<MediaStream | null>) {
//   const [isReady, setIsReady] = useState(false);

//   useEffect(() => {
//     const stream = streamRef.current;

//     const checkStream = () => {
//       const hasTracks = stream && stream.getTracks().length > 0;
//       if (hasTracks) {
//         setIsReady(true);
//       }
//     };

//     // Check immediately
//     checkStream();

//     // Listen to addtrack event for when tracks are added
//     if (stream && !isReady) {
//       const handleTrackAdded = () => {
//         setIsReady(true);
//       };

//       stream.addEventListener('addtrack', handleTrackAdded);

//       return () => {
//         stream.removeEventListener('addtrack', handleTrackAdded);
//       };
//     }
//   }, [streamRef, isReady]);

//   return isReady;
// }

export function useStreamReady(streamRef: React.RefObject<MediaStream | null>) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkStream = () => {
      const hasTracks =
        streamRef.current && streamRef.current.getTracks().length > 0;
      if (hasTracks) {
        setIsReady(true);
      }
      console.log('isReady', isReady);
    };

    // Check immediately
    checkStream();

    // Listen to addtrack event for when tracks are added
    if (streamRef.current && !isReady) {
      const handleTrackAdded = () => {
        setIsReady(true);
      };

      streamRef.current.addEventListener('addtrack', handleTrackAdded);

      return () => {
        streamRef.current?.removeEventListener('addtrack', handleTrackAdded);
      };
    }

    // Also check periodically until ready (for race conditions)
    if (!isReady) {
      const interval = setInterval(checkStream, 200); // TODO: don't relay on setInterval
      return () => clearInterval(interval);
    }
  }, [streamRef, isReady]);

  return isReady;
}
