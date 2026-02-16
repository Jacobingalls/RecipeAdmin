import type { ApiLogEntry, ApiProduct } from '../../api';
import type { NutritionInformation, ProductGroupData } from '../../domain';
import { SubsectionTitle } from '../common';
import HistoryEntryRow from '../HistoryEntryRow';
import { formatSignificant, resolveEntryName, resolveEntryBrand } from '../../utils';

interface HistoryDayGroupProps {
  dayHeading: string;
  dayNutrition: NutritionInformation | undefined;
  entries: ApiLogEntry[];
  productDetails: Record<string, ApiProduct>;
  groupDetails: Record<string, ProductGroupData>;
  entryNutritionById: Map<string, NutritionInformation>;
  onViewFullNutrition: () => void;
  onLogAgain: (entry: ApiLogEntry) => void;
  logAgainLoadingId: string | null;
  onEdit: (entry: ApiLogEntry) => void;
  editLoadingId: string | null;
  onDelete: (entry: ApiLogEntry) => void;
  deleteLoadingId: string | null;
}

export default function HistoryDayGroup({
  dayHeading,
  dayNutrition,
  entries,
  productDetails,
  groupDetails,
  entryNutritionById,
  onViewFullNutrition,
  onLogAgain,
  logAgainLoadingId,
  onEdit,
  editLoadingId,
  onDelete,
  deleteLoadingId,
}: HistoryDayGroupProps) {
  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <SubsectionTitle as="h5" className="mb-0">
          {dayHeading}
        </SubsectionTitle>

        <div className="d-flex align-items-center">
          <span className="text-body-secondary small fw-medium mb-0">
            {formatSignificant(dayNutrition?.calories?.amount ?? 0)} kcal total,&nbsp;
          </span>

          <button
            type="button"
            className="btn btn-link text-decoration-none small p-0"
            onClick={onViewFullNutrition}
          >
            View full nutrition &rarr;
          </button>
        </div>
      </div>
      <div className="list-group">
        {entries.map((entry) => (
          <HistoryEntryRow
            key={entry.id}
            entry={entry}
            name={resolveEntryName(entry, productDetails, groupDetails)}
            brand={resolveEntryBrand(entry, productDetails, groupDetails)}
            calories={entryNutritionById.get(entry.id)?.calories?.amount ?? null}
            timeDisplay="time"
            onLogAgain={onLogAgain}
            logAgainLoadingId={logAgainLoadingId}
            onEdit={onEdit}
            editLoadingId={editLoadingId}
            onDelete={onDelete}
            deleteLoadingId={deleteLoadingId}
          />
        ))}
      </div>
    </div>
  );
}
