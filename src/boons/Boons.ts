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
  const shuffled = [...ALL_BOONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
