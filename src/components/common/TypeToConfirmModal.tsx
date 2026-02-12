import type { ReactNode } from 'react';
import { useState, useId } from 'react';

import ModalBase, { ModalHeader, ModalBody, ModalFooter } from './ModalBase';
import Button from './Button';

interface TypeToConfirmModalProps {
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
 * <TypeToConfirmModal
 *   isOpen={!!deleteTarget}
 *   title="Delete passkey"
 *   message="This will permanently delete this passkey. This can't be undone."
 *   itemName={deleteTarget?.name ?? ''}
 *   confirmButtonText="Delete passkey"
 *   onConfirm={handleDelete}
 *   onCancel={() => setDeleteTarget(null)}
 * />
 * ```
 */

/** Internal component that manages modal state. Remounts when itemName changes. */
function TypeToConfirmModalContent({
  title,
  message,
  itemName,
  confirmButtonText,
  onConfirm,
  onCancel,
  isLoading,
}: Omit<TypeToConfirmModalProps, 'isOpen'>) {
  const [confirmText, setConfirmText] = useState('');
  const titleId = useId();
  const inputId = useId();

  return (
    <ModalBase onClose={onCancel} ariaLabelledBy={titleId}>
      <ModalHeader onClose={onCancel} titleId={titleId}>
        {title}
      </ModalHeader>
      <ModalBody>
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
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="danger"
          disabled={confirmText !== itemName}
          loading={isLoading}
          onClick={onConfirm}
        >
          {confirmButtonText}
        </Button>
      </ModalFooter>
    </ModalBase>
  );
}

export default function TypeToConfirmModal({
  isOpen,
  title,
  message,
  itemName,
  confirmButtonText = 'Confirm',
  onConfirm,
  onCancel,
  isLoading = false,
}: TypeToConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <TypeToConfirmModalContent
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
