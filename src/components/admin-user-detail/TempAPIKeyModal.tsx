import type { AdminTempAPIKeyResponse } from '../../api';
import { CopyButton } from '../common';

interface TempAPIKeyModalProps {
  isOpen: boolean;
  tempKey: AdminTempAPIKeyResponse | null;
  onClose: () => void;
}

export default function TempAPIKeyModal({ isOpen, tempKey, onClose }: TempAPIKeyModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop fade show" />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-label="Temporary API key"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Temporary API Key</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body">
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
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
