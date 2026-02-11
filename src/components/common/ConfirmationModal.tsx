import type { ReactNode } from 'react';
import { useState, useId } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  itemName: string;
  confirmButtonText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Modal that requires the user to type an item name before confirming a destructive action.
 *
 * ```tsx
 * <ConfirmationModal
 *   isOpen={!!deleteTarget}
 *   title="Delete Passkey"
 *   message="This will permanently delete this passkey. This action cannot be undone."
 *   itemName={deleteTarget?.name ?? ''}
 *   confirmButtonText="Delete passkey"
 *   onConfirm={handleDelete}
 *   onCancel={() => setDeleteTarget(null)}
 * />
 * ```
 */
/**
 * Internal component that manages modal state. Remounts when itemName changes.
 */
function ConfirmationModalContent({
  title,
  message,
  itemName,
  confirmButtonText,
  onConfirm,
  onCancel,
  isLoading,
}: Omit<ConfirmationModalProps, 'isOpen'>) {
  const [confirmText, setConfirmText] = useState('');
  const titleId = useId();
  const inputId = useId();

  return (
    <>
      <div className="modal-backdrop fade show" />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-labelledby={titleId}
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id={titleId}>
                {title}
              </h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onCancel} />
            </div>
            <div className="modal-body">
              <p>{message}</p>
              <label htmlFor={inputId} className="form-label">
                Type <strong>{itemName}</strong> to confirm
              </label>
              <input
                type="text"
                className="form-control"
                id={inputId}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={confirmText !== itemName || isLoading}
                onClick={onConfirm}
              >
                {isLoading ? 'Processing...' : confirmButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  itemName,
  confirmButtonText = 'Confirm',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <ConfirmationModalContent
      key={itemName}
      title={title}
      message={message}
      itemName={itemName}
      confirmButtonText={confirmButtonText}
      onConfirm={onConfirm}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
}
