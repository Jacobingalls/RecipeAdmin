import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Preparation, ServingSize } from '../domain';

import EuropeanNutritionLabel from './EuropeanNutritionLabel';

function bar() {
  return new Preparation({
    name: 'One bar',
    servingSizeDescription: '1 bar (42g)',
    mass: { amount: 42, unit: 'g' },
    nutritionalInformation: {
      calories: { amount: 250, unit: 'kcal' },
      totalFat: { amount: 10, unit: 'g' },
      saturatedFat: { amount: 1.5, unit: 'g' },
      transFat: { amount: 0, unit: 'g' },
      cholesterol: { amount: 5, unit: 'mg' },
      sodium: { amount: 160, unit: 'mg' },
      totalCarbohydrate: { amount: 35, unit: 'g' },
      totalSugars: { amount: 12, unit: 'g' },
      dietaryFiber: { amount: 3, unit: 'g' },
      protein: { amount: 5, unit: 'g' },
      calcium: { amount: 200, unit: 'mg' },
    },
  });
}

function renderLabel(prep = bar()) {
  return render(
    <EuropeanNutritionLabel
      nutritionInfo={prep.nutritionalInformation}
      servingSize={ServingSize.servings(1)}
      prep={prep}
    />,
  );
}

function row(name: string) {
  return screen.getByRole('row', { name: new RegExp(name) });
}

describe('EuropeanNutritionLabel', () => {
  it('heads the table the way European packaging does', () => {
    renderLabel();
    expect(screen.getByRole('heading', { name: 'Nutrition information' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'per 100 g' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'per 1 serving' })).toBeInTheDocument();
  });

  it('gives energy in both kilojoules and kilocalories, stacked as packaging does', () => {
    renderLabel();
    const energy = within(row('Energy'));
    expect(energy.getByText('1,046 kJ')).toBeInTheDocument();
    expect(energy.getByText('250 kcal')).toBeInTheDocument();
    // The per-100 g column carries both units too.
    expect(energy.getByText('2,490 kJ')).toBeInTheDocument();
  });

  it('declares salt rather than sodium', () => {
    renderLabel();
    expect(row('Salt')).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /Sodium/ })).not.toBeInTheDocument();
  });

  it('leaves out trans fat and cholesterol', () => {
    renderLabel();
    expect(screen.queryByRole('row', { name: /Trans/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /Cholesterol/ })).not.toBeInTheDocument();
  });

  it('nests the "of which" nutrients under their parent', () => {
    renderLabel();
    expect(screen.getByRole('rowheader', { name: 'of which saturates' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'of which sugars' })).toBeInTheDocument();
  });

  it('rates the serving against reference intakes, not daily values', () => {
    renderLabel();
    expect(screen.getByRole('columnheader', { name: '%RI*' })).toBeInTheDocument();
    expect(
      screen.getByText(/Reference intake of an average adult \(8,400 kJ \/ 2,000 kcal\)/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Daily Value/)).not.toBeInTheDocument();
  });

  it('explains where the salt figure comes from', () => {
    renderLabel();
    expect(screen.getByText(/Salt comes from the food/)).toBeInTheDocument();
  });

  it('lists vitamins and minerals against the EU reference value', () => {
    renderLabel();
    expect(screen.getByRole('rowheader', { name: 'Vitamins and minerals' })).toBeInTheDocument();
    // 200 mg of an 800 mg reference value.
    expect(within(row('Calcium')).getByText('25%')).toBeInTheDocument();
  });

  it('names a nutrient the product barely carries rather than hiding the figure', () => {
    const prep = new Preparation({
      mass: { amount: 42, unit: 'g' },
      nutritionalInformation: {
        calories: { amount: 250, unit: 'kcal' },
        protein: { amount: 5, unit: 'g' },
        calcium: { amount: 1, unit: 'mg' },
      },
    });
    renderLabel(prep);

    expect(screen.getByRole('rowheader', { name: 'Vitamins and minerals' })).toBeInTheDocument();
    expect(within(row('Calcium')).getByText('1 mg')).toBeInTheDocument();
  });

  it('drops the per-100 column when the product carries no mass or volume', () => {
    const prep = new Preparation({
      nutritionalInformation: {
        calories: { amount: 250, unit: 'kcal' },
        protein: { amount: 5, unit: 'g' },
      },
    });
    renderLabel(prep);

    expect(screen.queryByRole('columnheader', { name: 'per 100 g' })).not.toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'per 1 serving' })).toBeInTheDocument();
  });

  it('renders nothing without nutrition', () => {
    const prep = bar();
    const { container } = render(
      <EuropeanNutritionLabel
        nutritionInfo={null}
        servingSize={ServingSize.servings(1)}
        prep={prep}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
