import type { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Section heading with optional action area on the right.
 *
 * ```tsx
 * <SectionHeader title="Credentials" className="mt-4">
 *   <button className="btn btn-dark btn-sm">Add</button>
 * </SectionHeader>
 * ```
 */
export default function SectionHeader({ title, children, className = '' }: SectionHeaderProps) {
  return (
    <div
      className={`d-flex justify-content-between align-items-center mb-3${className ? ` ${className}` : ''}`}
    >
      <h5 className="mb-0">{title}</h5>
      {children}
    </div>
  );
}
