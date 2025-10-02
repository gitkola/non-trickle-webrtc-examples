import { useState, useRef, useEffect } from 'react';
import { Copy, Clipboard, Check, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { cn } from './lib/utils';
import { VideoComponent } from './components/VideoComponent';

const iceServers = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  iceTransportPolicy: 'all' as RTCIceTransportPolicy,
};

export function App() {
  const [localSDP, setLocalSDP] = useState('');
  const [remoteSDP, setRemoteSDP] = useState('');
  const [connectionState, setConnectionState] = useState('disconnected');
  const [isOfferer, setIsOfferer] = useState<boolean | null>(null);

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
      pcRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          iceCandidatesRef.current.push(event.candidate);
        } else {
          pcRef.current?.localDescription &&
            setLocalSDP(
              JSON.stringify(pcRef.current.localDescription, null, 2)
            );
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
      const sdp = JSON.parse(remoteSDP);
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

  return (
    <div className="h-screen w-screen overflow-hidden bg-black/50">
      <div className="flex flex-col items-center justify-center">
        <span
          className={`flex items-center justify-center text-sm py-2 w-full self-center font-medium ${
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
      </div>

      <div className="flex flex-col items-start justify-center">
        <div className="flex items-center justify-start">
          <Button
            variant="default"
            onClick={createOffer}
            className={cn(
              'shrink-0',
              'h-12',
              'border-0',
              'rounded-none',
              'bg-teal-500',
              'hover:bg-teal-600',
              'active:bg-teal-700'
            )}
          >
            <ArrowUp className="size-6" />
            <span className="font-semibold">Create Offer</span>
          </Button>
          <Input
            value={localSDP}
            readOnly
            className={cn(
              'h-12',
              'w-full',
              'px-2',
              'font-mono',
              'text-background',
              'bg-foreground',
              'rounded-none',
              'border-none'
            )}
            placeholder="Your SDP will appear here..."
          />
          <Button
            variant="default"
            disabled={!localSDP}
            onClick={() => copyToClipboard(localSDP)}
            title="Copy to clipboard"
            className="shrink-0 size-12 border-0 rounded-none bg-teal-500 hover:bg-teal-600 active:bg-teal-700"
          >
            {copied ? (
              <Check className="size-6" />
            ) : (
              <Copy className="size-6" />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-start">
          <Button
            variant="default"
            onClick={createAnswer}
            className="shrink-0 h-12 border-0 rounded-none bg-teal-500 hover:bg-teal-600 active:bg-teal-700"
          >
            <ArrowDown className="size-6" />
            <span className="font-semibold">Create Answer</span>
          </Button>
          <Input
            value={remoteSDP}
            onChange={(e) => handleSetRemoteSDP(e.target.value)}
            className={cn(
              'h-12',
              'w-full',
              'px-2',
              'font-mono',
              'text-background',
              'bg-foreground',
              'rounded-none',
              'border-none'
            )}
            placeholder="Paste remote SDP here..."
          />
          <Button
            variant="default"
            onClick={handleApplyRemoteSDP}
            title="Apply remote SDP"
            className="shrink-0 size-12 border-0 rounded-none bg-teal-500 hover:bg-teal-600 active:bg-teal-700"
          >
            <Clipboard className="size-6" />
          </Button>
        </div>
      </div>
      <div className="flex flex-row items-stretch justify-stretch">
        <VideoComponent videoElementRef={localVideoRef} isLocal />
        <VideoComponent videoElementRef={remoteVideoRef} isLocal={false} />
      </div>
    </div>
  );
}
