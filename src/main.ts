import Phaser from 'phaser';
import config from './config';

// Initialize the game
const game = new Phaser.Game(config);

// Log game info
console.log('🎮 Neoverse Brawl initialized');
console.log('Phaser version:', Phaser.VERSION);

// Add keyboard shortcuts info
console.log(`
Controls:
Player 1: WASD (movement) + F, G, H, J (attacks)
Player 2: Arrow Keys (movement) + U, I, O, P (attacks)

Voice Creation: Press SPACE to record your character description
`);

// Export game instance for debugging
(window as any).game = game;
