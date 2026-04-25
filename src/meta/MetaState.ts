import type { Player } from '../entities/Player';
import { UPGRADES, Upgrade } from './Upgrades';

const STORAGE_KEY = 'rogue-like:meta:v1';

interface SavedMeta {
  shards: number;
  owned: string[];
}

export class MetaState {
  shards = 0;
  owned = new Set<string>();

  static load(): MetaState {
    const m = new MetaState();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return m;
    try {
      const parsed = JSON.parse(raw) as SavedMeta;
      m.shards = parsed.shards ?? 0;
      m.owned = new Set(parsed.owned ?? []);
    } catch {
      // corrupt save — start fresh
    }
    return m;
  }

  save(): void {
    const data: SavedMeta = { shards: this.shards, owned: [...this.owned] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  awardShards(n: number): void {
    this.shards += n;
    this.save();
  }

  canBuy(u: Upgrade): boolean {
    return !this.owned.has(u.id) && this.shards >= u.cost;
  }

  buy(u: Upgrade): boolean {
    if (!this.canBuy(u)) return false;
    this.shards -= u.cost;
    this.owned.add(u.id);
    this.save();
    return true;
  }

  applyTo(player: Player): void {
    for (const u of UPGRADES) {
      if (this.owned.has(u.id)) u.apply(player);
    }
  }
}
