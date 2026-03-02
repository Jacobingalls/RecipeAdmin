import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { ApiProduct } from '../../api';
import * as api from '../../api';

import ProductDangerZone from './ProductDangerZone';

vi.mock('../../api', () => ({
  adminDeleteProduct: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockDeleteProduct = vi.mocked(api.adminDeleteProduct);

const sampleProduct: ApiProduct = {
  id: 'p1',
  name: 'Peanut Butter',
  brand: 'NutCo',
  barcodes: [],
  preparations: [],
  notes: [],
};

function renderSection(product = sampleProduct) {
  return render(
    <MemoryRouter>
      <ProductDangerZone product={product} />
    </MemoryRouter>,
  );
}

describe('ProductDangerZone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders section header', () => {
    renderSection();
    expect(screen.getByRole('heading', { name: 'Product actions' })).toBeInTheDocument();
  });

  it('renders delete button', () => {
    renderSection();
    expect(screen.getByRole('button', { name: 'Delete product' })).toBeInTheDocument();
  });

  it('renders descriptive text', () => {
    renderSection();
    expect(
      screen.getByText(/This will permanently delete this product and all its data/),
    ).toBeInTheDocument();
  });

  it('opens delete confirmation modal', () => {
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: 'Delete product' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Delete product' })).toBeInTheDocument();
  });

  it('shows product name in confirmation message', () => {
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: 'Delete product' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Peanut Butter');
  });

  it('calls adminDeleteProduct and navigates on confirmation', async () => {
    mockDeleteProduct.mockResolvedValue(undefined);
    renderSection();

    fireEvent.click(screen.getByRole('button', { name: 'Delete product' }));
    fireEvent.change(screen.getByLabelText(/Type .* to confirm/), {
      target: { value: 'Peanut Butter' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Delete this product' }));
    });

    expect(mockDeleteProduct).toHaveBeenCalledWith('p1');
    expect(mockNavigate).toHaveBeenCalledWith('/admin/products');
  });

  it('shows error message when delete fails', async () => {
    mockDeleteProduct.mockRejectedValue(new Error('Server error'));
    renderSection();

    fireEvent.click(screen.getByRole('button', { name: 'Delete product' }));
    fireEvent.change(screen.getByLabelText(/Type .* to confirm/), {
      target: { value: 'Peanut Butter' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Delete this product' }));
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Server error');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows fallback error for non-Error throws', async () => {
    mockDeleteProduct.mockRejectedValue('unknown');
    renderSection();

    fireEvent.click(screen.getByRole('button', { name: 'Delete product' }));
    fireEvent.change(screen.getByLabelText(/Type .* to confirm/), {
      target: { value: 'Peanut Butter' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Delete this product' }));
    });

    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't delete this product. Try again.");
  });

  it('closes modal on cancel', () => {
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: 'Delete product' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
