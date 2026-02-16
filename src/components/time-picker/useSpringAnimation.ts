import { useRef, useCallback, useEffect } from 'react';

interface SpringConfig {
  onFrame: (eased: number) => void;
  onComplete: () => void;
}

const DURATION = 450;

function easeOutBack(t: number): number {
  const c1 = 0.8;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export default function useSpringAnimation() {
  const frameRef = useRef<number | null>(null);
  const isAnimating = useRef(false);

  const cancelAnimation = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    isAnimating.current = false;
  }, []);

  const startAnimation = useCallback(
    (config: SpringConfig) => {
      cancelAnimation();
      isAnimating.current = true;
      const startTime = performance.now();

      function tick(now: number) {
        const t = Math.min((now - startTime) / DURATION, 1);
        const eased = easeOutBack(t);
        config.onFrame(eased);

        if (t < 1) {
          frameRef.current = requestAnimationFrame(tick);
        } else {
          frameRef.current = null;
          isAnimating.current = false;
          config.onComplete();
        }
      }

      frameRef.current = requestAnimationFrame(tick);
    },
    [cancelAnimation],
  );

  useEffect(() => cancelAnimation, [cancelAnimation]);

  return { isAnimating, startAnimation, cancelAnimation };
}
