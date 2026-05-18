import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { MeleeEnemy } from '../entities/MeleeEnemy';
import { Hitbox } from '../weapons/Hitbox';
import { AttackWorld } from '../weapons/Weapon';
import { makeRectTexture } from '../utils/textures';
import { Boon } from '../boons/Boon';
import { pickRandomBoons } from '../boons/Boons';
import { MetaState } from '../meta/MetaState';

const BAR_LEN = 14;
function bar(ratio: number): string {
  const filled = Math.round(ratio * BAR_LEN);
  return '[' + '█'.repeat(filled) + '░'.repeat(BAR_LEN - filled) + ']';
}

export class GameScene extends Phaser.Scene implements AttackWorld {
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private playerHitboxes!: Phaser.Physics.Arcade.Group;
  private hpText!: Phaser.GameObjects.Text;
  private cdText!: Phaser.GameObjects.Text;
  private door?: Phaser.Physics.Arcade.Sprite;
  private currentRoom = 1;
  private pendingBoons: Boon[] = [];
  private boonUI?: Phaser.GameObjects.Container;
  private boonKeys!: Phaser.Input.Keyboard.Key[];
  private shardsThisRun = 0;
  private runEnded = false;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.currentRoom = 1;
    this.shardsThisRun = 0;
    this.runEnded = false;
    this.door = undefined;
    this.boonUI = undefined;
    this.pendingBoons = [];

    this.drawArena();

    this.enemies = this.physics.add.group({ runChildUpdate: false });
    this.playerHitboxes = this.physics.add.group({ allowGravity: false });

    this.player = new Player(this, this.scale.width / 2, this.scale.height / 2);
    MetaState.load().applyTo(this.player);

    this.startRoom();

    this.physics.add.collider(this.player, this.enemies, (_p, e) => {
      const enemy = e as Enemy;
      this.player.takeDamage(10);
      enemy.knockbackFrom(this.player.x, this.player.y);
    });
    this.physics.add.collider(this.enemies, this.enemies);

    this.physics.add.overlap(this.playerHitboxes, this.enemies, (hb, e) => {
      const hitbox = hb as Hitbox;
      const enemy = e as Enemy;
      if (hitbox.hasHit(enemy)) return;
      hitbox.markHit(enemy);
      enemy.knockbackFrom(hitbox.x, hitbox.y);
      const ex = enemy.x;
      const ey = enemy.y;
      const killed = enemy.takeDamage(hitbox.damage);
      if (killed) this.creditShard(ex, ey);
      if (hitbox.destroyOnHit) hitbox.destroy();
    });

    this.hpText = this.add
      .text(16, 12, '', { fontFamily: 'monospace', fontSize: '16px', color: '#dddddd' })
      .setScrollFactor(0);
    this.cdText = this.add
      .text(16, 36, '', { fontFamily: 'monospace', fontSize: '14px', color: '#bbbbbb' })
      .setScrollFactor(0);

    const KC = Phaser.Input.Keyboard.KeyCodes;
    this.boonKeys = [
      this.input.keyboard!.addKey(KC.Z),
      this.input.keyboard!.addKey(KC.X),
      this.input.keyboard!.addKey(KC.C),
    ];
  }

  update(_time: number, delta: number): void {
    this.player.update(delta);
    this.enemies.getChildren().forEach((e) => (e as Enemy).act(this.player));
    this.hpText.setText(
      `HP ${this.player.getHp()}/${this.player.getMaxHp()}    Room ${this.currentRoom}    Shards ${this.shardsThisRun}`,
    );

    if (!this.runEnded && this.player.isDead()) {
      this.runEnded = true;
      this.scene.start('DeathScene', {
        shardsEarned: this.shardsThisRun,
        room: this.currentRoom,
      });
      return;
    }
    const cd = this.player.getCooldownRatios();
    this.cdText.setText(
      `Weapon ${this.player.getWeaponName()}  (1=Sword 2=Bow)\n` +
        `Dash   ${bar(cd.dash)}\n` +
        `Attack ${bar(cd.attack)}`,
    );

    if (this.boonUI) {
      for (let i = 0; i < this.boonKeys.length; i++) {
        if (Phaser.Input.Keyboard.JustDown(this.boonKeys[i])) {
          this.pickBoon(i);
          break;
        }
      }
      return;
    }

    if (!this.door && this.enemies.countActive(true) === 0) {
      this.presentBoons();
    }
  }

  private presentBoons(): void {
    this.pendingBoons = pickRandomBoons(3);
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const labels = ['Z', 'X', 'C'];
    const container = this.add.container(0, 0).setScrollFactor(0);

    this.pendingBoons.forEach((b, i) => {
      const x = cx + (i - 1) * 220;
      const bg = this.add.rectangle(x, cy, 200, 150, 0x1c1c2e, 0.95).setStrokeStyle(2, 0x66ccff);
      const key = this.add
        .text(x, cy - 50, `[${labels[i]}]`, {
          fontFamily: 'monospace',
          fontSize: '24px',
          color: '#ffffff',
        })
        .setOrigin(0.5);
      const name = this.add
        .text(x, cy - 10, b.name, {
          fontFamily: 'monospace',
          fontSize: '15px',
          color: '#ffeeaa',
        })
        .setOrigin(0.5);
      const desc = this.add
        .text(x, cy + 30, b.description, {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#cccccc',
          wordWrap: { width: 180 },
          align: 'center',
        })
        .setOrigin(0.5);
      container.add([bg, key, name, desc]);
    });

    this.boonUI = container;
  }

  private pickBoon(idx: number): void {
    if (!this.boonUI || idx >= this.pendingBoons.length) return;
    this.pendingBoons[idx].apply(this.player);
    this.boonUI.destroy();
    this.boonUI = undefined;
    this.pendingBoons = [];
    this.openDoor();
  }

  private startRoom(): void {
    const count = 2 + this.currentRoom;
    for (let i = 0; i < count; i++) this.spawnEnemy();
  }

  private openDoor(): void {
    const tex = makeRectTexture(this, 'door', 40, 40, 0x66ff88);
    this.door = this.physics.add.staticSprite(this.scale.width / 2, this.scale.height / 2, tex);
    this.door.setAlpha(0.85);
    this.physics.add.overlap(this.player, this.door, () => this.advanceRoom());
  }

  private advanceRoom(): void {
    if (!this.door) return;
    this.door.destroy();
    this.door = undefined;
    this.currentRoom++;
    this.startRoom();
  }

  spawnPlayerHitbox(
    x: number,
    y: number,
    w: number,
    h: number,
    damage: number,
    lifetimeMs: number,
  ): Hitbox {
    const hb = new Hitbox(this, x, y, w, h, damage, lifetimeMs);
    this.playerHitboxes.add(hb);
    return hb;
  }

  private creditShard(x: number, y: number): void {
    this.shardsThisRun++;
    const txt = this.add
      .text(x, y, '+1', { fontFamily: 'monospace', fontSize: '14px', color: '#ffeeaa' })
      .setOrigin(0.5);
    this.tweens.add({
      targets: txt,
      y: y - 26,
      alpha: 0,
      duration: 600,
      onComplete: () => txt.destroy(),
    });
  }

  private spawnEnemy(): void {
    const margin = 80;
    const x = Phaser.Math.Between(margin, this.scale.width - margin);
    const y = Phaser.Math.Between(margin, this.scale.height - margin);
    this.enemies.add(new MeleeEnemy(this, x, y));
  }

  private drawArena(): void {
    const g = this.add.graphics();
    g.lineStyle(2, 0x444466, 1);
    g.strokeRect(8, 8, this.scale.width - 16, this.scale.height - 16);
  }
}
