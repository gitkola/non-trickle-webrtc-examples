import { useCallback, useState } from 'react';

interface UseClipboardCopyReturn {
  copyToClipboard: (text: string) => void;
  pasteFromClipboard: () => Promise<string>;
  copied: boolean;
}

export function useClipboard(): UseClipboardCopyReturn {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback((text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const pasteFromClipboard = useCallback(async () => {
    return await navigator.clipboard.readText();
  }, []);

  return { copyToClipboard, pasteFromClipboard, copied };
}
