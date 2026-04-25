import Phaser from 'phaser';
import { MetaState } from '../meta/MetaState';

interface DeathData {
  shardsEarned: number;
  room: number;
}

export class DeathScene extends Phaser.Scene {
  private payload: DeathData = { shardsEarned: 0, room: 1 };

  constructor() {
    super('DeathScene');
  }

  init(data: DeathData): void {
    this.payload = data;
  }

  create(): void {
    const meta = MetaState.load();
    meta.awardShards(this.payload.shardsEarned);

    this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2,
        `You died in Room ${this.payload.room}\n\n` +
          `Shards earned: ${this.payload.shardsEarned}\n` +
          `Total shards:  ${meta.shards}\n\n` +
          `Press SPACE to return to title.`,
        {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#ffaaaa',
          align: 'center',
        },
      )
      .setOrigin(0.5);

    this.input.keyboard!.on('keydown-SPACE', () => this.scene.start('TitleScene'));
  }
}
