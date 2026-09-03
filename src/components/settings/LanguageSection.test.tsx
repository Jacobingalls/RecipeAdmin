import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import i18n, { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, SUPPORTED_LOCALES } from '../../i18n';

import LanguageSection from './LanguageSection';

function renderSection() {
  return render(<LanguageSection />);
}

describe('LanguageSection', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US']);
  });

  afterEach(async () => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    await i18n.changeLanguage(DEFAULT_LOCALE);
  });

  it('offers every shipped language plus following the browser', () => {
    renderSection();
    expect(screen.getByRole('option', { name: 'Follow your browser' })).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(SUPPORTED_LOCALES.length + 1);
  });

  it.each([
    ['en', 'English'],
    ['da', 'Dansk'],
    ['es', 'Español'],
    ['nl', 'Nederlands'],
    ['sv', 'Svenska'],
  ])('names %s in that language so speakers can find it', (locale, endonym) => {
    renderSection();
    expect(screen.getByRole('option', { name: endonym })).toHaveValue(locale);
  });

  it('starts on "follow your browser" when the user has not chosen', () => {
    renderSection();
    expect(screen.getByRole('combobox', { name: 'Language' })).toHaveValue('system');
  });

  it.each([
    ['nl', 'Taal'],
    ['sv', 'Språk'],
    ['da', 'Sprog'],
    ['es', 'Idioma'],
  ])('switches the app to %s', async (locale, label) => {
    const user = userEvent.setup();
    renderSection();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Language' }), locale);

    expect(screen.getByRole('combobox', { name: label })).toHaveValue(locale);
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe(locale);
  });

  it('explains that the browser language is used by default', () => {
    renderSection();
    expect(
      screen.getByText("We'll use your browser's language unless you pick one here."),
    ).toBeInTheDocument();
  });
});
