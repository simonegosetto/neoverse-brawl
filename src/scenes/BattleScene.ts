import Phaser from 'phaser';
import { Fighter } from '../entities/Fighter';
import { CharacterData } from '../types/Character';

export class BattleScene extends Phaser.Scene {
  private player1!: Fighter;
  private player2!: Fighter;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys: any;
  private roundTimer: number = 120; // 120 seconds
  private timerText!: Phaser.GameObjects.Text;
  private roundText!: Phaser.GameObjects.Text;
  private currentRound: number = 1;
  private roundActive: boolean = true;
  private p1Wins: number = 0;
  private p2Wins: number = 0;
  private winsText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data: { player1: CharacterData; player2: CharacterData }) {
    this.registry.set('player1Data', data.player1);
    this.registry.set('player2Data', data.player2);
  }

  create() {
    // Background
    this.createBackground();

    // Get character data
    const p1Data = this.registry.get('player1Data') as CharacterData;
    const p2Data = this.registry.get('player2Data') as CharacterData;

    // Create fighters
    this.player1 = new Fighter(this, 250, 500, p1Data, 1);
    this.player2 = new Fighter(this, 750, 500, p2Data, 2);

    // Setup controls
    this.setupControls();

    // UI
    this.createUI();

    // Start round timer
    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // Round intro
    this.showRoundIntro();
  }

  private createBackground() {
    // Simple gradient background
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x0a0a2e, 0x0a0a2e, 0x16213e, 0x16213e, 1);
    graphics.fillRect(0, 0, 1000, 600);

    // Ground
    const ground = this.add.rectangle(500, 550, 1000, 100, 0x1a1a1a);

    // Grid effect
    for (let i = 0; i < 1000; i += 50) {
      this.add.line(0, 0, i, 500, i, 600, 0x00ff00, 0.1).setOrigin(0);
    }

    // Neoverse logo/text
    this.add.text(500, 30, 'NEOVERSE BRAWL', {
      fontSize: '32px',
      color: '#00ff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
  }

  private setupControls() {
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Player 1 controls: WASD + F, G, H, J
    this.keys = {
      p1: {
        left: this.input.keyboard!.addKey('A'),
        right: this.input.keyboard!.addKey('D'),
        up: this.input.keyboard!.addKey('W'),
        down: this.input.keyboard!.addKey('S'),
        lightAttack: this.input.keyboard!.addKey('F'),
        heavyAttack: this.input.keyboard!.addKey('G'),
        special: this.input.keyboard!.addKey('H'),
        ultimate: this.input.keyboard!.addKey('J'),
        dash: this.input.keyboard!.addKey('SHIFT')
      },
      p2: {
        left: this.cursors.left,
        right: this.cursors.right,
        up: this.cursors.up,
        down: this.cursors.down,
        lightAttack: this.input.keyboard!.addKey('U'),
        heavyAttack: this.input.keyboard!.addKey('I'),
        special: this.input.keyboard!.addKey('O'),
        ultimate: this.input.keyboard!.addKey('P'),
        dash: this.input.keyboard!.addKey('ENTER')
      }
    };
  }

  private createUI() {
    // Round counter
    this.roundText = this.add.text(500, 70, `ROUND ${this.currentRound}`, {
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Timer
    this.timerText = this.add.text(500, 100, this.formatTime(this.roundTimer), {
      fontSize: '36px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Wins counter
    this.winsText = this.add.text(500, 135, `${this.p1Wins} - ${this.p2Wins}`, {
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Controls hint
    this.add.text(20, 560, 'P1: WASD + FGHJ', {
      fontSize: '14px',
      color: '#00ff00'
    });

    this.add.text(800, 560, 'P2: Arrows + UIOP', {
      fontSize: '14px',
      color: '#00ff00'
    });
  }

  private showRoundIntro() {
    this.roundActive = false;

    const introText = this.add.text(500, 300, 'FIGHT!', {
      fontSize: '96px',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 10
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: introText,
      alpha: 1,
      scale: 1.5,
      duration: 500,
      yoyo: true,
      onComplete: () => {
        introText.destroy();
        this.roundActive = true;
      }
    });
  }

  update(time: number, delta: number) {
    if (!this.roundActive) return;

    // Update fighters
    this.player1.update(time, delta);
    this.player2.update(time, delta);

    // Player 1 controls
    if (this.keys.p1.left.isDown) {
      this.player1.moveLeft();
    } else if (this.keys.p1.right.isDown) {
      this.player1.moveRight();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.p1.up)) {
      this.player1.jump();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.p1.lightAttack)) {
      this.player1.lightAttack(this.player2);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.p1.heavyAttack)) {
      this.player1.heavyAttack(this.player2);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.p1.special)) {
      this.player1.special1(this.player2);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.p1.ultimate)) {
      this.player1.ultimate(this.player2);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.p1.dash)) {
      this.player1.dash();
    }

    // Player 2 controls
    if (this.keys.p2.left.isDown) {
      this.player2.moveLeft();
    } else if (this.keys.p2.right.isDown) {
      this.player2.moveRight();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.p2.up)) {
      this.player2.jump();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.p2.lightAttack)) {
      this.player2.lightAttack(this.player1);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.p2.heavyAttack)) {
      this.player2.heavyAttack(this.player1);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.p2.special)) {
      this.player2.special1(this.player1);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.p2.ultimate)) {
      this.player2.ultimate(this.player1);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.p2.dash)) {
      this.player2.dash();
    }

    // Check round end conditions
    this.checkRoundEnd();
  }

  private updateTimer() {
    if (!this.roundActive) return;

    this.roundTimer--;
    this.timerText.setText(this.formatTime(this.roundTimer));

    if (this.roundTimer <= 10) {
      this.timerText.setColor('#ff0000');
    }

    if (this.roundTimer <= 0) {
      this.endRound('timeout');
    }
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  private checkRoundEnd() {
    if (this.player1.isKO()) {
      console.log('Player 1 KO! Health:', this.player1.getHealth());
      this.endRound('p2');
    } else if (this.player2.isKO()) {
      console.log('Player 2 KO! Health:', this.player2.getHealth());
      this.endRound('p1');
    }
  }

  private endRound(winner: 'p1' | 'p2' | 'timeout') {
    console.log('endRound called! Winner:', winner, 'P1 HP:', this.player1.getHealth(), 'P2 HP:', this.player2.getHealth());
    this.roundActive = false;

    let winnerText = '';

    if (winner === 'timeout') {
      // Judge by health
      if (this.player1.getHealth() > this.player2.getHealth()) {
        this.p1Wins++;
        winnerText = `${this.player1.characterData.name} WINS!`;
      } else if (this.player2.getHealth() > this.player1.getHealth()) {
        this.p2Wins++;
        winnerText = `${this.player2.characterData.name} WINS!`;
      } else {
        winnerText = 'DRAW!';
      }
    } else if (winner === 'p1') {
      this.p1Wins++;
      winnerText = `${this.player1.characterData.name} WINS!`;
    } else {
      this.p2Wins++;
      winnerText = `${this.player2.characterData.name} WINS!`;
    }

    this.winsText.setText(`${this.p1Wins} - ${this.p2Wins}`);

    const resultText = this.add.text(500, 300, winnerText, {
      fontSize: '72px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      resultText.destroy();

      // Check if match is over (best of 3)
      if (this.p1Wins >= 2 || this.p2Wins >= 2) {
        this.endMatch();
      } else {
        this.startVoiceCreationPhase();
      }
    });
  }

  private endMatch() {
    const matchWinner = this.p1Wins > this.p2Wins ?
      this.player1.characterData.name :
      this.player2.characterData.name;

    const victoryText = this.add.text(500, 300, `${matchWinner}\nVICTORY!`, {
      fontSize: '64px',
      color: '#ff00ff',
      stroke: '#000000',
      strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5);

    this.time.delayedCall(3000, () => {
      this.scene.start('VoiceCreationScene');
    });
  }

  private startVoiceCreationPhase() {
    this.scene.start('VoiceCreationScene', {
      currentRound: this.currentRound + 1,
      p1Wins: this.p1Wins,
      p2Wins: this.p2Wins,
      continueMatch: true
    });
  }
}
