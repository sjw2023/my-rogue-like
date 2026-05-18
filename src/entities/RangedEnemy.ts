import Phaser from 'phaser';
import { Enemy, EnemyWorld } from './Enemy';

// Kiting band: retreat if closer than MIN, approach if farther than MAX,
// otherwise strafe sideways.
const PREFERRED_MIN = 200;
const PREFERRED_MAX = 320;
const STRAFE_SCALE = 0.5;

const FIRE_COOLDOWN_MS = 1600;
const BULLET_SPEED = 300;
const BULLET_DAMAGE = 12;
const BULLET_SIZE = 12;
const BULLET_LIFETIME_MS = 2500;
const BULLET_COLOR = 0xffaa44;

/** Shooter enemy: keeps its distance and fires aimed projectiles. */
export class RangedEnemy extends Enemy {
  private nextFireAt: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, {
      textureKey: 'enemy-ranged',
      size: 20,
      color: 0xcc66ff,
      maxHp: 30,
      speed: 95,
    });
    // Wind-up before the first shot so a room never opens with instant fire.
    this.nextFireAt = scene.time.now + FIRE_COOLDOWN_MS;
  }

  act(player: Phaser.Types.Math.Vector2Like, world: EnemyWorld): void {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;

    if (dist < PREFERRED_MIN) {
      this.steer(-dx, -dy);
    } else if (dist > PREFERRED_MAX) {
      this.steer(dx, dy);
    } else {
      this.steer(-dy, dx, STRAFE_SCALE);
    }

    const now = this.scene.time.now;
    if (now >= this.nextFireAt) {
      this.nextFireAt = now + FIRE_COOLDOWN_MS;
      const bullet = world.spawnEnemyProjectile(
        this.x,
        this.y,
        BULLET_SIZE,
        BULLET_SIZE,
        BULLET_DAMAGE,
        BULLET_LIFETIME_MS,
        BULLET_COLOR,
      );
      bullet.destroyOnHit = true;
      bullet.setVelocity((dx / dist) * BULLET_SPEED, (dy / dist) * BULLET_SPEED);
    }
  }
}
