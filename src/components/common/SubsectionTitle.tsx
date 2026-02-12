import type { ReactNode } from 'react';

type HeadingLevel = 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface SubsectionTitleProps {
  as?: HeadingLevel;
  children: ReactNode;
  className?: string;
}

/**
 * De-emphasized heading for subsections within a page.
 *
 * Defaults to `<h2>` rendered at `h6` size. Pass `as` to change the
 * semantic heading level (the visual size adapts automatically).
 *
 * ```tsx
 * <SubsectionTitle>Barcodes</SubsectionTitle>
 * <SubsectionTitle as="h5" className="mb-0">Today</SubsectionTitle>
 * ```
 */
export default function SubsectionTitle({
  as: Tag = 'h2',
  children,
  className = 'mb-2',
}: SubsectionTitleProps) {
  const classes = [Tag === 'h2' ? 'h6' : '', className].filter(Boolean).join(' ');
  return (
    <Tag className={classes || undefined} style={{ opacity: 0.9 }}>
      {children}
    </Tag>
  );
}
