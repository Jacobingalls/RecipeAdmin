import { render, screen, fireEvent } from '@testing-library/react';

import { NutritionInformation } from '../domain';

import DayNutritionModal from './DayNutritionModal';

vi.mock('./NutritionLabel', () => ({
  default: (props: { nutritionInfo: NutritionInformation | null }) => (
    <div data-testid="nutrition-label">
      {props.nutritionInfo?.calories?.amount != null
        ? `Calories: ${props.nutritionInfo.calories.amount}`
        : 'No nutrition data'}
    </div>
  ),
}));

function makeNutritionInfo(overrides = {}) {
  return new NutritionInformation({
    calories: { amount: 2000, unit: 'kcal' },
    totalFat: { amount: 65, unit: 'g' },
    protein: { amount: 80, unit: 'g' },
    ...overrides,
  });
}

describe('DayNutritionModal', () => {
  afterEach(() => {
    document.body.classList.remove('modal-open');
  });

  it('renders inside a modal dialog', () => {
    const onClose = vi.fn();
    render(
      <DayNutritionModal
        dayLabel="Mon, Feb 10"
        nutritionInfo={makeNutritionInfo()}
        onClose={onClose}
      />,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays the day label', () => {
    render(
      <DayNutritionModal
        dayLabel="Mon, Feb 10"
        nutritionInfo={makeNutritionInfo()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Mon, Feb 10')).toBeInTheDocument();
  });

  it('displays the Daily nutrition title', () => {
    render(
      <DayNutritionModal
        dayLabel="Mon, Feb 10"
        nutritionInfo={makeNutritionInfo()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Daily nutrition')).toBeInTheDocument();
  });

  it('renders the nutrition label with provided nutrition info', () => {
    render(
      <DayNutritionModal
        dayLabel="Mon, Feb 10"
        nutritionInfo={makeNutritionInfo()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByTestId('nutrition-label')).toHaveTextContent('Calories: 2000');
  });

  it('renders a close button', () => {
    render(
      <DayNutritionModal
        dayLabel="Mon, Feb 10"
        nutritionInfo={makeNutritionInfo()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <DayNutritionModal
        dayLabel="Mon, Feb 10"
        nutritionInfo={makeNutritionInfo()}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking the backdrop', () => {
    const onClose = vi.fn();
    render(
      <DayNutritionModal
        dayLabel="Mon, Feb 10"
        nutritionInfo={makeNutritionInfo()}
        onClose={onClose}
      />,
    );
    fireEvent.mouseDown(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses the day label in the modal aria-label', () => {
    render(
      <DayNutritionModal
        dayLabel="Mon, Feb 10"
        nutritionInfo={makeNutritionInfo()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'day-nutrition-title');
  });

  it('renders with different day labels', () => {
    render(
      <DayNutritionModal
        dayLabel="Tue, Feb 11"
        nutritionInfo={makeNutritionInfo()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Tue, Feb 11')).toBeInTheDocument();
  });

  it('renders with minimal nutrition data', () => {
    const minimalInfo = new NutritionInformation({
      calories: { amount: 500, unit: 'kcal' },
    });
    render(
      <DayNutritionModal dayLabel="Wed, Feb 12" nutritionInfo={minimalInfo} onClose={vi.fn()} />,
    );
    expect(screen.getByTestId('nutrition-label')).toHaveTextContent('Calories: 500');
  });
});
