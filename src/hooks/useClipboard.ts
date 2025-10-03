import { useState } from 'react';

interface UseClipboardCopyReturn {
  copyToClipboard: (text: string) => Promise<void>;
  pasteFromClipboard: () => Promise<string>;
  copied: boolean;
}

export function useClipboard(): UseClipboardCopyReturn {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pasteFromClipboard = async () => {
    return await navigator.clipboard.readText();
  };

  return { copyToClipboard, pasteFromClipboard, copied };
}
