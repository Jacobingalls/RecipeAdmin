import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { LogTarget } from './LogModal';
import LogModal from './LogModal';

interface AddToLogButtonProps {
  /** What to log; the modal starts from its serving size and lets the reader pick a time. */
  target: LogTarget;
}

export default function AddToLogButton({ target }: AddToLogButtonProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn btn-outline-primary btn-sm"
        onClick={() => setIsOpen(true)}
      >
        {t('log.button.add')}
      </button>
      <LogModal target={isOpen ? target : null} onClose={() => setIsOpen(false)} />
    </>
  );
}
