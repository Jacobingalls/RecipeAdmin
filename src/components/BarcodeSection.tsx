import { Link } from 'react-router-dom';

import type { BarcodeData } from '../domain';
import { ServingSize } from '../domain';

import type { Note } from './NotesDisplay';
import NotesDisplay from './NotesDisplay';

interface BarcodeSectionProps {
  barcodes?: BarcodeData[];
  onSelectSize?: (size: ServingSize) => void;
}

export default function BarcodeSection({ barcodes, onSelectSize }: BarcodeSectionProps) {
  if (!barcodes || barcodes.length === 0) return null;

  return (
    <section className="mt-3">
      <h2 className="h6 text-secondary mb-2">Barcodes</h2>
      <div className="list-group">
        {barcodes.map((bc, index) => (
          <BarcodeItem key={bc.code || index} barcode={bc} onSelectSize={onSelectSize} />
        ))}
      </div>
    </section>
  );
}

interface BarcodeItemProps {
  barcode: BarcodeData;
  onSelectSize?: (size: ServingSize) => void;
}

function BarcodeItem({ barcode, onSelectSize }: BarcodeItemProps) {
  const { code, notes, servingSize: servingSizeData } = barcode;
  const servingSize = ServingSize.fromObject(servingSizeData ?? null) || ServingSize.servings(1);

  const handleUse = () => {
    if (servingSize) {
      onSelectSize?.(servingSize);
    }
  };

  const hasNotes = notes && notes.length > 0;

  return (
    <div className="list-group-item">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex flex-grow-1 align-items-center">
          <code className="fw-medium">{code}</code>
          {servingSize && (
            <span className="text-secondary ms-2 small">{servingSize.toString()}</span>
          )}
        </div>
        <div className="d-flex align-items-center ms-2">
          <Link
            to={`/lookup/${encodeURIComponent(code)}`}
            className="btn btn-outline-secondary btn-sm"
            title={`Look up ${code}`}
          >
            Lookup
          </Link>
          {servingSize && onSelectSize && (
            <button
              className="btn btn-outline-primary btn-sm ms-2"
              onClick={handleUse}
              title={`Set serving to ${servingSize.toString()}`}
            >
              Use
            </button>
          )}
        </div>
      </div>

      {hasNotes && (
        <div className="mt-1">
          <NotesDisplay notes={notes as Note[]} />
        </div>
      )}
    </div>
  );
}
