import { createSDPUrl } from '@/lib/url-utils';
import { OfferButton } from './OfferButton';
import { useState } from 'react';
import { handleError } from '@/lib/handleError';
import { cn } from '@/lib/utils';
import { AnswerButton } from './AnswerButton';

export function ConnectPanel({
  localSDP,
  createOffer,
  isCreatingOffer,
  isCreatingAnswer,
  setRemoteSDP,
}: {
  localSDP: string;
  createOffer: () => void;
  isCreatingOffer: boolean;
  isCreatingAnswer: boolean;
  setRemoteSDP: (sdp: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const handleShareOffer = async () => {
    const url = createSDPUrl(localSDP, 'offer');
    try {
      if (!navigator.canShare({ text: url })) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
        return;
      }
      await navigator.share({
        text: url,
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      handleError((error as Error).message || 'Failed to share offer');
    }
  };

  const hasOffer = !!localSDP;
  const handlePress = hasOffer ? handleShareOffer : createOffer;
  return (
    <div className="flex items-center w-full">
      <OfferButton
        localSDP={localSDP}
        onPress={handlePress}
        isCreatingOffer={isCreatingOffer}
        copied={copied}
      />
      <div
        className={cn(
          'flex-1',
          'flex',
          'items-center',
          'justify-center',
          'w-full',
          hasOffer ? 'w-0' : 'block'
        )}
      >
        <AnswerButton
          isCreatingAnswer={isCreatingAnswer}
          handleSetRemoteSDP={setRemoteSDP}
        />
      </div>
    </div>
  );
}
