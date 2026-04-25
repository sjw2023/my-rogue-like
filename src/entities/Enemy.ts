import Phaser from 'phaser';
import { makeRectTexture } from '../utils/textures';

const SPEED = 110;
const MAX_HP = 50;

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private hp = MAX_HP;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, makeRectTexture(scene, 'enemy', 22, 22, 0xff6677));
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setBounce(0.4);
  }

  chase(target: Phaser.Math.Vector2Like): void {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const len = Math.hypot(dx, dy) || 1;
    this.setVelocity((dx / len) * SPEED, (dy / len) * SPEED);
  }

  knockbackFrom(x: number, y: number): void {
    const dx = this.x - x;
    const dy = this.y - y;
    const len = Math.hypot(dx, dy) || 1;
    this.setVelocity((dx / len) * 320, (dy / len) * 320);
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(80, () => this.clearTint());
    if (this.hp <= 0) {
      this.destroy();
      return true;
    }
    return false;
  }
}
