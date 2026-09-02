import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LocaleProvider } from '../../contexts/LocaleContext';
import { LOCALE_STORAGE_KEY } from '../../i18n';

import LanguageSection from './LanguageSection';

function renderSection() {
  return render(
    <LocaleProvider>
      <LanguageSection />
    </LocaleProvider>,
  );
}

describe('LanguageSection', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US']);
  });

  it('offers every shipped language plus following the browser', () => {
    renderSection();
    expect(screen.getByRole('option', { name: 'Follow your browser' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Nederlands' })).toBeInTheDocument();
  });

  it('names each language in that language so speakers can find it', () => {
    renderSection();
    expect(screen.getByRole('option', { name: 'Nederlands' })).toHaveValue('nl');
  });

  it('starts on "follow your browser" when the user has not chosen', () => {
    renderSection();
    expect(screen.getByRole('combobox', { name: 'Language' })).toHaveValue('system');
  });

  it('switches the app to the chosen language', async () => {
    const user = userEvent.setup();
    renderSection();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'nl');

    expect(screen.getByRole('combobox', { name: 'Taal' })).toHaveValue('nl');
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('nl');
  });

  it('explains that the browser language is used by default', () => {
    renderSection();
    expect(
      screen.getByText("We'll use your browser's language unless you pick one here."),
    ).toBeInTheDocument();
  });
});
