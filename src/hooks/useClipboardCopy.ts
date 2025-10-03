import { useEffect, useRef, useCallback } from 'react';
import { createSDPUrl } from '@/lib/url-utils';
import { toast } from '@/components/ui/use-toast';

interface UseClipboardCopyProps {
  localSDP: string;
  isOfferer: boolean | null;
}

interface UseClipboardCopyReturn {
  copyToClipboard: (sdp: string) => void;
  markUserInitiated: () => void;
}

/**
 * Custom hook to handle automatic clipboard copying of SDP URLs
 */
export function useClipboardCopy({
  localSDP,
  isOfferer,
}: UseClipboardCopyProps): UseClipboardCopyReturn {
  const previousLocalSDP = useRef('');
  const userInitiatedAction = useRef(false);

  // Auto-copy offer URL or answer SDP when generated
  useEffect(() => {
    if (localSDP && localSDP !== previousLocalSDP.current) {
      previousLocalSDP.current = localSDP;

      // Offers get URLs, answers get raw SDP
      const isOffer = isOfferer === true;
      const contentToCopy = isOffer
        ? createSDPUrl(localSDP, 'offer')
        : localSDP;
      const contentType = isOffer ? 'Offer URL' : 'Answer SDP';

      // Only auto-copy if this was a user-initiated action
      if (userInitiatedAction.current) {
        userInitiatedAction.current = false; // Reset flag
        navigator.clipboard
          .writeText(contentToCopy)
          .then(() => {
            // toast({
            //   title: 'Copied!',
            //   description: `${contentType} copied to clipboard`,
            // });
          })
          .catch((err) => {
            // console.error('Failed to auto-copy to clipboard:', err);
            toast({
              title: `${isOffer ? 'Offer' : 'Answer'} generated`,
              description: 'Click the copy button to copy to clipboard',
            });
          });
      } else {
        // Auto-generated (not user-initiated) - just show notification
        toast({
          // title: `${isOffer ? 'Offer' : 'Answer'} generated`,
          description: 'Click the copy button to copy to clipboard',
        });
      }
    }
  }, [localSDP, isOfferer]);

  // Mark next action as user-initiated (for clipboard access)
  const markUserInitiated = useCallback(() => {
    userInitiatedAction.current = true;
  }, []);

  // Manual copy to clipboard helper
  const copyToClipboard = useCallback(
    (sdp: string) => {
      if (!sdp) return;

      // Offers get URLs, answers get raw SDP
      const isOffer = isOfferer === true;
      const contentToCopy = isOffer ? createSDPUrl(sdp, 'offer') : sdp;
      const contentType = isOffer ? 'Offer URL' : 'Answer SDP';

      navigator.clipboard.writeText(contentToCopy);
      toast({
        title: 'Copied!',
        description: `${contentType} copied to clipboard`,
      });
    },
    [isOfferer, toast]
  );

  return { copyToClipboard, markUserInitiated };
}
