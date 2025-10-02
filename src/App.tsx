import { useState, useRef, useEffect } from 'react';
import { VideoComponent } from './components/VideoComponent';
import { AnswerPanel } from './components/AnswerPanel';
import { OfferPanel } from './components/OfferPanel';
import { Button } from './components/ui/button';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

const iceServers = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  iceTransportPolicy: 'all' as RTCIceTransportPolicy,
};

// Compress string using gzip and encode to base64
async function compressString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const compressionStream = new CompressionStream('gzip');
  const writer = compressionStream.writable.getWriter();
  writer.write(data);
  writer.close();
  const compressedData = await new Response(compressionStream.readable).arrayBuffer();
  const bytes = new Uint8Array(compressedData);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64;
}

// Decompress base64 string using gzip
async function decompressString(base64: string): Promise<string> {
  try {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const decompressionStream = new DecompressionStream('gzip');
    const writer = decompressionStream.writable.getWriter();
    writer.write(bytes);
    writer.close();
    const decompressedData = await new Response(decompressionStream.readable).arrayBuffer();
    const decoder = new TextDecoder();
    return decoder.decode(decompressedData);
  } catch (error) {
    // If decompression fails, return original string (might not be compressed)
    throw error;
  }
}

export function App() {
  const [localSDP, setLocalSDP] = useState('');
  const [remoteSDP, setRemoteSDP] = useState('');
  const [connectionState, setConnectionState] = useState('disconnected');
  const [isOfferer, setIsOfferer] = useState<boolean | null>(null);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const iceCandidatesRef = useRef<RTCIceCandidate[]>([]);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    startLocalMedia();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startLocalMedia = async () => {
    try {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoRef.current.srcObject ??= localStreamRef.current;
    } catch (error) {
      console.error('Failed to access media devices:', error);
      alert('Failed to access media devices');
    }
  };

  const cleanup = () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    pcRef.current?.close();
  };

  const createOffer = async () => {
    await initializeConnection(true);
  };

  const createAnswer = async () => {
    await initializeConnection(false);
  };

  const initializeConnection = async (asOfferer: boolean) => {
    try {
      setIsOfferer(asOfferer);
      pcRef.current = new RTCPeerConnection(iceServers);
      localStreamRef.current?.getTracks().forEach((track) => {
        pcRef.current?.addTrack(track, localStreamRef.current);
      });
      pcRef.current.ontrack = (event) => {
        remoteVideoRef.current.srcObject ??= event.streams[0];
      };
      pcRef.current.onicecandidate = async (event) => {
        if (event.candidate) {
          iceCandidatesRef.current.push(event.candidate);
        } else {
          if (pcRef.current?.localDescription) {
            const sdpString = JSON.stringify(pcRef.current.localDescription);
            const compressed = await compressString(sdpString);
            setLocalSDP(compressed);
          }
        }
      };
      pcRef.current.onconnectionstatechange = () => {
        setConnectionState(pcRef.current.connectionState);
      };

      if (asOfferer) {
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        // copyToClipboard(JSON.stringify(offer, null, 2));
      }
    } catch (error) {
      console.error('Failed to initialize connection:', error);
      alert('Failed to access media devices or create connection');
    }
  };

  const handleSetRemoteSDP = async (sdp: string) => {
    setRemoteSDP(sdp);
  };

  const handleApplyRemoteSDP = async () => {
    if (!pcRef.current || !remoteSDP.trim()) {
      alert('Please initialize connection and provide remote SDP');
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

      const sdp = JSON.parse(sdpString);
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));

      if (sdp.type === 'offer' && !isOfferer) {
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        // copyToClipboard(JSON.stringify(answer, null, 2));
      }
    } catch (error) {
      console.error('Failed to apply remote SDP:', error);
      alert('Invalid SDP format or connection error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMicEnabled(!isMicEnabled);
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraEnabled(!isCameraEnabled);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-black/50">
      <span
        className={`flex shrink-0 items-center justify-center text-sm py-1 w-full font-medium ${
          connectionState === 'connected'
            ? 'bg-green-600'
            : connectionState === 'connecting'
            ? 'bg-yellow-600'
            : connectionState === 'failed'
            ? 'bg-red-600'
            : 'bg-slate-600'
        }`}
      >
        {connectionState}
      </span>
      <OfferPanel
        localSDP={localSDP}
        createOffer={createOffer}
        copyToClipboard={copyToClipboard}
        copied={copied}
      />
      <div className="flex gap-2 p-2 bg-slate-800 justify-center">
        <Button
          size="icon"
          variant={isMicEnabled ? "default" : "destructive"}
          onClick={toggleMic}
          title={isMicEnabled ? "Mute microphone" : "Unmute microphone"}
          className="size-10"
        >
          {isMicEnabled ? <Mic className="size-5" /> : <MicOff className="size-5" />}
        </Button>
        <Button
          size="icon"
          variant={isCameraEnabled ? "default" : "destructive"}
          onClick={toggleCamera}
          title={isCameraEnabled ? "Turn off camera" : "Turn on camera"}
          className="size-10"
        >
          {isCameraEnabled ? <Video className="size-5" /> : <VideoOff className="size-5" />}
        </Button>
      </div>
      <div className={`flex ${isLandscape ? 'flex-row' : 'flex-col'} flex-1 min-h-0`}>
        <VideoComponent videoElementRef={localVideoRef} isLocal />
        <VideoComponent videoElementRef={remoteVideoRef} isLocal={false} />
      </div>
      <AnswerPanel
        remoteSDP={remoteSDP}
        handleSetRemoteSDP={handleSetRemoteSDP}
        handleApplyRemoteSDP={handleApplyRemoteSDP}
        createAnswer={createAnswer}
      />
    </div>
  );
}
