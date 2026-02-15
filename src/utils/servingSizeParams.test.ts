import { ServingSize } from '../domain';

import { servingSizeSearchParams } from './servingSizeParams';

describe('servingSizeSearchParams', () => {
  it('builds params for servings', () => {
    const ss = ServingSize.servings(2);
    const params = servingSizeSearchParams(ss);
    expect(params.get('st')).toBe('servings');
    expect(params.get('sa')).toBe('2');
    expect(params.has('su')).toBe(false);
    expect(params.has('sn')).toBe(false);
  });

  it('builds params for mass', () => {
    const ss = ServingSize.mass(100, 'g');
    const params = servingSizeSearchParams(ss);
    expect(params.get('st')).toBe('mass');
    expect(params.get('sa')).toBe('100');
    expect(params.get('su')).toBe('g');
    expect(params.has('sn')).toBe(false);
  });

  it('builds params for volume', () => {
    const ss = ServingSize.volume(8, 'fl oz (US)');
    const params = servingSizeSearchParams(ss);
    expect(params.get('st')).toBe('volume');
    expect(params.get('sa')).toBe('8');
    expect(params.get('su')).toBe('fl oz (US)');
  });

  it('builds params for energy', () => {
    const ss = ServingSize.energy(200, 'kcal');
    const params = servingSizeSearchParams(ss);
    expect(params.get('st')).toBe('energy');
    expect(params.get('sa')).toBe('200');
    expect(params.get('su')).toBe('kcal');
  });

  it('builds params for customSize', () => {
    const ss = ServingSize.customSize('cookie', 3);
    const params = servingSizeSearchParams(ss);
    expect(params.get('st')).toBe('customSize');
    expect(params.get('sa')).toBe('3');
    expect(params.get('sn')).toBe('cookie');
    expect(params.has('su')).toBe(false);
  });

  it('handles fractional servings', () => {
    const ss = ServingSize.servings(0.5);
    const params = servingSizeSearchParams(ss);
    expect(params.get('sa')).toBe('0.5');
  });
});
