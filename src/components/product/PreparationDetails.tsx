import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { PreparationData, ServingSize } from '../../domain';
import { Preparation } from '../../domain';
import { SubsectionTitle } from '../common';
import NutritionLabel from '../NutritionLabel';
import ServingSizeSelector from '../ServingSizeSelector';
import CustomSizesSection from '../CustomSizesSection';
import NotesDisplay from '../NotesDisplay';

interface PreparationDetailsProps {
  prep: PreparationData;
  servingSize: ServingSize;
  onServingSizeChange: (size: ServingSize) => void;
  actionSlot?: ReactNode;
}

/**
 * Displays details for a single preparation including nutrition label,
 * serving size selector, custom sizes, and notes.
 */
export default function PreparationDetails({
  prep: prepData,
  servingSize,
  onServingSizeChange,
  actionSlot,
}: PreparationDetailsProps) {
  const { t } = useTranslation();
  const prep = new Preparation(prepData);

  let nutritionInfo = null;
  let error = null;
  try {
    nutritionInfo = prep.nutritionalInformationFor(servingSize);
  } catch (e: unknown) {
    error = (e as Error).message;
  }

  return (
    <>
      <div className="d-flex align-items-end mb-3">
        <ServingSizeSelector prep={prep} value={servingSize} onChange={onServingSizeChange} />
        {actionSlot && <div className="ms-auto">{actionSlot}</div>}
      </div>

      {error && (
        <div className="text-danger small mb-3" role="alert">
          {error}
        </div>
      )}
      {nutritionInfo && (
        <NutritionLabel nutritionInfo={nutritionInfo} servingSize={servingSize} prep={prep} />
      )}

      {prep.customSizes.length > 0 && (
        <>
          <br />
          <CustomSizesSection customSizes={prep.customSizes} onSelectSize={onServingSizeChange} />
        </>
      )}

      {prep.notes.length > 0 && (
        <>
          <br />
          <div className="mt-3">
            <SubsectionTitle>{t('notes.title')}</SubsectionTitle>
            <NotesDisplay notes={prep.notes} />
          </div>
        </>
      )}
    </>
  );
}
