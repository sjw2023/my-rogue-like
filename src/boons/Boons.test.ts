import { describe, it, expect } from 'vitest';
import { ALL_BOONS, pickRandomBoons } from './Boons';

describe('pickRandomBoons', () => {
  it('returns the requested number of boons', () => {
    expect(pickRandomBoons(3)).toHaveLength(3);
  });

  it('returns only boons drawn from ALL_BOONS', () => {
    for (const boon of pickRandomBoons(3)) {
      expect(ALL_BOONS).toContain(boon);
    }
  });

  it('returns distinct boons — no duplicates in one offer', () => {
    const picked = pickRandomBoons(3);
    expect(new Set(picked).size).toBe(picked.length);
  });

  it('caps the count at the number of available boons', () => {
    expect(pickRandomBoons(99)).toHaveLength(ALL_BOONS.length);
  });

  it('does not mutate the shared ALL_BOONS array', () => {
    const before = [...ALL_BOONS];
    pickRandomBoons(3);
    expect(ALL_BOONS).toEqual(before);
  });
});
