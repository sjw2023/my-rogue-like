import { Hitbox } from './Hitbox';

export interface Owner {
  x: number;
  y: number;
  damageMultiplier: number;
}

export interface AttackWorld {
  spawnPlayerHitbox(
    x: number,
    y: number,
    w: number,
    h: number,
    damage: number,
    lifetimeMs: number,
  ): Hitbox;
}

export abstract class Weapon {
  abstract readonly name: string;
  abstract readonly cooldownMs: number;
  abstract attack(world: AttackWorld, owner: Owner, dirX: number, dirY: number): void;
}
