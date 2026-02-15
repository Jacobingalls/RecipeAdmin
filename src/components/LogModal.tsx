import { useState, useCallback } from 'react';

import type { Preparation, ProductGroup, ServingSize } from '../domain';
import type { ApiLogItem } from '../api';
import { logEntry, updateLogEntry } from '../api';

import { ModalBase, ModalBody } from './common';
import NutritionLabel from './NutritionLabel';
import ServingSizeSelector from './ServingSizeSelector';

/** Convert epoch seconds to a datetime-local input value string. */
export function epochToDatetimeLocal(epoch: number): string {
  const date = new Date(epoch * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/** Convert a datetime-local input value string to epoch seconds. */
export function datetimeLocalToEpoch(value: string): number {
  return new Date(value).getTime() / 1000;
}

export interface LogTarget {
  name: string;
  brand?: string;
  prepOrGroup: Preparation | ProductGroup;
  initialServingSize: ServingSize;
  productId?: string;
  groupId?: string;
  preparationId?: string;
  editEntryId?: string;
  initialTimestamp?: number;
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
  const [timestamp, setTimestamp] = useState(
    () => target.initialTimestamp ?? Math.floor(Date.now() / 1000),
  );
  const [logState, setLogState] = useState<LogState>('idle');
  const [logError, setLogError] = useState<string | null>(null);

  const isEdit = !!target.editEntryId;

  const handleLog = useCallback(async () => {
    setLogState('logging');
    setLogError(null);

    try {
      if (target.editEntryId) {
        const item: ApiLogItem = target.groupId
          ? { kind: 'group', groupID: target.groupId, servingSize: servingSize.toObject() }
          : {
              kind: 'product',
              productID: target.productId,
              preparationID: target.preparationId,
              servingSize: servingSize.toObject(),
            };
        await updateLogEntry(target.editEntryId, item, timestamp);
      } else {
        await logEntry({
          productId: target.productId,
          groupId: target.groupId,
          preparationId: target.preparationId,
          servingSize: servingSize.toObject(),
          timestamp,
        });
      }
      onSaved?.();
      setLogState('success');
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (e: unknown) {
      setLogError((e as Error).message);
      setLogState('idle');
    }
  }, [target, servingSize, timestamp, onClose, onSaved]);

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
    <ModalBase onClose={onClose} ariaLabel="Log modal" scrollable>
      <div className="modal-header d-block align-items-center">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            {target.brand && <div className="text-secondary small">{target.brand}</div>}
            <h5 className="modal-title">{target.name}</h5>
          </div>
          <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
        </div>
        <div className="d-flex justify-content-between align-items-end mt-2">
          <ServingSizeSelector prep={prepOrGroup} value={servingSize} onChange={setServingSize} />
          <div>
            {logError && (
              <div className="text-danger small me-auto" role="alert">
                {logError}
              </div>
            )}
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
        <div className="mt-2">
          <label htmlFor="log-timestamp" className="form-label small text-secondary mb-0">
            Date and time
          </label>
          <input
            id="log-timestamp"
            type="datetime-local"
            className="form-control form-control-sm"
            value={epochToDatetimeLocal(timestamp)}
            onChange={(e) => setTimestamp(datetimeLocalToEpoch(e.target.value))}
          />
        </div>
      </div>
      <ModalBody>
        {nutritionError && (
          <div className="text-danger small mb-3" role="alert">
            {nutritionError}
          </div>
        )}
        {nutritionInfo && (
          <div className="bg-body shadow-lg">
            <NutritionLabel
              nutritionInfo={nutritionInfo}
              servingSize={servingSize}
              prep={prepOrGroup}
            />
          </div>
        )}
      </ModalBody>
    </ModalBase>
  );
}

/** Renders nothing when target is null; uses key to reset state on target change. */
export default function LogModal({ target, onClose, onSaved }: LogModalProps) {
  if (!target) return null;
  return <LogModalInner key={target.name} target={target} onClose={onClose} onSaved={onSaved} />;
}
