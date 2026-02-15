import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ServingSize } from '../domain';
import { servingSizeSearchParams } from '../utils/servingSizeParams';

const PARAM_TYPE = 'st';
const PARAM_AMOUNT = 'sa';
const PARAM_UNIT = 'su';
const PARAM_NAME = 'sn';

const SERVING_SIZE_PARAMS = [PARAM_TYPE, PARAM_AMOUNT, PARAM_UNIT, PARAM_NAME];

function parseServingSize(params: URLSearchParams): ServingSize {
  const type = params.get(PARAM_TYPE);
  const amountStr = params.get(PARAM_AMOUNT);
  const unit = params.get(PARAM_UNIT);
  const name = params.get(PARAM_NAME);

  const amount = amountStr != null ? Number(amountStr) : NaN;

  switch (type) {
    case 'servings':
      return ServingSize.servings(Number.isFinite(amount) ? amount : 1);
    case 'mass':
      if (Number.isFinite(amount) && unit) return ServingSize.mass(amount, unit);
      break;
    case 'volume':
      if (Number.isFinite(amount) && unit) return ServingSize.volume(amount, unit);
      break;
    case 'energy':
      if (Number.isFinite(amount) && unit) return ServingSize.energy(amount, unit);
      break;
    case 'customSize':
      if (Number.isFinite(amount) && name) return ServingSize.customSize(name, amount);
      break;
  }

  return ServingSize.servings(1);
}

function servingSizeToParams(ss: ServingSize, current: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(current);

  for (const key of SERVING_SIZE_PARAMS) {
    next.delete(key);
  }

  const ssParams = servingSizeSearchParams(ss);
  for (const [key, value] of ssParams) {
    next.set(key, value);
  }

  return next;
}

/** Syncs a `ServingSize` with URL search params (`st`, `sa`, `su`, `sn`). */
export function useServingSizeParams(): [ServingSize, (ss: ServingSize) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const servingSize = parseServingSize(searchParams);

  const setServingSize = useCallback(
    (ss: ServingSize) => {
      setSearchParams((prev) => servingSizeToParams(ss, prev), { replace: true });
    },
    [setSearchParams],
  );

  return [servingSize, setServingSize];
}
