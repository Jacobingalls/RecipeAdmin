import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import i18n, { DEFAULT_LOCALE } from '../../i18n';
import { ENERGY_DISPLAY_STORAGE_KEY } from '../../utils';

import EnergySection from './EnergySection';

describe('EnergySection', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(async () => {
    window.localStorage.clear();
    await i18n.changeLanguage(DEFAULT_LOCALE);
  });

  it('offers both measures plus following the language', () => {
    render(<EnergySection />);
    expect(screen.getByRole('option', { name: 'Follow your language' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Calories (kcal)' })).toHaveValue('calories');
    expect(screen.getByRole('option', { name: 'Kilojoules (kJ)' })).toHaveValue('kilojoules');
  });

  it('starts on "follow your language" when the user has not chosen', () => {
    render(<EnergySection />);
    expect(screen.getByRole('combobox', { name: 'Energy' })).toHaveValue('system');
  });

  it('starts on the measure the user chose earlier', () => {
    window.localStorage.setItem(ENERGY_DISPLAY_STORAGE_KEY, 'kilojoules');
    render(<EnergySection />);
    expect(screen.getByRole('combobox', { name: 'Energy' })).toHaveValue('kilojoules');
  });

  it('remembers the measure the user picks', async () => {
    const user = userEvent.setup();
    render(<EnergySection />);

    await user.selectOptions(screen.getByRole('combobox', { name: 'Energy' }), 'kilojoules');

    expect(screen.getByRole('combobox', { name: 'Energy' })).toHaveValue('kilojoules');
    expect(window.localStorage.getItem(ENERGY_DISPLAY_STORAGE_KEY)).toBe('kilojoules');
  });

  it('goes back to following the language', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(ENERGY_DISPLAY_STORAGE_KEY, 'kilojoules');
    render(<EnergySection />);

    await user.selectOptions(screen.getByRole('combobox', { name: 'Energy' }), 'system');

    expect(window.localStorage.getItem(ENERGY_DISPLAY_STORAGE_KEY)).toBeNull();
  });

  it('explains that the language decides by default', () => {
    render(<EnergySection />);
    expect(
      screen.getByText(
        "We'll match your language unless you pick one here. European languages read energy in kilojoules.",
      ),
    ).toBeInTheDocument();
  });
});
