import type { AdminTempAPIKeyResponse } from '../../api';
import { useTranslation } from '../../contexts/LocaleContext';
import { CopyButton, ModalBase, ModalHeader, ModalBody, ModalFooter, Button } from '../common';

interface TempAPIKeyModalProps {
  isOpen: boolean;
  tempKey: AdminTempAPIKeyResponse | null;
  onClose: () => void;
}

export default function TempAPIKeyModal({ isOpen, tempKey, onClose }: TempAPIKeyModalProps) {
  const { t, locale } = useTranslation();

  if (!isOpen) return null;

  return (
    <ModalBase onClose={onClose} ariaLabel={t('adminUser.tempKey.ariaLabel')}>
      <ModalHeader onClose={onClose}>{t('adminUser.tempKey.title')}</ModalHeader>
      <ModalBody>
        {tempKey ? (
          <>
            <div className="mb-3">
              <label htmlFor="temp-key-value" className="form-label">
                {t('adminUser.tempKey.keyLabel')}
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  id="temp-key-value"
                  value={tempKey.key}
                  readOnly
                />
                <CopyButton text={tempKey.key} className="btn btn-outline-secondary" />
              </div>
            </div>
            <p className="text-body-secondary small mb-0">
              {t('adminUser.tempKey.expires', {
                date: new Date(tempKey.expiresAt * 1000).toLocaleString(locale),
              })}
            </p>
          </>
        ) : (
          <div className="text-center py-2">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">{t('adminUser.tempKey.generating')}</span>
            </div>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="outline-secondary" onClick={onClose}>
          {t('common.done')}
        </Button>
      </ModalFooter>
    </ModalBase>
  );
}
