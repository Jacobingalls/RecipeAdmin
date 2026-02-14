import { useState, useMemo, useCallback, useEffect } from 'react';

import type { ApiLogEntry, ApiProduct, ApiProductSummary, ApiGroupSummary } from '../api';
import { getLogs, listProducts, listGroups, getProduct, getGroup, deleteLog } from '../api';
import { Preparation, ProductGroup, ServingSize } from '../domain';
import type { ProductGroupData, NutritionInformation } from '../domain';
import type { LogTarget } from '../components/LogModal';
import { buildLogTarget } from '../utils/logEntryHelpers';

import { useApiQuery } from './useApiQuery';

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

export interface UseHistoryDataResult {
  logs: ApiLogEntry[] | null;
  products: ApiProductSummary[] | null;
  groups: ApiGroupSummary[] | null;
  loading: boolean;
  error: string | null;
  refetchLogs: () => void;
  entryNutritionById: Map<string, NutritionInformation>;
  logTarget: LogTarget | null;
  logAgainLoading: boolean;
  editLoading: boolean;
  deleteLoading: boolean;
  handleLogAgainClick: (entry: ApiLogEntry) => Promise<void>;
  handleEditClick: (entry: ApiLogEntry) => Promise<void>;
  handleDeleteClick: (entry: ApiLogEntry) => Promise<void>;
  handleSaved: () => void;
  handleModalClose: () => void;
}

/**
 * Shared hook for history data fetching, nutrition resolution, and log entry actions.
 * Used by both HistoryPage and HistoryTile.
 */
export function useHistoryData(options?: { limit?: number }): UseHistoryDataResult {
  const limit = options?.limit;
  const {
    data: logs,
    loading: logsLoading,
    error: logsError,
    refetch: refetchLogs,
  } = useApiQuery(() => getLogs(undefined, undefined, limit), [limit], {
    errorMessage: "Couldn't load history. Try again later.",
  });
  const {
    data: products,
    loading: productsLoading,
    error: productsError,
  } = useApiQuery(listProducts, [], { errorMessage: "Couldn't load history. Try again later." });
  const {
    data: groups,
    loading: groupsLoading,
    error: groupsError,
  } = useApiQuery(listGroups, [], {
    errorMessage: "Couldn't load history. Try again later.",
  });

  const [logTarget, setLogTarget] = useState<LogTarget | null>(null);
  const [logAgainLoading, setLogAgainLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [productDetails, setProductDetails] = useState<Record<string, ApiProduct>>({});
  const [groupDetails, setGroupDetails] = useState<Record<string, ProductGroupData>>({});

  const loading = logsLoading || productsLoading || groupsLoading;
  const error = logsError || productsError || groupsError;

  // Lazy-load product and group details for nutrition resolution
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
        const { editEntryId: _, initialTimestamp: __, ...createTarget } = target;
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

  return {
    logs,
    products,
    groups,
    loading,
    error,
    refetchLogs,
    entryNutritionById,
    logTarget,
    logAgainLoading,
    editLoading,
    deleteLoading,
    handleLogAgainClick,
    handleEditClick,
    handleDeleteClick,
    handleSaved,
    handleModalClose,
  };
}
