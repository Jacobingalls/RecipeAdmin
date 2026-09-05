import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import i18n, { DEFAULT_LOCALE } from '../i18n';
import { setEnergyDisplayPreference } from '../utils';

import { useEnergyDisplay } from './useEnergyDisplay';

describe('useEnergyDisplay', () => {
  afterEach(async () => {
    window.localStorage.clear();
    await i18n.changeLanguage(DEFAULT_LOCALE);
  });

  it('starts on the measure the language reads', () => {
    const { result } = renderHook(() => useEnergyDisplay());
    expect(result.current).toBe('calories');
  });

  it('follows the measure the user picks', () => {
    const { result } = renderHook(() => useEnergyDisplay());

    act(() => setEnergyDisplayPreference('kilojoules'));

    expect(result.current).toBe('kilojoules');
  });

  it('follows a language change while no measure is picked', async () => {
    const { result } = renderHook(() => useEnergyDisplay());

    await act(async () => {
      await i18n.changeLanguage('da');
    });

    expect(result.current).toBe('kilojoules');
  });

  it('stops listening once unmounted', () => {
    const { result, unmount } = renderHook(() => useEnergyDisplay());
    unmount();

    setEnergyDisplayPreference('kilojoules');

    expect(result.current).toBe('calories');
  });
});
