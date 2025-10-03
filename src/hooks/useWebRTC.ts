import { useState, useRef, useCallback, useEffect } from 'react';
import { z } from 'zod';
import { compressString, decompressString } from '@/lib/sdp-compression';
import { ICE_SERVERS, CONNECTION_TIMEOUT_MS } from '@/lib/constants';
import { clearUrlParams } from './useUrlParams';

// Zod schema for SDP validation
const SDPSchema = z.object({
  type: z.enum(['offer', 'answer']),
  sdp: z.string(),
});

interface UseWebRTCProps {
  localStreamRef: React.RefObject<MediaStream | null>;
  onError: (message: string) => void;
}

/**
 * Custom hook to manage WebRTC peer connection lifecycle
 */
export function useWebRTC({ localStreamRef, onError }: UseWebRTCProps) {
  const [localSDP, setLocalSDP] = useState('');
  const [remoteSDP, setRemoteSDP] = useState('');
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>('disconnected');
  const [iceConnectionState, setIceConnectionState] =
    useState<RTCIceConnectionState>('new');
  const [isOfferer, setIsOfferer] = useState<boolean | null>(null);
  const [isCreatingOffer, setIsCreatingOffer] = useState(false);
  const [isCreatingAnswer, setIsCreatingAnswer] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup peer connection
  const cleanupPeerConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.oniceconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }

    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Clear remote video
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, []);

  // Connection timeout handler
  useEffect(() => {
    if (connectionState === 'connecting') {
      timeoutRef.current = setTimeout(() => {
        if (pcRef.current?.connectionState === 'connecting') {
          onError('Connection timeout after 30 seconds');
          cleanupPeerConnection();
          setConnectionState('failed');
        }
      }, CONNECTION_TIMEOUT_MS);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }
  }, [connectionState, cleanupPeerConnection, onError]);

  // Initialize peer connection
  const initializeConnection = useCallback(
    async (asOfferer: boolean) => {
      try {
        // Clean up any existing connection
        cleanupPeerConnection();

        setIsOfferer(asOfferer);
        pcRef.current = new RTCPeerConnection(ICE_SERVERS);

        // Add local tracks to peer connection
        localStreamRef.current?.getTracks().forEach((track) => {
          if (pcRef.current && localStreamRef.current) {
            pcRef.current.addTrack(track, localStreamRef.current);
          }
        });

        // Handle remote track
        pcRef.current.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        // Handle ICE candidates (non-trickle: wait for all candidates)
        pcRef.current.onicecandidate = async (event) => {
          if (!event.candidate && pcRef.current?.localDescription) {
            // All ICE candidates gathered, compress and set SDP
            const sdpString = JSON.stringify(pcRef.current.localDescription);
            const compressed = await compressString(sdpString);
            setLocalSDP(compressed);
          }
        };

        // Monitor connection state
        pcRef.current.onconnectionstatechange = () => {
          if (pcRef.current) {
            setConnectionState(pcRef.current.connectionState);
          }
        };

        // Monitor ICE connection state
        pcRef.current.oniceconnectionstatechange = () => {
          if (pcRef.current) {
            setIceConnectionState(pcRef.current.iceConnectionState);
          }
        };

        // Create offer if offerer
        if (asOfferer) {
          const offer = await pcRef.current.createOffer();
          await pcRef.current.setLocalDescription(offer);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to initialize connection';
        onError(errorMessage);
        console.error('Failed to initialize connection:', err);
      }
    },
    [localStreamRef, cleanupPeerConnection, onError]
  );

  // Create offer
  const createOffer = useCallback(async () => {
    if (isCreatingOffer) return;
    setIsCreatingOffer(true);
    try {
      await initializeConnection(true);
    } finally {
      setIsCreatingOffer(false);
    }
  }, [initializeConnection]);

  // Create answer
  const createAnswer = useCallback(async () => {
    if (isCreatingAnswer) return;
    setIsCreatingAnswer(true);
    try {
      await initializeConnection(false);
    } finally {
      setIsCreatingAnswer(false);
    }
  }, [initializeConnection]);

  // Validate and apply remote SDP
  const handleApplyRemoteSDP = useCallback(async () => {
    if (!pcRef.current || !remoteSDP.trim()) {
      onError('Please initialize connection and provide remote SDP');
      return;
    }

    try {
      // Try to decompress first, if that fails assume it's uncompressed JSON
      let sdpString = remoteSDP;
      try {
        sdpString = await decompressString(remoteSDP);
      } catch {
        // If decompression fails, use original string (might be uncompressed JSON)
      }

      // Parse and validate SDP
      const parsedSDP = JSON.parse(sdpString);
      const result = SDPSchema.safeParse(parsedSDP);

      if (!result.success) {
        onError('Invalid SDP format');
        return;
      }

      const sdp = result.data;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));

      // If we received an offer and we're not the offerer, create answer
      if (sdp.type === 'offer' && !isOfferer) {
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Invalid SDP format or connection error';
      onError(errorMessage);
      console.error('Failed to apply remote SDP:', err);
    }
  }, [remoteSDP, isOfferer, onError]);

  // Hangup - close connection and reset state
  const hangup = useCallback(() => {
    cleanupPeerConnection();
    setConnectionState('disconnected');
    setIceConnectionState('new');
    setLocalSDP('');
    setRemoteSDP('');
    setIsOfferer(null);
    setIsCreatingOffer(false);
    setIsCreatingAnswer(false);
    clearUrlParams();
  }, [cleanupPeerConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupPeerConnection();
    };
  }, [cleanupPeerConnection]);

  // Auto-apply remote SDP when it changes
  useEffect(() => {
    if (remoteSDP && pcRef.current) {
      handleApplyRemoteSDP();
    }
  }, [remoteSDP, handleApplyRemoteSDP]);

  return {
    localSDP,
    remoteSDP,
    setRemoteSDP,
    connectionState,
    iceConnectionState,
    isOfferer,
    isCreatingOffer,
    isCreatingAnswer,
    remoteVideoRef,
    createOffer,
    createAnswer,
    handleApplyRemoteSDP, // TODO: check if this is needed
    hangup,
  };
}
