import Phaser from 'phaser';
import { ClaudeCharacterGenerator } from '../services/ClaudeCharacterGenerator';
import { VoiceInputService } from '../services/VoiceInputService';
import { CharacterData } from '../types/Character';

export class VoiceCreationScene extends Phaser.Scene {
  private characterGenerator: ClaudeCharacterGenerator;
  private voiceService: VoiceInputService;
    private player1Character: CharacterData | null = null;
    private player2Character: CharacterData | null = null;
    private statusText!: Phaser.GameObjects.Text;
    private instructionText!: Phaser.GameObjects.Text;
    private timerText!: Phaser.GameObjects.Text;
    private transcriptText!: Phaser.GameObjects.Text;
    private visualizer!: Phaser.GameObjects.Graphics;
    private loaderGraphics!: Phaser.GameObjects.Graphics;

    constructor() {
        super({key: 'VoiceCreationScene'});
        this.characterGenerator = new ClaudeCharacterGenerator();
        this.voiceService = new VoiceInputService();
    }

    init(data?: any) {
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
        this.instructionText = this.add.text(500, 200, '', {
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Transcript display box con sfondo
        this.add.rectangle(500, 280, 700, 80, 0x000000, 0.7);
        this.transcriptText = this.add.text(500, 280, '', {
            fontSize: '24px',
            color: '#00ffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center',
            fontStyle: 'italic',
            wordWrap: {width: 650}
        }).setOrigin(0.5);

        this.statusText = this.add.text(500, 360, '', {
            fontSize: '20px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);

        this.timerText = this.add.text(500, 440, '', {
            fontSize: '48px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Audio visualizer placeholder
        this.visualizer = this.add.graphics();

        // Loader graphics
        this.loaderGraphics = this.add.graphics();
    }

    private async startVoicePhase() {
        await this.recordPlayer(1);
  }

  private async recordPlayer(player: number) {
    this.instructionText.setText(`PLAYER ${player}\nDescribe Your Warrior`);
    this.statusText.setText('Click SPACE to start recording (5 seconds)\nPress ESC to return to menu');

    const spaceKey = this.input.keyboard!.addKey('SPACE');
    const escKey = this.input.keyboard!.addKey('ESC');

    const escHandler = () => {
      this.returnToMenu();
    };

    escKey.once('down', escHandler);

    spaceKey.once('down', async () => {
      // Rimuovi l'handler ESC quando si inizia la registrazione
      escKey.off('down', escHandler);
      await this.captureVoiceInput(player);
    });
  }

  private async captureVoiceInput(player: number) {
    this.statusText.setText('🎤 RECORDING...');
    this.instructionText.setColor('#ff0000');
    this.transcriptText.setText('"..."');

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
      const transcript = await this.voiceService.startListening(5000, (interimText) => {
        // Mostra il testo in tempo reale mentre viene riconosciuto
        this.transcriptText.setText(`"${interimText}"`);
        this.transcriptText.setColor('#00ffff');

        // Effetto lampeggiante
        this.tweens.add({
          targets: this.transcriptText,
          alpha: 0.7,
          duration: 100,
          yoyo: true
        });
      });
      console.log(`Player ${player} said:`, transcript);

      // Mostra il transcript finale
      this.transcriptText.setText(`"${transcript}"`);
      this.transcriptText.setColor('#00ff00');
      this.transcriptText.setAlpha(1);

      this.statusText.setText('✨ GENERATING WARRIOR...');
      this.instructionText.setColor('#ffffff');
      this.timerText.setText('');

      // Avvia il loader cyberpunk
      this.startCyberpunkLoader();

      await this.generateCharacter(player, transcript);

      // Ferma il loader
      this.stopCyberpunkLoader();

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

    // Setup listener per sprite generate
    this.setupSpriteListener(result.character);

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

  /**
   * Setup listener per caricare sprite quando viene generata
   */
  private setupSpriteListener(character: any) {
    const handler = (event: CustomEvent) => {
      const { characterName, spriteImage } = event.detail;

      if (characterName === character.name) {
        console.log(`📦 Loading sprite for ${characterName} into Phaser`);

        // Genera texture key
        const textureKey = `fighter_${characterName.replace(/\s/g, '_').toLowerCase()}`;

        // Carica l'immagine in Phaser
        if (spriteImage && !this.textures.exists(textureKey)) {
          this.textures.addImage(textureKey, spriteImage);
          console.log(`✅ Sprite loaded into Phaser: ${textureKey}`);
        }

        // Rimuovi listener
        window.removeEventListener('sprite-generated', handler as EventListener);
      }
    };

    window.addEventListener('sprite-generated', handler as EventListener);
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
    this.statusText.setText('Press SPACE to enter text\nPress T for quick test\nPress ESC to return to menu');

    const spaceKey = this.input.keyboard!.addKey('SPACE');
    spaceKey.once('down', () => {
      this.showTextInputForPlayer(1);
    });

    const tKey = this.input.keyboard!.addKey('T');
    tKey.once('down', () => {
      this.quickTestMode();
    });

    const escKey = this.input.keyboard!.addKey('ESC');
    escKey.once('down', () => {
      this.returnToMenu();
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

  private loaderTimer?: Phaser.Time.TimerEvent;

  private startCyberpunkLoader() {
    const centerX = 500;
    const centerY = 320;
    let angle = 0;
    let pulseScale = 1;
    let pulseDirection = 1;

    // Array di messaggi cyberpunk
    const loadingMessages = [
      'SCANNING DNA...',
      'ANALYZING COMBAT STYLE...',
      'SYNTHESIZING ABILITIES...',
      'CALIBRATING POWER LEVELS...',
      'GENERATING NEURAL MATRIX...',
      'COMPILING WARRIOR DATA...',
      'INITIALIZING BATTLE SYSTEMS...'
    ];
    let messageIndex = 0;

    // Cambia messaggio ogni 800ms
    const messageTimer = this.time.addEvent({
      delay: 800,
      callback: () => {
        this.statusText.setText(loadingMessages[messageIndex % loadingMessages.length]);
        messageIndex++;
      },
      loop: true
    });

    this.loaderTimer = this.time.addEvent({
      delay: 30,
      callback: () => {
        this.loaderGraphics.clear();

        // Cerchi concentrici rotanti
        for (let ring = 0; ring < 3; ring++) {
          const radius = 60 + ring * 30;
          const segments = 8 + ring * 4;

          for (let i = 0; i < segments; i++) {
            const segmentAngle = (Math.PI * 2 / segments) * i + angle * (ring % 2 === 0 ? 1 : -1);
            const x = centerX + Math.cos(segmentAngle) * radius * pulseScale;
            const y = centerY + Math.sin(segmentAngle) * radius * pulseScale;

            // Colori cyberpunk alternati
            const colors = [0x00ffff, 0xff00ff, 0x00ff00, 0xffff00];
            const color = colors[ring % colors.length];
            const alpha = 0.6 + Math.sin(angle * 3 + i) * 0.4;

            this.loaderGraphics.fillStyle(color, alpha);
            this.loaderGraphics.fillCircle(x, y, 4 + ring);
          }
        }

        // Particelle glitch
        for (let i = 0; i < 10; i++) {
          const particleAngle = Math.random() * Math.PI * 2;
          const particleRadius = 40 + Math.random() * 120;
          const px = centerX + Math.cos(particleAngle) * particleRadius;
          const py = centerY + Math.sin(particleAngle) * particleRadius;

          this.loaderGraphics.fillStyle(0xffffff, Math.random() * 0.5);
          this.loaderGraphics.fillRect(px, py, 2, 2);
        }

        // Linee che connettono
        this.loaderGraphics.lineStyle(1, 0x00ffff, 0.3);
        for (let i = 0; i < 6; i++) {
          const lineAngle = (Math.PI * 2 / 6) * i + angle;
          const innerRadius = 40;
          const outerRadius = 150;

          const x1 = centerX + Math.cos(lineAngle) * innerRadius;
          const y1 = centerY + Math.sin(lineAngle) * innerRadius;
          const x2 = centerX + Math.cos(lineAngle) * outerRadius;
          const y2 = centerY + Math.sin(lineAngle) * outerRadius;

          this.loaderGraphics.strokeLineShape(new Phaser.Geom.Line(x1, y1, x2, y2));
        }

        // Hexagon centrale pulsante
        this.loaderGraphics.lineStyle(3, 0xff00ff, 0.8);
        const hexRadius = 30 * pulseScale;
        for (let i = 0; i < 6; i++) {
          const hexAngle1 = (Math.PI * 2 / 6) * i + angle;
          const hexAngle2 = (Math.PI * 2 / 6) * (i + 1) + angle;

          const hx1 = centerX + Math.cos(hexAngle1) * hexRadius;
          const hy1 = centerY + Math.sin(hexAngle1) * hexRadius;
          const hx2 = centerX + Math.cos(hexAngle2) * hexRadius;
          const hy2 = centerY + Math.sin(hexAngle2) * hexRadius;

          this.loaderGraphics.strokeLineShape(new Phaser.Geom.Line(hx1, hy1, hx2, hy2));
        }

        // Aggiorna animazioni
        angle += 0.05;
        pulseScale += 0.02 * pulseDirection;
        if (pulseScale > 1.2 || pulseScale < 0.9) {
          pulseDirection *= -1;
        }
      },
      loop: true
    });

    // Salva il timer dei messaggi per fermarlo dopo
    (this.loaderTimer as any).messageTimer = messageTimer;
  }

  private stopCyberpunkLoader() {
    if (this.loaderTimer) {
      this.loaderTimer.remove();
      if ((this.loaderTimer as any).messageTimer) {
        ((this.loaderTimer as any).messageTimer as Phaser.Time.TimerEvent).remove();
      }
      this.loaderTimer = undefined;
    }
    this.loaderGraphics.clear();
  }

  private returnToMenu() {
    // Pulisci eventuali timer e grafica attivi
    this.stopCyberpunkLoader();
    this.visualizer.clear();

    // Ferma il riconoscimento vocale se attivo
    this.voiceService.stopListening();

    // Mostra messaggio di conferma
    this.instructionText.setText('Returning to Menu...');
    this.statusText.setText('');
    this.transcriptText.setText('');
    this.timerText.setText('');

    // Torna al MenuScene dopo un breve delay
    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }
}
