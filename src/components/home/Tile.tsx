import type { ReactNode } from 'react';

interface TileProps {
  title: string;
  titleRight?: ReactNode;
  minHeight?: string;
  children: ReactNode;
}

export default function Tile({ title, titleRight, minHeight, children }: TileProps) {
  return (
    <div className="card" style={minHeight ? { minHeight } : undefined}>
      <div className="card-header d-flex justify-content-between align-items-end pt-3 pb-2">
        <h4 className="card-title mb-0">{title}</h4>
        {titleRight}
      </div>
      {children}
    </div>
  );
}
