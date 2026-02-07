import { render, screen } from '@testing-library/react';

import type { PreparationData } from '../../domain';
import { ServingSize } from '../../domain';

import PreparationDetails from './PreparationDetails';

vi.mock('../NutritionLabel', () => ({
  default: () => <div data-testid="nutrition-label" />,
}));

vi.mock('../ServingSizeSelector', () => ({
  default: () => <div data-testid="serving-size-selector" />,
}));

vi.mock('../CustomSizesSection', () => ({
  default: ({ customSizes }: { customSizes: unknown[] }) => (
    <div data-testid="custom-sizes-section">{customSizes.length} sizes</div>
  ),
}));

vi.mock('../NotesDisplay', () => ({
  default: ({ notes }: { notes: string[] }) => (
    <div data-testid="notes-display">{notes.length} notes</div>
  ),
}));

const basePrepData: PreparationData = {
  id: 'prep-1',
  name: 'Default',
  nutritionalInformation: {
    calories: { amount: 200, unit: 'kcal' },
    totalFat: { amount: 10, unit: 'g' },
    protein: { amount: 8, unit: 'g' },
  },
  mass: { amount: 100, unit: 'g' },
};

describe('PreparationDetails', () => {
  const defaultServingSize = ServingSize.servings(1);
  const onChange = vi.fn();

  it('renders the serving size selector', () => {
    render(
      <PreparationDetails
        prep={basePrepData}
        servingSize={defaultServingSize}
        onServingSizeChange={onChange}
      />,
    );
    expect(screen.getByTestId('serving-size-selector')).toBeInTheDocument();
  });

  it('renders the nutrition label', () => {
    render(
      <PreparationDetails
        prep={basePrepData}
        servingSize={defaultServingSize}
        onServingSizeChange={onChange}
      />,
    );
    expect(screen.getByTestId('nutrition-label')).toBeInTheDocument();
  });

  it('does not render custom sizes section when there are none', () => {
    render(
      <PreparationDetails
        prep={basePrepData}
        servingSize={defaultServingSize}
        onServingSizeChange={onChange}
      />,
    );
    expect(screen.queryByTestId('custom-sizes-section')).not.toBeInTheDocument();
  });

  it('renders custom sizes section when custom sizes exist', () => {
    const prepWithCustomSizes: PreparationData = {
      ...basePrepData,
      customSizes: [
        {
          name: 'cookie',
          servingSize: { type: 'servings', value: 0.5 },
        },
      ],
    };
    render(
      <PreparationDetails
        prep={prepWithCustomSizes}
        servingSize={defaultServingSize}
        onServingSizeChange={onChange}
      />,
    );
    expect(screen.getByTestId('custom-sizes-section')).toBeInTheDocument();
    expect(screen.getByText('1 sizes')).toBeInTheDocument();
  });

  it('does not render notes section when there are none', () => {
    render(
      <PreparationDetails
        prep={basePrepData}
        servingSize={defaultServingSize}
        onServingSizeChange={onChange}
      />,
    );
    expect(screen.queryByTestId('notes-display')).not.toBeInTheDocument();
  });

  it('renders notes section when notes exist', () => {
    const prepWithNotes: PreparationData = {
      ...basePrepData,
      notes: ['Note one', 'Note two'],
    };
    render(
      <PreparationDetails
        prep={prepWithNotes}
        servingSize={defaultServingSize}
        onServingSizeChange={onChange}
      />,
    );
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByTestId('notes-display')).toBeInTheDocument();
    expect(screen.getByText('2 notes')).toBeInTheDocument();
  });

  it('displays an error when nutrition calculation fails', () => {
    // Volume-based serving when prep has no volume → throws
    const servingSize = ServingSize.volume(100, 'mL');
    render(
      <PreparationDetails
        prep={basePrepData}
        servingSize={servingSize}
        onServingSizeChange={onChange}
      />,
    );
    expect(screen.getByText(/Cannot calculate serving by volume/)).toBeInTheDocument();
    expect(screen.queryByTestId('nutrition-label')).not.toBeInTheDocument();
  });

  it('renders with different serving sizes', () => {
    const servingSize = ServingSize.servings(2);
    render(
      <PreparationDetails
        prep={basePrepData}
        servingSize={servingSize}
        onServingSizeChange={onChange}
      />,
    );
    expect(screen.getByTestId('nutrition-label')).toBeInTheDocument();
  });

  it('renders actionSlot when provided', () => {
    render(
      <PreparationDetails
        prep={basePrepData}
        servingSize={defaultServingSize}
        onServingSizeChange={onChange}
        actionSlot={<button data-testid="action-slot-btn">Log</button>}
      />,
    );
    expect(screen.getByTestId('action-slot-btn')).toBeInTheDocument();
  });

  it('does not render actionSlot wrapper when not provided', () => {
    const { container } = render(
      <PreparationDetails
        prep={basePrepData}
        servingSize={defaultServingSize}
        onServingSizeChange={onChange}
      />,
    );
    expect(container.querySelector('.ms-auto')).not.toBeInTheDocument();
  });
});
