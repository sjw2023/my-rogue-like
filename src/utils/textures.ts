import Phaser from 'phaser';

export function makeRectTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  color: number,
): string {
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(color, 1);
  g.fillRect(0, 0, width, height);
  g.generateTexture(key, width, height);
  g.destroy();
  return key;
}
