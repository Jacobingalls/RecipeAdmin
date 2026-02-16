import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

import {
  BLOCKS,
  getNowMinutes,
  dayMinutesToEpoch,
  epochToDayMinutes,
  blockForMinutes,
  formatTriggerLabel,
  determineInitialView,
} from './timeBlocks';
import TimePickerRoot from './TimePickerRoot';
import TimePickerDay from './TimePickerDay';
import TimePickerSlider from './TimePickerSlider';
import TimePickerCustom from './TimePickerCustom';

type Level = 'root' | 'day' | 'slider' | 'custom';

const TP_STYLES = `
:root, [data-bs-theme="light"] {
  --tp-fill: #a8c7fa;
}
[data-bs-theme="dark"] {
  --tp-fill: #3b6cb5;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-bs-theme="light"]) {
    --tp-fill: #3b6cb5;
  }
}
.tp-chip {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  background: var(--bs-tertiary-bg);
  border: 1px solid var(--bs-border-color);
  font-size: 0.825rem;
  cursor: pointer;
  color: var(--bs-body-color);
  white-space: nowrap;
  transition: background 0.15s, border-color 0.15s;
}
.tp-chip:hover {
  background: var(--bs-secondary-bg);
  border-color: var(--bs-secondary-border-subtle);
}
.tp-chip:active {
  background: var(--bs-primary-bg-subtle);
  border-color: var(--bs-primary-border-subtle);
}
.tp-drill-row:not(:disabled):hover {
  background: var(--bs-tertiary-bg) !important;
}
.tp-drill-row:not(:disabled):active {
  background: var(--bs-secondary-bg) !important;
}
@keyframes tp-slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}
@keyframes tp-slide-in-left {
  from { transform: translateX(-100%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}
.tp-slide-right { animation: tp-slide-in-right 0.25s ease-out both; }
.tp-slide-left  { animation: tp-slide-in-left  0.25s ease-out both; }
`;

const LEVEL_DEPTH: Record<Level, number> = {
  root: 0,
  day: 1,
  slider: 2,
  custom: 1,
};

interface TimePickerProps {
  value: number;
  onChange: (epoch: number) => void;
}

export default function TimePicker({ value, onChange }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [level, setLevel] = useState<Level>('root');
  const [dayOffset, setDayOffset] = useState(0);
  const [selectedBlockIdx, setSelectedBlockIdx] = useState(0);
  const [initialSliderMinutes, setInitialSliderMinutes] = useState(0);
  const [graceEdge, setGraceEdge] = useState<'left' | 'right' | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [contentHeight, setContentHeight] = useState<number | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prevLevelRef = useRef<Level>('root');
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  // Height animation via ResizeObserver
  useEffect(() => {
    if (!isOpen || !contentRef.current) return undefined;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContentHeight(entry.contentRect.height);
      }
    });

    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [isOpen]);

  // Reposition popover on resize/scroll
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return undefined;

    function update() {
      const rect = triggerRef.current!.getBoundingClientRect();
      setPopoverPos({
        top: rect.bottom + 8,
        left: rect.left,
        width: Math.max(rect.width, 300),
      });
    }

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [isOpen]);

  // Escape key closes popover
  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const navigateTo = useCallback((newLevel: Level) => {
    const oldDepth = LEVEL_DEPTH[prevLevelRef.current];
    const newDepth = LEVEL_DEPTH[newLevel];
    setSlideDirection(newDepth > oldDepth ? 'right' : 'left');
    prevLevelRef.current = newLevel;
    setLevel(newLevel);
  }, []);

  function handleOpen() {
    // Compute position synchronously to avoid flash at (0,0)
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPopoverPos({
        top: rect.bottom + 8,
        left: rect.left,
        width: Math.max(rect.width, 300),
      });
    }

    const view = determineInitialView(value);

    if (view.level === 'slider') {
      setDayOffset(view.dayOffset);
      setSelectedBlockIdx(view.blockIdx);
      setInitialSliderMinutes(view.minutes);
      setLevel('slider');
      prevLevelRef.current = 'slider';
    } else if (view.level === 'custom') {
      setLevel('custom');
      prevLevelRef.current = 'custom';
    } else {
      setLevel('root');
      prevLevelRef.current = 'root';
    }

    setSlideDirection(null);
    setGraceEdge(null);
    setContentHeight(null);
    setIsOpen(true);
  }

  function handleToggle() {
    if (isOpen) {
      setIsOpen(false);
    } else {
      handleOpen();
    }
  }

  function handleClose() {
    setIsOpen(false);
    setGraceEdge(null);
  }

  function handleSelectPreset(minutesAgo: number) {
    const epoch = Math.floor(Date.now() / 1000) - minutesAgo * 60;
    const { dayOffset: presetDayOffset, minutes } = epochToDayMinutes(epoch);
    const roundedMinutes = Math.round(minutes / 5) * 5;
    const blockIdx = blockForMinutes(roundedMinutes);

    setDayOffset(presetDayOffset);
    setSelectedBlockIdx(blockIdx);
    setInitialSliderMinutes(roundedMinutes);
    onChange(dayMinutesToEpoch(presetDayOffset, roundedMinutes));
    navigateTo('slider');
  }

  function handleSelectDay(offset: number) {
    setDayOffset(offset);
    navigateTo('day');
  }

  function handleSelectBlock(blockIdx: number) {
    setSelectedBlockIdx(blockIdx);

    const block = BLOCKS[blockIdx];
    let mins: number;
    if (dayOffset === 0) {
      const now = getNowMinutes();
      if (now >= block.coreStart && now <= block.coreEnd) {
        mins = Math.floor(now / 5) * 5;
      } else {
        mins = Math.round(((block.coreStart + block.coreEnd) / 2 / 5) * 5);
      }
    } else {
      mins = Math.round(((block.coreStart + block.coreEnd) / 2 / 5) * 5);
    }

    setInitialSliderMinutes(mins);
    onChange(dayMinutesToEpoch(dayOffset, mins));
    navigateTo('slider');
  }

  function handleSliderBack(currentDayOffset: number) {
    setDayOffset(currentDayOffset);
    navigateTo('day');
  }

  function handleCustom() {
    navigateTo('custom');
  }

  function handleCustomBack() {
    navigateTo('root');
  }

  const triggerLabel = formatTriggerLabel(value);

  return (
    <div>
      <style>{TP_STYLES}</style>
      <button
        ref={triggerRef}
        type="button"
        className="form-select text-start"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        style={{ minWidth: '11.25rem' }}
      >
        {triggerLabel}
      </button>

      {isOpen &&
        popoverPos &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 1059 }}
              onClick={handleClose}
              aria-hidden="true"
            />
            {/* Popover */}
            <div
              role="dialog"
              aria-label="Select time"
              style={{
                position: 'fixed',
                top: popoverPos.top,
                left: popoverPos.left,
                width: popoverPos.width,
                maxWidth: 380,
                zIndex: 1060,
                background: 'var(--bs-body-bg)',
                border: '1px solid var(--bs-border-color)',
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                overflow: 'hidden',
                height: contentHeight !== null ? contentHeight : undefined,
                transition: contentHeight !== null ? 'height 0.2s ease' : undefined,
              }}
            >
              {/* Grace edge glow */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: 60,
                  borderRadius: '12px 0 0 12px',
                  background: 'linear-gradient(to right, rgba(13,110,253,0.18), transparent)',
                  pointerEvents: 'none',
                  zIndex: 10,
                  transition: '500ms opacity ease-in-out',
                  opacity: graceEdge === 'left' ? 0.5 : 0,
                }}
              />
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: 0,
                  width: 60,
                  borderRadius: '0 12px 12px 0',
                  background: 'linear-gradient(to left, rgba(13,110,253,0.18), transparent)',
                  pointerEvents: 'none',
                  zIndex: 10,
                  transition: '500ms opacity ease-in-out',
                  opacity: graceEdge === 'right' ? 0.5 : 0,
                }}
              />

              <div ref={contentRef}>
                <div
                  key={level}
                  className={slideDirection ? `tp-slide-${slideDirection}` : undefined}
                >
                  {level === 'root' && (
                    <TimePickerRoot
                      onSelectPreset={handleSelectPreset}
                      onSelectDay={handleSelectDay}
                      onCustom={handleCustom}
                    />
                  )}
                  {level === 'day' && (
                    <TimePickerDay
                      dayOffset={dayOffset}
                      onBack={() => navigateTo('root')}
                      onSelectBlock={handleSelectBlock}
                    />
                  )}
                  {level === 'slider' && (
                    <TimePickerSlider
                      dayOffset={dayOffset}
                      initialBlockIdx={selectedBlockIdx}
                      initialMinutes={initialSliderMinutes}
                      onChange={onChange}
                      onBack={handleSliderBack}
                      onGraceEdgeChange={setGraceEdge}
                    />
                  )}
                  {level === 'custom' && (
                    <TimePickerCustom value={value} onChange={onChange} onBack={handleCustomBack} />
                  )}
                </div>
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
