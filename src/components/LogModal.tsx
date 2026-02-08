import { useState, useEffect, useCallback, useRef } from 'react';

import type { Preparation, ProductGroup, ServingSize } from '../domain';
import { logEntry, updateLogEntryServingSize } from '../api';

import NutritionLabel from './NutritionLabel';
import ServingSizeSelector from './ServingSizeSelector';

export interface LogTarget {
  name: string;
  brand?: string;
  prepOrGroup: Preparation | ProductGroup;
  initialServingSize: ServingSize;
  productId?: string;
  groupId?: string;
  preparationId?: string;
  editEntryId?: string;
}

interface LogModalProps {
  target: LogTarget | null;
  onClose: () => void;
  onSaved?: () => void;
}

type LogState = 'idle' | 'logging' | 'success';

function getButtonLabel(state: LogState, isEdit: boolean): string {
  if (isEdit) {
    if (state === 'logging') return 'Saving...';
    if (state === 'success') return 'Saved!';
    return 'Save';
  }
  if (state === 'logging') return 'Logging...';
  if (state === 'success') return 'Logged!';
  return 'Add to Log';
}

/** Inner component that resets state when key changes. */
function LogModalInner({
  target,
  onClose,
  onSaved,
}: {
  target: LogTarget;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [servingSize, setServingSize] = useState(() => target.initialServingSize);
  const [logState, setLogState] = useState<LogState>('idle');
  const [logError, setLogError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  // Dismiss when clicking the backdrop (outside the dialog)
  useEffect(() => {
    const el = modalRef.current;
    if (!el) return undefined;
    const handleMouseDown = (e: MouseEvent) => {
      if (e.target === el) onClose();
    };
    el.addEventListener('mousedown', handleMouseDown);
    return () => el.removeEventListener('mousedown', handleMouseDown);
  }, [onClose]);

  const isEdit = !!target.editEntryId;

  const handleLog = useCallback(async () => {
    setLogState('logging');
    setLogError(null);

    try {
      if (target.editEntryId) {
        await updateLogEntryServingSize(target.editEntryId, servingSize.toObject());
        onSaved?.();
      } else {
        await logEntry({
          productId: target.productId,
          groupId: target.groupId,
          preparationId: target.preparationId,
          servingSize: servingSize.toObject(),
        });
      }
      setLogState('success');
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (e: unknown) {
      setLogError((e as Error).message);
      setLogState('idle');
    }
  }, [target, servingSize, onClose, onSaved]);

  const { prepOrGroup } = target;

  let nutritionInfo = null;
  let nutritionError = null;
  try {
    if ('oneServing' in prepOrGroup) {
      nutritionInfo = prepOrGroup.serving(servingSize).nutrition;
    } else {
      nutritionInfo = prepOrGroup.nutritionalInformationFor(servingSize);
    }
  } catch (e: unknown) {
    nutritionError = (e as Error).message;
  }

  return (
    <>
      <div className="modal-backdrop fade show" />
      <div
        ref={modalRef}
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-label="Log modal"
      >
        <div className="modal-dialog modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header d-block align-items-center">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  {target.brand && <div className="text-secondary small">{target.brand}</div>}
                  <h5 className="modal-title">{target.name}</h5>
                </div>
                <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
              </div>
              <div className="d-flex justify-content-between align-items-end mt-2">
                <ServingSizeSelector
                  prep={prepOrGroup}
                  value={servingSize}
                  onChange={setServingSize}
                />
                <div>
                  {logError && <div className="text-danger small me-auto">{logError}</div>}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleLog}
                    disabled={logState !== 'idle'}
                  >
                    {getButtonLabel(logState, isEdit)}
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-body">
              {nutritionError && <div className="text-danger small mb-3">{nutritionError}</div>}
              {nutritionInfo && (
                <div className="bg-body shadow-lg">
                  <NutritionLabel
                    nutritionInfo={nutritionInfo}
                    servingSize={servingSize}
                    prep={prepOrGroup}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/** Renders nothing when target is null; uses key to reset state on target change. */
export default function LogModal({ target, onClose, onSaved }: LogModalProps) {
  if (!target) return null;
  return <LogModalInner key={target.name} target={target} onClose={onClose} onSaved={onSaved} />;
}
