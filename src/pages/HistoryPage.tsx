import { useState, useMemo, useCallback, useEffect } from 'react';

import type { ApiLogEntry, ApiProduct } from '../api';
import { getLogs, listProducts, listGroups, getProduct, getGroup, deleteLog } from '../api';
import { NutritionInformation, Preparation, ProductGroup, ServingSize } from '../domain';
import type { ProductGroupData } from '../domain';
import { BackButton, ErrorState, ContentUnavailableView } from '../components/common';
import { useApiQuery } from '../hooks';
import LogModal from '../components/LogModal';
import type { LogTarget } from '../components/LogModal';
import DayNutritionModal from '../components/DayNutritionModal';
import HistoryEntryRow from '../components/HistoryEntryRow';
import { formatSignificant } from '../utils/formatters';
import { resolveEntryName, buildLogTarget } from '../utils/logEntryHelpers';

function formatDayHeading(dateStr: string): string {
  const today = new Date();
  const todayDate = today.toLocaleDateString();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = yesterday.toLocaleDateString();

  if (dateStr === todayDate) return 'Today';
  if (dateStr === yesterdayDate) return 'Yesterday';
  return dateStr;
}

function groupByDay(entries: ApiLogEntry[]): Map<string, ApiLogEntry[]> {
  const groups = new Map<string, ApiLogEntry[]>();
  for (const entry of entries) {
    const dayKey = new Date(entry.timestamp * 1000).toLocaleDateString();
    const existing = groups.get(dayKey);
    if (existing) {
      existing.push(entry);
    } else {
      groups.set(dayKey, [entry]);
    }
  }
  return groups;
}

function formatDayLabelForModal(day: string): string {
  const dayHeading = formatDayHeading(day);
  if (dayHeading === day) return day;
  return `${dayHeading} (${day})`;
}

function resolveEntryNutrition(
  entry: ApiLogEntry,
  productDetails: Record<string, ApiProduct>,
  groupDetails: Record<string, ProductGroupData>,
): NutritionInformation | null {
  const servingSize = ServingSize.fromObject(entry.item.servingSize) ?? ServingSize.servings(1);

  if (entry.item.kind === 'product' && entry.item.productID) {
    const product = productDetails[entry.item.productID];
    const prepData =
      product?.preparations?.find((prep) => prep.id === entry.item.preparationID) ??
      product?.preparations?.[0];
    if (!prepData) return null;

    try {
      const prep = new Preparation(prepData);
      return prep.nutritionalInformationFor(servingSize);
    } catch {
      return null;
    }
  }

  if (entry.item.kind === 'group' && entry.item.groupID) {
    const groupData = groupDetails[entry.item.groupID];
    if (!groupData) return null;

    try {
      const group = new ProductGroup(groupData);
      return group.serving(servingSize).nutrition;
    } catch {
      return null;
    }
  }

  return null;
}

export default function HistoryPage() {
  const {
    data: logs,
    loading: logsLoading,
    error: logsError,
    refetch: refetchLogs,
  } = useApiQuery(getLogs, []);
  const {
    data: products,
    loading: productsLoading,
    error: productsError,
  } = useApiQuery(listProducts, []);
  const { data: groups, loading: groupsLoading, error: groupsError } = useApiQuery(listGroups, []);

  const [logTarget, setLogTarget] = useState<LogTarget | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [logAgainLoading, setLogAgainLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [productDetails, setProductDetails] = useState<Record<string, ApiProduct>>({});
  const [groupDetails, setGroupDetails] = useState<Record<string, ProductGroupData>>({});

  const loading = logsLoading || productsLoading || groupsLoading;
  const error = logsError || productsError || groupsError;

  const dayGroups = useMemo(() => {
    if (!logs) return new Map<string, ApiLogEntry[]>();
    return groupByDay(logs);
  }, [logs]);

  useEffect(() => {
    if (!logs || logs.length === 0) return;

    const productIds = Array.from(
      new Set(
        logs
          .filter((entry) => entry.item.kind === 'product' && !!entry.item.productID)
          .map((entry) => entry.item.productID!)
          .filter((id) => !productDetails[id]),
      ),
    );

    const groupIds = Array.from(
      new Set(
        logs
          .filter((entry) => entry.item.kind === 'group' && !!entry.item.groupID)
          .map((entry) => entry.item.groupID!)
          .filter((id) => !groupDetails[id]),
      ),
    );

    if (productIds.length === 0 && groupIds.length === 0) return;

    let cancelled = false;

    const loadDetails = async () => {
      const [loadedProducts, loadedGroups] = await Promise.all([
        Promise.all(
          productIds.map(async (id) => {
            try {
              return [id, await getProduct(id)] as const;
            } catch {
              return null;
            }
          }),
        ),
        Promise.all(
          groupIds.map(async (id) => {
            try {
              return [id, await getGroup(id)] as const;
            } catch {
              return null;
            }
          }),
        ),
      ]);

      if (cancelled) return;

      const successfulProducts = loadedProducts.filter(
        (item): item is readonly [string, ApiProduct] => item !== null,
      );
      if (successfulProducts.length > 0) {
        setProductDetails((prev) => ({
          ...prev,
          ...Object.fromEntries(successfulProducts),
        }));
      }

      const successfulGroups = loadedGroups.filter(
        (item): item is readonly [string, ProductGroupData] => item !== null,
      );
      if (successfulGroups.length > 0) {
        setGroupDetails((prev) => ({
          ...prev,
          ...Object.fromEntries(successfulGroups),
        }));
      }
    };

    loadDetails();

    return () => {
      cancelled = true;
    };
  }, [logs, productDetails, groupDetails]);

  const entryNutritionById = useMemo(() => {
    const nutritionById = new Map<string, NutritionInformation>();
    if (!logs) return nutritionById;

    for (const entry of logs) {
      const nutrition = resolveEntryNutrition(entry, productDetails, groupDetails);
      if (nutrition) {
        nutritionById.set(entry.id, nutrition);
      }
    }

    return nutritionById;
  }, [logs, productDetails, groupDetails]);

  const dayNutritionByDay = useMemo(() => {
    const totalsByDay = new Map<string, NutritionInformation>();
    for (const [day, entries] of dayGroups.entries()) {
      let dayNutrition = NutritionInformation.zero();
      for (const entry of entries) {
        const nutrition = entryNutritionById.get(entry.id);
        if (nutrition) {
          dayNutrition = dayNutrition.add(nutrition);
        }
      }
      totalsByDay.set(day, dayNutrition);
    }
    return totalsByDay;
  }, [dayGroups, entryNutritionById]);

  const selectedDayNutrition = selectedDay ? (dayNutritionByDay.get(selectedDay) ?? null) : null;

  const handleLogAgainClick = useCallback(async (entry: ApiLogEntry) => {
    setLogAgainLoading(true);
    try {
      let product: ApiProduct | null = null;
      let groupData: ProductGroupData | null = null;

      if (entry.item.kind === 'product' && entry.item.productID) {
        product = await getProduct(entry.item.productID);
      } else if (entry.item.kind === 'group' && entry.item.groupID) {
        groupData = await getGroup(entry.item.groupID);
      }

      const target = buildLogTarget(entry, product, groupData);
      if (target) {
        const { editEntryId: _, ...createTarget } = target;
        setLogTarget(createTarget);
      }
    } finally {
      setLogAgainLoading(false);
    }
  }, []);

  const handleEditClick = useCallback(async (entry: ApiLogEntry) => {
    setEditLoading(true);
    try {
      let product: ApiProduct | null = null;
      let groupData: ProductGroupData | null = null;

      if (entry.item.kind === 'product' && entry.item.productID) {
        product = await getProduct(entry.item.productID);
      } else if (entry.item.kind === 'group' && entry.item.groupID) {
        groupData = await getGroup(entry.item.groupID);
      }

      const target = buildLogTarget(entry, product, groupData);
      if (target) {
        setLogTarget(target);
      }
    } finally {
      setEditLoading(false);
    }
  }, []);

  const handleDeleteClick = useCallback(
    async (entry: ApiLogEntry) => {
      setDeleteLoading(true);
      try {
        await deleteLog(entry.id);
        refetchLogs();
      } finally {
        setDeleteLoading(false);
      }
    },
    [refetchLogs],
  );

  const handleSaved = useCallback(() => {
    refetchLogs();
  }, [refetchLogs]);

  const handleModalClose = useCallback(() => {
    setLogTarget(null);
  }, []);

  const handleDayModalClose = useCallback(() => {
    setSelectedDay(null);
  }, []);

  return (
    <>
      <BackButton to="/" />
      <h2 className="mb-4">History</h2>
      {loading && (
        <div data-testid="history-placeholder">
          <div className="mb-4">
            <h5 className="text-body-secondary mb-3 placeholder-glow">
              <span className="placeholder col-2" />
            </h5>
            <div className="list-group placeholder-glow">
              {[1, 2, 3].map((i) => (
                <div key={i} className="list-group-item">
                  <div>
                    <div className="mb-1">
                      <span className="placeholder col-4" />
                    </div>
                    <small>
                      <span className="placeholder col-3" />
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {!loading && error && <ErrorState message={error} />}
      {!loading && !error && dayGroups.size === 0 && (
        <ContentUnavailableView icon="bi-clock-history" title="No History" />
      )}
      {!loading &&
        !error &&
        dayGroups.size > 0 &&
        Array.from(dayGroups.entries()).map(([day, entries]) => (
          <div key={day} className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
			  <h5 className="text-body-secondary mb-0">{formatDayHeading(day)}</h5>

				<div className="d-flex align-items-center">
				  <span className="text-body-secondary small fw-medium mb-0">
					{formatSignificant(dayNutritionByDay.get(day)?.calories?.amount ?? 0)} kcal total, &nbsp;
				  </span>
				  
				  <button
					  type="button"
					  className="btn btn-link text-decoration-none small p-0"
					  onClick={() => setSelectedDay(day)}
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
                  name={resolveEntryName(entry, products!, groups!)}
                  calories={entryNutritionById.get(entry.id)?.calories?.amount ?? null}
                  onLogAgain={handleLogAgainClick}
                  logAgainLoading={logAgainLoading}
                  onEdit={handleEditClick}
                  editLoading={editLoading}
                  onDelete={handleDeleteClick}
                  deleteLoading={deleteLoading}
                />
              ))}
            </div>
          </div>
        ))}

      <LogModal target={logTarget} onClose={handleModalClose} onSaved={handleSaved} />
      {selectedDay && selectedDayNutrition && (
        <DayNutritionModal
          dayLabel={formatDayLabelForModal(selectedDay)}
          nutritionInfo={selectedDayNutrition}
          onClose={handleDayModalClose}
        />
      )}
    </>
  );
}
