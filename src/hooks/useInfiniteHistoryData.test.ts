import { renderHook, waitFor, act } from '@testing-library/react';

import type { ApiLogEntry, ApiProduct } from '../api';
import { getLogs, getProduct, getGroup, deleteLog } from '../api';
import type { ProductGroupData } from '../domain';
import { buildLogTarget } from '../utils/logEntryHelpers';

import { useInfiniteHistoryData } from './useInfiniteHistoryData';

vi.mock('../api', () => ({
  getLogs: vi.fn(),
  getProduct: vi.fn(),
  getGroup: vi.fn(),
  deleteLog: vi.fn(),
}));

vi.mock('../utils/logEntryHelpers', () => ({
  buildLogTarget: vi.fn(),
}));

const mockGetLogs = vi.mocked(getLogs);
const mockGetProduct = vi.mocked(getProduct);
const mockGetGroup = vi.mocked(getGroup);
const mockDeleteLog = vi.mocked(deleteLog);
const mockBuildLogTarget = vi.mocked(buildLogTarget);

function makeProductEntry(id: string, timestamp: number): ApiLogEntry {
  return {
    id,
    timestamp,
    item: {
      kind: 'product',
      productID: 'prod-1',
      preparationID: 'prep-1',
      servingSize: { servings: 1 },
    },
  };
}

function makeGroupEntry(id: string, timestamp: number): ApiLogEntry {
  return {
    id,
    timestamp,
    item: {
      kind: 'group',
      groupID: 'group-1',
      servingSize: { servings: 1 },
    },
  };
}

const sampleProduct: ApiProduct = {
  id: 'prod-1',
  name: 'Test Product',
  preparations: [
    {
      id: 'prep-1',
      name: 'Default',
      nutritionalInformation: { calories: { amount: 200, unit: 'kcal' } },
      mass: { amount: 100, unit: 'g' },
    },
  ],
};

const sampleGroupData: ProductGroupData = {
  id: 'group-1',
  name: 'Test Group',
  items: [
    {
      servingSize: { servings: 1 },
      product: {
        id: 'prod-1',
        name: 'Test Product',
        preparations: [
          {
            id: 'prep-1',
            name: 'Default',
            nutritionalInformation: { calories: { amount: 150, unit: 'kcal' } },
          },
        ],
      },
    },
  ],
};

describe('useInfiniteHistoryData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial load', () => {
    it('starts in loading state', () => {
      mockGetLogs.mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useInfiniteHistoryData());

      expect(result.current.loading).toBe(true);
      expect(result.current.logs).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('loads initial page of logs', async () => {
      const entries = [makeProductEntry('log-1', 1700000000)];
      mockGetLogs.mockResolvedValue(entries);
      mockGetProduct.mockResolvedValue(sampleProduct);

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.logs).toEqual(entries);
      expect(mockGetLogs).toHaveBeenCalledWith({ limitDays: 7 });
    });

    it('sets hasMore to false when initial load returns empty', async () => {
      mockGetLogs.mockResolvedValue([]);

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasMore).toBe(false);
    });

    it('sets hasMore to true when initial load returns entries', async () => {
      mockGetLogs.mockResolvedValue([makeProductEntry('log-1', 1700000000)]);
      mockGetProduct.mockResolvedValue(sampleProduct);

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasMore).toBe(true);
    });

    it('sets error on fetch failure', async () => {
      mockGetLogs.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Couldn't load history. Try again later.");
    });
  });

  describe('loadMore', () => {
    it('appends new entries to existing logs', async () => {
      const page1 = [makeProductEntry('log-1', 1700000000)];
      const page2 = [makeProductEntry('log-2', 1699900000)];
      mockGetLogs.mockResolvedValueOnce(page1).mockResolvedValueOnce(page2);
      mockGetProduct.mockResolvedValue(sampleProduct);

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.logs).toHaveLength(2);
      });

      expect(result.current.logs[0].id).toBe('log-1');
      expect(result.current.logs[1].id).toBe('log-2');
    });

    it('uses last entry timestamp as cursor for next page', async () => {
      const page1 = [makeProductEntry('log-1', 1700000000)];
      mockGetLogs.mockResolvedValueOnce(page1).mockResolvedValueOnce([]);
      mockGetProduct.mockResolvedValue(sampleProduct);

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.loadingMore).toBe(false);
      });

      // Second call should use the timestamp cursor minus 0.001
      expect(mockGetLogs).toHaveBeenCalledWith({
        start: 1700000000 - 0.001,
        limitDays: 7,
      });
    });

    it('sets hasMore to false when loadMore returns empty', async () => {
      const page1 = [makeProductEntry('log-1', 1700000000)];
      mockGetLogs.mockResolvedValueOnce(page1).mockResolvedValueOnce([]);
      mockGetProduct.mockResolvedValue(sampleProduct);

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.loadingMore).toBe(false);
      });

      expect(result.current.hasMore).toBe(false);
    });

    it('manages loadingMore state', async () => {
      const page1 = [makeProductEntry('log-1', 1700000000)];
      let resolvePage2: (entries: ApiLogEntry[]) => void;
      mockGetLogs.mockResolvedValueOnce(page1).mockReturnValueOnce(
        new Promise<ApiLogEntry[]>((r) => {
          resolvePage2 = r;
        }),
      );
      mockGetProduct.mockResolvedValue(sampleProduct);

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.loadingMore).toBe(true);
      });

      await act(async () => {
        resolvePage2!([]);
      });

      expect(result.current.loadingMore).toBe(false);
    });

    it('does not load more when already loading', async () => {
      const page1 = [makeProductEntry('log-1', 1700000000)];
      mockGetLogs.mockResolvedValueOnce(page1).mockReturnValueOnce(new Promise(() => {}));
      mockGetProduct.mockResolvedValue(sampleProduct);

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.loadMore();
      });

      // Second call while first loadMore is pending should be no-op
      act(() => {
        result.current.loadMore();
      });

      // Only initial + 1 loadMore call (not 2)
      expect(mockGetLogs).toHaveBeenCalledTimes(2);
    });

    it('does not load more when hasMore is false', async () => {
      mockGetLogs.mockResolvedValue([]);

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasMore).toBe(false);

      act(() => {
        result.current.loadMore();
      });

      // Only the initial load call
      expect(mockGetLogs).toHaveBeenCalledTimes(1);
    });

    it('sets hasMore to false on loadMore error', async () => {
      const page1 = [makeProductEntry('log-1', 1700000000)];
      mockGetLogs.mockResolvedValueOnce(page1).mockRejectedValueOnce(new Error('fail'));
      mockGetProduct.mockResolvedValue(sampleProduct);

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.loadingMore).toBe(false);
      });

      expect(result.current.hasMore).toBe(false);
    });
  });

  describe('detail loading', () => {
    it('fetches product details for product entries', async () => {
      mockGetLogs.mockResolvedValue([makeProductEntry('log-1', 1700000000)]);
      mockGetProduct.mockResolvedValue(sampleProduct);

      renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(mockGetProduct).toHaveBeenCalledWith('prod-1');
      });
    });

    it('fetches group details for group entries', async () => {
      mockGetLogs.mockResolvedValue([makeGroupEntry('log-1', 1700000000)]);
      mockGetGroup.mockResolvedValue(sampleGroupData);

      renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(mockGetGroup).toHaveBeenCalledWith('group-1');
      });
    });

    it('handles detail fetch errors gracefully', async () => {
      mockGetLogs.mockResolvedValue([makeProductEntry('log-1', 1700000000)]);
      mockGetProduct.mockRejectedValue(new Error('fail'));

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await waitFor(() => {
        expect(mockGetProduct).toHaveBeenCalled();
      });

      // Should not crash
      expect(result.current.productDetails).toEqual({});
    });
  });

  describe('nutrition resolution', () => {
    it('resolves nutrition for product entries after details load', async () => {
      mockGetLogs.mockResolvedValue([makeProductEntry('log-1', 1700000000)]);
      mockGetProduct.mockResolvedValue(sampleProduct);

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.entryNutritionById.has('log-1')).toBe(true);
      });

      const nutrition = result.current.entryNutritionById.get('log-1')!;
      expect(nutrition.calories!.amount).toBe(200);
    });

    it('resolves nutrition for group entries after details load', async () => {
      mockGetLogs.mockResolvedValue([makeGroupEntry('log-1', 1700000000)]);
      mockGetGroup.mockResolvedValue(sampleGroupData);

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.entryNutritionById.has('log-1')).toBe(true);
      });

      const nutrition = result.current.entryNutritionById.get('log-1')!;
      expect(nutrition.calories!.amount).toBe(150);
    });

    it('returns empty map when details never resolve', async () => {
      mockGetLogs.mockResolvedValue([makeProductEntry('log-1', 1700000000)]);
      // Return a promise that never resolves so details never load
      mockGetProduct.mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Details never load, so nutrition map should be empty
      expect(result.current.entryNutritionById.has('log-1')).toBe(false);
    });
  });

  describe('handleLogAgainClick', () => {
    it('fetches product and sets logTarget without editEntryId', async () => {
      mockGetLogs.mockResolvedValue([]);
      const entry = makeProductEntry('log-1', 1700000000);
      mockGetProduct.mockResolvedValue(sampleProduct);
      mockBuildLogTarget.mockReturnValue({
        name: 'Test Product',
        prepOrGroup: {} as never,
        initialServingSize: {} as never,
        productId: 'prod-1',
        preparationId: 'prep-1',
        editEntryId: 'log-1',
        initialTimestamp: 1700000000,
      });

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.handleLogAgainClick(entry);
      });

      expect(mockBuildLogTarget).toHaveBeenCalledWith(entry, sampleProduct, null);
      expect(result.current.logTarget).not.toHaveProperty('editEntryId');
      expect(result.current.logTarget).not.toHaveProperty('initialTimestamp');
    });

    it('fetches group for group entries', async () => {
      mockGetLogs.mockResolvedValue([]);
      const entry = makeGroupEntry('log-1', 1700000000);
      mockGetGroup.mockResolvedValue(sampleGroupData);
      mockBuildLogTarget.mockReturnValue({
        name: 'Test Group',
        prepOrGroup: {} as never,
        initialServingSize: {} as never,
        groupId: 'group-1',
        editEntryId: 'log-1',
        initialTimestamp: 1700000000,
      });

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.handleLogAgainClick(entry);
      });

      expect(mockGetGroup).toHaveBeenCalledWith('group-1');
    });

    it('manages logAgainLoadingId state', async () => {
      mockGetLogs.mockResolvedValue([]);
      const entry = makeProductEntry('log-1', 1700000000);
      let resolveProduct: (p: ApiProduct) => void;
      mockGetProduct.mockReturnValue(
        new Promise<ApiProduct>((r) => {
          resolveProduct = r;
        }),
      );
      mockBuildLogTarget.mockReturnValue(null);

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let promise: Promise<void>;
      act(() => {
        promise = result.current.handleLogAgainClick(entry);
      });

      expect(result.current.logAgainLoadingId).toBe('log-1');

      await act(async () => {
        resolveProduct!(sampleProduct);
        await promise!;
      });

      expect(result.current.logAgainLoadingId).toBeNull();
    });

    it('does not set logTarget when buildLogTarget returns null', async () => {
      mockGetLogs.mockResolvedValue([]);
      const entry = makeProductEntry('log-1', 1700000000);
      mockGetProduct.mockResolvedValue(sampleProduct);
      mockBuildLogTarget.mockReturnValue(null);

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.handleLogAgainClick(entry);
      });

      expect(result.current.logTarget).toBeNull();
    });
  });

  describe('handleEditClick', () => {
    it('fetches product and sets logTarget with editEntryId', async () => {
      mockGetLogs.mockResolvedValue([]);
      const entry = makeProductEntry('log-1', 1700000000);
      mockGetProduct.mockResolvedValue(sampleProduct);
      const target = {
        name: 'Test Product',
        prepOrGroup: {} as never,
        initialServingSize: {} as never,
        productId: 'prod-1',
        preparationId: 'prep-1',
        editEntryId: 'log-1',
        initialTimestamp: 1700000000,
      };
      mockBuildLogTarget.mockReturnValue(target);

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.handleEditClick(entry);
      });

      expect(result.current.logTarget).toEqual(target);
      expect(result.current.logTarget).toHaveProperty('editEntryId', 'log-1');
    });

    it('manages editLoadingId state', async () => {
      mockGetLogs.mockResolvedValue([]);
      const entry = makeProductEntry('log-1', 1700000000);
      let resolveProduct: (p: ApiProduct) => void;
      mockGetProduct.mockReturnValue(
        new Promise<ApiProduct>((r) => {
          resolveProduct = r;
        }),
      );
      mockBuildLogTarget.mockReturnValue(null);

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let promise: Promise<void>;
      act(() => {
        promise = result.current.handleEditClick(entry);
      });

      expect(result.current.editLoadingId).toBe('log-1');

      await act(async () => {
        resolveProduct!(sampleProduct);
        await promise!;
      });

      expect(result.current.editLoadingId).toBeNull();
    });
  });

  describe('handleDeleteClick', () => {
    it('calls deleteLog and removes entry from logs', async () => {
      const entries = [
        makeProductEntry('log-1', 1700000000),
        makeProductEntry('log-2', 1699900000),
      ];
      mockGetLogs.mockResolvedValue(entries);
      mockGetProduct.mockResolvedValue(sampleProduct);
      mockDeleteLog.mockResolvedValue(undefined);

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.handleDeleteClick(entries[0]);
      });

      expect(mockDeleteLog).toHaveBeenCalledWith('log-1');
      expect(result.current.logs).toHaveLength(1);
      expect(result.current.logs[0].id).toBe('log-2');
    });

    it('manages deleteLoadingId state', async () => {
      mockGetLogs.mockResolvedValue([]);
      let resolveDelete: () => void;
      mockDeleteLog.mockReturnValue(
        new Promise<void>((r) => {
          resolveDelete = r;
        }),
      );

      const entry = makeProductEntry('log-1', 1700000000);
      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let promise: Promise<void>;
      act(() => {
        promise = result.current.handleDeleteClick(entry);
      });

      expect(result.current.deleteLoadingId).toBe('log-1');

      await act(async () => {
        resolveDelete!();
        await promise!;
      });

      expect(result.current.deleteLoadingId).toBeNull();
    });

    it('sets deleteLoadingId to null on error', async () => {
      mockGetLogs.mockResolvedValue([]);
      mockDeleteLog.mockRejectedValue(new Error('fail'));

      const entry = makeProductEntry('log-1', 1700000000);
      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.handleDeleteClick(entry).catch(() => {});
      });

      expect(result.current.deleteLoadingId).toBeNull();
    });
  });

  describe('handleSaved', () => {
    it('resets and reloads data', async () => {
      const page1 = [makeProductEntry('log-1', 1700000000)];
      const page2 = [makeProductEntry('log-2', 1700000001)];
      mockGetLogs.mockResolvedValueOnce(page1).mockResolvedValueOnce(page2);
      mockGetProduct.mockResolvedValue(sampleProduct);

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.logs[0].id).toBe('log-1');

      act(() => {
        result.current.handleSaved();
      });

      await waitFor(() => {
        expect(result.current.logs[0].id).toBe('log-2');
      });

      // getLogs called twice: initial load + after save
      expect(mockGetLogs).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleModalClose', () => {
    it('clears logTarget', async () => {
      mockGetLogs.mockResolvedValue([]);
      const entry = makeProductEntry('log-1', 1700000000);
      mockGetProduct.mockResolvedValue(sampleProduct);
      mockBuildLogTarget.mockReturnValue({
        name: 'Test Product',
        prepOrGroup: {} as never,
        initialServingSize: {} as never,
        editEntryId: 'log-1',
        initialTimestamp: 1700000000,
      });

      const { result } = renderHook(() => useInfiniteHistoryData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.handleEditClick(entry);
      });
      expect(result.current.logTarget).not.toBeNull();

      act(() => {
        result.current.handleModalClose();
      });

      expect(result.current.logTarget).toBeNull();
    });
  });
});
