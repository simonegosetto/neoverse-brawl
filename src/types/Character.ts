// Character data structures based on GDD

export type Archetype = 
  | 'Bruiser'
  | 'Striker'
  | 'Zoner'
  | 'Summoner'
  | 'Tank'
  | 'Wildcard';

export interface CharacterStats {
  hp: number;           // 1-10
  power: number;        // 1-10
  speed: number;        // 1-10
  defense: number;      // 1-10
  stamina: number;      // 1-10
  range: number;        // 1-10
  special_gain: number; // 1-10
}

export interface CharacterMoveset {
  light: string;
  heavy: string;
  dash: string;
  special1: string;
  special2?: string;
  ultimate?: string;
}

export interface SpritePack {
  idle: string;
  walk: string;
  jump: string;
  light_attack: string;
  heavy_attack: string;
  special: string;
  hit: string;
  ko: string;
}

export interface CharacterData {
  name: string;
  description: string;
  archetype: Archetype;
  stats: CharacterStats;
  moveset: CharacterMoveset;
  passive: string;
  spritePack: SpritePack;
}

export interface GenerationRequest {
  voiceTranscript: string;
  context?: string;
}

export interface GenerationResponse {
  character: CharacterData;
  success: boolean;
  error?: string;
}
