import type { AdminTempAPIKeyResponse } from '../../api';
import { CopyButton, ModalBase, ModalHeader, ModalBody, ModalFooter, Button } from '../common';

interface TempAPIKeyModalProps {
  isOpen: boolean;
  tempKey: AdminTempAPIKeyResponse | null;
  onClose: () => void;
}

export default function TempAPIKeyModal({ isOpen, tempKey, onClose }: TempAPIKeyModalProps) {
  if (!isOpen) return null;

  return (
    <ModalBase onClose={onClose} ariaLabel="Temporary API key">
      <ModalHeader onClose={onClose}>Temporary API Key</ModalHeader>
      <ModalBody>
        {tempKey ? (
          <>
            <div className="mb-3">
              <label htmlFor="temp-key-value" className="form-label">
                API Key
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
              Expires {new Date(tempKey.expiresAt * 1000).toLocaleString()}
            </p>
          </>
        ) : (
          <div className="text-center py-2">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Generating...</span>
            </div>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="outline-secondary" onClick={onClose}>
          Done
        </Button>
      </ModalFooter>
    </ModalBase>
  );
}
