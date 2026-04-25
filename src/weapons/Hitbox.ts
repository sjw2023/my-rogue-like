import Phaser from 'phaser';
import { makeRectTexture } from '../utils/textures';

interface FollowTarget {
  x: number;
  y: number;
}

export class Hitbox extends Phaser.Physics.Arcade.Sprite {
  public readonly damage: number;
  public destroyOnHit = false;
  private readonly alreadyHit = new Set<Phaser.GameObjects.GameObject>();
  private followTarget?: FollowTarget;
  private followOffsetX = 0;
  private followOffsetY = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    w: number,
    h: number,
    damage: number,
    lifetimeMs: number,
  ) {
    super(scene, x, y, makeRectTexture(scene, `hb-${w}x${h}`, w, h, 0xffffaa));
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setAlpha(0.45);
    (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.damage = damage;
    scene.time.delayedCall(lifetimeMs, () => this.destroy());
  }

  attachTo(target: FollowTarget, offsetX: number, offsetY: number): void {
    this.followTarget = target;
    this.followOffsetX = offsetX;
    this.followOffsetY = offsetY;
    this.setPosition(target.x + offsetX, target.y + offsetY);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (this.followTarget) {
      this.setPosition(
        this.followTarget.x + this.followOffsetX,
        this.followTarget.y + this.followOffsetY,
      );
    }
  }

  hasHit(target: Phaser.GameObjects.GameObject): boolean {
    return this.alreadyHit.has(target);
  }

  markHit(target: Phaser.GameObjects.GameObject): void {
    this.alreadyHit.add(target);
  }
}
