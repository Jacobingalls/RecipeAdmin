import type { CustomSize } from '../domain';
import { ServingSize } from '../domain';

import type { Note } from './NotesDisplay';
import NotesDisplay from './NotesDisplay';

interface CustomSizesSectionProps {
  customSizes?: CustomSize[];
  onSelectSize?: (size: ServingSize) => void;
}

export default function CustomSizesSection({ customSizes, onSelectSize }: CustomSizesSectionProps) {
  if (!customSizes || customSizes.length === 0) return null;

  return (
    <section className="mt-3">
      <h2 className="h6 text-secondary mb-2">Custom Sizes</h2>
      <div className="list-group">
        {customSizes.map((cs, index) => (
          <CustomSizeItem
            key={cs.id || cs.name || index}
            customSize={cs}
            onSelect={() => onSelectSize?.(ServingSize.customSize(cs.name, 1))}
          />
        ))}
      </div>
    </section>
  );
}

interface CustomSizeItemProps {
  customSize: CustomSize;
  onSelect: () => void;
}

function CustomSizeItem({ customSize, onSelect }: CustomSizeItemProps) {
  const { name, description, notes } = customSize;
  const hasNotes = notes && notes.length > 0;

  return (
    <div
      className={`list-group-item d-flex justify-content-between ${hasNotes ? 'align-items-start' : 'align-items-center'}`}
    >
      <div className="flex-grow-1">
        <div className="d-flex align-items-baseline">
          <span className="fw-medium">{name}</span>
          {description && <span className="text-secondary ms-2 small">({description})</span>}
        </div>
        {hasNotes && (
          <div className="mt-1">
            <NotesDisplay notes={notes as Note[]} />
          </div>
        )}
      </div>
      <button
        className="btn btn-outline-primary btn-sm ms-2"
        onClick={onSelect}
        title={`Set serving to 1 ${name}`}
      >
        Use
      </button>
    </div>
  );
}
