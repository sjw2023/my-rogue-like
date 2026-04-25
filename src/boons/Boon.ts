import type { Player } from '../entities/Player';

export interface Boon {
  name: string;
  description: string;
  apply(player: Player): void;
}
