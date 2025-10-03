import { useEffect, useRef, useCallback } from 'react';
import { createSDPUrl } from '@/lib/url-utils';

interface UseClipboardCopyProps {
  localSDP: string;
  isOfferer: boolean | null;
  toast: (options: {
    title: string;
    description: string;
    variant?: 'default' | 'destructive';
  }) => void;
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
  toast,
}: UseClipboardCopyProps): UseClipboardCopyReturn {
  const previousLocalSDP = useRef('');
  const userInitiatedAction = useRef(false);

  // Auto-copy offer/answer URL when generated
  useEffect(() => {
    if (localSDP && localSDP !== previousLocalSDP.current) {
      previousLocalSDP.current = localSDP;

      // Determine type based on isOfferer
      const type = isOfferer ? 'offer' : 'answer';
      const url = createSDPUrl(localSDP, type);

      // Only auto-copy if this was a user-initiated action
      if (userInitiatedAction.current) {
        userInitiatedAction.current = false; // Reset flag
        navigator.clipboard
          .writeText(url)
          .then(() => {
            toast({
              title: 'Copied!',
              description: `${
                type === 'offer' ? 'Offer' : 'Answer'
              } URL copied to clipboard`,
            });
          })
          .catch((err) => {
            console.error('Failed to auto-copy to clipboard:', err);
            toast({
              title: `${type === 'offer' ? 'Offer' : 'Answer'} generated`,
              description: 'Click the copy button to copy to clipboard',
            });
          });
      } else {
        // Auto-generated (not user-initiated) - just show notification
        toast({
          title: `${type === 'offer' ? 'Offer' : 'Answer'} generated`,
          description: 'Click the copy button to copy to clipboard',
        });
      }
    }
  }, [localSDP, isOfferer, toast]);

  // Mark next action as user-initiated (for clipboard access)
  const markUserInitiated = useCallback(() => {
    userInitiatedAction.current = true;
  }, []);

  // Manual copy to clipboard helper
  const copyToClipboard = useCallback(
    (sdp: string) => {
      if (!sdp) return;
      const type = isOfferer ? 'offer' : 'answer';
      const url = createSDPUrl(sdp, type);
      navigator.clipboard.writeText(url);
      toast({
        title: 'Copied!',
        description: `${
          type === 'offer' ? 'Offer' : 'Answer'
        } URL copied to clipboard`,
      });
    },
    [isOfferer, toast]
  );

  return { copyToClipboard, markUserInitiated };
}
