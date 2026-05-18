import Phaser from 'phaser';
import { makeRectTexture } from '../utils/textures';
import { Hitbox } from '../weapons/Hitbox';

const KNOCKBACK_SPEED = 320;

export interface EnemyConfig {
  textureKey: string;
  size: number;
  color: number;
  maxHp: number;
  speed: number;
}

/** What an enemy needs from the scene to fire at the player. */
export interface EnemyWorld {
  spawnEnemyProjectile(
    x: number,
    y: number,
    w: number,
    h: number,
    damage: number,
    lifetimeMs: number,
    color: number,
  ): Hitbox;
}

/**
 * Shared behaviour for every enemy: a runtime-generated square sprite with
 * HP, knockback, and a speed-aware steering helper. Concrete subclasses
 * implement `act()` — the per-frame AI.
 */
export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
  protected hp: number;
  protected readonly speed: number;

  constructor(scene: Phaser.Scene, x: number, y: number, cfg: EnemyConfig) {
    super(scene, x, y, makeRectTexture(scene, cfg.textureKey, cfg.size, cfg.size, cfg.color));
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setBounce(0.4);
    this.hp = cfg.maxHp;
    this.speed = cfg.speed;
  }

  /** Per-frame AI. Called by GameScene for every active enemy. */
  abstract act(player: Phaser.Types.Math.Vector2Like, world: EnemyWorld): void;

  knockbackFrom(x: number, y: number): void {
    const dx = this.x - x;
    const dy = this.y - y;
    const len = Math.hypot(dx, dy) || 1;
    this.setVelocity((dx / len) * KNOCKBACK_SPEED, (dy / len) * KNOCKBACK_SPEED);
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(80, () => {
      // The enemy may have been destroyed within the 80ms window.
      if (this.active) this.clearTint();
    });
    if (this.hp <= 0) {
      this.destroy();
      return true;
    }
    return false;
  }

  /** Move along (dx, dy) at this enemy's speed; `scale` < 1 eases off. */
  protected steer(dx: number, dy: number, scale = 1): void {
    const len = Math.hypot(dx, dy) || 1;
    this.setVelocity((dx / len) * this.speed * scale, (dy / len) * this.speed * scale);
  }
}
