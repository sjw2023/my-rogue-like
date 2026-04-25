import { AttackWorld, Owner, Weapon } from './Weapon';

const SPAWN_OFFSET = 22;
const ARROW_W = 22;
const ARROW_H = 6;
const SPEED = 600;
const DAMAGE = 18;
const LIFETIME_MS = 1500;

export class Bow extends Weapon {
  readonly name = 'Bow';
  readonly cooldownMs = 450;

  attack(world: AttackWorld, owner: Owner, dirX: number, dirY: number): void {
    const x = owner.x + dirX * SPAWN_OFFSET;
    const y = owner.y + dirY * SPAWN_OFFSET;
    const arrow = world.spawnPlayerHitbox(
      x,
      y,
      ARROW_W,
      ARROW_H,
      DAMAGE * owner.damageMultiplier,
      LIFETIME_MS,
    );
    arrow.destroyOnHit = true;
    arrow.setVelocity(dirX * SPEED, dirY * SPEED);
    arrow.setRotation(Math.atan2(dirY, dirX));
  }
}
