import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }
  
  create() {
    this.createBackground();
    this.createTitle();
    this.createMenu();
  }
  
  private createBackground() {
    // Animated background gradient
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x0a0033, 0x0a0033, 0x1a0055, 0x1a0055, 1);
    graphics.fillRect(0, 0, 1000, 600);
    
    // Animated particles/stars
    for (let i = 0; i < 50; i++) {
      const star = this.add.circle(
        Math.random() * 1000,
        Math.random() * 600,
        Math.random() * 3,
        0x00ff00,
        Math.random() * 0.5
      );
      
      this.tweens.add({
        targets: star,
        alpha: 0,
        duration: 2000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2000
      });
    }
    
    // Grid lines
    for (let i = 0; i < 10; i++) {
      const line = this.add.line(
        0, 0,
        0, i * 60,
        1000, i * 60,
        0x00ff00, 0.05
      ).setOrigin(0);
    }
  }
  
  private createTitle() {
    // Main title
    const title = this.add.text(500, 150, 'NEOVERSE', {
      fontSize: '96px',
      color: '#00ff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 10
    }).setOrigin(0.5);
    
    const subtitle = this.add.text(500, 230, 'BRAWL', {
      fontSize: '64px',
      color: '#ff00ff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);
    
    // Animated glow effect
    this.tweens.add({
      targets: [title, subtitle],
      scale: 1.05,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Tagline
    this.add.text(500, 290, 'AI-Powered Fighting Game', {
      fontSize: '20px',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
  }
  
  private createMenu() {
    const menuY = 380;
    const spacing = 60;
    
    const menuItems = [
      { text: 'ARCADE MODE', key: 'arcade' },
      { text: 'VERSUS MODE', key: 'versus' },
      { text: 'QUICK TEST', key: 'test' },
      { text: 'HOW TO PLAY', key: 'howto' }
    ];
    
    menuItems.forEach((item, index) => {
      const button = this.createButton(
        500,
        menuY + (index * spacing),
        item.text,
        item.key
      );
    });
    
    // Footer info
    this.add.text(500, 560, 'Powered by Claude AI & Phaser 3', {
      fontSize: '14px',
      color: '#666666'
    }).setOrigin(0.5);
  }
  
  private createButton(x: number, y: number, text: string, key: string): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    const bg = this.add.rectangle(0, 0, 400, 50, 0x000000, 0.7);
    const border = this.add.rectangle(0, 0, 400, 50).setStrokeStyle(2, 0x00ff00);
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '24px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    container.add([bg, border, buttonText]);
    container.setSize(400, 50);
    container.setInteractive();
    
    // Hover effects
    container.on('pointerover', () => {
      bg.setFillStyle(0x00ff00, 0.3);
      buttonText.setColor('#ffffff');
      this.tweens.add({
        targets: container,
        scale: 1.1,
        duration: 200,
        ease: 'Power2'
      });
    });
    
    container.on('pointerout', () => {
      bg.setFillStyle(0x000000, 0.7);
      buttonText.setColor('#00ff00');
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 200,
        ease: 'Power2'
      });
    });
    
    container.on('pointerdown', () => {
      this.handleMenuClick(key);
    });
    
    return container;
  }
  
  private handleMenuClick(key: string) {
    switch (key) {
      case 'arcade':
      case 'versus':
        this.scene.start('VoiceCreationScene');
        break;
      case 'test':
        this.startQuickTest();
        break;
      case 'howto':
        this.showHowToPlay();
        break;
    }
  }
  
  private startQuickTest() {
    import('../data/DefaultCharacters').then(module => {
      const p1 = module.getRandomCharacter();
      const p2 = module.getRandomCharacter();
      
      this.scene.start('BattleScene', {
        player1: p1,
        player2: p2
      });
    });
  }
  
  private showHowToPlay() {
    const overlay = this.add.rectangle(500, 300, 1000, 600, 0x000000, 0.9);
    
    const instructions = [
      'HOW TO PLAY',
      '',
      'VOICE CREATION PHASE:',
      '• Press SPACE to start recording',
      '• Speak for 5 seconds to describe your character',
      '• Claude AI will generate your warrior',
      '',
      'COMBAT:',
      'Player 1: WASD + F(Light) G(Heavy) H(Special) J(Ultimate)',
      'Player 2: Arrows + U(Light) I(Heavy) O(Special) P(Ultimate)',
      '',
      'Win by depleting opponent\'s health or timeout',
      '',
      'Press ESC to return'
    ].join('\n');
    
    const text = this.add.text(500, 300, instructions, {
      fontSize: '18px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
      lineSpacing: 10
    }).setOrigin(0.5);
    
    const escKey = this.input.keyboard!.addKey('ESC');
    escKey.once('down', () => {
      overlay.destroy();
      text.destroy();
    });
  }
}
