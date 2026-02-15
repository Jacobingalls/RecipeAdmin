import { renderHook, waitFor, act } from '@testing-library/react';

import type { ApiLogEntry, ApiProduct } from '../api';
import { getProduct, getGroup, deleteLog } from '../api';
import type { ProductGroupData } from '../domain';
import { buildLogTarget } from '../utils/logEntryHelpers';

import type { UseApiQueryResult } from './useApiQuery';
import { useApiQuery } from './useApiQuery';
import { useHistoryData } from './useHistoryData';

vi.mock('../api', () => ({
  getLogs: vi.fn(),
  getProduct: vi.fn(),
  getGroup: vi.fn(),
  deleteLog: vi.fn(),
}));

vi.mock('./useApiQuery', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('../utils/logEntryHelpers', () => ({
  buildLogTarget: vi.fn(),
}));

const mockUseApiQuery = vi.mocked(useApiQuery);
const mockGetProduct = vi.mocked(getProduct);
const mockGetGroup = vi.mocked(getGroup);
const mockDeleteLog = vi.mocked(deleteLog);
const mockBuildLogTarget = vi.mocked(buildLogTarget);

function mockQuery(overrides: Partial<UseApiQueryResult<ApiLogEntry[]>> = {}) {
  mockUseApiQuery.mockReturnValue({
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as UseApiQueryResult<ApiLogEntry[]>);
}

function makeProductEntry(overrides: Partial<ApiLogEntry> = {}): ApiLogEntry {
  return {
    id: 'log-1',
    timestamp: 1700000000,
    userID: 'user-1',
    item: {
      kind: 'product',
      productID: 'prod-1',
      preparationID: 'prep-1',
      servingSize: { servings: 2 },
    },
    ...overrides,
  };
}

function makeGroupEntry(overrides: Partial<ApiLogEntry> = {}): ApiLogEntry {
  return {
    id: 'log-2',
    timestamp: 1700000000,
    userID: 'user-1',
    item: {
      kind: 'group',
      groupID: 'group-1',
      servingSize: { servings: 1 },
    },
    ...overrides,
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

describe('useHistoryData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery();
  });

  describe('initial state', () => {
    it('passes loading state from useApiQuery', () => {
      mockQuery({ loading: true });
      const { result } = renderHook(() => useHistoryData());

      expect(result.current.loading).toBe(true);
      expect(result.current.logs).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('passes error state from useApiQuery', () => {
      mockQuery({ error: "Couldn't load history. Try again later." });
      const { result } = renderHook(() => useHistoryData());

      expect(result.current.error).toBe("Couldn't load history. Try again later.");
    });

    it('returns empty product and group details initially', () => {
      const { result } = renderHook(() => useHistoryData());

      expect(result.current.productDetails).toEqual({});
      expect(result.current.groupDetails).toEqual({});
    });

    it('returns empty nutrition map initially', () => {
      const { result } = renderHook(() => useHistoryData());

      expect(result.current.entryNutritionById.size).toBe(0);
    });

    it('returns null logTarget initially', () => {
      const { result } = renderHook(() => useHistoryData());

      expect(result.current.logTarget).toBeNull();
    });

    it('returns false for all action loading states', () => {
      const { result } = renderHook(() => useHistoryData());

      expect(result.current.logAgainLoading).toBe(false);
      expect(result.current.editLoading).toBe(false);
      expect(result.current.deleteLoading).toBe(false);
    });
  });

  describe('useApiQuery configuration', () => {
    it('calls useApiQuery with an error message', () => {
      renderHook(() => useHistoryData());

      expect(mockUseApiQuery).toHaveBeenCalledWith(expect.any(Function), [undefined, undefined], {
        errorMessage: "Couldn't load history. Try again later.",
      });
    });

    it('passes limit and limitDays options', () => {
      renderHook(() => useHistoryData({ limit: 10, limitDays: 7 }));

      expect(mockUseApiQuery).toHaveBeenCalledWith(expect.any(Function), [10, 7], {
        errorMessage: "Couldn't load history. Try again later.",
      });
    });

    it('exposes refetch from useApiQuery', () => {
      const refetchFn = vi.fn();
      mockQuery({ refetch: refetchFn });

      const { result } = renderHook(() => useHistoryData());

      expect(result.current.refetchLogs).toBe(refetchFn);
    });
  });

  describe('detail loading', () => {
    it('fetches product details when logs contain product entries', async () => {
      const entry = makeProductEntry();
      mockQuery({ data: [entry] });
      mockGetProduct.mockResolvedValue(sampleProduct);

      renderHook(() => useHistoryData());

      await waitFor(() => {
        expect(mockGetProduct).toHaveBeenCalledWith('prod-1');
      });
    });

    it('fetches group details when logs contain group entries', async () => {
      const entry = makeGroupEntry();
      mockQuery({ data: [entry] });
      mockGetGroup.mockResolvedValue(sampleGroupData);

      renderHook(() => useHistoryData());

      await waitFor(() => {
        expect(mockGetGroup).toHaveBeenCalledWith('group-1');
      });
    });

    it('deduplicates product IDs across entries', async () => {
      const entry1 = makeProductEntry({ id: 'log-1' });
      const entry2 = makeProductEntry({ id: 'log-2' });
      mockQuery({ data: [entry1, entry2] });
      mockGetProduct.mockResolvedValue(sampleProduct);

      renderHook(() => useHistoryData());

      await waitFor(() => {
        expect(mockGetProduct).toHaveBeenCalledTimes(1);
      });
    });

    it('does not fetch details when logs are null', () => {
      mockQuery({ data: null });

      renderHook(() => useHistoryData());

      expect(mockGetProduct).not.toHaveBeenCalled();
      expect(mockGetGroup).not.toHaveBeenCalled();
    });

    it('does not fetch details when logs are empty', () => {
      mockQuery({ data: [] });

      renderHook(() => useHistoryData());

      expect(mockGetProduct).not.toHaveBeenCalled();
      expect(mockGetGroup).not.toHaveBeenCalled();
    });

    it('handles product fetch errors gracefully', async () => {
      const entry = makeProductEntry();
      mockQuery({ data: [entry] });
      mockGetProduct.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useHistoryData());

      await waitFor(() => {
        expect(mockGetProduct).toHaveBeenCalled();
      });

      // Should not crash; product details remain empty
      expect(result.current.productDetails).toEqual({});
    });

    it('handles group fetch errors gracefully', async () => {
      const entry = makeGroupEntry();
      mockQuery({ data: [entry] });
      mockGetGroup.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useHistoryData());

      await waitFor(() => {
        expect(mockGetGroup).toHaveBeenCalled();
      });

      expect(result.current.groupDetails).toEqual({});
    });
  });

  describe('nutrition resolution', () => {
    it('resolves nutrition for product entries', async () => {
      const entry = makeProductEntry();
      mockQuery({ data: [entry] });
      mockGetProduct.mockResolvedValue(sampleProduct);

      const { result } = renderHook(() => useHistoryData());

      await waitFor(() => {
        expect(result.current.entryNutritionById.has('log-1')).toBe(true);
      });

      const nutrition = result.current.entryNutritionById.get('log-1')!;
      // 2 servings * 200 kcal = 400 kcal
      expect(nutrition.calories!.amount).toBe(400);
    });

    it('resolves nutrition for group entries', async () => {
      const entry = makeGroupEntry();
      mockQuery({ data: [entry] });
      mockGetGroup.mockResolvedValue(sampleGroupData);

      const { result } = renderHook(() => useHistoryData());

      await waitFor(() => {
        expect(result.current.entryNutritionById.has('log-2')).toBe(true);
      });

      const nutrition = result.current.entryNutritionById.get('log-2')!;
      expect(nutrition.calories!.amount).toBe(150);
    });

    it('returns null nutrition when product has no preparations', async () => {
      const entry = makeProductEntry();
      const productNoPrepData: ApiProduct = { id: 'prod-1', name: 'No Prep', preparations: [] };
      mockQuery({ data: [entry] });
      mockGetProduct.mockResolvedValue(productNoPrepData);

      const { result } = renderHook(() => useHistoryData());

      await waitFor(() => {
        expect(mockGetProduct).toHaveBeenCalled();
      });

      // Give time for state updates
      await waitFor(() => {
        expect(Object.keys(result.current.productDetails).length).toBeGreaterThan(0);
      });

      expect(result.current.entryNutritionById.has('log-1')).toBe(false);
    });

    it('falls back to first preparation when preparationID does not match', async () => {
      const entry = makeProductEntry({
        item: {
          kind: 'product',
          productID: 'prod-1',
          preparationID: 'nonexistent-prep',
          servingSize: { servings: 1 },
        },
      });
      mockQuery({ data: [entry] });
      mockGetProduct.mockResolvedValue(sampleProduct);

      const { result } = renderHook(() => useHistoryData());

      await waitFor(() => {
        expect(result.current.entryNutritionById.has('log-1')).toBe(true);
      });

      // Falls back to first prep (200 kcal)
      const nutrition = result.current.entryNutritionById.get('log-1')!;
      expect(nutrition.calories!.amount).toBe(200);
    });

    it('returns null nutrition when product details not yet loaded', () => {
      const entry = makeProductEntry();
      mockQuery({ data: [entry] });

      const { result } = renderHook(() => useHistoryData());

      expect(result.current.entryNutritionById.has('log-1')).toBe(false);
    });

    it('returns null nutrition when group details not yet loaded', () => {
      const entry = makeGroupEntry();
      mockQuery({ data: [entry] });

      const { result } = renderHook(() => useHistoryData());

      expect(result.current.entryNutritionById.has('log-2')).toBe(false);
    });

    it('returns null nutrition for entries with unknown kind', () => {
      const entry: ApiLogEntry = {
        id: 'log-x',
        timestamp: 1700000000,
        userID: 'user-1',
        item: {
          kind: 'unknown',
          servingSize: { servings: 1 },
        },
      };
      mockQuery({ data: [entry] });

      const { result } = renderHook(() => useHistoryData());

      expect(result.current.entryNutritionById.has('log-x')).toBe(false);
    });
  });

  describe('handleLogAgainClick', () => {
    it('fetches product and sets logTarget without editEntryId', async () => {
      mockQuery({ data: [] });
      const entry = makeProductEntry();
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

      const { result } = renderHook(() => useHistoryData());

      await act(async () => {
        await result.current.handleLogAgainClick(entry);
      });

      expect(mockGetProduct).toHaveBeenCalledWith('prod-1');
      expect(mockBuildLogTarget).toHaveBeenCalledWith(entry, sampleProduct, null);

      // logTarget should NOT have editEntryId or initialTimestamp (it's "log again", not edit)
      expect(result.current.logTarget).not.toHaveProperty('editEntryId');
      expect(result.current.logTarget).not.toHaveProperty('initialTimestamp');
      expect(result.current.logTarget).toHaveProperty('name', 'Test Product');
    });

    it('fetches group for group entries', async () => {
      mockQuery({ data: [] });
      const entry = makeGroupEntry();
      mockGetGroup.mockResolvedValue(sampleGroupData);
      mockBuildLogTarget.mockReturnValue({
        name: 'Test Group',
        prepOrGroup: {} as never,
        initialServingSize: {} as never,
        groupId: 'group-1',
        editEntryId: 'log-2',
        initialTimestamp: 1700000000,
      });

      const { result } = renderHook(() => useHistoryData());

      await act(async () => {
        await result.current.handleLogAgainClick(entry);
      });

      expect(mockGetGroup).toHaveBeenCalledWith('group-1');
      expect(mockBuildLogTarget).toHaveBeenCalledWith(entry, null, sampleGroupData);
    });

    it('manages logAgainLoading state', async () => {
      mockQuery({ data: [] });
      const entry = makeProductEntry();
      let resolveProduct: (p: ApiProduct) => void;
      mockGetProduct.mockReturnValue(
        new Promise<ApiProduct>((r) => {
          resolveProduct = r;
        }),
      );
      mockBuildLogTarget.mockReturnValue(null);

      const { result } = renderHook(() => useHistoryData());

      let promise: Promise<void>;
      act(() => {
        promise = result.current.handleLogAgainClick(entry);
      });

      expect(result.current.logAgainLoading).toBe(true);

      await act(async () => {
        resolveProduct!(sampleProduct);
        await promise!;
      });

      expect(result.current.logAgainLoading).toBe(false);
    });

    it('sets logAgainLoading to false even on error', async () => {
      mockQuery({ data: [] });
      const entry = makeProductEntry();
      mockGetProduct.mockRejectedValue(new Error('fail'));

      const { result } = renderHook(() => useHistoryData());

      await act(async () => {
        await result.current.handleLogAgainClick(entry).catch(() => {});
      });

      expect(result.current.logAgainLoading).toBe(false);
    });

    it('does not set logTarget when buildLogTarget returns null', async () => {
      mockQuery({ data: [] });
      const entry = makeProductEntry();
      mockGetProduct.mockResolvedValue(sampleProduct);
      mockBuildLogTarget.mockReturnValue(null);

      const { result } = renderHook(() => useHistoryData());

      await act(async () => {
        await result.current.handleLogAgainClick(entry);
      });

      expect(result.current.logTarget).toBeNull();
    });
  });

  describe('handleEditClick', () => {
    it('fetches product and sets logTarget with editEntryId', async () => {
      mockQuery({ data: [] });
      const entry = makeProductEntry();
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

      const { result } = renderHook(() => useHistoryData());

      await act(async () => {
        await result.current.handleEditClick(entry);
      });

      expect(result.current.logTarget).toEqual(target);
      expect(result.current.logTarget).toHaveProperty('editEntryId', 'log-1');
    });

    it('fetches group for group entries', async () => {
      mockQuery({ data: [] });
      const entry = makeGroupEntry();
      mockGetGroup.mockResolvedValue(sampleGroupData);
      mockBuildLogTarget.mockReturnValue({
        name: 'Test Group',
        prepOrGroup: {} as never,
        initialServingSize: {} as never,
        groupId: 'group-1',
        editEntryId: 'log-2',
        initialTimestamp: 1700000000,
      });

      const { result } = renderHook(() => useHistoryData());

      await act(async () => {
        await result.current.handleEditClick(entry);
      });

      expect(mockGetGroup).toHaveBeenCalledWith('group-1');
    });

    it('manages editLoading state', async () => {
      mockQuery({ data: [] });
      const entry = makeProductEntry();
      let resolveProduct: (p: ApiProduct) => void;
      mockGetProduct.mockReturnValue(
        new Promise<ApiProduct>((r) => {
          resolveProduct = r;
        }),
      );
      mockBuildLogTarget.mockReturnValue(null);

      const { result } = renderHook(() => useHistoryData());

      let promise: Promise<void>;
      act(() => {
        promise = result.current.handleEditClick(entry);
      });

      expect(result.current.editLoading).toBe(true);

      await act(async () => {
        resolveProduct!(sampleProduct);
        await promise!;
      });

      expect(result.current.editLoading).toBe(false);
    });

    it('sets editLoading to false even on error', async () => {
      mockQuery({ data: [] });
      const entry = makeProductEntry();
      mockGetProduct.mockRejectedValue(new Error('fail'));

      const { result } = renderHook(() => useHistoryData());

      await act(async () => {
        await result.current.handleEditClick(entry).catch(() => {});
      });

      expect(result.current.editLoading).toBe(false);
    });
  });

  describe('handleDeleteClick', () => {
    it('calls deleteLog and refetches', async () => {
      const refetchFn = vi.fn();
      mockQuery({ data: [], refetch: refetchFn });
      mockDeleteLog.mockResolvedValue(undefined);

      const entry = makeProductEntry();

      const { result } = renderHook(() => useHistoryData());

      await act(async () => {
        await result.current.handleDeleteClick(entry);
      });

      expect(mockDeleteLog).toHaveBeenCalledWith('log-1');
      expect(refetchFn).toHaveBeenCalled();
    });

    it('manages deleteLoading state', async () => {
      const refetchFn = vi.fn();
      mockQuery({ data: [], refetch: refetchFn });
      let resolveDelete: () => void;
      mockDeleteLog.mockReturnValue(
        new Promise<void>((r) => {
          resolveDelete = r;
        }),
      );

      const entry = makeProductEntry();
      const { result } = renderHook(() => useHistoryData());

      let promise: Promise<void>;
      act(() => {
        promise = result.current.handleDeleteClick(entry);
      });

      expect(result.current.deleteLoading).toBe(true);

      await act(async () => {
        resolveDelete!();
        await promise!;
      });

      expect(result.current.deleteLoading).toBe(false);
    });

    it('sets deleteLoading to false even on error', async () => {
      const refetchFn = vi.fn();
      mockQuery({ data: [], refetch: refetchFn });
      mockDeleteLog.mockRejectedValue(new Error('fail'));

      const entry = makeProductEntry();
      const { result } = renderHook(() => useHistoryData());

      await act(async () => {
        await result.current.handleDeleteClick(entry).catch(() => {});
      });

      expect(result.current.deleteLoading).toBe(false);
    });
  });

  describe('handleSaved', () => {
    it('calls refetchLogs', () => {
      const refetchFn = vi.fn();
      mockQuery({ data: [], refetch: refetchFn });

      const { result } = renderHook(() => useHistoryData());

      act(() => {
        result.current.handleSaved();
      });

      expect(refetchFn).toHaveBeenCalled();
    });
  });

  describe('handleModalClose', () => {
    it('clears logTarget', async () => {
      mockQuery({ data: [] });
      const entry = makeProductEntry();
      mockGetProduct.mockResolvedValue(sampleProduct);
      mockBuildLogTarget.mockReturnValue({
        name: 'Test Product',
        prepOrGroup: {} as never,
        initialServingSize: {} as never,
        editEntryId: 'log-1',
        initialTimestamp: 1700000000,
      });

      const { result } = renderHook(() => useHistoryData());

      // First set a logTarget via edit
      await act(async () => {
        await result.current.handleEditClick(entry);
      });
      expect(result.current.logTarget).not.toBeNull();

      // Then close the modal
      act(() => {
        result.current.handleModalClose();
      });

      expect(result.current.logTarget).toBeNull();
    });
  });
});
