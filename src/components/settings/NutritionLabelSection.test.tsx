import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import i18n, { DEFAULT_LOCALE } from '../../i18n';
import { LABEL_STYLE_STORAGE_KEY } from '../../utils';

import NutritionLabelSection from './NutritionLabelSection';

const PICKER = { name: 'Nutrition label' };

describe('NutritionLabelSection', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  // The picker from the test that just ran is still mounted, and both of these re-render it.
  afterEach(async () => {
    await act(async () => {
      window.localStorage.clear();
      await i18n.changeLanguage(DEFAULT_LOCALE);
    });
  });

  it('offers both conventions plus following the language', () => {
    render(<NutritionLabelSection />);
    expect(screen.getByRole('option', { name: 'Follow your language' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'US (calories, % daily value)' })).toHaveValue('us');
    expect(screen.getByRole('option', { name: 'European (kilojoules, per 100 g)' })).toHaveValue(
      'european',
    );
  });

  it('starts on "follow your language" when the user has not chosen', () => {
    render(<NutritionLabelSection />);
    expect(screen.getByRole('combobox', PICKER)).toHaveValue('system');
  });

  it('starts on the convention the user chose earlier', () => {
    window.localStorage.setItem(LABEL_STYLE_STORAGE_KEY, 'european');
    render(<NutritionLabelSection />);
    expect(screen.getByRole('combobox', PICKER)).toHaveValue('european');
  });

  it('remembers the convention the user picks', async () => {
    const user = userEvent.setup();
    render(<NutritionLabelSection />);

    await user.selectOptions(screen.getByRole('combobox', PICKER), 'european');

    expect(screen.getByRole('combobox', PICKER)).toHaveValue('european');
    expect(window.localStorage.getItem(LABEL_STYLE_STORAGE_KEY)).toBe('european');
  });

  it('goes back to following the language', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(LABEL_STYLE_STORAGE_KEY, 'european');
    render(<NutritionLabelSection />);

    await user.selectOptions(screen.getByRole('combobox', PICKER), 'system');

    expect(window.localStorage.getItem(LABEL_STYLE_STORAGE_KEY)).toBeNull();
  });

  it('explains what changes beyond the units', () => {
    render(<NutritionLabelSection />);
    expect(screen.getByText(/European labels measure energy in kilojoules/)).toBeInTheDocument();
    expect(screen.getByText(/report salt instead of sodium/)).toBeInTheDocument();
  });
});
