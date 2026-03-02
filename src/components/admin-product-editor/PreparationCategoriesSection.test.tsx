import { render, screen, fireEvent } from '@testing-library/react';

import type { ApiProduct, ApiCategory } from '../../api';

import PreparationCategoriesSection from './PreparationCategoriesSection';

const testCategories: ApiCategory[] = [
  {
    id: 'cat-1',
    slug: 'dairy',
    displayName: 'Dairy',
    description: null,
    parents: [],
    children: [],
    notes: [],
  },
  {
    id: 'cat-2',
    slug: 'protein',
    displayName: 'Protein',
    description: null,
    parents: [],
    children: [],
    notes: [],
  },
  {
    id: 'cat-3',
    slug: 'snacks',
    displayName: 'Snacks',
    description: null,
    parents: [],
    children: [],
    notes: [],
  },
];

vi.mock('../../contexts/CategoriesContext', () => ({
  useCategories: () => ({
    allCategories: testCategories,
    lookup: new Map(testCategories.map((c) => [c.id, c])),
    addCategories: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('../../utils', () => ({
  buildSlugPath: (id: string) => `/${id}`,
}));

vi.mock('../admin-category-detail', () => ({
  CreateCategoryModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="create-category-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

const onChange = vi.fn();

const sampleProduct: ApiProduct = {
  id: 'p1',
  name: 'Butter',
  brand: '',
  barcodes: [],
  preparations: [
    {
      id: 'prep-1',
      name: 'Default',
      categories: ['cat-1', 'cat-2'],
    },
  ],
  notes: [],
};

function renderSection(product = sampleProduct) {
  return render(
    <PreparationCategoriesSection product={product} preparationId="prep-1" onChange={onChange} />,
  );
}

describe('PreparationCategoriesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders assigned categories', () => {
    renderSection();
    expect(screen.getByText('Dairy')).toBeInTheDocument();
    expect(screen.getByText('Protein')).toBeInTheDocument();
  });

  it('renders delete buttons for each category', () => {
    renderSection();
    expect(screen.getByLabelText('Remove Dairy')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove Protein')).toBeInTheDocument();
  });

  it('renders Add dropdown', () => {
    renderSection();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('shows empty state when no categories', () => {
    const product: ApiProduct = {
      ...sampleProduct,
      preparations: [{ id: 'prep-1', name: 'Default', categories: [] }],
    };
    renderSection(product);
    expect(screen.getByText('No categories')).toBeInTheDocument();
  });

  it('calls onChange when a category is removed', () => {
    renderSection();
    fireEvent.click(screen.getByLabelText('Remove Dairy'));
    expect(onChange).toHaveBeenCalled();
    const passedProduct = onChange.mock.calls[0][0] as ApiProduct;
    expect(passedProduct.preparations[0].categories).toEqual(['cat-2']);
  });

  it('returns null when prep not found', () => {
    const { container } = render(
      <PreparationCategoriesSection
        product={sampleProduct}
        preparationId="nonexistent"
        onChange={onChange}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
