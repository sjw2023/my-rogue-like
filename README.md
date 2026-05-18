# my-rogue-like

A Hades-inspired top-down action roguelike, built from scratch as a learning project.

Clear a room of chasing enemies, pick a boon, walk through the door, fight a harder room. Die, bank shards, spend them on permanent upgrades, run again.

## Tech

- [Phaser 3](https://phaser.io/) — 2D game framework with arcade physics
- TypeScript (strict mode)
- [Vite](https://vitejs.dev/) — dev server and bundler
- `localStorage` — meta-progression saves

No image assets yet — sprites are colored rectangles generated at runtime.

## Quick start

Requires Node.js 18+.

```bash
npm install
npm run dev      # opens http://localhost:5173
```

Other scripts:

```bash
npm run build      # type-check + bundle to dist/
npm run preview    # serve the built bundle
npm run typecheck  # tsc --noEmit
npm test           # run the Vitest unit tests
```

## Controls

| Action | Key |
|---|---|
| Move | `W` `A` `S` `D` |
| Aim | Mouse |
| Attack | `Left-click` |
| Dash (with i-frames) | `Space` |
| Switch weapon | `1` (Sword) / `2` (Bow) |
| Pick a boon | `Z` / `X` / `C` |
| Buy upgrade (title screen) | `1` – `4` |
| Start run / continue | `Space` |

## Features

- **Combat**: melee Sword and ranged Bow, swappable mid-room
- **Dodge**: short dash with brief invulnerability
- **Enemies**: melee chasers plus ranged shooters that kite and fire projectiles
- **Rooms**: clear all enemies → green door appears → next room is harder
- **Boons**: between rooms, pick 1 of 3 random power-ups (damage, speed, max HP, cooldowns, dash strike)
- **Meta-progression**: enemies drop shards; spend them on the title screen for permanent buffs that persist across runs

## Project structure

```
src/
  main.ts          Phaser bootstrap, registers all scenes
  scenes/          TitleScene, GameScene, DeathScene
  entities/        Player + Enemy (abstract) → MeleeEnemy, RangedEnemy
  weapons/         Weapon (abstract) + Sword, Bow, Hitbox
  boons/           Boon interface + concrete boon list
  meta/            Upgrades + MetaState (localStorage save/load)
  utils/           runtime texture generator
```

## Roadmap

- "Erase save" button on the title screen
- Particle effects, dash trail, camera punch on kill
- Replace placeholder rectangles with real sprite art
- Hold both weapons simultaneously, swap with mouse-wheel
- Stackable boons (Hades-style "Pom of Power" upgrades)

## License

MIT.
