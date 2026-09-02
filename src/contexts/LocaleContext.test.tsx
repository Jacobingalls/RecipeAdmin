import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LOCALE_STORAGE_KEY } from '../i18n';

import { LocaleProvider, useTranslation } from './LocaleContext';

function Probe() {
  const { t, locale, preference, setPreference } = useTranslation();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="preference">{preference}</span>
      <span data-testid="message">{t('common.save')}</span>
      <button type="button" onClick={() => setPreference('nl')}>
        Dutch
      </button>
      <button type="button" onClick={() => setPreference('system')}>
        System
      </button>
    </div>
  );
}

describe('useTranslation', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US']);
  });

  it('falls back to English outside a provider', () => {
    render(<Probe />);
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(screen.getByTestId('message')).toHaveTextContent('Save');
  });

  it('follows the browser language when nothing is stored', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['nl-NL']);
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );
    expect(screen.getByTestId('preference')).toHaveTextContent('system');
    expect(screen.getByTestId('locale')).toHaveTextContent('nl');
    expect(screen.getByTestId('message')).toHaveTextContent('Opslaan');
  });

  it('starts from the stored preference', () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'nl');
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );
    expect(screen.getByTestId('message')).toHaveTextContent('Opslaan');
  });

  it('re-renders in the chosen language and remembers the choice', async () => {
    const user = userEvent.setup();
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );
    expect(screen.getByTestId('message')).toHaveTextContent('Save');

    await user.click(screen.getByRole('button', { name: 'Dutch' }));

    expect(screen.getByTestId('message')).toHaveTextContent('Opslaan');
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('nl');
  });

  it('goes back to following the browser', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'nl');
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'System' }));

    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBeNull();
  });

  it('keeps the document language in sync for screen readers', async () => {
    const user = userEvent.setup();
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );
    expect(document.documentElement.lang).toBe('en');

    await user.click(screen.getByRole('button', { name: 'Dutch' }));

    expect(document.documentElement.lang).toBe('nl');
  });
});
