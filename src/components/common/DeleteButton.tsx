import CircularButton from './CircularButton';

interface DeleteButtonProps {
  ariaLabel: string;
  onClick: () => void;
}

/**
 * Circular icon-only trash button for destructive actions in list rows.
 *
 * ```tsx
 * <DeleteButton ariaLabel={`Delete passkey ${name}`} onClick={handleDelete} />
 * ```
 */
export default function DeleteButton({ ariaLabel, onClick }: DeleteButtonProps) {
  return (
    <CircularButton className="flex-shrink-0" aria-label={ariaLabel} onClick={onClick}>
      <i className="bi bi-trash" aria-hidden="true" />
    </CircularButton>
  );
}
