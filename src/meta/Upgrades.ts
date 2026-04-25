import type { Player } from '../entities/Player';

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  apply(player: Player): void;
}

export const UPGRADES: Upgrade[] = [
  {
    id: 'hp',
    name: 'Tougher Body',
    description: '+10 max HP',
    cost: 5,
    apply: (p) => p.addMaxHp(10),
  },
  {
    id: 'dmg',
    name: 'Battle Trained',
    description: '+5% damage',
    cost: 5,
    apply: (p) => p.addDamageMultiplier(0.05),
  },
  {
    id: 'spd',
    name: 'Light Feet',
    description: '+5% speed',
    cost: 5,
    apply: (p) => p.addSpeedMultiplier(0.05),
  },
  {
    id: 'cdr',
    name: 'Quick Reflex',
    description: '-5% cooldowns',
    cost: 8,
    apply: (p) => p.multiplyCooldowns(0.95),
  },
];
