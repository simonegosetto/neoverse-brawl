// EXAMPLE: How to extend Neoverse Brawl with custom mechanics
// Save as: src/extensions/CustomMechanics.ts

import { Fighter } from '../entities/Fighter';
import { CharacterData } from '../types/Character';

/**
 * EXAMPLE 1: Status Effects System
 * Add burning, freezing, poisoned effects to fighters
 */
export class StatusEffectSystem {
  private effects: Map<Fighter, StatusEffect[]> = new Map();

  applyEffect(fighter: Fighter, effect: StatusEffect) {
    const existing = this.effects.get(fighter) || [];
    existing.push(effect);
    this.effects.set(fighter, existing);
  }

  update(fighter: Fighter, delta: number) {
    const effects = this.effects.get(fighter) || [];
    
    effects.forEach((effect, index) => {
      effect.duration -= delta;
      
      // Apply effect damage/behavior
      if (effect.type === 'burning') {
        // Deal DoT
        if (Math.random() < 0.1) {
          fighter.takeDamage(5, fighter); // self damage
        }
      }
      
      if (effect.type === 'frozen') {
        fighter.stun(100);
      }
      
      // Remove expired effects
      if (effect.duration <= 0) {
        effects.splice(index, 1);
      }
    });
  }
}

interface StatusEffect {
  type: 'burning' | 'frozen' | 'poisoned' | 'stunned';
  duration: number;
  power: number;
}

/**
 * EXAMPLE 2: Weather System
 * Environmental effects that change combat dynamics
 */
export class WeatherSystem {
  private currentWeather: Weather;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.currentWeather = 'clear';
  }

  setWeather(weather: Weather) {
    this.currentWeather = weather;
    this.applyWeatherEffects();
  }

  private applyWeatherEffects() {
    switch (this.currentWeather) {
      case 'rain':
        // Reduce speed for all fighters
        // Add slippery movement
        this.createRainParticles();
        break;
      case 'storm':
        // Random lightning strikes
        this.spawnLightning();
        break;
      case 'wind':
        // Affects projectile trajectory
        break;
    }
  }

  private createRainParticles() {
    const particles = this.scene.add.particles(0, 0, 'rain', {
      x: { min: 0, max: 1000 },
      y: -10,
      speedY: { min: 400, max: 600 },
      lifespan: 2000,
      scale: 0.5,
      alpha: 0.6
    });
  }

  private spawnLightning() {
    this.scene.time.addEvent({
      delay: 5000,
      callback: () => {
        const x = Phaser.Math.Between(100, 900);
        // Create lightning effect
        const lightning = this.scene.add.line(
          0, 0, x, 0, x, 600, 0xffff00
        ).setLineWidth(3);
        
        this.scene.time.delayedCall(100, () => {
          lightning.destroy();
        });
      },
      loop: true
    });
  }
}

type Weather = 'clear' | 'rain' | 'storm' | 'wind' | 'fog';

/**
 * EXAMPLE 3: Item/Pickup System
 * Spawn power-ups during battle
 */
export class ItemSystem {
  private scene: Phaser.Scene;
  private activeItems: Item[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  spawnRandomItem() {
    const x = Phaser.Math.Between(100, 900);
    const y = 400;
    
    const itemTypes: ItemType[] = ['health', 'power', 'speed', 'shield'];
    const type = Phaser.Utils.Array.GetRandom(itemTypes);
    
    const item: Item = {
      type,
      sprite: this.createItemSprite(x, y, type),
      collected: false
    };
    
    this.activeItems.push(item);
  }

  private createItemSprite(x: number, y: number, type: ItemType): Phaser.GameObjects.Rectangle {
    const colors = {
      health: 0x00ff00,
      power: 0xff0000,
      speed: 0x00ffff,
      shield: 0xffff00
    };
    
    return this.scene.add.rectangle(x, y, 30, 30, colors[type]);
  }

  checkCollision(fighter: Fighter) {
    this.activeItems.forEach((item, index) => {
      if (!item.collected) {
        const distance = Phaser.Math.Distance.Between(
          fighter.x, fighter.y,
          item.sprite.x, item.sprite.y
        );
        
        if (distance < 50) {
          this.collectItem(fighter, item);
          this.activeItems.splice(index, 1);
        }
      }
    });
  }

  private collectItem(fighter: Fighter, item: Item) {
    item.collected = true;
    item.sprite.destroy();
    
    switch (item.type) {
      case 'health':
        // Heal fighter
        fighter.takeDamage(-50, fighter); // negative damage = heal
        break;
      case 'power':
        // Temporary power boost
        fighter.characterData.stats.power += 2;
        break;
      case 'speed':
        fighter.characterData.stats.speed += 2;
        break;
      case 'shield':
        // Temporary shield
        fighter.characterData.stats.defense += 3;
        break;
    }
  }
}

interface Item {
  type: ItemType;
  sprite: Phaser.GameObjects.Rectangle;
  collected: boolean;
}

type ItemType = 'health' | 'power' | 'speed' | 'shield';

/**
 * EXAMPLE 4: AI Opponent System
 * Simple AI behavior for single player mode
 */
export class AIController {
  private fighter: Fighter;
  private target: Fighter;
  private decision_cooldown: number = 0;

  constructor(fighter: Fighter, target: Fighter) {
    this.fighter = fighter;
    this.target = target;
  }

  update(delta: number) {
    this.decision_cooldown -= delta;
    
    if (this.decision_cooldown <= 0) {
      this.makeDecision();
      this.decision_cooldown = 500; // Decide every 500ms
    }
  }

  private makeDecision() {
    const distance = Phaser.Math.Distance.Between(
      this.fighter.x, this.fighter.y,
      this.target.x, this.target.y
    );
    
    // Strategy based on archetype
    switch (this.fighter.characterData.archetype) {
      case 'Striker':
        this.aggressiveStrategy(distance);
        break;
      case 'Tank':
        this.tankStrategy(distance);
        break;
      case 'Zoner':
        this.rangedStrategy(distance);
        break;
      default:
        this.balancedStrategy(distance);
    }
  }

  private aggressiveStrategy(distance: number) {
    if (distance > 100) {
      // Move closer
      if (this.target.x > this.fighter.x) {
        this.fighter.moveRight();
      } else {
        this.fighter.moveLeft();
      }
    } else {
      // Attack
      const rand = Math.random();
      if (rand < 0.5) {
        this.fighter.lightAttack(this.target);
      } else if (rand < 0.8) {
        this.fighter.heavyAttack(this.target);
      } else {
        this.fighter.special1(this.target);
      }
    }
  }

  private tankStrategy(distance: number) {
    // Stay at medium range, use heavy attacks
    if (distance > 150) {
      if (this.target.x > this.fighter.x) {
        this.fighter.moveRight();
      } else {
        this.fighter.moveLeft();
      }
    } else if (distance < 80) {
      // Too close, back up
      if (this.target.x > this.fighter.x) {
        this.fighter.moveLeft();
      } else {
        this.fighter.moveRight();
      }
    } else {
      this.fighter.heavyAttack(this.target);
    }
  }

  private rangedStrategy(distance: number) {
    // Maintain distance, use specials
    if (distance < 200) {
      // Back away
      if (this.target.x > this.fighter.x) {
        this.fighter.moveLeft();
      } else {
        this.fighter.moveRight();
      }
    }
    
    // Fire projectiles
    if (Math.random() < 0.3) {
      this.fighter.special1(this.target);
    } else {
      this.fighter.lightAttack(this.target);
    }
  }

  private balancedStrategy(distance: number) {
    // Mix of approaches
    if (distance > 120) {
      if (this.target.x > this.fighter.x) {
        this.fighter.moveRight();
      } else {
        this.fighter.moveLeft();
      }
    } else {
      const rand = Math.random();
      if (rand < 0.4) {
        this.fighter.lightAttack(this.target);
      } else if (rand < 0.7) {
        this.fighter.heavyAttack(this.target);
      } else {
        this.fighter.special1(this.target);
      }
    }
  }
}

/**
 * EXAMPLE 5: Custom Character Modifier
 * Modify generated characters with custom rules
 */
export class CharacterModifier {
  static applyTheme(character: CharacterData, theme: string): CharacterData {
    const modified = { ...character };
    
    switch (theme) {
      case 'berserker':
        modified.stats.power += 3;
        modified.stats.defense -= 2;
        modified.passive = `${modified.passive} + Rage: Deal more damage when low HP`;
        break;
      case 'tank':
        modified.stats.hp += 3;
        modified.stats.defense += 3;
        modified.stats.speed -= 2;
        break;
      case 'speedster':
        modified.stats.speed += 4;
        modified.stats.power -= 1;
        modified.moveset.dash = 'Ultra-fast triple dash';
        break;
    }
    
    return modified;
  }
  
  static balanceStats(character: CharacterData): CharacterData {
    const total = Object.values(character.stats).reduce((a, b) => a + b, 0);
    const target = 45; // Target total stat points
    
    if (total > target) {
      // Nerf
      const excess = total - target;
      const reduction = excess / 7;
      Object.keys(character.stats).forEach(key => {
        character.stats[key as keyof typeof character.stats] -= reduction;
      });
    }
    
    return character;
  }
}

// Usage example in BattleScene:
/*
import { StatusEffectSystem, WeatherSystem, ItemSystem, AIController } from '../extensions/CustomMechanics';

class BattleScene extends Phaser.Scene {
  private statusSystem!: StatusEffectSystem;
  private weatherSystem!: WeatherSystem;
  private itemSystem!: ItemSystem;
  private aiController!: AIController;
  
  create() {
    // ... existing code ...
    
    this.statusSystem = new StatusEffectSystem();
    this.weatherSystem = new WeatherSystem(this);
    this.itemSystem = new ItemSystem(this);
    
    // Set random weather
    this.weatherSystem.setWeather('rain');
    
    // Spawn items periodically
    this.time.addEvent({
      delay: 10000,
      callback: () => this.itemSystem.spawnRandomItem(),
      loop: true
    });
    
    // If single player mode
    this.aiController = new AIController(this.player2, this.player1);
  }
  
  update(time: number, delta: number) {
    // ... existing code ...
    
    this.statusSystem.update(this.player1, delta);
    this.statusSystem.update(this.player2, delta);
    this.itemSystem.checkCollision(this.player1);
    this.itemSystem.checkCollision(this.player2);
    
    if (this.aiController) {
      this.aiController.update(delta);
    }
  }
}
*/
