import { generateName } from './generateName';

describe('generateName', () => {
  it('returns a string in adjective-noun format', () => {
    const name = generateName();
    expect(name).toMatch(/^[a-z]+-[a-z]+$/);
  });

  it('contains exactly one hyphen', () => {
    const name = generateName();
    const hyphens = name.split('').filter((c) => c === '-');
    expect(hyphens).toHaveLength(1);
  });

  it('produces non-empty adjective and noun parts', () => {
    const name = generateName();
    const [adjective, noun] = name.split('-');
    expect(adjective.length).toBeGreaterThan(0);
    expect(noun.length).toBeGreaterThan(0);
  });

  it('generates different names over multiple calls', () => {
    const names = new Set<string>();
    for (let i = 0; i < 50; i++) {
      names.add(generateName());
    }
    // With 54 adjectives x 52 nouns = 2808 combinations,
    // 50 calls should produce many unique names
    expect(names.size).toBeGreaterThan(1);
  });

  it('always returns lowercase strings', () => {
    for (let i = 0; i < 20; i++) {
      const name = generateName();
      expect(name).toBe(name.toLowerCase());
    }
  });

  it('uses the adjective and noun arrays deterministically with seeded random', () => {
    const mockRandom = vi.spyOn(Math, 'random');
    // First call returns index 0 for adjective, second returns index 0 for noun
    mockRandom.mockReturnValueOnce(0).mockReturnValueOnce(0);
    const name = generateName();
    expect(name).toBe('admiring-albatross');
    mockRandom.mockRestore();
  });

  it('selects last elements when random returns near 1', () => {
    const mockRandom = vi.spyOn(Math, 'random');
    // 0.999... will floor to last index for both arrays
    mockRandom.mockReturnValueOnce(0.999).mockReturnValueOnce(0.999);
    const name = generateName();
    expect(name).toBe('zen-wren');
    mockRandom.mockRestore();
  });
});
