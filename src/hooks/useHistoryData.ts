import { useState, useMemo, useCallback, useEffect } from 'react';

import type { ApiLogEntry, ApiProduct } from '../api';
import { getLogs, getProduct, getGroup, deleteLog } from '../api';
import { Preparation, ProductGroup, ServingSize } from '../domain';
import type { ProductGroupData, NutritionInformation } from '../domain';
import type { LogTarget } from '../components/LogModal';
import { buildLogTarget } from '../utils';

import { useApiQuery } from './useApiQuery';

function resolveEntryNutrition(
  entry: ApiLogEntry,
  productDetails: Record<string, ApiProduct>,
  groupDetails: Record<string, ProductGroupData>,
): NutritionInformation | null {
  const servingSize = ServingSize.fromObject(entry.item.servingSize) ?? ServingSize.servings(1);

  if (entry.item.productID) {
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

  if (entry.item.groupID) {
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

export interface UseHistoryDataResult {
  logs: ApiLogEntry[] | null;
  productDetails: Record<string, ApiProduct>;
  groupDetails: Record<string, ProductGroupData>;
  loading: boolean;
  error: string | null;
  refetchLogs: () => void;
  entryNutritionById: Map<string, NutritionInformation>;
  logTarget: LogTarget | null;
  logAgainLoadingId: string | null;
  editLoadingId: string | null;
  deleteLoadingId: string | null;
  handleLogAgainClick: (entry: ApiLogEntry) => Promise<void>;
  handleEditClick: (entry: ApiLogEntry) => Promise<void>;
  handleDeleteClick: (entry: ApiLogEntry) => Promise<void>;
  handleSaved: () => void;
  handleModalClose: () => void;
}

/**
 * Shared hook for history data fetching, nutrition resolution, and log entry actions.
 * Used by both HistoryPage and TodayTile.
 */
export function useHistoryData(options?: {
  limit?: number;
  limitDays?: number;
}): UseHistoryDataResult {
  const limit = options?.limit;
  const limitDays = options?.limitDays;
  const {
    data: logs,
    loading: logsLoading,
    error: logsError,
    refetch: refetchLogs,
  } = useApiQuery(() => getLogs({ limit, limitDays }), [limit, limitDays], {
    errorMessage: "Couldn't load history. Try again later.",
  });
  const [logTarget, setLogTarget] = useState<LogTarget | null>(null);
  const [logAgainLoadingId, setLogAgainLoadingId] = useState<string | null>(null);
  const [editLoadingId, setEditLoadingId] = useState<string | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [productDetails, setProductDetails] = useState<Record<string, ApiProduct>>({});
  const [groupDetails, setGroupDetails] = useState<Record<string, ProductGroupData>>({});

  const loading = logsLoading;
  const error = logsError;

  // Lazy-load product and group details for nutrition resolution
  useEffect(() => {
    if (!logs || logs.length === 0) return;

    const productIds = Array.from(
      new Set(
        logs
          .filter((entry) => !!entry.item.productID)
          .map((entry) => entry.item.productID!)
          .filter((id) => !productDetails[id]),
      ),
    );

    const groupIds = Array.from(
      new Set(
        logs
          .filter((entry) => !!entry.item.groupID)
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

  const handleLogAgainClick = useCallback(async (entry: ApiLogEntry) => {
    setLogAgainLoadingId(entry.id);
    try {
      let product: ApiProduct | null = null;
      let groupData: ProductGroupData | null = null;

      if (entry.item.productID) {
        product = await getProduct(entry.item.productID);
      } else if (entry.item.groupID) {
        groupData = await getGroup(entry.item.groupID);
      }

      const target = buildLogTarget(entry, product, groupData);
      if (target) {
        const { editEntryId: _, initialTimestamp: __, ...createTarget } = target;
        setLogTarget(createTarget);
      }
    } finally {
      setLogAgainLoadingId(null);
    }
  }, []);

  const handleEditClick = useCallback(async (entry: ApiLogEntry) => {
    setEditLoadingId(entry.id);
    try {
      let product: ApiProduct | null = null;
      let groupData: ProductGroupData | null = null;

      if (entry.item.productID) {
        product = await getProduct(entry.item.productID);
      } else if (entry.item.groupID) {
        groupData = await getGroup(entry.item.groupID);
      }

      const target = buildLogTarget(entry, product, groupData);
      if (target) {
        setLogTarget(target);
      }
    } finally {
      setEditLoadingId(null);
    }
  }, []);

  const handleDeleteClick = useCallback(
    async (entry: ApiLogEntry) => {
      setDeleteLoadingId(entry.id);
      try {
        await deleteLog(entry.id);
        refetchLogs();
      } finally {
        setDeleteLoadingId(null);
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

  return {
    logs,
    productDetails,
    groupDetails,
    loading,
    error,
    refetchLogs,
    entryNutritionById,
    logTarget,
    logAgainLoadingId,
    editLoadingId,
    deleteLoadingId,
    handleLogAgainClick,
    handleEditClick,
    handleDeleteClick,
    handleSaved,
    handleModalClose,
  };
}
