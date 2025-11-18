import Phaser from 'phaser';
import { CharacterData } from '../types/Character';

export class Fighter extends Phaser.GameObjects.Container {
  public characterData: CharacterData;
  public sprite: Phaser.GameObjects.Rectangle;
  public nameText: Phaser.GameObjects.Text;
  public healthBar: Phaser.GameObjects.Rectangle;
  public healthBarBg: Phaser.GameObjects.Rectangle;
  public specialBar: Phaser.GameObjects.Rectangle;
  public specialBarBg: Phaser.GameObjects.Rectangle;
  
  private currentHealth: number;
  private maxHealth: number;
  private specialEnergy: number = 0;
  private maxSpecialEnergy: number = 100;
  private isAttacking: boolean = false;
  private stunned: boolean = false;
  private velocityX: number = 0;
  private velocityY: number = 0;
  private gravity: number = 0.8;
  private jumpPower: number = -15;
  private isGrounded: boolean = true;
  private facing: number = 1; // 1 = right, -1 = left
  
  constructor(scene: Phaser.Scene, x: number, y: number, characterData: CharacterData, player: number) {
    super(scene, x, y);
    
    this.characterData = characterData;
    this.maxHealth = characterData.stats.hp * 100;
    this.currentHealth = this.maxHealth;
    
    // Create sprite (placeholder colored rectangle based on archetype)
    const color = this.getArchetypeColor(characterData.archetype);
    this.sprite = scene.add.rectangle(0, 0, 60, 80, color);
    this.add(this.sprite);
    
    // Name tag
    this.nameText = scene.add.text(0, -60, characterData.name, {
      fontSize: '12px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.add(this.nameText);
    
    // Health bar background
    this.healthBarBg = scene.add.rectangle(-30, -50, 60, 6, 0x000000);
    this.add(this.healthBarBg);
    
    // Health bar
    this.healthBar = scene.add.rectangle(-30, -50, 60, 6, 0x00ff00);
    this.add(this.healthBar);
    
    // Special bar background
    this.specialBarBg = scene.add.rectangle(-30, -42, 60, 4, 0x000000);
    this.add(this.specialBarBg);
    
    // Special bar
    this.specialBar = scene.add.rectangle(-30, -42, 0, 4, 0xffff00);
    this.add(this.specialBar);
    
    scene.add.existing(this);
    
    // Set initial facing based on player position
    if (player === 2) {
      this.facing = -1;
      this.sprite.setScale(-1, 1);
    }
  }
  
  private getArchetypeColor(archetype: string): number {
    const colors: { [key: string]: number } = {
      'Bruiser': 0xff3333,
      'Striker': 0x33ff33,
      'Zoner': 0x3333ff,
      'Summoner': 0xff33ff,
      'Tank': 0x888888,
      'Wildcard': 0xffff33
    };
    return colors[archetype] || 0xffffff;
  }
  
  update(time: number, delta: number) {
    // Apply gravity
    if (!this.isGrounded) {
      this.velocityY += this.gravity;
    }
    
    // Update position
    this.x += this.velocityX;
    this.y += this.velocityY;
    
    // Ground collision (simple, assuming ground at y = 500)
    if (this.y >= 500) {
      this.y = 500;
      this.velocityY = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
    
    // Deceleration
    this.velocityX *= 0.85;
    
    // Screen bounds
    if (this.x < 50) this.x = 50;
    if (this.x > 950) this.x = 950;
  }
  
  moveLeft() {
    if (this.stunned || this.isAttacking) return;
    const speed = this.characterData.stats.speed * 0.5;
    this.velocityX = -speed;
    this.facing = -1;
    this.sprite.setScale(-1, 1);
  }
  
  moveRight() {
    if (this.stunned || this.isAttacking) return;
    const speed = this.characterData.stats.speed * 0.5;
    this.velocityX = speed;
    this.facing = 1;
    this.sprite.setScale(1, 1);
  }
  
  jump() {
    if (!this.isGrounded || this.stunned) return;
    this.velocityY = this.jumpPower * (this.characterData.stats.speed / 5);
    this.isGrounded = false;
  }
  
  lightAttack(opponent: Fighter) {
    if (this.isAttacking || this.stunned) return;
    
    this.isAttacking = true;
    const damage = this.characterData.stats.power * 5;
    
    // Visual feedback
    this.sprite.setTint(0xffff00);
    this.scene.time.delayedCall(100, () => {
      this.sprite.clearTint();
      this.isAttacking = false;
    });
    
    // Check if hit
    const distance = Phaser.Math.Distance.Between(this.x, this.y, opponent.x, opponent.y);
    if (distance < 100 && this.facing === (opponent.x > this.x ? 1 : -1)) {
      opponent.takeDamage(damage, this);
      this.gainSpecialEnergy(10);
    }
  }
  
  heavyAttack(opponent: Fighter) {
    if (this.isAttacking || this.stunned) return;
    
    this.isAttacking = true;
    const damage = this.characterData.stats.power * 12;
    
    // Visual feedback
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(200, () => {
      this.sprite.clearTint();
      this.isAttacking = false;
    });
    
    // Check if hit
    const distance = Phaser.Math.Distance.Between(this.x, this.y, opponent.x, opponent.y);
    if (distance < 120 && this.facing === (opponent.x > this.x ? 1 : -1)) {
      opponent.takeDamage(damage, this);
      opponent.knockback(this.facing * 10);
      this.gainSpecialEnergy(20);
    }
  }
  
  special1(opponent: Fighter) {
    if (this.specialEnergy < 30 || this.isAttacking || this.stunned) return;
    
    this.specialEnergy -= 30;
    this.updateSpecialBar();
    this.isAttacking = true;
    
    const damage = this.characterData.stats.power * 15;
    
    // Visual feedback
    this.sprite.setTint(0x00ffff);
    
    // Create projectile or effect based on archetype
    if (this.characterData.archetype === 'Zoner' || this.characterData.archetype === 'Summoner') {
      this.createProjectile(opponent, damage);
    } else {
      // Melee special
      const distance = Phaser.Math.Distance.Between(this.x, this.y, opponent.x, opponent.y);
      if (distance < 150) {
        opponent.takeDamage(damage, this);
        opponent.knockback(this.facing * 15);
      }
    }
    
    this.scene.time.delayedCall(300, () => {
      this.sprite.clearTint();
      this.isAttacking = false;
    });
  }
  
  ultimate(opponent: Fighter) {
    if (this.specialEnergy < 100 || this.isAttacking || this.stunned) return;
    
    this.specialEnergy = 0;
    this.updateSpecialBar();
    this.isAttacking = true;
    
    const damage = this.characterData.stats.power * 30;
    
    // Ultimate visual
    this.sprite.setTint(0xff00ff);
    this.sprite.setScale(this.facing * 1.5, 1.5);
    
    opponent.takeDamage(damage, this);
    opponent.stun(1000);
    
    this.scene.time.delayedCall(500, () => {
      this.sprite.clearTint();
      this.sprite.setScale(this.facing, 1);
      this.isAttacking = false;
    });
  }
  
  dash() {
    if (this.stunned) return;
    const dashPower = this.characterData.stats.speed * 2;
    this.velocityX = this.facing * dashPower;
  }
  
  private createProjectile(opponent: Fighter, damage: number) {
    const projectile = this.scene.add.circle(this.x + (this.facing * 40), this.y, 10, 0xffff00);
    const speed = 8;
    
    this.scene.tweens.add({
      targets: projectile,
      x: this.x + (this.facing * 400),
      duration: 1000,
      onUpdate: () => {
        const distance = Phaser.Math.Distance.Between(projectile.x, projectile.y, opponent.x, opponent.y);
        if (distance < 50) {
          opponent.takeDamage(damage, this);
          projectile.destroy();
        }
      },
      onComplete: () => {
        projectile.destroy();
      }
    });
  }
  
  takeDamage(amount: number, attacker: Fighter) {
    const actualDamage = Math.max(0, amount - (this.characterData.stats.defense * 2));
    this.currentHealth -= actualDamage;
    
    if (this.currentHealth < 0) this.currentHealth = 0;
    
    this.updateHealthBar();
    
    // Hit flash
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.sprite.clearTint();
    });
    
    if (this.currentHealth <= 0) {
      this.knockout();
    }
  }
  
  knockback(force: number) {
    this.velocityX += force;
  }
  
  stun(duration: number) {
    this.stunned = true;
    this.sprite.setAlpha(0.5);
    this.scene.time.delayedCall(duration, () => {
      this.stunned = false;
      this.sprite.setAlpha(1);
    });
  }
  
  gainSpecialEnergy(amount: number) {
    this.specialEnergy += amount * (this.characterData.stats.special_gain / 5);
    if (this.specialEnergy > this.maxSpecialEnergy) {
      this.specialEnergy = this.maxSpecialEnergy;
    }
    this.updateSpecialBar();
  }
  
  private updateHealthBar() {
    const healthPercent = this.currentHealth / this.maxHealth;
    this.healthBar.width = 60 * healthPercent;
    this.healthBar.x = -30 + (60 - this.healthBar.width) / 2;
    
    // Color changes based on health
    if (healthPercent > 0.5) {
      this.healthBar.setFillStyle(0x00ff00);
    } else if (healthPercent > 0.25) {
      this.healthBar.setFillStyle(0xffff00);
    } else {
      this.healthBar.setFillStyle(0xff0000);
    }
  }
  
  private updateSpecialBar() {
    const specialPercent = this.specialEnergy / this.maxSpecialEnergy;
    this.specialBar.width = 60 * specialPercent;
    this.specialBar.x = -30 + (60 - this.specialBar.width) / 2;
  }
  
  knockout() {
    this.stunned = true;
    this.sprite.setAlpha(0.3);
    this.velocityX = 0;
    this.velocityY = 0;
  }
  
  isKO(): boolean {
    return this.currentHealth <= 0;
  }
  
  getHealth(): number {
    return this.currentHealth;
  }
  
  reset() {
    this.currentHealth = this.maxHealth;
    this.specialEnergy = 0;
    this.stunned = false;
    this.isAttacking = false;
    this.velocityX = 0;
    this.velocityY = 0;
    this.sprite.setAlpha(1);
    this.sprite.clearTint();
    this.updateHealthBar();
    this.updateSpecialBar();
  }
}
