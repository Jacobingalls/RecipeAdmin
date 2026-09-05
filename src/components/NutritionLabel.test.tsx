import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Preparation, ServingSize } from '../domain';
import i18n, { DEFAULT_LOCALE } from '../i18n';
import { setLabelStylePreference } from '../utils';

import NutritionLabel from './NutritionLabel';

const prep = new Preparation({
  mass: { amount: 42, unit: 'g' },
  nutritionalInformation: {
    calories: { amount: 250, unit: 'kcal' },
    sodium: { amount: 160, unit: 'mg' },
    protein: { amount: 5, unit: 'g' },
  },
});

function renderLabel() {
  return render(
    <NutritionLabel
      nutritionInfo={prep.nutritionalInformation}
      servingSize={ServingSize.servings(1)}
      prep={prep}
    />,
  );
}

describe('NutritionLabel', () => {
  // The label from the test that just ran is still mounted, and both of these re-render it.
  afterEach(async () => {
    await act(async () => {
      window.localStorage.clear();
      await i18n.changeLanguage(DEFAULT_LOCALE);
    });
  });

  it('shows the FDA facts panel to a US reader', () => {
    setLabelStylePreference('us');
    renderLabel();

    expect(screen.getByText('Nutrition Facts')).toBeInTheDocument();
    expect(screen.getByText('Sodium')).toBeInTheDocument();
  });

  it('shows the European declaration to a European reader', () => {
    setLabelStylePreference('european');
    renderLabel();

    expect(screen.getByRole('heading', { name: 'Nutrition information' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Salt' })).toBeInTheDocument();
  });

  it('follows the language when the user has picked neither', async () => {
    await act(async () => {
      await i18n.changeLanguage('sv');
    });
    renderLabel();

    expect(screen.getByRole('heading', { name: 'Näringsvärde' })).toBeInTheDocument();
  });
});
