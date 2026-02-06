import { render, screen } from '@testing-library/react';

import { NutritionInformation, Preparation, ProductGroup, ServingSize } from '../domain';

import NutritionLabel from './NutritionLabel';

function makePrep(overrides = {}) {
  return new Preparation({
    name: 'Default',
    nutritionalInformation: {
      calories: { amount: 200, unit: 'kcal' },
      caloriesFromFat: { amount: 50, unit: 'kcal' },
      totalFat: { amount: 10, unit: 'g' },
      saturatedFat: { amount: 3, unit: 'g' },
      sodium: { amount: 500, unit: 'mg' },
      totalCarbohydrate: { amount: 30, unit: 'g' },
      dietaryFiber: { amount: 5, unit: 'g' },
      protein: { amount: 15, unit: 'g' },
      vitaminA: { amount: 300, unit: 'mcg' },
      calcium: { amount: 200, unit: 'mg' },
    },
    mass: { amount: 100, unit: 'g' },
    servingSizeDescription: '1 cup (240ml)',
    ...overrides,
  });
}

function renderLabel(
  overrides: {
    nutritionInfo?: NutritionInformation | null;
    servingSize?: ServingSize;
    prep?: Preparation | ProductGroup;
  } = {},
) {
  const prep = overrides.prep ?? makePrep();
  const servingSize = overrides.servingSize ?? ServingSize.servings(1);
  let nutritionInfo: NutritionInformation | null;
  if (overrides.nutritionInfo !== undefined) {
    ({ nutritionInfo } = overrides);
  } else if (prep instanceof Preparation) {
    nutritionInfo = prep.nutritionalInformationFor(servingSize);
  } else {
    nutritionInfo = null;
  }

  return render(
    <NutritionLabel nutritionInfo={nutritionInfo} servingSize={servingSize} prep={prep} />,
  );
}

describe('NutritionLabel', () => {
  it('returns null when nutritionInfo is null', () => {
    const { container } = renderLabel({ nutritionInfo: null });
    expect(container.innerHTML).toBe('');
  });

  it('renders the Nutrition Facts heading', () => {
    renderLabel();
    expect(screen.getByText('Nutrition Facts')).toBeInTheDocument();
  });

  it('renders serving size information', () => {
    renderLabel();
    expect(screen.getByText('Serving size')).toBeInTheDocument();
    expect(screen.getByText('1 serving')).toBeInTheDocument();
  });

  it('renders servingSizeDescription when prep has it', () => {
    renderLabel();
    expect(screen.getByText('1 cup (240ml)')).toBeInTheDocument();
  });

  it('does not render servingSizeDescription for ProductGroup', () => {
    const group = new ProductGroup({
      name: 'Test Group',
      items: [],
    });
    const nutritionInfo = new NutritionInformation({
      calories: { amount: 100, unit: 'kcal' },
    });
    renderLabel({ prep: group, nutritionInfo });
    expect(screen.queryByText('1 cup (240ml)')).not.toBeInTheDocument();
  });

  it('renders calories', () => {
    renderLabel();
    expect(screen.getByText('Calories')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('renders calories from fat when present', () => {
    renderLabel();
    expect(screen.getByText(/Calories from Fat/)).toBeInTheDocument();
  });

  it('renders dash for calories when not available', () => {
    const nutritionInfo = new NutritionInformation({});
    const prep = makePrep();
    renderLabel({ nutritionInfo, prep });
    // The em dash for missing calories
    const caloriesSection = screen.getByText('Calories').closest('div');
    expect(caloriesSection?.parentElement?.textContent).toContain('—');
  });

  it('renders nutrient rows with formatted amounts', () => {
    renderLabel();
    expect(screen.getByText('Total Fat')).toBeInTheDocument();
    expect(screen.getByText('10g')).toBeInTheDocument();
    expect(screen.getByText('Sodium')).toBeInTheDocument();
    expect(screen.getByText('500mg')).toBeInTheDocument();
  });

  it('renders percentage daily values', () => {
    renderLabel();
    // Total Fat: 10g / 78g DV = 13%
    expect(screen.getByText('13%')).toBeInTheDocument();
    // Sodium: 500mg / 2300mg DV = 22%
    expect(screen.getByText('22%')).toBeInTheDocument();
  });

  it('shows %DV tooltip with daily value info', () => {
    renderLabel();
    // Total Fat: 10g / 78g = 13%
    const dvCell = screen.getByTitle('13% of 78g');
    expect(dvCell).toBeInTheDocument();
  });

  it('does not render rows for null nutrients', () => {
    const nutritionInfo = new NutritionInformation({
      calories: { amount: 100, unit: 'kcal' },
      totalFat: { amount: 5, unit: 'g' },
    });
    renderLabel({ nutritionInfo });
    expect(screen.getByText('Total Fat')).toBeInTheDocument();
    expect(screen.queryByText('Trans Fat')).not.toBeInTheDocument();
    expect(screen.queryByText('Cholesterol')).not.toBeInTheDocument();
  });

  it('renders bold nutrient rows', () => {
    renderLabel();
    const totalFatLabel = screen.getByText('Total Fat');
    expect(totalFatLabel.className).toContain('fw-bold');
  });

  it('renders indented nutrient rows', () => {
    renderLabel();
    const saturatedFatLabel = screen.getByText('Saturated Fat');
    expect(saturatedFatLabel).toHaveStyle({ paddingLeft: '12px' });
  });

  it('renders the column headers', () => {
    renderLabel();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('% DV*')).toBeInTheDocument();
  });

  it('renders the daily value footnote', () => {
    renderLabel();
    expect(screen.getByText(/The % Daily Value/)).toBeInTheDocument();
  });

  it('renders vitamin and mineral rows', () => {
    renderLabel();
    expect(screen.getByText('Vitamin A')).toBeInTheDocument();
    expect(screen.getByText('Calcium')).toBeInTheDocument();
  });

  it('renders with multiple servings', () => {
    const prep = makePrep();
    const servingSize = ServingSize.servings(2);
    const nutritionInfo = prep.nutritionalInformationFor(servingSize);
    renderLabel({ servingSize, nutritionInfo, prep });
    expect(screen.getByText('2 servings')).toBeInTheDocument();
    // Calories should be doubled: 200 * 2 = 400
    expect(screen.getByText('400')).toBeInTheDocument();
  });

  it('renders resolved serving size breakdown', () => {
    const prep = makePrep();
    const servingSize = ServingSize.mass(200, 'g');
    const nutritionInfo = prep.nutritionalInformationFor(servingSize);
    renderLabel({ servingSize, nutritionInfo, prep });
    // Primary should show the mass
    expect(screen.getByText('200g')).toBeInTheDocument();
    // Resolved should show equivalent servings
    expect(screen.getByText(/2 servings/)).toBeInTheDocument();
  });
});
