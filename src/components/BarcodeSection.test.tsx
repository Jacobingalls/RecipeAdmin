import type { ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { BarcodeData } from '../domain';

import BarcodeSection from './BarcodeSection';

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

const barcode: BarcodeData = {
  code: '0123456789',
  servingSize: { kind: 'servings', amount: 2 },
};

const barcodeWithNotes: BarcodeData = {
  code: '9876543210',
  notes: ['Note one', 'Note two'],
  servingSize: { kind: 'mass', amount: { amount: 100, unit: 'g' } },
};

const barcodeNoServing: BarcodeData = {
  code: '5555555555',
};

describe('BarcodeSection', () => {
  it('returns null when barcodes is undefined', () => {
    const { container } = renderWithRouter(<BarcodeSection />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when barcodes is empty', () => {
    const { container } = renderWithRouter(<BarcodeSection barcodes={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the section heading', () => {
    renderWithRouter(<BarcodeSection barcodes={[barcode]} />);
    expect(screen.getByText('Barcodes')).toBeInTheDocument();
  });

  it('renders barcode codes', () => {
    renderWithRouter(<BarcodeSection barcodes={[barcode, barcodeWithNotes]} />);
    expect(screen.getByText('0123456789')).toBeInTheDocument();
    expect(screen.getByText('9876543210')).toBeInTheDocument();
  });

  it('renders serving size description', () => {
    renderWithRouter(<BarcodeSection barcodes={[barcode]} />);
    expect(screen.getByText('2 servings')).toBeInTheDocument();
  });

  it('renders lookup links for each barcode', () => {
    renderWithRouter(<BarcodeSection barcodes={[barcode]} />);
    const lookupLink = screen.getByTitle('Look up barcode 0123456789');
    expect(lookupLink).toHaveAttribute('href', '/lookup/0123456789');
  });

  it('renders Use button when onSelectSize is provided', () => {
    const onSelectSize = vi.fn();
    renderWithRouter(<BarcodeSection barcodes={[barcode]} onSelectSize={onSelectSize} />);
    expect(screen.getByTitle(/Set serving to/)).toBeInTheDocument();
  });

  it('does not render Use button when onSelectSize is not provided', () => {
    renderWithRouter(<BarcodeSection barcodes={[barcode]} />);
    expect(screen.queryByTitle(/Set serving to/)).not.toBeInTheDocument();
  });

  it('calls onSelectSize with the serving size when Use is clicked', () => {
    const onSelectSize = vi.fn();
    renderWithRouter(<BarcodeSection barcodes={[barcode]} onSelectSize={onSelectSize} />);
    fireEvent.click(screen.getByTitle(/Set serving to/));
    expect(onSelectSize).toHaveBeenCalledTimes(1);
    const arg = onSelectSize.mock.calls[0][0];
    expect(arg.type).toBe('servings');
    expect(arg.amount).toBe(2);
  });

  it('renders notes when present', () => {
    renderWithRouter(<BarcodeSection barcodes={[barcodeWithNotes]} />);
    expect(screen.getByText('Note one')).toBeInTheDocument();
    expect(screen.getByText('Note two')).toBeInTheDocument();
  });

  it('does not render notes section when notes are absent', () => {
    renderWithRouter(<BarcodeSection barcodes={[barcode]} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('defaults to 1 serving when servingSize is missing', () => {
    renderWithRouter(<BarcodeSection barcodes={[barcodeNoServing]} />);
    expect(screen.getByText('1 serving')).toBeInTheDocument();
  });

  it('encodes barcode in lookup URL', () => {
    const specialBarcode: BarcodeData = { code: 'foo/bar' };
    renderWithRouter(<BarcodeSection barcodes={[specialBarcode]} />);
    const link = screen.getByTitle('Look up barcode foo/bar');
    expect(link).toHaveAttribute('href', '/lookup/foo%2Fbar');
  });
});
