import Phaser from 'phaser';
import { MetaState } from '../meta/MetaState';
import { UPGRADES } from '../meta/Upgrades';

const DIGIT_KEYS = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];

export class TitleScene extends Phaser.Scene {
  private meta!: MetaState;
  private text!: Phaser.GameObjects.Text;

  constructor() {
    super('TitleScene');
  }

  create(): void {
    this.meta = MetaState.load();

    this.text = this.add
      .text(this.scale.width / 2, this.scale.height / 2, '', {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: '#dddddd',
        align: 'left',
      })
      .setOrigin(0.5);
    this.refresh();

    UPGRADES.forEach((u, i) => {
      this.input.keyboard!.on(`keydown-${DIGIT_KEYS[i + 1]}`, () => {
        if (this.meta.buy(u)) this.refresh();
      });
    });

    this.input.keyboard!.on('keydown-SPACE', () => this.scene.start('GameScene'));
  }

  private refresh(): void {
    const lines: string[] = [];
    lines.push('=== MY ROGUE-LIKE ===');
    lines.push('');
    lines.push(`Shards: ${this.meta.shards}`);
    lines.push('');
    lines.push('Permanent Upgrades:');
    UPGRADES.forEach((u, i) => {
      const status = this.meta.owned.has(u.id)
        ? 'OWNED'
        : this.meta.shards >= u.cost
          ? `${u.cost} shards`
          : `${u.cost} shards (need more)`;
      lines.push(`  [${i + 1}] ${u.name.padEnd(16)} ${u.description.padEnd(18)} ${status}`);
    });
    lines.push('');
    lines.push('Press number to buy.   SPACE to start run.');
    this.text.setText(lines.join('\n'));
  }
}
