import { useState, useRef, useCallback, useEffect } from 'react';

import type { Tick } from './timeBlocks';
import {
  BLOCKS,
  blockSliderMin,
  blockSliderMax,
  formatTime,
  buildCoreTicks,
  tickPadding,
  getNowMinutes,
  dayMinutesToEpoch,
} from './timeBlocks';
import useSpringAnimation from './useSpringAnimation';

interface TickSlideState {
  oldTicks: Tick[];
  oldPadding: { left: number; right: number };
  newTicks: Tick[];
  newPadding: { left: number; right: number };
  direction: 1 | -1;
}

interface TimePickerSliderProps {
  dayOffset: number;
  initialBlockIdx: number;
  initialMinutes: number;
  onChange: (epoch: number) => void;
  onBack: (currentDayOffset: number) => void;
  onGraceEdgeChange: (edge: 'left' | 'right' | null) => void;
}

function TickRow({ ticks, padding }: { ticks: Tick[]; padding: { left: number; right: number } }) {
  return (
    <div
      className="d-flex justify-content-between"
      style={{
        flex: '0 0 100%',
        minWidth: '100%',
        paddingLeft: `${padding.left}%`,
        paddingRight: `${padding.right}%`,
        marginTop: '0.375rem',
      }}
    >
      {ticks.map((tick) => (
        <div
          key={tick.minutes}
          className="d-flex flex-column align-items-center"
          style={{ gap: '0.125rem' }}
        >
          <div
            style={{
              width: 1,
              height: 8,
              background: 'var(--bs-tertiary-color)',
            }}
          />
          <span
            style={{
              fontSize: '0.65rem',
              color: 'var(--bs-secondary-color)',
              whiteSpace: 'nowrap',
            }}
          >
            {tick.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/** CSS calc expression that matches the browser's thumb position for a given percentage. */
const THUMB_R = 14; // half of 28px thumb
function thumbPos(pct: number): string {
  return `calc(${THUMB_R}px + (100% - ${THUMB_R * 2}px) * ${pct / 100})`;
}

const SLIDER_STYLES = `
.tp-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 12px;
  border-radius: 6px;
  background: var(--bs-secondary-bg);
  outline: none;
  cursor: pointer;
  position: relative;
  z-index: 3;
}
.tp-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bs-primary);
  border: 3px solid var(--bs-body-bg);
  box-shadow: 0 2px 8px rgba(13,110,253,0.35);
  cursor: grab;
  position: relative;
  z-index: 4;
}
.tp-slider::-webkit-slider-thumb:active {
  cursor: grabbing;
  box-shadow: 0 2px 16px rgba(13,110,253,0.6);
}
.tp-slider::-moz-range-thumb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bs-primary);
  border: 3px solid var(--bs-body-bg);
  box-shadow: 0 2px 8px rgba(13,110,253,0.35);
  cursor: grab;
}
.tp-slider.tp-no-now {
  background: linear-gradient(to right,
    var(--tp-fill) var(--fill),
    var(--bs-secondary-bg) var(--fill)
  );
}
.tp-slider.tp-has-now {
  background: transparent;
}
`;

export default function TimePickerSlider({
  dayOffset: initialDayOffset,
  initialBlockIdx,
  initialMinutes,
  onChange,
  onBack,
  onGraceEdgeChange,
}: TimePickerSliderProps) {
  const [currentBlockIdx, setCurrentBlockIdx] = useState(initialBlockIdx);
  const [currentMinutes, setCurrentMinutes] = useState(initialMinutes);
  const [currentDayOffset, setCurrentDayOffset] = useState(initialDayOffset);
  const [tickSlide, setTickSlide] = useState<TickSlideState | null>(null);

  // Refs for stable event handler access
  const blockIdxRef = useRef(initialBlockIdx);
  const minutesRef = useRef(initialMinutes);
  const dayOffsetRef = useRef(initialDayOffset);
  const sliderRef = useRef<HTMLInputElement>(null);
  const tickTrackRef = useRef<HTMLDivElement>(null);
  const fillTrackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const pendingGraceIdxRef = useRef<number | null>(null);
  const graceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onGraceEdgeChangeRef = useRef(onGraceEdgeChange);
  onGraceEdgeChangeRef.current = onGraceEdgeChange;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const { isAnimating, startAnimation, cancelAnimation } = useSpringAnimation();

  const isToday = currentDayOffset === 0;

  // Keep refs in sync with state
  useEffect(() => {
    blockIdxRef.current = currentBlockIdx;
  }, [currentBlockIdx]);
  useEffect(() => {
    minutesRef.current = currentMinutes;
  }, [currentMinutes]);
  useEffect(() => {
    dayOffsetRef.current = currentDayOffset;
  }, [currentDayOffset]);

  function clampToNow(val: number): number {
    if (!isToday) return val;
    const clampedNow = Math.floor(getNowMinutes() / 5) * 5;
    return Math.min(val, clampedNow);
  }

  function updateSliderFill(slider: HTMLInputElement, val: number) {
    const min = parseInt(slider.min);
    const max = parseInt(slider.max);
    const range = max - min;
    if (range <= 0) return;
    const pct = ((val - min) / range) * 100;
    slider.style.setProperty('--fill', `${pct}%`);
    // Also update the fill track overlay for has-now mode
    if (fillTrackRef.current) {
      fillTrackRef.current.style.width = thumbPos(pct);
    }
  }

  function syncSlider(blockIdx: number, minutes: number) {
    const slider = sliderRef.current;
    if (!slider) return;
    const min = blockSliderMin(blockIdx);
    const max = blockSliderMax(blockIdx);
    slider.min = String(min);
    slider.max = String(max);
    slider.step = '5';
    const clamped = clampToNow(Math.max(min, Math.min(max, minutes)));
    slider.value = String(clamped);
    updateSliderFill(slider, clamped);
  }

  // Initialize slider on mount
  useEffect(() => {
    syncSlider(initialBlockIdx, initialMinutes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // switchBlock reads from refs for stable access
  const switchBlock = useCallback(
    (targetIdx: number, targetDayOffset?: number) => {
      const slider = sliderRef.current;
      if (!slider) return;

      const oldBlockIdx = blockIdxRef.current;
      const curMinutes = minutesRef.current;
      const oldMin = parseInt(slider.min);
      const oldMax = parseInt(slider.max);
      const oldRange = oldMax - oldMin;
      const oldPct = oldRange > 0 ? ((curMinutes - oldMin) / oldRange) * 100 : 50;

      // Determine direction and cross-day flag BEFORE updating refs
      const isCrossDay = targetDayOffset !== undefined && targetDayOffset !== dayOffsetRef.current;
      let direction: 1 | -1;
      if (isCrossDay) {
        direction = targetDayOffset > dayOffsetRef.current ? 1 : -1;
      } else {
        direction = targetIdx > oldBlockIdx ? 1 : -1;
      }

      onGraceEdgeChangeRef.current(null);
      pendingGraceIdxRef.current = null;
      if (graceTimerRef.current) clearTimeout(graceTimerRef.current);

      // Update day offset if crossing days
      if (isCrossDay) {
        setCurrentDayOffset(targetDayOffset);
        dayOffsetRef.current = targetDayOffset;
      }

      const newMin = blockSliderMin(targetIdx);
      const newMax = blockSliderMax(targetIdx);
      const isTargetToday = (targetDayOffset ?? dayOffsetRef.current) === 0;
      const clampVal = (v: number) => {
        if (!isTargetToday) return v;
        const clampedNow = Math.floor(getNowMinutes() / 5) * 5;
        return Math.min(v, clampedNow);
      };
      // For cross-day, use midpoint since time ranges don't overlap
      const newValue = isCrossDay
        ? clampVal(
            Math.round(((BLOCKS[targetIdx].coreStart + BLOCKS[targetIdx].coreEnd) / 2 / 5) * 5),
          )
        : clampVal(Math.max(newMin, Math.min(newMax, curMinutes)));
      const newRange = newMax - newMin;
      const newPct = newRange > 0 ? ((newValue - newMin) / newRange) * 100 : 50;

      // Set up tick slide
      setTickSlide({
        oldTicks: buildCoreTicks(BLOCKS[oldBlockIdx]),
        oldPadding: tickPadding(oldBlockIdx),
        newTicks: buildCoreTicks(BLOCKS[targetIdx]),
        newPadding: tickPadding(targetIdx),
        direction,
      });

      // Update state — refs update via effects
      setCurrentBlockIdx(targetIdx);
      setCurrentMinutes(newValue);
      blockIdxRef.current = targetIdx;
      minutesRef.current = newValue;

      // Fix jitter: expand range first, set value, then shrink range.
      // This prevents the browser from clamping the value between min/max updates.
      slider.step = '1';
      if (direction > 0) {
        slider.max = String(newMax);
        slider.value = String(Math.round(newMin + (oldPct / 100) * newRange));
        slider.min = String(newMin);
      } else {
        slider.min = String(newMin);
        slider.value = String(Math.round(newMin + (oldPct / 100) * newRange));
        slider.max = String(newMax);
      }
      slider.style.setProperty('--fill', `${oldPct}%`);

      const trackFrom = direction > 0 ? 0 : -100;
      const trackTo = direction > 0 ? -100 : 0;

      const finalDayOffset = targetDayOffset ?? dayOffsetRef.current;

      startAnimation({
        onFrame: (eased) => {
          const pct = Math.max(0, Math.min(100, oldPct + (newPct - oldPct) * eased));
          if (sliderRef.current) {
            sliderRef.current.style.setProperty('--fill', `${pct}%`);
            sliderRef.current.value = String(Math.round(newMin + (pct / 100) * newRange));
          }
          if (fillTrackRef.current) {
            fillTrackRef.current.style.width = thumbPos(pct);
          }
          if (tickTrackRef.current) {
            const trackX = trackFrom + (trackTo - trackFrom) * eased;
            tickTrackRef.current.style.transform = `translateX(${trackX}%)`;
          }
        },
        onComplete: () => {
          if (sliderRef.current) {
            sliderRef.current.step = '5';
            sliderRef.current.value = String(newValue);
            updateSliderFill(sliderRef.current, newValue);
          }
          setTickSlide(null);
          onChangeRef.current(dayMinutesToEpoch(finalDayOffset, newValue));
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startAnimation],
  );

  const handleSliderInput = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    if (isAnimating.current) {
      cancelAnimation();
      setTickSlide(null);
    }

    let val = parseInt(slider.value);
    const curDayOffset = dayOffsetRef.current;
    const curIsToday = curDayOffset === 0;

    if (curIsToday) {
      const clampedNow = Math.floor(getNowMinutes() / 5) * 5;
      if (val > clampedNow) {
        val = clampedNow;
        slider.value = String(val);
      }
    }

    minutesRef.current = val;
    setCurrentMinutes(val);
    updateSliderFill(slider, val);

    // Live update
    onChangeRef.current(dayMinutesToEpoch(curDayOffset, val));

    const blockIdx = blockIdxRef.current;
    const block = BLOCKS[blockIdx];
    const inLeftGrace = val < block.coreStart;
    const inRightGrace = val > block.coreEnd;

    if (inLeftGrace && (blockIdx > 0 || curDayOffset === 0)) {
      onGraceEdgeChangeRef.current('left');
      if (blockIdx > 0) {
        // Same-day: previous block
        pendingGraceIdxRef.current = blockIdx - 1;
        if (!isDraggingRef.current) {
          if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
          graceTimerRef.current = setTimeout(() => switchBlock(blockIdx - 1), 800);
        }
      } else {
        // Cross-day: Today Late Night → Yesterday Night
        pendingGraceIdxRef.current = -100;
        if (!isDraggingRef.current) {
          if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
          graceTimerRef.current = setTimeout(() => switchBlock(BLOCKS.length - 1, -1), 800);
        }
      }
    } else if (inRightGrace) {
      onGraceEdgeChangeRef.current('right');
      if (blockIdx < BLOCKS.length - 1) {
        // Same-day: next block
        pendingGraceIdxRef.current = blockIdx + 1;
        if (!isDraggingRef.current) {
          if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
          graceTimerRef.current = setTimeout(() => switchBlock(blockIdx + 1), 800);
        }
      } else if (curDayOffset === -1) {
        // Cross-day: Yesterday Night → Today Late Night
        pendingGraceIdxRef.current = -200;
        if (!isDraggingRef.current) {
          if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
          graceTimerRef.current = setTimeout(() => switchBlock(0, 0), 800);
        }
      }
    } else {
      onGraceEdgeChangeRef.current(null);
      pendingGraceIdxRef.current = null;
      if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
    }
  }, [cancelAnimation, isAnimating, switchBlock]);

  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  // Global mouseup/touchend for drag end
  useEffect(() => {
    function handleDragEnd() {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      const pending = pendingGraceIdxRef.current;
      if (pending !== null) {
        if (pending === -100) {
          // Cross-day: Today → Yesterday Night
          switchBlock(BLOCKS.length - 1, -1);
        } else if (pending === -200) {
          // Cross-day: Yesterday → Today Late Night
          switchBlock(0, 0);
        } else {
          switchBlock(pending);
        }
        pendingGraceIdxRef.current = null;
      }
    }
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchend', handleDragEnd);
    return () => {
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [switchBlock]);

  // Cleanup timer on unmount
  useEffect(
    () => () => {
      if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
    },
    [],
  );

  function handleNavBlock(delta: number) {
    const blockIdx = currentBlockIdx;

    // Cross-day navigation
    if (delta < 0 && blockIdx === 0 && currentDayOffset === 0) {
      // Today Late Night → Yesterday Night
      if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
      cancelAnimation();
      setTickSlide(null);

      switchBlock(BLOCKS.length - 1, -1);
      return;
    }
    if (delta > 0 && blockIdx === BLOCKS.length - 1 && currentDayOffset === -1) {
      // Yesterday Night → Today Late Night
      if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
      cancelAnimation();
      setTickSlide(null);

      switchBlock(0, 0);
      return;
    }

    const targetIdx = blockIdx + delta;
    if (targetIdx < 0 || targetIdx >= BLOCKS.length) return;
    if (isToday && BLOCKS[targetIdx].coreStart > getNowMinutes()) return;

    if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
    cancelAnimation();
    setTickSlide(null);

    const target = BLOCKS[targetIdx];
    const midpoint = Math.round(((target.coreStart + target.coreEnd) / 2 / 5) * 5);
    const mins = clampToNow(midpoint);

    setCurrentBlockIdx(targetIdx);
    setCurrentMinutes(mins);
    blockIdxRef.current = targetIdx;
    minutesRef.current = mins;
    syncSlider(targetIdx, mins);
    onChangeRef.current(dayMinutesToEpoch(currentDayOffset, mins));
  }

  const block = BLOCKS[currentBlockIdx];
  const time = formatTime(currentMinutes);
  const dayLabel = currentDayOffset === 0 ? 'Today' : 'Yesterday';

  const currentTicks = buildCoreTicks(block);
  const currentPad = tickPadding(currentBlockIdx);

  // Now marker calculations
  const sliderMin = blockSliderMin(currentBlockIdx);
  const sliderMax = blockSliderMax(currentBlockIdx);
  const sliderRange = sliderMax - sliderMin;
  const nowMinutes = isToday ? getNowMinutes() : null;
  const hasNow = nowMinutes !== null && nowMinutes >= sliderMin && nowMinutes <= sliderMax;
  const nowPct = hasNow ? ((nowMinutes - sliderMin) / sliderRange) * 100 : null;
  const fillPct = sliderRange > 0 ? ((currentMinutes - sliderMin) / sliderRange) * 100 : 0;

  // Nav arrow states — allow cross-day
  const canGoPrev = currentBlockIdx > 0 || currentDayOffset === 0;
  const canGoNext =
    (currentBlockIdx < BLOCKS.length - 1 &&
      !(isToday && BLOCKS[currentBlockIdx + 1].coreStart > (nowMinutes ?? Infinity))) ||
    (currentBlockIdx === BLOCKS.length - 1 && currentDayOffset === -1);

  let prevLabel = 'No previous block';
  if (currentBlockIdx > 0) {
    prevLabel = `Previous: ${BLOCKS[currentBlockIdx - 1].name}`;
  } else if (currentDayOffset === 0) {
    prevLabel = 'Previous: Yesterday, Night';
  }

  let nextLabel = 'No next block';
  if (currentBlockIdx < BLOCKS.length - 1) {
    nextLabel = `Next: ${BLOCKS[currentBlockIdx + 1].name}`;
  } else if (currentDayOffset === -1) {
    nextLabel = 'Next: Today, Late night';
  }

  return (
    <>
      <style>{SLIDER_STYLES}</style>

      {/* Nav bar */}
      <div
        className="d-flex align-items-center px-3 py-2 border-bottom bg-body-tertiary position-relative"
        style={{ minHeight: '2.25rem' }}
      >
        <button
          type="button"
          className="btn btn-link btn-sm p-0 d-flex align-items-center text-decoration-none"
          onClick={() => onBack(currentDayOffset)}
          style={{ gap: '0.125rem' }}
        >
          <i className="bi bi-chevron-left" aria-hidden="true" style={{ fontSize: '0.7rem' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{dayLabel}</span>
        </button>
        <div className="position-absolute start-50 translate-middle-x d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm p-0 d-inline-flex align-items-center justify-content-center"
            disabled={!canGoPrev}
            onClick={() => handleNavBlock(-1)}
            style={{
              width: '1.5rem',
              height: '1.5rem',
              borderRadius: 6,
              border: 'none',
              background: 'transparent',
              color: canGoPrev ? 'var(--bs-primary)' : 'var(--bs-tertiary-color)',
            }}
            aria-label={prevLabel}
          >
            <i className="bi bi-chevron-left" aria-hidden="true" style={{ fontSize: '0.75rem' }} />
          </button>
          <span className="fw-semibold" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
            {block.name}
          </span>
          <button
            type="button"
            className="btn btn-sm p-0 d-inline-flex align-items-center justify-content-center"
            disabled={!canGoNext}
            onClick={() => handleNavBlock(1)}
            style={{
              width: '1.5rem',
              height: '1.5rem',
              borderRadius: 6,
              border: 'none',
              background: 'transparent',
              color: canGoNext ? 'var(--bs-primary)' : 'var(--bs-tertiary-color)',
            }}
            aria-label={nextLabel}
          >
            <i className="bi bi-chevron-right" aria-hidden="true" style={{ fontSize: '0.75rem' }} />
          </button>
        </div>
      </div>

      {/* Slider section */}
      <div style={{ padding: '1rem 1rem 0.75rem' }}>
        {/* Time display */}
        <div
          className="text-center fw-semibold"
          style={{ fontSize: '1.5rem', fontVariantNumeric: 'tabular-nums' }}
          aria-live="polite"
          aria-atomic="true"
        >
          {time.display}{' '}
          <span
            style={{
              fontSize: '0.9rem',
              fontWeight: 500,
              color: 'var(--bs-secondary-color)',
            }}
          >
            {time.period}
          </span>
        </div>

        {/* Slider track */}
        <div className="position-relative" style={{ padding: '0.75rem 0' }}>
          {hasNow && nowPct !== null && (
            <>
              {/* Gray background track ending at now (thumb-corrected) */}
              <div
                className="position-absolute"
                style={{
                  top: '50%',
                  left: 0,
                  height: 12,
                  borderRadius: 6,
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  zIndex: 1,
                  width: `calc(${thumbPos(nowPct)} + 6px)`,
                  background: 'var(--bs-secondary-bg)',
                }}
              />
              {/* Blue fill track (animated via ref, thumb-corrected) */}
              <div
                ref={fillTrackRef}
                className="position-absolute"
                style={{
                  top: '50%',
                  left: 0,
                  height: 12,
                  borderRadius: 6,
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  zIndex: 1,
                  width: thumbPos(fillPct),
                  background: 'var(--tp-fill)',
                }}
              />
              {/* Now dot (thumb-corrected) */}
              <div
                className="position-absolute"
                style={{
                  top: '50%',
                  left: thumbPos(nowPct),
                  width: 8,
                  height: 8,
                  background: '#dc3545',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              />
              {/* NOW label (thumb-corrected) */}
              <span
                className="position-absolute"
                style={{
                  bottom: -4,
                  left: thumbPos(nowPct),
                  fontSize: '0.5rem',
                  fontWeight: 700,
                  color: 'rgba(220, 53, 69, 0.7)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  transform: 'translateX(-50%)',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              >
                NOW
              </span>
            </>
          )}
          <input
            ref={sliderRef}
            type="range"
            className={`tp-slider ${hasNow ? 'tp-has-now' : 'tp-no-now'}`}
            onInput={handleSliderInput}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            aria-label="Select time"
          />
        </div>

        {/* Ticks */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: '1.5rem',
          }}
        >
          <div
            ref={tickTrackRef}
            style={{
              display: 'flex',
              // Reset transform via React (not imperatively) so it clears
              // in the same render that removes the sliding tick rows.
              transform: tickSlide === null ? 'none' : undefined,
            }}
          >
            {!tickSlide && <TickRow ticks={currentTicks} padding={currentPad} />}
            {tickSlide && tickSlide.direction > 0 && (
              <>
                <TickRow ticks={tickSlide.oldTicks} padding={tickSlide.oldPadding} />
                <TickRow ticks={tickSlide.newTicks} padding={tickSlide.newPadding} />
              </>
            )}
            {tickSlide && tickSlide.direction < 0 && (
              <>
                <TickRow ticks={tickSlide.newTicks} padding={tickSlide.newPadding} />
                <TickRow ticks={tickSlide.oldTicks} padding={tickSlide.oldPadding} />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
