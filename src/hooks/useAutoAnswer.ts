import { useEffect, useRef } from 'react';

interface UseAutoAnswerProps {
  remoteSDP: string;
  localSDP: string;
  isOfferer: boolean | null;
  isLocalStreamReady: boolean;
  createAnswer: () => void;
  connectionState: RTCPeerConnectionState;
}

/**
 * Custom hook to automatically generate an answer when an offer is received
 */
export function useAutoAnswer({
  remoteSDP,
  localSDP,
  isOfferer,
  isLocalStreamReady,
  createAnswer,
  connectionState,
}: UseAutoAnswerProps) {
  const hasAutoAnswered = useRef(false);

  // Auto-generate answer when offer is pasted/received
  useEffect(() => {
    // Only auto-answer if we have remote SDP, no local SDP yet, and haven't answered yet
    // AND local stream is ready (has tracks)
    if (
      remoteSDP &&
      !localSDP &&
      !hasAutoAnswered.current &&
      isOfferer === null &&
      isLocalStreamReady
    ) {
      hasAutoAnswered.current = true;
      createAnswer();
    }
  }, [remoteSDP, localSDP, isOfferer, createAnswer, isLocalStreamReady]);

  // Reset auto-answer flag when hanging up
  useEffect(() => {
    if (connectionState === 'disconnected') {
      hasAutoAnswered.current = false;
    }
  }, [connectionState]);
}
