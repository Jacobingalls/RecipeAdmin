import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import type { ApiSearchResult } from '../../api';
import * as api from '../../api';
import type { GroupItem } from '../../domain';

import ItemModal from './ItemModal';

vi.mock('../../api', () => ({
  searchItems: vi.fn(),
}));

const mockSearchItems = vi.mocked(api.searchItems);

const onSave = vi.fn();
const onClose = vi.fn();

const productResult: ApiSearchResult = {
  item: {
    product: {
      id: 'prod-1',
      name: 'Oats',
      brand: 'BrandA',
      barcodes: [],
      preparations: [
        {
          id: 'prep-1',
          name: 'Dry',
          nutritionalInformation: { calories: { amount: 150, unit: 'kcal' } },
          mass: { amount: 40, unit: 'g' },
        },
        {
          id: 'prep-2',
          name: 'Cooked',
          nutritionalInformation: { calories: { amount: 100, unit: 'kcal' } },
          mass: { amount: 200, unit: 'g' },
        },
      ],
      notes: [],
    },
  },
  servingSize: { kind: 'servings', amount: 1 },
  relevance: 1,
};

const groupResult: ApiSearchResult = {
  item: {
    group: {
      id: 'grp-1',
      name: 'Overnight Oats',
      brand: 'Homemade',
      items: [],
    },
  },
  servingSize: { kind: 'servings', amount: 2 },
  relevance: 0.9,
};

const existingProductItem: GroupItem = {
  product: {
    id: 'prod-1',
    name: 'Oats',
    brand: 'BrandA',
    preparations: [
      {
        id: 'prep-1',
        name: 'Dry',
        nutritionalInformation: { calories: { amount: 150, unit: 'kcal' } },
        mass: { amount: 40, unit: 'g' },
      },
      {
        id: 'prep-2',
        name: 'Cooked',
        nutritionalInformation: { calories: { amount: 100, unit: 'kcal' } },
        mass: { amount: 200, unit: 'g' },
      },
    ],
  },
  preparationID: 'prep-2',
  servingSize: { kind: 'mass', amount: { amount: 100, unit: 'g' } },
};

const existingGroupItem: GroupItem = {
  group: {
    id: 'grp-1',
    name: 'Overnight Oats',
    brand: 'Homemade',
    items: [],
  },
  servingSize: { kind: 'servings', amount: 3 },
};

function renderModal(item?: GroupItem) {
  return render(<ItemModal item={item} onSave={onSave} onClose={onClose} />);
}

describe('ItemModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('add mode', () => {
    it('renders with "Add item" title and search input', () => {
      renderModal();
      expect(screen.getByRole('heading', { name: 'Add item' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search products and groups...')).toBeInTheDocument();
    });

    it('has disabled Add button when no item is selected', () => {
      renderModal();
      expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
    });

    it('does not show config controls initially', () => {
      renderModal();
      expect(screen.queryByText('Serving size')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Clear selection')).not.toBeInTheDocument();
    });

    it('searches and displays results after typing', async () => {
      mockSearchItems.mockResolvedValue([productResult, groupResult]);
      renderModal();

      fireEvent.change(screen.getByPlaceholderText('Search products and groups...'), {
        target: { value: 'oats' },
      });

      await vi.advanceTimersByTimeAsync(300);
      await waitFor(() => {
        expect(mockSearchItems).toHaveBeenCalledWith('oats');
      });

      await waitFor(() => {
        expect(screen.getByText('Oats')).toBeInTheDocument();
        expect(screen.getByText('Overnight Oats')).toBeInTheDocument();
      });
    });

    it('shows selection and config after selecting a product result', async () => {
      mockSearchItems.mockResolvedValue([productResult]);
      renderModal();

      fireEvent.change(screen.getByPlaceholderText('Search products and groups...'), {
        target: { value: 'oats' },
      });
      await vi.advanceTimersByTimeAsync(300);

      await waitFor(() => expect(screen.getByText('Oats')).toBeInTheDocument());
      fireEvent.click(screen.getByText('Oats'));

      // Selection indicator visible
      expect(screen.getByLabelText('Clear selection')).toBeInTheDocument();
      // Config controls visible
      expect(screen.getByText('Serving size')).toBeInTheDocument();
      // Prep selector visible (product has 2 preps)
      expect(screen.getByLabelText('Preparation')).toBeInTheDocument();
      // Add button enabled
      expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
    });

    it('shows selection without prep selector for groups', async () => {
      mockSearchItems.mockResolvedValue([groupResult]);
      renderModal();

      fireEvent.change(screen.getByPlaceholderText('Search products and groups...'), {
        target: { value: 'overnight' },
      });
      await vi.advanceTimersByTimeAsync(300);

      await waitFor(() => expect(screen.getByText('Overnight Oats')).toBeInTheDocument());
      fireEvent.click(screen.getByText('Overnight Oats'));

      expect(screen.getByLabelText('Clear selection')).toBeInTheDocument();
      expect(screen.getByText('Serving size')).toBeInTheDocument();
      expect(screen.queryByLabelText('Preparation')).not.toBeInTheDocument();
    });

    it('clears selection when clear button is clicked', async () => {
      mockSearchItems.mockResolvedValue([productResult]);
      renderModal();

      fireEvent.change(screen.getByPlaceholderText('Search products and groups...'), {
        target: { value: 'oats' },
      });
      await vi.advanceTimersByTimeAsync(300);
      await waitFor(() => expect(screen.getByText('Oats')).toBeInTheDocument());
      fireEvent.click(screen.getByText('Oats'));

      expect(screen.getByText('Serving size')).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Clear selection'));

      expect(screen.queryByText('Serving size')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
    });

    it('emits correct GroupItem for a product on save', async () => {
      mockSearchItems.mockResolvedValue([productResult]);
      renderModal();

      fireEvent.change(screen.getByPlaceholderText('Search products and groups...'), {
        target: { value: 'oats' },
      });
      await vi.advanceTimersByTimeAsync(300);
      await waitFor(() => expect(screen.getByText('Oats')).toBeInTheDocument());
      fireEvent.click(screen.getByText('Oats'));

      fireEvent.click(screen.getByRole('button', { name: 'Add' }));

      expect(onSave).toHaveBeenCalledTimes(1);
      const saved = onSave.mock.calls[0][0] as GroupItem;
      expect(saved.product?.id).toBe('prod-1');
      expect(saved.preparationID).toBe('prep-1');
      expect(saved.servingSize).toBeDefined();
    });

    it('emits correct GroupItem for a group on save', async () => {
      mockSearchItems.mockResolvedValue([groupResult]);
      renderModal();

      fireEvent.change(screen.getByPlaceholderText('Search products and groups...'), {
        target: { value: 'overnight' },
      });
      await vi.advanceTimersByTimeAsync(300);
      await waitFor(() => expect(screen.getByText('Overnight Oats')).toBeInTheDocument());
      fireEvent.click(screen.getByText('Overnight Oats'));

      fireEvent.click(screen.getByRole('button', { name: 'Add' }));

      expect(onSave).toHaveBeenCalledTimes(1);
      const saved = onSave.mock.calls[0][0] as GroupItem;
      expect(saved.group?.id).toBe('grp-1');
      expect(saved.preparationID).toBeUndefined();
      expect(saved.servingSize).toBeDefined();
    });

    it('calls onClose when Cancel is clicked', () => {
      renderModal();
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('edit mode', () => {
    it('renders with "Edit item" title and Save button', () => {
      renderModal(existingProductItem);
      expect(screen.getByRole('heading', { name: 'Edit item' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    });

    it('pre-populates selection for a product item', () => {
      renderModal(existingProductItem);
      expect(screen.getByText('Oats')).toBeInTheDocument();
      expect(screen.getByLabelText('Clear selection')).toBeInTheDocument();
      expect(screen.getByText('Serving size')).toBeInTheDocument();
    });

    it('pre-populates prep selector with current preparation', () => {
      renderModal(existingProductItem);
      const prepSelect = screen.getByLabelText('Preparation') as HTMLSelectElement;
      expect(prepSelect.value).toBe('prep-2');
    });

    it('pre-populates selection for a group item', () => {
      renderModal(existingGroupItem);
      expect(screen.getByText('Overnight Oats')).toBeInTheDocument();
      expect(screen.queryByLabelText('Preparation')).not.toBeInTheDocument();
    });

    it('emits updated GroupItem on save', () => {
      renderModal(existingProductItem);
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(onSave).toHaveBeenCalledTimes(1);
      const saved = onSave.mock.calls[0][0] as GroupItem;
      expect(saved.product?.id).toBe('prod-1');
      expect(saved.preparationID).toBe('prep-2');
    });

    it('allows changing selection via search', async () => {
      mockSearchItems.mockResolvedValue([groupResult]);
      renderModal(existingProductItem);

      // Originally showing product
      expect(screen.getByText('Oats')).toBeInTheDocument();

      fireEvent.change(screen.getByPlaceholderText('Search products and groups...'), {
        target: { value: 'overnight' },
      });
      await vi.advanceTimersByTimeAsync(300);
      await waitFor(() => expect(screen.getByText('Overnight Oats')).toBeInTheDocument());

      // Click the search result (not the selection indicator)
      const resultButtons = screen.getAllByRole('button', { name: /Overnight Oats/i });
      const searchResultBtn = resultButtons.find((btn) =>
        btn.classList.contains('list-group-item-action'),
      );
      fireEvent.click(searchResultBtn!);

      // Selection changed
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
      const saved = onSave.mock.calls[0][0] as GroupItem;
      expect(saved.group?.id).toBe('grp-1');
      expect(saved.product).toBeUndefined();
    });

    it('does not show prep selector for product with single preparation', () => {
      const singlePrepItem: GroupItem = {
        product: {
          id: 'prod-2',
          name: 'Milk',
          brand: 'BrandB',
          preparations: [{ id: 'prep-only', name: 'Default' }],
        },
        preparationID: 'prep-only',
        servingSize: { kind: 'servings', amount: 1 },
      };
      renderModal(singlePrepItem);
      expect(screen.queryByLabelText('Preparation')).not.toBeInTheDocument();
    });
  });

  describe('search behavior', () => {
    it('does not search for queries shorter than 2 characters', async () => {
      renderModal();

      fireEvent.change(screen.getByPlaceholderText('Search products and groups...'), {
        target: { value: 'o' },
      });
      await vi.advanceTimersByTimeAsync(300);

      await waitFor(() => {
        expect(mockSearchItems).not.toHaveBeenCalled();
      });
    });

    it('shows "No results" when search returns empty', async () => {
      mockSearchItems.mockResolvedValue([]);
      renderModal();

      fireEvent.change(screen.getByPlaceholderText('Search products and groups...'), {
        target: { value: 'xyz' },
      });
      await vi.advanceTimersByTimeAsync(300);

      await waitFor(() => {
        expect(screen.getByText('No results')).toBeInTheDocument();
      });
    });

    it('shows searching indicator', async () => {
      let resolveSearch: (value: ApiSearchResult[]) => void;
      mockSearchItems.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveSearch = resolve;
          }),
      );
      renderModal();

      fireEvent.change(screen.getByPlaceholderText('Search products and groups...'), {
        target: { value: 'oats' },
      });
      await vi.advanceTimersByTimeAsync(300);

      await waitFor(() => {
        expect(screen.getByText('Searching...')).toBeInTheDocument();
      });

      resolveSearch!([]);
      await waitFor(() => {
        expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
      });
    });
  });
});
