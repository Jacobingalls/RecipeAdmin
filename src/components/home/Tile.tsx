import type { ReactNode } from 'react';

interface TileProps {
  title: string;
  titleRight?: ReactNode;
  children: ReactNode;
}

export default function Tile({ title, titleRight, children }: TileProps) {
  return (
    <div className="card overflow-hidden">
      <div className="card-header d-flex justify-content-between align-items-end pt-3 pb-2">
        <h4 className="card-title mb-0">{title}</h4>
        {titleRight}
      </div>
      <div className="card-body p-0">{children}</div>
    </div>
  );
}
