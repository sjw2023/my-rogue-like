import { Boon } from './Boon';

export const ALL_BOONS: Boon[] = [
  {
    name: 'Sharpened Edge',
    description: '+25% damage',
    apply: (p) => p.addDamageMultiplier(0.25),
  },
  {
    name: 'Hermes Sandals',
    description: '+30% move speed',
    apply: (p) => p.addSpeedMultiplier(0.3),
  },
  {
    name: 'Ironbody',
    description: '+25 max HP, fully heal',
    apply: (p) => p.addMaxHp(25),
  },
  {
    name: 'Quickdraw',
    description: '-20% all cooldowns',
    apply: (p) => p.multiplyCooldowns(0.8),
  },
  {
    name: 'Dash Strike',
    description: 'Damage enemies you dash through',
    apply: (p) => p.enableDashStrike(),
  },
];

export function pickRandomBoons(count: number): Boon[] {
  // Fisher-Yates — an unbiased shuffle, unlike sort() with a random comparator.
  const pool = [...ALL_BOONS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}
