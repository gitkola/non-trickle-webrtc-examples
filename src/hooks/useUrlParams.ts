import { useEffect, useRef } from 'react';
import { parseUrlParams } from '@/lib/url-utils';

/**
 * Custom hook to parse URL parameters and populate remote SDP on mount
 */
export function useUrlParams(setRemoteSDP: (sdp: string) => void) {
  const initializedFromUrl = useRef(false);

  useEffect(() => {
    if (!initializedFromUrl.current) {
      const { offer, answer } = parseUrlParams();
      if (offer) {
        setRemoteSDP(offer);
      } else if (answer) {
        setRemoteSDP(answer);
      }
      initializedFromUrl.current = true;
    }
  }, [setRemoteSDP]);
}
