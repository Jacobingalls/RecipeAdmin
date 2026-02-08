import type { ReactNode } from 'react';

interface StatusViewProps {
  symbol: ReactNode;
  title: string;
  description?: string;
}

/**
 * Shared layout for centered status displays (loading, empty, error).
 * Renders a symbol, title, and optional description in a vertically stacked layout.
 */
export default function StatusView({ symbol, title, description }: StatusViewProps) {
  return (
    <div className="d-flex flex-column align-items-center py-5">
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ width: '2.5rem', height: '2.5rem' }}
      >
        {symbol}
      </div>
      <h5 className="fw-semibold mt-2">{title}</h5>
      {description && <p className="text-secondary mb-0">{description}</p>}
    </div>
  );
}
