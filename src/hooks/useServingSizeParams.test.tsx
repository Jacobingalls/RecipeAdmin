import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { ServingSize } from '../domain';

import { useServingSizeParams } from './useServingSizeParams';

function wrapper(initialEntry: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/test" element={children} />
        </Routes>
      </MemoryRouter>
    );
  };
}

describe('useServingSizeParams', () => {
  describe('parsing', () => {
    it('defaults to 1 serving when no params present', () => {
      const { result } = renderHook(() => useServingSizeParams(), {
        wrapper: wrapper('/test'),
      });
      const [ss] = result.current;
      expect(ss.type).toBe('servings');
      expect(ss.amount).toBe(1);
    });

    it('parses servings type', () => {
      const { result } = renderHook(() => useServingSizeParams(), {
        wrapper: wrapper('/test?st=servings&sa=3'),
      });
      const [ss] = result.current;
      expect(ss.type).toBe('servings');
      expect(ss.amount).toBe(3);
    });

    it('parses servings with decimal amount', () => {
      const { result } = renderHook(() => useServingSizeParams(), {
        wrapper: wrapper('/test?st=servings&sa=0.5'),
      });
      const [ss] = result.current;
      expect(ss.type).toBe('servings');
      expect(ss.amount).toBe(0.5);
    });

    it('defaults servings amount to 1 when sa is missing', () => {
      const { result } = renderHook(() => useServingSizeParams(), {
        wrapper: wrapper('/test?st=servings'),
      });
      const [ss] = result.current;
      expect(ss.type).toBe('servings');
      expect(ss.amount).toBe(1);
    });

    it('defaults servings amount to 1 when sa is invalid', () => {
      const { result } = renderHook(() => useServingSizeParams(), {
        wrapper: wrapper('/test?st=servings&sa=abc'),
      });
      const [ss] = result.current;
      expect(ss.type).toBe('servings');
      expect(ss.amount).toBe(1);
    });

    it('parses mass type', () => {
      const { result } = renderHook(() => useServingSizeParams(), {
        wrapper: wrapper('/test?st=mass&sa=100&su=g'),
      });
      const [ss] = result.current;
      expect(ss.type).toBe('mass');
      expect(ss.amount).toBe(100);
      expect((ss.value as { unit: string }).unit).toBe('g');
    });

    it('parses volume type', () => {
      const { result } = renderHook(() => useServingSizeParams(), {
        wrapper: wrapper('/test?st=volume&sa=240&su=mL'),
      });
      const [ss] = result.current;
      expect(ss.type).toBe('volume');
      expect(ss.amount).toBe(240);
      expect((ss.value as { unit: string }).unit).toBe('mL');
    });

    it('parses energy type', () => {
      const { result } = renderHook(() => useServingSizeParams(), {
        wrapper: wrapper('/test?st=energy&sa=200&su=kcal'),
      });
      const [ss] = result.current;
      expect(ss.type).toBe('energy');
      expect(ss.amount).toBe(200);
      expect((ss.value as { unit: string }).unit).toBe('kcal');
    });

    it('parses customSize type', () => {
      const { result } = renderHook(() => useServingSizeParams(), {
        wrapper: wrapper('/test?st=customSize&sa=3&sn=Cookie'),
      });
      const [ss] = result.current;
      expect(ss.type).toBe('customSize');
      expect(ss.amount).toBe(3);
      expect((ss.value as { name: string }).name).toBe('Cookie');
    });

    it('falls back to default when mass is missing unit', () => {
      const { result } = renderHook(() => useServingSizeParams(), {
        wrapper: wrapper('/test?st=mass&sa=100'),
      });
      const [ss] = result.current;
      expect(ss.type).toBe('servings');
      expect(ss.amount).toBe(1);
    });

    it('falls back to default when customSize is missing name', () => {
      const { result } = renderHook(() => useServingSizeParams(), {
        wrapper: wrapper('/test?st=customSize&sa=3'),
      });
      const [ss] = result.current;
      expect(ss.type).toBe('servings');
      expect(ss.amount).toBe(1);
    });

    it('falls back to default for unknown type', () => {
      const { result } = renderHook(() => useServingSizeParams(), {
        wrapper: wrapper('/test?st=unknown&sa=5'),
      });
      const [ss] = result.current;
      expect(ss.type).toBe('servings');
      expect(ss.amount).toBe(1);
    });
  });

  describe('writing', () => {
    it('sets servings params', () => {
      const { result } = renderHook(() => useServingSizeParams(), {
        wrapper: wrapper('/test'),
      });

      act(() => {
        result.current[1](ServingSize.servings(2));
      });

      const [ss] = result.current;
      expect(ss.type).toBe('servings');
      expect(ss.amount).toBe(2);
    });

    it('sets mass params', () => {
      const { result } = renderHook(() => useServingSizeParams(), {
        wrapper: wrapper('/test'),
      });

      act(() => {
        result.current[1](ServingSize.mass(100, 'g'));
      });

      const [ss] = result.current;
      expect(ss.type).toBe('mass');
      expect(ss.amount).toBe(100);
      expect((ss.value as { unit: string }).unit).toBe('g');
    });

    it('sets volume params', () => {
      const { result } = renderHook(() => useServingSizeParams(), {
        wrapper: wrapper('/test'),
      });

      act(() => {
        result.current[1](ServingSize.volume(8, 'fl oz (US)'));
      });

      const [ss] = result.current;
      expect(ss.type).toBe('volume');
      expect(ss.amount).toBe(8);
      expect((ss.value as { unit: string }).unit).toBe('fl oz (US)');
    });

    it('sets energy params', () => {
      const { result } = renderHook(() => useServingSizeParams(), {
        wrapper: wrapper('/test'),
      });

      act(() => {
        result.current[1](ServingSize.energy(200, 'kcal'));
      });

      const [ss] = result.current;
      expect(ss.type).toBe('energy');
      expect(ss.amount).toBe(200);
      expect((ss.value as { unit: string }).unit).toBe('kcal');
    });

    it('sets customSize params', () => {
      const { result } = renderHook(() => useServingSizeParams(), {
        wrapper: wrapper('/test'),
      });

      act(() => {
        result.current[1](ServingSize.customSize('Cookie', 3));
      });

      const [ss] = result.current;
      expect(ss.type).toBe('customSize');
      expect(ss.amount).toBe(3);
      expect((ss.value as { name: string }).name).toBe('Cookie');
    });

    it('clears stale params when switching types', () => {
      const { result } = renderHook(() => useServingSizeParams(), {
        wrapper: wrapper('/test?st=mass&sa=100&su=g'),
      });

      act(() => {
        result.current[1](ServingSize.servings(2));
      });

      const [ss] = result.current;
      expect(ss.type).toBe('servings');
      expect(ss.amount).toBe(2);
    });

    it('preserves non-serving-size params', () => {
      const { result } = renderHook(
        () => {
          // eslint-disable-next-line @typescript-eslint/no-require-imports, no-undef
          const { useSearchParams } = require('react-router-dom');
          const [params] = useSearchParams();
          return { hook: useServingSizeParams(), params };
        },
        {
          wrapper: wrapper('/test?prep=abc123'),
        },
      );

      act(() => {
        result.current.hook[1](ServingSize.servings(2));
      });

      expect(result.current.params.get('prep')).toBe('abc123');
    });
  });
});
