# 🔧 NEOVERSE BRAWL - Technical Documentation

## Architecture Overview

### Core Systems

#### 1. Character Generation Pipeline
```
Voice Input → Transcript → Claude API → JSON → Character Object → Fighter Entity
```

**Flow Details:**
- VoiceInputService captures 5s audio via Web Speech API
- Transcript sent to ClaudeCharacterGenerator
- Claude returns structured JSON with character data
- Character spawned as Fighter instance in BattleScene

#### 2. Combat System

**Fighter State Machine:**
```
IDLE → MOVING → ATTACKING → STUNNED → KO
```

**Hit Detection:**
- Distance-based collision (Euclidean distance)
- Facing direction check (attacker must face opponent)
- Range varies by attack type and character stats

**Damage Calculation:**
```typescript
actualDamage = baseDamage - (targetDefense * 2)
baseDamage = power * attackMultiplier
```

**Special Energy System:**
- Charges on successful hits
- Gain rate modified by `special_gain` stat
- Light Attack: +10 energy
- Heavy Attack: +20 energy
- Taking damage: +5 energy

#### 3. Animation System

Currently using placeholder rectangles. Future implementation:

```typescript
interface AnimationFrame {
  sprite: Phaser.GameObjects.Image;
  duration: number;
  hitbox?: Phaser.Geom.Rectangle;
}

class AnimationController {
  playAnimation(name: string, loop: boolean): void;
  onAnimationComplete(callback: Function): void;
}
```

---

## Future Enhancements

### Phase 1: Visual Improvements

#### Sprite Generation
Integrate AI image generation for character sprites:

```typescript
// Option A: DALL-E Integration
async generateSprites(description: string): Promise<SpriteSheet> {
  const prompt = `pixel art character sprite sheet, ${description}, 
                  idle, walk, attack animations, 32x32px, transparent background`;
  const image = await dalleAPI.generate(prompt);
  return processSpriteSheet(image);
}

// Option B: Stable Diffusion Local
async generateSprites(description: string): Promise<SpriteSheet> {
  const result = await stableDiffusion.txt2img({
    prompt: `${description}, pixel art, sprite sheet`,
    steps: 20,
    cfg_scale: 7
  });
  return result;
}
```

#### Particle Effects
```typescript
class ParticleManager {
  createHitEffect(x: number, y: number, type: string): void;
  createTrailEffect(fighter: Fighter): void;
  createUltimateEffect(fighter: Fighter): void;
}
```

### Phase 2: Advanced Combat

#### Combo System
```typescript
interface ComboNode {
  input: string;  // 'light', 'heavy', 'special'
  next: ComboNode[];
  damage: number;
  animation: string;
}

class ComboSystem {
  private comboTree: ComboNode;
  private currentCombo: ComboNode[];
  private comboWindow: number = 500; // ms
  
  checkComboInput(input: string): boolean;
  executeCombo(): void;
  resetCombo(): void;
}
```

#### Frame Data
```typescript
interface FrameData {
  startup: number;    // frames before hitbox active
  active: number;     // frames hitbox is active
  recovery: number;   // frames after attack ends
  blockstun: number;  // frames opponent is stunned if blocked
  hitstun: number;    // frames opponent is stunned if hit
}
```

#### Blocking & Parrying
```typescript
class DefenseSystem {
  block(fighter: Fighter): void {
    fighter.state = 'BLOCKING';
    fighter.damageReduction = 0.7; // 70% reduction
  }
  
  parry(fighter: Fighter, timing: number): boolean {
    const perfectParry = timing < 100; // ms
    if (perfectParry) {
      fighter.gainSpecialEnergy(30);
      return true;
    }
    return false;
  }
}
```

### Phase 3: Game Modes

#### Arcade Mode
```typescript
interface ArcadeConfig {
  stages: number;
  difficultyScaling: (stage: number) => number;
  bossStages: number[];
  rewards: Reward[];
}

class ArcadeMode extends Phaser.Scene {
  private currentStage: number = 1;
  private aiDifficulty: number = 1;
  
  generateOpponent(): CharacterData {
    const difficulty = this.difficultyScaling(this.currentStage);
    // Generate AI-powered opponent with scaled stats
  }
}
```

#### Boss Mode
```typescript
interface BossCharacter extends CharacterData {
  phases: BossPhase[];
  mechanics: BossMechanic[];
}

interface BossPhase {
  healthThreshold: number;
  newMoves: string[];
  statBoosts: Partial<CharacterStats>;
}
```

### Phase 4: Online Multiplayer

#### Network Architecture
```typescript
// Using WebSockets + Rollback Netcode
class NetworkManager {
  private socket: WebSocket;
  private inputHistory: Map<number, PlayerInput>;
  private stateHistory: Map<number, GameState>;
  
  sendInput(frame: number, input: PlayerInput): void;
  receiveInput(frame: number, input: PlayerInput): void;
  rollback(toFrame: number): void;
  predictFrame(): void;
}

interface PlayerInput {
  frame: number;
  keys: {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    light: boolean;
    heavy: boolean;
    special: boolean;
    ultimate: boolean;
  };
}
```

#### Lobby System
```typescript
class LobbyScene extends Phaser.Scene {
  private matchmaking: MatchmakingService;
  
  async findMatch(): Promise<Match> {
    return this.matchmaking.findOpponent({
      skillLevel: this.playerSkill,
      region: this.region
    });
  }
  
  createPrivateRoom(): string {
    return this.matchmaking.createRoom();
  }
}
```

### Phase 5: Progression & Unlocks

#### Character Roster
```typescript
class RosterManager {
  private unlockedCharacters: CharacterData[];
  private favoriteCharacters: CharacterData[];
  
  saveCharacter(character: CharacterData): void {
    localStorage.setItem(
      `character_${character.name}`,
      JSON.stringify(character)
    );
  }
  
  loadRoster(): CharacterData[] {
    const saved = localStorage.getItem('roster');
    return saved ? JSON.parse(saved) : [];
  }
}
```

#### Achievement System
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (stats: PlayerStats) => boolean;
  reward: Reward;
}

class AchievementTracker {
  checkAchievements(event: GameEvent): void;
  unlockAchievement(id: string): void;
}
```

---

## Performance Optimization

### Object Pooling
```typescript
class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  
  get(): T {
    return this.pool.pop() || this.factory();
  }
  
  release(obj: T): void {
    this.pool.push(obj);
  }
}

// Usage
const projectilePool = new ObjectPool(() => 
  scene.add.circle(0, 0, 10)
);
```

### Sprite Atlas
```typescript
// Combine all character sprites into single texture atlas
class SpriteAtlasGenerator {
  async generateAtlas(characters: CharacterData[]): Promise<TextureAtlas> {
    const sprites = await this.generateAllSprites(characters);
    return this.packSprites(sprites);
  }
}
```

---

## Testing Strategy

### Unit Tests
```typescript
describe('Fighter Combat', () => {
  test('light attack hits within range', () => {
    const attacker = createFighter(100, 100);
    const target = createFighter(150, 100);
    
    attacker.lightAttack(target);
    
    expect(target.getHealth()).toBeLessThan(target.maxHealth);
  });
  
  test('special requires energy', () => {
    const fighter = createFighter(100, 100);
    fighter.specialEnergy = 0;
    
    const result = fighter.special1(opponent);
    
    expect(result).toBe(false);
  });
});
```

### Integration Tests
```typescript
describe('Voice to Combat Pipeline', () => {
  test('voice input generates playable character', async () => {
    const voiceInput = "un ninja veloce";
    const generator = new ClaudeCharacterGenerator();
    
    const result = await generator.generateCharacter({ 
      voiceTranscript: voiceInput 
    });
    
    expect(result.success).toBe(true);
    expect(result.character.stats.hp).toBeGreaterThan(0);
  });
});
```

---

## API Rate Limiting

### Claude API Caching
```typescript
class CharacterCache {
  private cache: Map<string, CharacterData> = new Map();
  
  getCached(voiceInput: string): CharacterData | null {
    const normalized = this.normalizeInput(voiceInput);
    return this.cache.get(normalized) || null;
  }
  
  setCached(voiceInput: string, character: CharacterData): void {
    const normalized = this.normalizeInput(voiceInput);
    this.cache.set(normalized, character);
  }
  
  private normalizeInput(input: string): string {
    return input.toLowerCase().trim();
  }
}
```

---

## Deployment

### Build for Production
```bash
npm run build
```

### Hosting Options
- **Netlify**: Auto-deploy from Git, CDN, free tier
- **Vercel**: Similar to Netlify, optimized for frontend
- **GitHub Pages**: Free hosting for static sites
- **itch.io**: Game-specific platform

### Environment Variables
```env
VITE_CLAUDE_API_KEY=your_api_key_here
VITE_API_ENDPOINT=https://api.anthropic.com/v1/messages
VITE_ENVIRONMENT=production
```

---

## Monitoring & Analytics

### Event Tracking
```typescript
class AnalyticsTracker {
  trackCharacterGeneration(character: CharacterData): void {
    this.sendEvent('character_generated', {
      archetype: character.archetype,
      timestamp: Date.now()
    });
  }
  
  trackBattleResult(winner: string, duration: number): void {
    this.sendEvent('battle_completed', {
      winner,
      duration,
      timestamp: Date.now()
    });
  }
}
```

---

## License & Credits

MIT License - Feel free to modify and expand!

**Credits:**
- Game Engine: Phaser 3
- AI: Claude (Anthropic)
- Voice: Web Speech API
- Developer: Simone
