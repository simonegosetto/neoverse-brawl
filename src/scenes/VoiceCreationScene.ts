import Phaser from 'phaser';
import { ClaudeCharacterGenerator } from '../services/ClaudeCharacterGenerator';
import { VoiceInputService } from '../services/VoiceInputService';
import { CharacterData } from '../types/Character';

export class VoiceCreationScene extends Phaser.Scene {
  private characterGenerator: ClaudeCharacterGenerator;
  private voiceService: VoiceInputService;
  private currentPlayer: number = 1;
  private player1Character: CharacterData | null = null;
  private player2Character: CharacterData | null = null;
  private statusText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private visualizer!: Phaser.GameObjects.Graphics;
  private continueMatch: boolean = false;
  private roundData: any = null;
  
  constructor() {
    super({ key: 'VoiceCreationScene' });
    this.characterGenerator = new ClaudeCharacterGenerator();
    this.voiceService = new VoiceInputService();
  }
  
  init(data?: any) {
    this.continueMatch = data?.continueMatch || false;
    this.roundData = data;
  }
  
  create() {
    this.createBackground();
    this.createUI();
    
    if (this.voiceService.isSupported()) {
      this.startVoicePhase();
    } else {
      this.showFallbackInput();
    }
  }
  
  private createBackground() {
    // Animated background
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x1a0033, 0x1a0033, 0x330066, 0x330066, 1);
    graphics.fillRect(0, 0, 1000, 600);
    
    // Animated grid
    for (let i = 0; i < 20; i++) {
      const line = this.add.line(
        0, 0,
        Math.random() * 1000, 0,
        Math.random() * 1000, 600,
        0x00ff00, 0.1
      ).setOrigin(0);
      
      this.tweens.add({
        targets: line,
        alpha: 0.3,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 1000
      });
    }
    
    // Title
    this.add.text(500, 80, 'VOZ-SFERA', {
      fontSize: '64px',
      color: '#ff00ff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);
    
    this.add.text(500, 140, 'Voice Creation Phase', {
      fontSize: '24px',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
  }
  
  private createUI() {
    this.instructionText = this.add.text(500, 250, '', {
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5);
    
    this.statusText = this.add.text(500, 350, '', {
      fontSize: '20px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5);
    
    this.timerText = this.add.text(500, 420, '', {
      fontSize: '48px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    // Audio visualizer placeholder
    this.visualizer = this.add.graphics();
  }
  
  private async startVoicePhase() {
    this.currentPlayer = 1;
    await this.recordPlayer(1);
  }
  
  private async recordPlayer(player: number) {
    this.instructionText.setText(`PLAYER ${player}\nDescribe Your Warrior`);
    this.statusText.setText('Click SPACE to start recording (5 seconds)');
    
    const spaceKey = this.input.keyboard!.addKey('SPACE');
    
    spaceKey.once('down', async () => {
      await this.captureVoiceInput(player);
    });
  }
  
  private async captureVoiceInput(player: number) {
    this.statusText.setText('🎤 RECORDING...');
    this.instructionText.setColor('#ff0000');
    
    // Visual countdown
    let countdown = 5;
    this.timerText.setText(countdown.toString());
    
    const countdownTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        countdown--;
        this.timerText.setText(countdown > 0 ? countdown.toString() : '');
        if (countdown <= 0) {
          countdownTimer.remove();
        }
      },
      repeat: 4
    });
    
    // Animated visualizer
    this.animateVisualizer();
    
    try {
      const transcript = await this.voiceService.startListening(5000);
      console.log(`Player ${player} said:`, transcript);
      
      this.statusText.setText('✨ Generating character...');
      this.instructionText.setColor('#ffffff');
      this.timerText.setText('');
      
      await this.generateCharacter(player, transcript);
      
    } catch (error) {
      console.error('Voice capture failed:', error);
      this.statusText.setText('Voice capture failed. Using text input...');
      this.showTextInputForPlayer(player);
    }
  }
  
  private animateVisualizer() {
    const centerX = 500;
    const centerY = 500;
    let angle = 0;
    
    const visualizerTimer = this.time.addEvent({
      delay: 50,
      callback: () => {
        this.visualizer.clear();
        
        for (let i = 0; i < 12; i++) {
          const radius = 50 + Math.random() * 50;
          const x = centerX + Math.cos(angle + i * 0.5) * radius;
          const y = centerY + Math.sin(angle + i * 0.5) * radius;
          
          this.visualizer.fillStyle(0x00ff00, 0.7);
          this.visualizer.fillCircle(x, y, 5);
        }
        
        angle += 0.1;
      },
      repeat: 100
    });
    
    this.time.delayedCall(5000, () => {
      visualizerTimer.remove();
      this.visualizer.clear();
    });
  }
  
  private async generateCharacter(player: number, voiceInput: string) {
    const result = await this.characterGenerator.generateCharacter({
      voiceTranscript: voiceInput
    });
    
    if (player === 1) {
      this.player1Character = result.character;
    } else {
      this.player2Character = result.character;
    }
    
    // Show generated character info
    this.displayCharacterInfo(result.character, player);
    
    this.time.delayedCall(3000, () => {
      if (player === 1) {
        this.recordPlayer(2);
      } else {
        this.startBattle();
      }
    });
  }
  
  private displayCharacterInfo(character: CharacterData, player: number) {
    this.instructionText.setText(`Player ${player} Created:`);
    
    const infoText = [
      character.name,
      `Archetype: ${character.archetype}`,
      `Power: ${character.stats.power} | Speed: ${character.stats.speed}`,
      character.description
    ].join('\n');
    
    this.statusText.setText(infoText);
    this.statusText.setFontSize('16px');
    this.statusText.setColor('#00ffff');
  }
  
  private showTextInputForPlayer(player: number) {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Player ${player}: Describe your character...`;
    input.style.position = 'fixed';
    input.style.top = '50%';
    input.style.left = '50%';
    input.style.transform = 'translate(-50%, -50%)';
    input.style.padding = '15px';
    input.style.fontSize = '18px';
    input.style.width = '400px';
    input.style.zIndex = '1000';
    
    document.body.appendChild(input);
    input.focus();
    
    input.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        const text = input.value.trim();
        document.body.removeChild(input);
        
        this.statusText.setText('✨ Generating character...');
        await this.generateCharacter(player, text);
      }
    });
  }
  
  private showFallbackInput() {
    this.instructionText.setText('Voice not supported\nUse text input');
    this.statusText.setText('Press SPACE to enter text\nPress T for quick test with random characters');
    
    const spaceKey = this.input.keyboard!.addKey('SPACE');
    spaceKey.once('down', () => {
      this.showTextInputForPlayer(1);
    });
    
    const tKey = this.input.keyboard!.addKey('T');
    tKey.once('down', () => {
      this.quickTestMode();
    });
  }
  
  private quickTestMode() {
    // Import dynamically to avoid circular dependencies
    import('../data/DefaultCharacters').then(module => {
      this.player1Character = module.getRandomCharacter();
      this.player2Character = module.getRandomCharacter();
      
      this.instructionText.setText('Quick Test Mode');
      this.statusText.setText(`${this.player1Character.name} VS ${this.player2Character.name}`);
      
      this.time.delayedCall(1500, () => {
        this.startBattle();
      });
    });
  }
  
  private startBattle() {
    if (!this.player1Character || !this.player2Character) {
      console.error('Missing character data!');
      return;
    }
    
    this.statusText.setText('⚔️ BATTLE BEGINS!');
    
    this.time.delayedCall(1500, () => {
      this.scene.start('BattleScene', {
        player1: this.player1Character,
        player2: this.player2Character
      });
    });
  }
}
