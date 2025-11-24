import { CharacterData, GenerationRequest, GenerationResponse } from '../types/Character';
import { SpriteGeneratorService } from './SpriteGeneratorService';

export class ClaudeCharacterGenerator {
  private spriteGenerator: SpriteGeneratorService;
  // private apiEndpoint = 'https://api.anthropic.com/v1/messages';
  private apiEndpoint = 'https://betest.loonar.it:8080/pm/ai/text-generator';

  constructor() {
    this.spriteGenerator = new SpriteGeneratorService();
  }

  async generateCharacter(request: GenerationRequest): Promise<GenerationResponse> {
    const prompt = this.buildPrompt(request.voiceTranscript);

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: "generate",
            length: 1024,
            model: "claude-sonnet-4-20250514",
            prompt: prompt,
            provider: "anthropic",
            systemPrompt: "",
            tone: "comic",
        }/*{
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        }*/)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const characterJson = this.extractJSON(data.response);
      const character = JSON.parse(characterJson) as CharacterData;

      // Genera anche la sprite (in background, non blocca)
      this.generateSpriteForCharacter(character).catch(err => {
        console.warn('Sprite generation failed (using fallback):', err);
      });

      return {
        character,
        success: true
      };
    } catch (error) {
      console.error('Character generation failed:', error);
      return {
        character: this.getFallbackCharacter(request.voiceTranscript),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private buildPrompt(voiceInput: string): string {
    return `Genera un personaggio 2D per un picchiaduro basato su questa descrizione vocale: "${voiceInput}".

IMPORTANTE: Rispondi SOLO con un JSON valido, senza testo aggiuntivo, seguendo ESATTAMENTE questo schema:

{
  "name": "nome del personaggio",
  "description": "breve descrizione del personaggio",
  "archetype": "uno tra: Bruiser, Striker, Zoner, Summoner, Tank, Wildcard",
  "stats": {
    "hp": numero 1-10,
    "power": numero 1-10,
    "speed": numero 1-10,
    "defense": numero 1-10,
    "stamina": numero 1-10,
    "range": numero 1-10,
    "special_gain": numero 1-10
  },
  "moveset": {
    "light": "descrizione attacco leggero",
    "heavy": "descrizione attacco pesante",
    "dash": "descrizione movimento/dash",
    "special1": "descrizione abilità speciale 1",
    "special2": "descrizione abilità speciale 2 (opzionale)",
    "ultimate": "descrizione ultimate (opzionale)"
  },
  "passive": "descrizione abilità passiva unica",
  "spritePack": {
    "idle": "descrizione 4 frame idle animation",
    "walk": "descrizione 6 frame walk animation",
    "jump": "descrizione 2 frame jump animation",
    "light_attack": "descrizione 4 frame light attack animation",
    "heavy_attack": "descrizione 6 frame heavy attack animation",
    "special": "descrizione special move animation",
    "hit": "descrizione 2 frame hit reaction",
    "ko": "descrizione 1-2 frame KO animation"
  }
}

Regole:
- Stats devono essere numeri da 1 a 10
- Il personaggio deve essere bilanciato e giocabile
- Le animazioni devono essere descritte in stile pixel art cartoon tipo Metal Slug
- La passiva deve essere unica e tematica
- Le mosse devono essere coerenti con l'archetype scelto
- Rispondi SOLO con il JSON, nient'altro`;
  }

  private extractJSON(text: string): string {
    // Remove markdown code blocks if present
    let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Find JSON object
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }

    return cleaned;
  }

  private getFallbackCharacter(voiceInput: string): CharacterData {
    // Fallback character in case API fails
    return {
      name: 'Glitch Warrior',
      description: `Un guerriero generato dal frammento vocale: "${voiceInput}"`,
      archetype: 'Wildcard',
      stats: {
        hp: 7,
        power: 6,
        speed: 7,
        defense: 5,
        stamina: 6,
        range: 5,
        special_gain: 7
      },
      moveset: {
        light: 'Pugno rapido con effetto glitch',
        heavy: 'Calcio rotante che distorce lo spazio',
        dash: 'Teleport corto con scia digitale',
        special1: 'Emette onde sonore basate sul voice input',
        special2: 'Clona se stesso per 2 secondi',
        ultimate: 'Reality Break - distorce l\'arena danneggiando tutti'
      },
      passive: 'Ogni colpo ha 10% di causare glitch visivi che confondono l\'avversario',
      spritePack: {
        idle: '4 frame: figura umanoide con effetti glitch che pulsano',
        walk: '6 frame: camminata normale con distorsioni digitali casuali',
        jump: '2 frame: salto con particelle pixel che si disperdono',
        light_attack: '4 frame: pugno veloce con trail luminoso verde',
        heavy_attack: '6 frame: calcio rotante con effetto distorsione spaziale',
        special: 'Onde concentriche di energia sonora emanano dal corpo',
        hit: '2 frame: corpo che si pixela parzialmente',
        ko: '2 frame: dissoluzione in particelle luminose'
      }
    };
  }

  /**
   * Genera la sprite per il personaggio (asincrono, non blocca il gioco)
   */
  private async generateSpriteForCharacter(character: CharacterData): Promise<void> {
    console.log(`🎨 Starting sprite generation for ${character.name}...`);

    try {
      const spriteImage = await this.spriteGenerator.generateSprite({
        description: character.description,
        archetype: character.archetype,
        name: character.name,
        stats: character.stats
      });

      if (spriteImage) {
        console.log(`✅ Sprite generated successfully for ${character.name}`);

        // La sprite sarà disponibile per il prossimo utilizzo del personaggio
        // (per ora è solo in memoria, ma potrebbe essere salvata)

        // Emit evento per notificare che la sprite è pronta
        window.dispatchEvent(new CustomEvent('sprite-generated', {
          detail: {
            characterName: character.name,
            spriteImage
          }
        }));
      }
    } catch (error) {
      console.error(`❌ Failed to generate sprite for ${character.name}:`, error);
      throw error;
    }
  }
}
