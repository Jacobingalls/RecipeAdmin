import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import i18n, { DEFAULT_LOCALE } from '../i18n';
import { setLabelStylePreference } from '../utils';

import { useNutritionLabelStyle } from './useNutritionLabelStyle';

describe('useNutritionLabelStyle', () => {
  // Hooks from the test that just ran are still mounted here, and both of these notify them.
  afterEach(async () => {
    await act(async () => {
      window.localStorage.clear();
      await i18n.changeLanguage(DEFAULT_LOCALE);
    });
  });

  it('starts on the measure the language reads', () => {
    const { result } = renderHook(() => useNutritionLabelStyle());
    expect(result.current).toBe('us');
  });

  it('follows the measure the user picks', () => {
    const { result } = renderHook(() => useNutritionLabelStyle());

    act(() => {
      setLabelStylePreference('european');
    });

    expect(result.current).toBe('european');
  });

  it('follows a language change while no measure is picked', async () => {
    const { result } = renderHook(() => useNutritionLabelStyle());

    await act(async () => {
      await i18n.changeLanguage('da');
    });

    expect(result.current).toBe('european');
  });

  it('stops listening once unmounted', () => {
    const { result, unmount } = renderHook(() => useNutritionLabelStyle());
    unmount();

    setLabelStylePreference('european');

    expect(result.current).toBe('us');
  });
});
