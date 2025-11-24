/**
 * Service per generare sprite dei personaggi usando AI
 * Supporta multiple API di generazione immagini
 */

export interface SpriteGenerationOptions {
  description: string;
  archetype: string;
  name: string;
  stats: {
    power: number;
    speed: number;
    defense: number;
    hp: number;
    special_gain: number;
  };
}

export class SpriteGeneratorService {
  private apiKey: string = '';

  constructor() {
    // Prova a leggere API key da environment o config
    try {
      this.apiKey = (import.meta as any).env?.VITE_OPENAI_API_KEY || '';
    } catch {
      this.apiKey = '';
    }
  }

  /**
   * Genera una sprite usando DALL-E (o fallback a sprite procedurali)
   */
  async generateSprite(options: SpriteGenerationOptions): Promise<HTMLImageElement | null> {
    console.log('🎨 Generating sprite for:', options.name);

    // Se abbiamo API key, usa DALL-E
    if (this.apiKey) {
      try {
        return await this.generateWithDALLE(options);
      } catch (error) {
        console.warn('DALL-E generation failed, using fallback:', error);
      }
    }

    // Fallback: genera sprite procedurale migliorata con canvas
    return this.generateProceduralSprite(options);
  }

  /**
   * Genera sprite usando DALL-E API
   * Usa b64_json per evitare completamente problemi CORS
   */
  private async generateWithDALLE(options: SpriteGenerationOptions): Promise<HTMLImageElement | null> {
    const prompt = this.buildPrompt(options);

    console.log('📝 DALL-E Prompt:', prompt);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid",
        response_format: "b64_json" // ✅ Richiede base64 invece di URL!
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DALL-E API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const base64Data = data.data[0].b64_json;

    console.log('✅ DALL-E image received as base64, loading...');

    // Carica direttamente da base64 (NO CORS!)
    return await this.loadImageFromBase64(base64Data);
  }

  /**
   * Carica un'immagine da stringa base64
   * Nessun problema CORS perché è tutto locale!
   */
  private async loadImageFromBase64(base64Data: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        console.log('✅ Image loaded successfully from base64!');
        resolve(img);
      };

      img.onerror = (error) => {
        console.error('❌ Failed to load image from base64:', error);
        reject(new Error('Failed to load image from base64'));
      };

      // Costruisci data URL da base64
      img.src = `data:image/png;base64,${base64Data}`;
    });
  }

  /**
   * Costruisce il prompt per l'AI basandosi sulla descrizione del personaggio
   */
  private buildPrompt(options: SpriteGenerationOptions): string {
    const { description, archetype, name, stats } = options;

    // Determina caratteristiche fisiche dalle stats
    const physicalTraits = this.getPhysicalTraitsFromStats(stats);

    return `Create a pixel art fighting game character sprite for "${name}".

DESCRIPTION: ${description}

ARCHETYPE: ${archetype}

PHYSICAL TRAITS (based on stats):
- Build: ${physicalTraits.build}
- Size: ${physicalTraits.size}
- Posture: ${physicalTraits.posture}

STYLE REQUIREMENTS:
- 32x32 pixel art sprite
- Fighting game character
- Front-facing pose
- Combat ready stance
- Clean pixel art style (like Street Fighter or King of Fighters)
- Transparent background
- 16-bit era quality
- Bold outlines
- Limited color palette (8-16 colors)
- Readable at small size

Focus on making the character visually match their description while maintaining pixel art aesthetics.`;
  }

  /**
   * Determina caratteristiche fisiche dalle stats
   */
  private getPhysicalTraitsFromStats(stats: any) {
    const { power, speed, defense, hp } = stats;

    let build = 'average';
    if (power > 7 && defense > 6) build = 'muscular and bulky';
    else if (power > 7) build = 'muscular and athletic';
    else if (speed > 7 && defense < 5) build = 'lean and agile';
    else if (hp > 8) build = 'large and sturdy';

    let size = 'medium';
    if (hp > 8 || defense > 7) size = 'large';
    else if (speed > 8) size = 'smaller and nimble';

    let posture = 'balanced stance';
    if (power > 7) posture = 'aggressive forward stance';
    else if (defense > 7) posture = 'defensive guarded stance';
    else if (speed > 7) posture = 'dynamic mobile stance';

    return { build, size, posture };
  }

  /**
   * Genera sprite procedurale migliorata usando Canvas
   */
  private generateProceduralSprite(options: SpriteGenerationOptions): HTMLImageElement {
    console.log('🎨 Generating procedural sprite for:', options.name);

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Sfondo trasparente
    ctx.clearRect(0, 0, 128, 128);

    // Colore base dall'archetipo
    const color = this.getArchetypeColor(options.archetype);

    // Genera personaggio procedurale basato sulla descrizione
    this.drawProceduralCharacter(ctx, options, color);

    // Converti canvas in immagine
    const img = new Image();
    img.src = canvas.toDataURL();

    return img;
  }

  /**
   * Disegna un personaggio procedurale migliorato
   */
  private drawProceduralCharacter(
    ctx: CanvasRenderingContext2D,
    options: SpriteGenerationOptions,
    baseColor: string
  ) {
    const { stats, archetype, description } = options;

    // Centro del canvas
    const cx = 64;
    const cy = 64;

    // Scala basata su HP e Defense
    const scale = 0.8 + ((stats.hp + stats.defense) / 20) * 0.6;

    // Colori derivati
    const darkColor = this.darkenColor(baseColor, 0.3);
    const lightColor = this.lightenColor(baseColor, 0.3);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // Disegna basandoti sull'archetipo ma con variazioni dalla descrizione
    this.drawEnhancedArchetypeSprite(ctx, archetype, baseColor, darkColor, lightColor, description);

    ctx.restore();
  }

  /**
   * Disegna sprite migliorata con variazioni dalla descrizione
   */
  private drawEnhancedArchetypeSprite(
    ctx: CanvasRenderingContext2D,
    archetype: string,
    color: string,
    dark: string,
    light: string,
    description: string
  ) {
    // Analizza la descrizione per dettagli visivi
    const hasWeapon = /sword|blade|weapon|axe|hammer|gun/i.test(description);
    const hasArmor = /armor|armored|plate|shield|helmet/i.test(description);
    const hasCloak = /cloak|cape|robe|mantle/i.test(description);
    const isRobotic = /robot|mech|cyborg|android|mechanical/i.test(description);
    const isMagical = /magic|mage|wizard|mystic|arcane|spell/i.test(description);

    // Base forma umanoide
    ctx.fillStyle = color;

    // Testa
    ctx.fillRect(-8, -20, 16, 16);

    // Corpo
    ctx.fillRect(-12, -4, 24, 24);

    // Braccia
    ctx.fillRect(-16, -2, 4, 16);
    ctx.fillRect(12, -2, 4, 16);

    // Gambe
    ctx.fillRect(-10, 20, 8, 16);
    ctx.fillRect(2, 20, 8, 16);

    // Aggiungi dettagli basati sulla descrizione
    if (hasArmor) {
      ctx.fillStyle = light;
      // Spallacci
      ctx.fillRect(-16, -4, 6, 6);
      ctx.fillRect(10, -4, 6, 6);
      // Pettorale
      ctx.strokeStyle = dark;
      ctx.strokeRect(-10, 0, 20, 18);
    }

    if (hasCloak) {
      ctx.fillStyle = dark;
      // Mantello
      ctx.beginPath();
      ctx.moveTo(-14, -2);
      ctx.lineTo(-18, 20);
      ctx.lineTo(18, 20);
      ctx.lineTo(14, -2);
      ctx.closePath();
      ctx.fill();
    }

    if (hasWeapon) {
      ctx.fillStyle = '#888888';
      // Spada/arma nella mano
      ctx.fillRect(14, 0, 8, 2);
      ctx.fillRect(20, -6, 2, 12);
    }

    if (isRobotic) {
      ctx.fillStyle = '#666666';
      // Giunture meccaniche
      ctx.fillRect(-4, -4, 8, 2);
      ctx.fillRect(-4, 8, 8, 2);
      // Occhi LED
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(-6, -16, 3, 3);
      ctx.fillRect(3, -16, 3, 3);
    } else if (isMagical) {
      ctx.fillStyle = '#ff00ff';
      // Aura magica
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      // Occhi brillanti
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(-6, -16, 3, 3);
      ctx.fillRect(3, -16, 3, 3);
    } else {
      // Occhi normali
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, -16, 3, 3);
      ctx.fillRect(3, -16, 3, 3);
      ctx.fillStyle = '#000000';
      ctx.fillRect(-5, -15, 2, 2);
      ctx.fillRect(4, -15, 2, 2);
    }

    // Outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(-8, -20, 16, 16);
    ctx.strokeRect(-12, -4, 24, 24);
  }


  /**
   * Ottieni colore base dall'archetipo
   */
  private getArchetypeColor(archetype: string): string {
    const colors: { [key: string]: string } = {
      'Bruiser': '#ff3333',
      'Striker': '#33ff33',
      'Zoner': '#3333ff',
      'Summoner': '#ff33ff',
      'Tank': '#888888',
      'Wildcard': '#ffff33'
    };
    return colors[archetype] || '#ffffff';
  }

  /**
   * Scurisci un colore
   */
  private darkenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - amount));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - amount));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - amount));
    return `#${Math.floor(r).toString(16).padStart(2, '0')}${Math.floor(g).toString(16).padStart(2, '0')}${Math.floor(b).toString(16).padStart(2, '0')}`;
  }

  /**
   * Schiarisci un colore
   */
  private lightenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) * (1 + amount));
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) * (1 + amount));
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) * (1 + amount));
    return `#${Math.floor(r).toString(16).padStart(2, '0')}${Math.floor(g).toString(16).padStart(2, '0')}${Math.floor(b).toString(16).padStart(2, '0')}`;
  }
}

