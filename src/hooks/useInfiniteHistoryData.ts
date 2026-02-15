import { useState, useMemo, useCallback, useEffect, useRef } from 'react';

import type { ApiLogEntry, ApiProduct } from '../api';
import { getLogs, getProduct, getGroup, deleteLog } from '../api';
import { Preparation, ProductGroup, ServingSize } from '../domain';
import type { ProductGroupData, NutritionInformation } from '../domain';
import type { LogTarget } from '../components/LogModal';
import { buildLogTarget } from '../utils/logEntryHelpers';

const DAYS_PER_PAGE = 7;

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

export interface UseInfiniteHistoryDataResult {
  logs: ApiLogEntry[];
  productDetails: Record<string, ApiProduct>;
  groupDetails: Record<string, ProductGroupData>;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
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
 * Paginated history data hook with infinite scroll.
 * Loads 1-week windows of entries, accumulating results as the user scrolls.
 * Unlike `useHistoryData`, which loads a fixed date range, this hook supports incremental loading via `loadMore`.
 */
export function useInfiniteHistoryData(): UseInfiniteHistoryDataResult {
  const [allLogs, setAllLogs] = useState<ApiLogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const hasMoreRef = useRef(true);
  hasMoreRef.current = hasMore;
  const [logsError, setLogsError] = useState<string | null>(null);
  const cursorRef = useRef<number | null>(null);
  const loadingRef = useRef(false);
  const [resetKey, setResetKey] = useState(0);

  const [logTarget, setLogTarget] = useState<LogTarget | null>(null);
  const [logAgainLoading, setLogAgainLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [productDetails, setProductDetails] = useState<Record<string, ApiProduct>>({});
  const [groupDetails, setGroupDetails] = useState<Record<string, ProductGroupData>>({});

  // Initial load (and reset after save)
  useEffect(() => {
    let cancelled = false;
    setLogsLoading(true);
    setLogsError(null);
    setAllLogs([]);
    setHasMore(true);
    setProductDetails({});
    setGroupDetails({});
    cursorRef.current = null;
    loadingRef.current = true;

    getLogs({ limitDays: DAYS_PER_PAGE })
      .then((entries) => {
        if (cancelled) return;
        setAllLogs(entries);
        if (entries.length === 0) {
          setHasMore(false);
        } else {
          cursorRef.current = entries[entries.length - 1].timestamp;
        }
      })
      .catch(() => {
        if (cancelled) return;
        setLogsError("Couldn't load history. Try again later.");
      })
      .finally(() => {
        if (cancelled) return;
        setLogsLoading(false);
        loadingRef.current = false;
      });

    return () => {
      cancelled = true;
    };
  }, [resetKey]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current || cursorRef.current === null) return;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const entries = await getLogs({
        start: cursorRef.current - 0.001,
        limitDays: DAYS_PER_PAGE,
      });
      if (entries.length === 0) {
        setHasMore(false);
      } else {
        cursorRef.current = entries[entries.length - 1].timestamp;
        setAllLogs((prev) => [...prev, ...entries]);
      }
    } catch {
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, []);

  // Lazy-load product and group details for nutrition resolution.
  // Uses refs for the filter check to avoid re-triggering when details load.
  const productDetailsRef = useRef(productDetails);
  productDetailsRef.current = productDetails;
  const groupDetailsRef = useRef(groupDetails);
  groupDetailsRef.current = groupDetails;

  useEffect(() => {
    if (allLogs.length === 0) return;

    const currentProductDetails = productDetailsRef.current;
    const currentGroupDetails = groupDetailsRef.current;

    const productIds = Array.from(
      new Set(
        allLogs
          .filter((entry) => entry.item.kind === 'product' && !!entry.item.productID)
          .map((entry) => entry.item.productID!)
          .filter((id) => !currentProductDetails[id]),
      ),
    );

    const groupIds = Array.from(
      new Set(
        allLogs
          .filter((entry) => entry.item.kind === 'group' && !!entry.item.groupID)
          .map((entry) => entry.item.groupID!)
          .filter((id) => !currentGroupDetails[id]),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLogs]);

  const entryNutritionById = useMemo(() => {
    const nutritionById = new Map<string, NutritionInformation>();
    for (const entry of allLogs) {
      const nutrition = resolveEntryNutrition(entry, productDetails, groupDetails);
      if (nutrition) {
        nutritionById.set(entry.id, nutrition);
      }
    }
    return nutritionById;
  }, [allLogs, productDetails, groupDetails]);

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

  const handleDeleteClick = useCallback(async (entry: ApiLogEntry) => {
    setDeleteLoading(true);
    try {
      await deleteLog(entry.id);
      setAllLogs((prev) => prev.filter((e) => e.id !== entry.id));
    } finally {
      setDeleteLoading(false);
    }
  }, []);

  const handleSaved = useCallback(() => {
    setResetKey((k) => k + 1);
  }, []);

  const handleModalClose = useCallback(() => {
    setLogTarget(null);
  }, []);

  const loading = logsLoading;
  const error = logsError;

  return {
    logs: allLogs,
    productDetails,
    groupDetails,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
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
