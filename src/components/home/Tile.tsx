import type { ReactNode } from 'react';

interface TileProps {
  title: string;
  children: ReactNode;
}

export default function Tile({ title, children }: TileProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">{title}</h5>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}
