import { useState, useCallback } from 'react';

import type { ServingSize } from '../domain';
import { logEntry } from '../api';

interface AddToLogButtonProps {
  productId?: string;
  groupId?: string;
  preparationId?: string;
  servingSize: ServingSize;
}

type LogState = 'idle' | 'logging' | 'success';

export default function AddToLogButton({
  productId,
  groupId,
  preparationId,
  servingSize,
}: AddToLogButtonProps) {
  const [logState, setLogState] = useState<LogState>('idle');
  const [logError, setLogError] = useState<string | null>(null);

  const handleLog = useCallback(async () => {
    setLogState('logging');
    setLogError(null);

    try {
      await logEntry({
        productId,
        groupId,
        preparationId,
        servingSize: servingSize.toObject(),
      });
      setLogState('success');
      setTimeout(() => {
        setLogState('idle');
      }, 1500);
    } catch (e: unknown) {
      setLogError((e as Error).message);
      setLogState('idle');
    }
  }, [productId, groupId, preparationId, servingSize]);

  let buttonText: string;
  let buttonClass: string;
  if (logState === 'logging') {
    buttonText = 'Logging...';
    buttonClass = 'btn btn-outline-primary btn-sm';
  } else if (logState === 'success') {
    buttonText = 'Logged!';
    buttonClass = 'btn btn-success btn-sm';
  } else {
    buttonText = 'Add to Log';
    buttonClass = 'btn btn-outline-primary btn-sm';
  }

  return (
    <div>
      <button
        type="button"
        className={buttonClass}
        onClick={handleLog}
        disabled={logState !== 'idle'}
      >
        {buttonText}
      </button>
      {logError && (
        <div className="text-danger small mt-1" role="alert">
          {logError}
        </div>
      )}
    </div>
  );
}
