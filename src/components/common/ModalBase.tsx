import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

interface ModalBaseProps {
  children: ReactNode;
  onClose: () => void;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  scrollable?: boolean;
}

/**
 * Shared modal wrapper providing backdrop, scroll lock, backdrop-click-to-dismiss,
 * and ARIA attributes. Wrap modal content (header/body/footer) inside this component.
 *
 * ```tsx
 * <ModalBase onClose={handleClose} ariaLabelledBy="my-title">
 *   <ModalHeader onClose={handleClose} titleId="my-title">Edit Item</ModalHeader>
 *   <ModalBody>...</ModalBody>
 *   <ModalFooter>...</ModalFooter>
 * </ModalBase>
 * ```
 */
export default function ModalBase({
  children,
  onClose,
  ariaLabel,
  ariaLabelledBy,
  scrollable = false,
}: ModalBaseProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  useEffect(() => {
    const el = modalRef.current;
    if (!el) return undefined;
    const handleMouseDown = (e: MouseEvent) => {
      if (e.target === el) onClose();
    };
    el.addEventListener('mousedown', handleMouseDown);
    return () => el.removeEventListener('mousedown', handleMouseDown);
  }, [onClose]);

  return (
    <>
      <div className="modal-backdrop fade show" />
      <div
        ref={modalRef}
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-modal="true"
      >
        <div
          className={`modal-dialog modal-dialog-centered${scrollable ? ' modal-dialog-scrollable' : ''}`}
        >
          <div className="modal-content">{children}</div>
        </div>
      </div>
    </>
  );
}

interface ModalHeaderProps {
  children: ReactNode;
  onClose: () => void;
  titleId?: string;
}

/** Standard modal header with an `<h5>` title and a close button. */
export function ModalHeader({ children, onClose, titleId }: ModalHeaderProps) {
  return (
    <div className="modal-header">
      <h5 className="modal-title" id={titleId}>
        {children}
      </h5>
      <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
    </div>
  );
}

interface ModalBodyProps {
  children: ReactNode;
}

/** Standard modal body. */
export function ModalBody({ children }: ModalBodyProps) {
  return <div className="modal-body">{children}</div>;
}

interface ModalFooterProps {
  children: ReactNode;
}

/** Standard modal footer for action buttons. */
export function ModalFooter({ children }: ModalFooterProps) {
  return <div className="modal-footer">{children}</div>;
}
