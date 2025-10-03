import { useEffect, useRef } from 'react';
import { parseUrlParams } from '@/lib/url-utils';

/**
 * Clears URL parameters from the browser's address bar
 */
export function clearUrlParams() {
  const url = new URL(window.location.href);
  url.search = '';
  window.history.replaceState({}, '', url.toString());
}

/**
 * Custom hook to parse URL parameters and populate remote SDP on mount
 */
export function useUrlParams(setRemoteSDP: (sdp: string) => void) {
  const initializedFromUrl = useRef(false);

  useEffect(() => {
    if (!initializedFromUrl.current) {
      const { offer, answer } = parseUrlParams(); // TODO: We don't put answer in the URL isn't it?
      if (offer) {
        setRemoteSDP(offer);
        clearUrlParams();
      } else if (answer) {
        setRemoteSDP(answer);
        clearUrlParams();
      }
      initializedFromUrl.current = true;
    }
  }, [setRemoteSDP]);
}
