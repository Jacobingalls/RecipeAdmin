import type { CSSProperties, ReactNode } from 'react';

import CircularButtonGroupContext from './CircularButtonGroupContext';

interface CircularButtonGroupProps {
  children: ReactNode;
}

const OVERLAP = '0.375rem';

const groupRules = [
  `.circular-btn-group > * + * { margin-left: -${OVERLAP}; }`,
  '.circular-btn-group > *:hover { z-index: 1; }',
].join(' ');

const containerStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: '1.375rem',
  backgroundColor: 'rgba(var(--bs-body-color-rgb), 0.05)',
};

/**
 * Inline-flex pill container that visually groups adjacent `CircularButton`
 * children with a subtle background and slight overlap.
 *
 * One child renders as a circle, two or more form a wider pill.
 *
 * ```tsx
 * <CircularButtonGroup>
 *   <CircularButton aria-label="Star"><i className="bi bi-star" /></CircularButton>
 *   <CircularButton aria-label="More"><i className="bi bi-three-dots" /></CircularButton>
 * </CircularButtonGroup>
 * ```
 */
export default function CircularButtonGroup({ children }: CircularButtonGroupProps) {
  return (
    <CircularButtonGroupContext.Provider value>
      <style>{groupRules}</style>
      <div role="group" className="circular-btn-group" style={containerStyle}>
        {children}
      </div>
    </CircularButtonGroupContext.Provider>
  );
}
