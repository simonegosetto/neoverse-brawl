import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene';
import { VoiceCreationScene } from './scenes/VoiceCreationScene';
import { BattleScene } from './scenes/BattleScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1000,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#000000',
  scene: [MenuScene, VoiceCreationScene, BattleScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  render: {
    pixelArt: false,
    antialias: true
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

export default config;
