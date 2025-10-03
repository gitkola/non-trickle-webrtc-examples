import { useState } from 'react';

const COPIED_INDICATOR_TIMEOUT_MS = 3000;

interface UseClipboardCopyReturn {
  copyToClipboard: (text: string) => Promise<void>;
  pasteFromClipboard: () => Promise<string>;
  copied: boolean;
}

export function useClipboard(): UseClipboardCopyReturn {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      if (!text) return;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_INDICATOR_TIMEOUT_MS);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      return await navigator.clipboard.readText();
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
      throw error;
    }
  };

  return { copyToClipboard, pasteFromClipboard, copied };
}
