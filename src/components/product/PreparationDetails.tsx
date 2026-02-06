import type { PreparationData, ServingSize } from '../../domain';
import { Preparation } from '../../domain';
import NutritionLabel from '../NutritionLabel';
import ServingSizeSelector from '../ServingSizeSelector';
import CustomSizesSection from '../CustomSizesSection';
import NotesDisplay from '../NotesDisplay';

interface PreparationDetailsProps {
  prep: PreparationData;
  servingSize: ServingSize;
  onServingSizeChange: (size: ServingSize) => void;
}

/**
 * Displays details for a single preparation including nutrition label,
 * serving size selector, custom sizes, and notes.
 */
export default function PreparationDetails({
  prep: prepData,
  servingSize,
  onServingSizeChange,
}: PreparationDetailsProps) {
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
      <div className="mb-3">
        <ServingSizeSelector prep={prep} value={servingSize} onChange={onServingSizeChange} />
      </div>

      {error && <div className="text-danger small mb-3">{error}</div>}
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
            <h6 className="text-secondary mb-2">Notes</h6>
            <NotesDisplay notes={prep.notes} />
          </div>
        </>
      )}
    </>
  );
}
