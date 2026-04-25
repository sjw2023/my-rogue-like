import Phaser from 'phaser';
import { makeRectTexture } from '../utils/textures';
import { AttackWorld, Weapon } from '../weapons/Weapon';
import { Sword } from '../weapons/Sword';
import { Bow } from '../weapons/Bow';

const SPEED = 240;
const MAX_HP = 100;

const DASH_SPEED = 620;
const DASH_DURATION_MS = 180;
const DASH_COOLDOWN_MS = 600;
const DASH_STRIKE_DAMAGE = 18;
const DASH_STRIKE_SIZE = 44;

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

export class Player extends Phaser.Physics.Arcade.Sprite {
  public damageMultiplier = 1;
  private speedMultiplier = 1;
  private cooldownMultiplier = 1;
  private maxHp = MAX_HP;
  private hp = MAX_HP;
  private dashStrikeEnabled = false;

  private keys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private invulnerableUntil = 0;
  private weapon: Weapon = new Sword();
  private nextAttackAt = 0;
  private readonly world: AttackWorld;

  private dashUntil = 0;
  private nextDashAt = 0;
  private dashVx = 0;
  private dashVy = 0;

  constructor(scene: Phaser.Scene & AttackWorld, x: number, y: number) {
    super(scene, x, y, makeRectTexture(scene, 'player', 28, 28, 0x66ccff));
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.world = scene;

    const KC = Phaser.Input.Keyboard.KeyCodes;
    this.keys = scene.input.keyboard!.addKeys({
      W: KC.W,
      A: KC.A,
      S: KC.S,
      D: KC.D,
    }) as typeof this.keys;
    this.spaceKey = scene.input.keyboard!.addKey(KC.SPACE);

    scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.tryAttack(p));
    scene.input.keyboard!.on('keydown-ONE', () => (this.weapon = new Sword()));
    scene.input.keyboard!.on('keydown-TWO', () => (this.weapon = new Bow()));
  }

  update(_delta: number): void {
    const now = this.scene.time.now;

    let vx = 0;
    let vy = 0;
    if (this.keys.A.isDown) vx -= 1;
    if (this.keys.D.isDown) vx += 1;
    if (this.keys.W.isDown) vy -= 1;
    if (this.keys.S.isDown) vy += 1;

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && now >= this.nextDashAt) {
      this.tryStartDash(now, vx, vy);
    }

    if (now < this.dashUntil) {
      this.setVelocity(this.dashVx, this.dashVy);
    } else {
      const len = Math.hypot(vx, vy) || 1;
      const speed = SPEED * this.speedMultiplier;
      this.setVelocity((vx / len) * speed, (vy / len) * speed);
    }

    const invulnerable = now < this.invulnerableUntil;
    this.setAlpha(invulnerable ? (Math.floor(now / 60) % 2 === 0 ? 0.35 : 1) : 1);
  }

  takeDamage(amount: number): void {
    const now = this.scene.time.now;
    if (now < this.invulnerableUntil) return;
    this.invulnerableUntil = now + 500;

    this.hp = Math.max(0, this.hp - amount);
    this.scene.cameras.main.shake(80, 0.005);
    this.setTint(0xff4444);
    this.scene.time.delayedCall(120, () => this.clearTint());

    if (this.hp <= 0) this.die();
  }

  getHp(): number {
    return this.hp;
  }

  isDead(): boolean {
    return this.hp <= 0;
  }

  getMaxHp(): number {
    return this.maxHp;
  }

  getWeaponName(): string {
    return this.weapon.name;
  }

  getCooldownRatios(): { dash: number; attack: number } {
    const now = this.scene.time.now;
    const dashTotal = DASH_COOLDOWN_MS * this.cooldownMultiplier;
    const atkTotal = this.weapon.cooldownMs * this.cooldownMultiplier;
    return {
      dash: clamp01(1 - (this.nextDashAt - now) / dashTotal),
      attack: clamp01(1 - (this.nextAttackAt - now) / atkTotal),
    };
  }

  addDamageMultiplier(delta: number): void {
    this.damageMultiplier += delta;
  }

  addSpeedMultiplier(delta: number): void {
    this.speedMultiplier += delta;
  }

  multiplyCooldowns(factor: number): void {
    this.cooldownMultiplier *= factor;
  }

  addMaxHp(amount: number): void {
    this.maxHp += amount;
    this.hp = this.maxHp;
  }

  enableDashStrike(): void {
    this.dashStrikeEnabled = true;
  }

  private tryStartDash(now: number, inputX: number, inputY: number): void {
    let dx = inputX;
    let dy = inputY;
    if (dx === 0 && dy === 0) {
      const p = this.scene.input.activePointer;
      dx = p.worldX - this.x;
      dy = p.worldY - this.y;
    }
    const len = Math.hypot(dx, dy);
    if (len === 0) return;

    this.dashVx = (dx / len) * DASH_SPEED;
    this.dashVy = (dy / len) * DASH_SPEED;
    this.dashUntil = now + DASH_DURATION_MS;
    this.nextDashAt = now + DASH_COOLDOWN_MS * this.cooldownMultiplier;
    this.invulnerableUntil = Math.max(this.invulnerableUntil, this.dashUntil);

    this.setTint(0xffffff);
    this.scene.time.delayedCall(DASH_DURATION_MS, () => this.clearTint());

    if (this.dashStrikeEnabled) {
      const hb = this.world.spawnPlayerHitbox(
        this.x,
        this.y,
        DASH_STRIKE_SIZE,
        DASH_STRIKE_SIZE,
        DASH_STRIKE_DAMAGE * this.damageMultiplier,
        DASH_DURATION_MS,
      );
      hb.attachTo(this, 0, 0);
    }
  }

  private tryAttack(pointer: Phaser.Input.Pointer): void {
    if (!this.active) return;
    const now = this.scene.time.now;
    if (now < this.nextAttackAt) return;
    this.nextAttackAt = now + this.weapon.cooldownMs * this.cooldownMultiplier;

    const dx = pointer.worldX - this.x;
    const dy = pointer.worldY - this.y;
    const len = Math.hypot(dx, dy) || 1;
    this.weapon.attack(this.world, this, dx / len, dy / len);
  }

  private die(): void {
    this.setTint(0x666666);
    this.setVelocity(0, 0);
    this.disableBody(true, false);
  }
}
