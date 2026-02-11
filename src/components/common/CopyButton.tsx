import { useState, useCallback } from 'react';

interface CopyButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}

/**
 * Button that copies text to the clipboard and shows brief "Copied!" feedback.
 *
 * ```tsx
 * <CopyButton text={apiKey} />
 * <CopyButton text={apiKey} className="btn btn-outline-success btn-sm" />
 * ```
 */
export default function CopyButton({
  text,
  label = 'Copy',
  copiedLabel = 'Copied!',
  className = 'btn btn-outline-secondary btn-sm',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button type="button" className={className} onClick={handleCopy}>
      {copied ? copiedLabel : label}
    </button>
  );
}
