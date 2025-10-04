import { useEffect, useRef, useState } from 'react';
import { isMicEnabledAtom, isCameraEnabledAtom } from '@/components/store';
import { handleError } from '@/lib/handleError';
import { useAtom } from 'jotai';

export function useMediaStream() {
  const [isMicEnabled, setIsMicEnabled] = useAtom(isMicEnabledAtom);
  const [isCameraEnabled, setIsCameraEnabled] = useAtom(isCameraEnabledAtom);
  const [isLocalStreamReady, setIsLocalStreamReady] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const startLocalMedia = async () => {
    try {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoRef.current &&
        (localVideoRef.current.srcObject = localStreamRef.current);
      setIsLocalStreamReady(true);
    } catch (err) {
      handleError((err as Error)?.message || 'Failed to access media devices');
    }
  };

  const toggleMic = () => {
    setIsMicEnabled((prev) => {
      const next = !prev;
      localStreamRef.current?.getAudioTracks().forEach((track) => {
        track.enabled = next;
      });
      return next;
    });
  };

  const toggleCamera = () => {
    setIsCameraEnabled((prev) => {
      const next = !prev;
      localStreamRef.current?.getVideoTracks().forEach((track) => {
        track.enabled = next;
      });
      return next;
    });
  };

  const cleanup = () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
  };

  useEffect(() => {
    startLocalMedia();
    return cleanup;
  }, []);

  return {
    localStreamRef,
    localVideoRef,
    isMicEnabled,
    isCameraEnabled,
    toggleMic,
    toggleCamera,
    isLocalStreamReady,
  };
}
