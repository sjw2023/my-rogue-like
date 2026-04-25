import { AttackWorld, Owner, Weapon } from './Weapon';

const REACH = 36;
const SIZE = 36;
const DAMAGE = 25;
const LIFETIME_MS = 140;

export class Sword extends Weapon {
  readonly name = 'Sword';
  readonly cooldownMs = 350;

  attack(world: AttackWorld, owner: Owner, dirX: number, dirY: number): void {
    const offsetX = dirX * REACH;
    const offsetY = dirY * REACH;
    const hb = world.spawnPlayerHitbox(
      owner.x + offsetX,
      owner.y + offsetY,
      SIZE,
      SIZE,
      DAMAGE * owner.damageMultiplier,
      LIFETIME_MS,
    );
    hb.attachTo(owner, offsetX, offsetY);
  }
}
