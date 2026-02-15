import type { ServingSize } from '../domain';

/** Builds URL search params (`st`, `sa`, `su`, `sn`) representing a serving size. */
export function servingSizeSearchParams(ss: ServingSize): URLSearchParams {
  const params = new URLSearchParams();

  params.set('st', ss.type);
  params.set('sa', String(ss.amount));

  if (ss.type === 'mass' || ss.type === 'volume' || ss.type === 'energy') {
    const nu = ss.value as { unit: string };
    params.set('su', nu.unit);
  } else if (ss.type === 'customSize') {
    const cs = ss.value as { name: string };
    params.set('sn', cs.name);
  }

  return params;
}
