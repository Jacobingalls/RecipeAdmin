import { useState, useCallback } from 'react';

import { useTranslation } from '../../contexts/LocaleContext';

interface CopyButtonProps {
  text: string;
  /** Overrides the default "Copy" label. */
  label?: string;
  /** Overrides the default "Copied!" confirmation. */
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
  label,
  copiedLabel,
  className = 'btn btn-outline-secondary btn-sm',
}: CopyButtonProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button type="button" className={className} onClick={handleCopy} aria-live="polite">
      {copied ? (copiedLabel ?? t('common.copied')) : (label ?? t('common.copy'))}
    </button>
  );
}
