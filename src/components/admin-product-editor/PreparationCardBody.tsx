import type { ApiProduct } from '../../api';
import type { Note } from '../NotesDisplay';

import NotesSection from './NotesSection';
import PreparationServingSection from './PreparationServingSection';
import PreparationNutritionSection from './PreparationNutritionSection';
import PreparationCategoriesSection from './PreparationCategoriesSection';
import PreparationCustomSizesSection from './PreparationCustomSizesSection';
import PreparationDangerZone from './PreparationDangerZone';

interface PreparationCardBodyProps {
  product: ApiProduct;
  preparationId: string;
  onChange: (product: ApiProduct) => void;
  onPrepDeleted: () => void;
}

export default function PreparationCardBody({
  product,
  preparationId,
  onChange,
  onPrepDeleted,
}: PreparationCardBodyProps) {
  const prep = product.preparations.find((p) => p.id === preparationId);
  if (!prep) return null;

  const notes = (prep.notes ?? []) as Note[];

  return (
    <>
      <PreparationServingSection
        product={product}
        preparationId={preparationId}
        onChange={onChange}
      />
      <PreparationNutritionSection
        product={product}
        preparationId={preparationId}
        onChange={onChange}
      />
      <PreparationCategoriesSection
        product={product}
        preparationId={preparationId}
        onChange={onChange}
      />
      <PreparationCustomSizesSection
        product={product}
        preparationId={preparationId}
        onChange={onChange}
      />

      <NotesSection
        notes={notes}
        onChange={(updated) => {
          const updatedPreps = product.preparations.map((p) =>
            p.id === preparationId ? { ...p, notes: updated } : p,
          );
          onChange({ ...product, preparations: updatedPreps });
        }}
        variant="card"
        className="px-3 pt-3 pb-2"
      />

      <PreparationDangerZone
        product={product}
        preparationId={preparationId}
        onChange={onChange}
        onPrepDeleted={onPrepDeleted}
      />
    </>
  );
}
