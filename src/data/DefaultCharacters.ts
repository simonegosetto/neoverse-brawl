import { CharacterData } from '../types/Character';

export const DEFAULT_CHARACTERS: CharacterData[] = [
  {
    name: 'Blaze Striker',
    description: 'Un guerriero veloce avvolto dalle fiamme',
    archetype: 'Striker',
    stats: {
      hp: 7,
      power: 7,
      speed: 9,
      defense: 5,
      stamina: 8,
      range: 6,
      special_gain: 8
    },
    moveset: {
      light: 'Pugno fiammeggiante rapido',
      heavy: 'Calcio rotante infuocato',
      dash: 'Scatto con scia di fuoco',
      special1: 'Lancia una palla di fuoco',
      special2: 'Aura di fiamme che brucia chi si avvicina',
      ultimate: 'Esplosione di fuoco in area'
    },
    passive: 'Ogni colpo ha 15% di causare burning (DoT)',
    spritePack: {
      idle: '4 frame: figura umana con fiamme che danzano intorno',
      walk: '6 frame: corsa veloce con fiamme al seguito',
      jump: '2 frame: salto acrobatico con spirale di fuoco',
      light_attack: '4 frame: pugno veloce con trail rosso-arancio',
      heavy_attack: '6 frame: calcio rotante con anello di fuoco',
      special: 'Lancia projectile sferico infuocato',
      hit: '2 frame: recoil con particelle di fuoco',
      ko: '2 frame: caduta con fiamme che si spengono'
    }
  },
  {
    name: 'Iron Colossus',
    description: 'Un gigante di metallo quasi indistruttibile',
    archetype: 'Tank',
    stats: {
      hp: 10,
      power: 8,
      speed: 3,
      defense: 10,
      stamina: 7,
      range: 4,
      special_gain: 5
    },
    moveset: {
      light: 'Pugno pesante con onda d\'urto',
      heavy: 'Colpo al suolo che crea cratere',
      dash: 'Carica lenta ma inarrestabile',
      special1: 'Scudo di metallo assorbe danni',
      special2: 'Martello rotante area',
      ultimate: 'Trasformazione in fortezza - invulnerabile 3 sec'
    },
    passive: 'Riflette il 20% dei danni ricevuti',
    spritePack: {
      idle: '4 frame: colosso metallico respirazione pesante',
      walk: '6 frame: passi lenti che fanno tremare il terreno',
      jump: '2 frame: salto basso e potente',
      light_attack: '4 frame: pugno con impatto metallico',
      heavy_attack: '6 frame: slam al suolo con crepe radiali',
      special: 'Scudo energetico metallico si forma davanti',
      hit: '2 frame: corpo subisce danno minimo',
      ko: '2 frame: collasso metallico, parti che si staccano'
    }
  },
  {
    name: 'Phantom Assassin',
    description: 'Ninja delle ombre con teleport',
    archetype: 'Striker',
    stats: {
      hp: 6,
      power: 8,
      speed: 10,
      defense: 4,
      stamina: 7,
      range: 7,
      special_gain: 9
    },
    moveset: {
      light: 'Combo rapida di kunai',
      heavy: 'Affondo letale invisibile',
      dash: 'Teleport corto nelle ombre',
      special1: 'Diventa invisibile per 2 secondi',
      special2: 'Cloni d\'ombra che attaccano',
      ultimate: 'Assassination - danno massiccio da dietro'
    },
    passive: 'Attacchi da dietro fanno +50% danno',
    spritePack: {
      idle: '4 frame: figura oscura che si dissolve parzialmente',
      walk: '6 frame: movimento fluido quasi trasparente',
      jump: '2 frame: salto acrobatico con dissolvenza',
      light_attack: '4 frame: lancio kunai multipli',
      heavy_attack: '6 frame: affondo rapido con scia violacea',
      special: 'Corpo diventa semi-trasparente con effetto nebbia',
      hit: '2 frame: si dissolve parzialmente',
      ko: '2 frame: dissolvenza completa nell\'oscurità'
    }
  },
  {
    name: 'Volt Mage',
    description: 'Mago dell\'elettricità con controllo a distanza',
    archetype: 'Zoner',
    stats: {
      hp: 6,
      power: 9,
      speed: 6,
      defense: 5,
      stamina: 8,
      range: 10,
      special_gain: 9
    },
    moveset: {
      light: 'Scarica elettrica rapida',
      heavy: 'Fulmine dal cielo',
      dash: 'Teletrasporto elettrico',
      special1: 'Catena di fulmini che rimbalza',
      special2: 'Campo elettrico che stordisce',
      ultimate: 'Tempesta di fulmini in tutta l\'arena'
    },
    passive: 'Ogni attacco ha 25% di stordire (0.5s)',
    spritePack: {
      idle: '4 frame: corpo circondato da archi elettrici',
      walk: '6 frame: levitazione con scariche sotto i piedi',
      jump: '2 frame: balzo con propulsione elettrica',
      light_attack: '4 frame: dita che sparano saette',
      heavy_attack: '6 frame: evoca fulmine dall\'alto',
      special: 'Catena di fulmini a zig-zag tra nemici',
      hit: '2 frame: corpo si elettrifica in difesa',
      ko: '2 frame: sovraccarico elettrico e shutdown'
    }
  },
  {
    name: 'Cyber Glitch',
    description: 'Entità digitale che manipola la realtà',
    archetype: 'Wildcard',
    stats: {
      hp: 7,
      power: 7,
      speed: 8,
      defense: 6,
      stamina: 7,
      range: 7,
      special_gain: 10
    },
    moveset: {
      light: 'Pugno glitchato che ignora difesa parzialmente',
      heavy: 'Distorsione spazio-temporale',
      dash: 'Teleport glitch con trail pixelato',
      special1: 'Clona bug version di sé per 3s',
      special2: 'Hack: ruba 10% barra speciale avversario',
      ultimate: 'Reality Break: arena glitcha, danni casuali'
    },
    passive: 'Attacchi hanno 20% di duplicarsi (glitch)',
    spritePack: {
      idle: '4 frame: figura umanoide con glitch visivi pulsanti',
      walk: '6 frame: movimento jittery con frame skip',
      jump: '2 frame: salto con dissoluzione pixel',
      light_attack: '4 frame: pugno con trail corrotto',
      heavy_attack: '6 frame: attacco con distorsione spaziale',
      special: 'Clonazione glitchata con artifacts',
      hit: '2 frame: corpo si pixela e ricompone',
      ko: '2 frame: corrupted data dissolve in particelle'
    }
  },
  {
    name: 'Beast Master',
    description: 'Evocatore di creature selvagge',
    archetype: 'Summoner',
    stats: {
      hp: 7,
      power: 6,
      speed: 6,
      defense: 6,
      stamina: 9,
      range: 8,
      special_gain: 8
    },
    moveset: {
      light: 'Artiglio rapido',
      heavy: 'Carica bestiale',
      dash: 'Scatto felino',
      special1: 'Evoca lupo che attacca',
      special2: 'Evoca aquila che colpisce dall\'alto',
      ultimate: 'Stampede - branco di bestie attraversa arena'
    },
    passive: 'Sempre accompagnato da un piccolo familiar che attacca',
    spritePack: {
      idle: '4 frame: figura con mantello, animali intorno',
      walk: '6 frame: camminata con bestie al seguito',
      jump: '2 frame: salto assistito da creature volanti',
      light_attack: '4 frame: artiglio con energia animale',
      heavy_attack: '6 frame: charge con sagoma bestiale',
      special: 'Evocazione di creature con cerchio magico',
      hit: '2 frame: familiar si interpone parzialmente',
      ko: '2 frame: creature si dissolvono con il master'
    }
  }
];

export function getRandomCharacter(): CharacterData {
  return DEFAULT_CHARACTERS[Math.floor(Math.random() * DEFAULT_CHARACTERS.length)];
}

export function getCharacterByName(name: string): CharacterData | undefined {
  return DEFAULT_CHARACTERS.find(c => c.name === name);
}
