import Phaser from 'phaser';
import { Enemy, EnemyWorld } from './Enemy';

/** Chaser enemy: steers straight at the player and deals contact damage. */
export class MeleeEnemy extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, {
      textureKey: 'enemy-melee',
      size: 22,
      color: 0xff6677,
      maxHp: 50,
      speed: 110,
    });
  }

  act(player: Phaser.Types.Math.Vector2Like, _world: EnemyWorld): void {
    this.steer(player.x - this.x, player.y - this.y);
  }
}
