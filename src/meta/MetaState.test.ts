import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MetaState } from './MetaState';
import { UPGRADES } from './Upgrades';

const hpUpgrade = UPGRADES.find((u) => u.id === 'hp')!; // cost 5
const cdrUpgrade = UPGRADES.find((u) => u.id === 'cdr')!; // cost 8

/** Minimal in-memory localStorage — these tests run without a DOM. */
function makeLocalStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => {
      store.clear();
    },
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    key: (index) => [...store.keys()][index] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, String(value));
    },
  };
}

describe('MetaState', () => {
  beforeEach(() => vi.stubGlobal('localStorage', makeLocalStorage()));
  afterEach(() => vi.unstubAllGlobals());

  it('loads fresh defaults when storage is empty', () => {
    const m = MetaState.load();
    expect(m.shards).toBe(0);
    expect(m.owned.size).toBe(0);
  });

  it('round-trips shards and owned upgrades through save/load', () => {
    const m = MetaState.load();
    m.shards = 12;
    m.owned.add('hp');
    m.save();

    const reloaded = MetaState.load();
    expect(reloaded.shards).toBe(12);
    expect(reloaded.owned.has('hp')).toBe(true);
  });

  it('awardShards adds shards and persists them', () => {
    const m = MetaState.load();
    m.awardShards(7);
    expect(m.shards).toBe(7);
    expect(MetaState.load().shards).toBe(7);
  });

  it('buys an affordable upgrade: deducts cost, records ownership, persists', () => {
    const m = MetaState.load();
    m.shards = 10;

    expect(m.buy(hpUpgrade)).toBe(true);
    expect(m.shards).toBe(5);
    expect(m.owned.has('hp')).toBe(true);
    expect(MetaState.load().owned.has('hp')).toBe(true);
  });

  it('refuses to buy when shards are insufficient', () => {
    const m = MetaState.load();
    m.shards = 3;

    expect(m.buy(hpUpgrade)).toBe(false);
    expect(m.shards).toBe(3);
    expect(m.owned.size).toBe(0);
  });

  it('refuses to buy an already-owned upgrade (no double spend)', () => {
    const m = MetaState.load();
    m.shards = 20;
    m.buy(hpUpgrade);

    expect(m.buy(hpUpgrade)).toBe(false);
    expect(m.shards).toBe(15);
  });

  it('canBuy reflects both affordability and ownership', () => {
    const m = MetaState.load();
    m.shards = 8;
    expect(m.canBuy(cdrUpgrade)).toBe(true);

    m.shards = 7;
    expect(m.canBuy(cdrUpgrade)).toBe(false);

    m.shards = 99;
    m.buy(cdrUpgrade);
    expect(m.canBuy(cdrUpgrade)).toBe(false);
  });

  it('falls back to fresh state when the save is corrupt', () => {
    localStorage.setItem('rogue-like:meta:v1', '{not valid json');
    const m = MetaState.load();
    expect(m.shards).toBe(0);
    expect(m.owned.size).toBe(0);
  });
});
