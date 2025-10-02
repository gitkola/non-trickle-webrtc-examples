import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom hook to manage local media streams (camera and microphone)
 */
export function useMediaStream() {
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Start local media stream
  const startLocalMedia = useCallback(async () => {
    try {
      setError(null);
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to access media devices';
      setError(errorMessage);
      console.error('Failed to access media devices:', err);
    }
  }, []);

  // Toggle microphone on/off
  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMicEnabled((prev) => !prev);
    }
  }, []);

  // Toggle camera on/off
  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraEnabled((prev) => !prev);
    }
  }, []);

  // Cleanup: stop all tracks
  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
  }, []);

  // Initialize media stream on mount
  useEffect(() => {
    startLocalMedia();
    return cleanup;
  }, [startLocalMedia, cleanup]);

  return {
    localStreamRef,
    localVideoRef,
    isMicEnabled,
    isCameraEnabled,
    toggleMic,
    toggleCamera,
    error,
  };
}
