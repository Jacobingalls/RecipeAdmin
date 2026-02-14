import CircularButton from './CircularButton';

interface MoreButtonProps {
  ariaLabel: string;
}

/**
 * Circular icon-only three-dots button for dropdown menus in list rows.
 *
 * Renders a Bootstrap dropdown toggle with `data-bs-toggle="dropdown"`.
 * Stops event propagation so it works inside clickable parent elements.
 *
 * ```tsx
 * <div className="dropdown">
 *   <MoreButton ariaLabel={`${name} actions`} />
 *   <ul className="dropdown-menu dropdown-menu-end">...</ul>
 * </div>
 * ```
 */
export default function MoreButton({ ariaLabel }: MoreButtonProps) {
  return (
    <CircularButton
      data-bs-toggle="dropdown"
      aria-label={ariaLabel}
      title="More actions"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <i className="bi bi-three-dots" aria-hidden="true" />
    </CircularButton>
  );
}
