import { useState, useRef, useCallback, useEffect } from 'react';
import { z } from 'zod';
import { compressString, decompressString } from '@/lib/sdp-compression';
import { ICE_SERVERS } from '@/lib/constants';
import { clearUrlParams } from '@/hooks/useUrlParams';
import { handleError } from '@/lib/handleError';

// Zod schema for SDP validation
const SDPSchema = z.object({
  type: z.enum(['offer', 'answer']),
  sdp: z.string(),
});

interface UseWebRTCProps {
  localStreamRef: React.RefObject<MediaStream | null>;
}

export function useWebRTC({ localStreamRef }: UseWebRTCProps) {
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

  const cleanupPeerConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.oniceconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }

    // Clear remote video
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, []);

  const initializeConnection = useCallback(
    async (asOfferer: boolean) => {
      try {
        // Clean up any existing connection
        cleanupPeerConnection();
        setIsOfferer(asOfferer);
        pcRef.current = new RTCPeerConnection(ICE_SERVERS);
        // Add local tracks to peer connection
        localStreamRef.current?.getTracks().forEach((track) => {
          pcRef.current &&
            localStreamRef.current &&
            pcRef.current.addTrack(track, localStreamRef.current);
        });
        // Handle remote track
        pcRef.current.ontrack = (event) => {
          remoteVideoRef.current &&
            (remoteVideoRef.current.srcObject = event.streams[0]);
        };
        // Handle ICE candidates (non-trickle: wait for all candidates)
        pcRef.current.onicecandidate = async (event) => {
          if (!event.candidate && pcRef.current?.localDescription) {
            // All ICE candidates gathered, compress and set SDP
            const sdpString = JSON.stringify(pcRef.current.localDescription);
            const compressed = await compressString(sdpString);
            setLocalSDP(compressed);
            setIsCreatingOffer(false);
            setIsCreatingAnswer(false);
          }
        };
        // Monitor connection state
        pcRef.current.onconnectionstatechange = () => {
          pcRef.current && setConnectionState(pcRef.current.connectionState);
        };
        // Monitor ICE connection state
        pcRef.current.oniceconnectionstatechange = () => {
          pcRef.current &&
            setIceConnectionState(pcRef.current.iceConnectionState);
        };
        // Create offer if offerer
        if (asOfferer) {
          const offer = await pcRef.current.createOffer();
          await pcRef.current.setLocalDescription(offer);
        }
      } catch (err) {
        handleError(
          (err as Error).message || 'Failed to initialize connection'
        );
      }
    },
    [localStreamRef, cleanupPeerConnection]
  );

  // Create offer
  const createOffer = useCallback(async () => {
    if (isCreatingOffer) return;
    setIsCreatingOffer(true);
    await initializeConnection(true);
  }, [initializeConnection]);

  // Create answer
  const createAnswer = useCallback(async () => {
    if (isCreatingAnswer) return;
    setIsCreatingAnswer(true);
    await initializeConnection(false);
  }, [initializeConnection]);

  // Validate and apply remote SDP
  const handleApplyRemoteSDP = useCallback(async () => {
    if (!pcRef.current || !remoteSDP.trim()) {
      handleError('Please initialize connection and provide remote SDP');
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
        handleError('Invalid SDP format');
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
      handleError((err as Error).message || 'Failed to apply remote SDP');
    }
  }, [remoteSDP, isOfferer]);

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
    hangup,
  };
}
