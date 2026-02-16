import type { ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';

import NutritionRow from './NutritionRow';
import type { NutrientData } from './NutritionRow';

function renderRow(props: Partial<ComponentProps<typeof NutritionRow>> = {}) {
  const defaultNutrient: NutrientData = {
    formatted: '10g',
    percentDV: 13,
    dvFormatted: '78g',
  };
  return render(
    <table>
      <tbody>
        <NutritionRow label="Total Fat" nutrient={defaultNutrient} {...props} />
      </tbody>
    </table>,
  );
}

describe('NutritionRow', () => {
  it('renders null when nutrient is null-like', () => {
    const { container } = renderRow({
      nutrient: { formatted: null, percentDV: null, dvFormatted: null },
    });
    expect(container.querySelector('tr')).toBeNull();
  });

  it('renders null when formatted is null', () => {
    const { container } = renderRow({
      nutrient: { formatted: null, percentDV: 5, dvFormatted: '78g' },
    });
    expect(container.querySelector('tr')).toBeNull();
  });

  it('renders nutrient label, amount, and %DV', () => {
    renderRow();
    expect(screen.getByText('Total Fat')).toBeInTheDocument();
    expect(screen.getByText('10g')).toBeInTheDocument();
    expect(screen.getByText('13%')).toBeInTheDocument();
  });

  it('renders as a table row with proper semantic markup', () => {
    renderRow();
    const th = screen.getByText('Total Fat');
    expect(th.tagName).toBe('TH');
    expect(th).toHaveAttribute('scope', 'row');
  });

  it('applies bold styling when bold prop is true', () => {
    renderRow({ bold: true });
    const label = screen.getByText('Total Fat');
    expect(label.className).toContain('fw-bold');
  });

  it('applies normal font weight when bold is false', () => {
    renderRow({ bold: false });
    const label = screen.getByText('Total Fat');
    expect(label.className).toContain('fw-normal');
    expect(label.className).not.toContain('fw-bold');
  });

  it('applies indent padding', () => {
    renderRow({ indent: true });
    expect(screen.getByText('Total Fat')).toHaveStyle({ paddingLeft: '12px' });
  });

  it('applies double indent padding', () => {
    renderRow({ doubleIndent: true });
    expect(screen.getByText('Total Fat')).toHaveStyle({ paddingLeft: '24px' });
  });

  it('applies no indent padding by default', () => {
    renderRow();
    expect(screen.getByText('Total Fat')).toHaveStyle({ paddingLeft: '0px' });
  });

  it('removes bottom border when hideBottomBorder is true', () => {
    renderRow({ hideBottomBorder: true });
    const row = screen.getByText('Total Fat').closest('tr');
    expect(row?.querySelectorAll('.border-bottom')).toHaveLength(0);
  });

  it('renders %DV tooltip with daily value info', () => {
    renderRow();
    const dvCell = screen.getByTitle('13% of 78g');
    expect(dvCell).toBeInTheDocument();
    expect(dvCell).toHaveTextContent('13%');
  });

  it('does not render %DV or tooltip when percentDV is null', () => {
    renderRow({
      nutrient: { formatted: '1g', percentDV: null, dvFormatted: null },
    });
    const row = screen.getByText('Total Fat').closest('tr');
    expect(row?.querySelector('[title]')).toBeNull();
  });

  it('has nutrition-row class on the tr element', () => {
    renderRow();
    const row = screen.getByText('Total Fat').closest('tr');
    expect(row?.className).toContain('nutrition-row');
  });
});
