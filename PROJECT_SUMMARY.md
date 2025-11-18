# 🎮 NEOVERSE BRAWL - Project Summary

## 📋 Overview

**Neoverse Brawl** è un picchiaduro 2D innovativo che combina:
- **Voice Input**: I giocatori descrivono vocalmente i loro personaggi
- **AI Generation**: Claude genera personaggi completi in runtime
- **Real-time Combat**: Sistema di combattimento 2D fluido e reattivo
- **Local Multiplayer**: 2 giocatori sullo stesso dispositivo

---

## 🎯 Obiettivo del Progetto

Creare un'esperienza di gioco unica dove **l'immaginazione diventa gameplay**. Invece di scegliere da un roster fisso, ogni partita inizia con i giocatori che inventano i propri guerrieri usando solo la voce.

---

## 🏗️ Architettura Tecnica

### Stack Tecnologico
- **Game Engine**: Phaser 3 (v3.80.1)
- **Language**: TypeScript
- **Build Tool**: Vite
- **AI**: Claude Sonnet 4 (Anthropic API)
- **Voice**: Web Speech API (browser native)

### Struttura del Codice

```
neoverse-brawl/
│
├── src/
│   ├── scenes/                    # Scene del gioco
│   │   ├── MenuScene.ts          # Menu principale
│   │   ├── VoiceCreationScene.ts # Fase generazione personaggi
│   │   └── BattleScene.ts        # Arena combattimento
│   │
│   ├── entities/                  # Game entities
│   │   └── Fighter.ts            # Classe personaggio giocabile
│   │
│   ├── services/                  # Servizi esterni
│   │   ├── ClaudeCharacterGenerator.ts  # Integrazione Claude API
│   │   └── VoiceInputService.ts         # Web Speech API wrapper
│   │
│   ├── types/                     # TypeScript definitions
│   │   └── Character.ts          # Interfacce personaggio
│   │
│   ├── data/                      # Dati statici
│   │   └── DefaultCharacters.ts  # Personaggi preset
│   │
│   ├── extensions/                # Esempi di estensioni
│   │   └── CustomMechanics.example.ts
│   │
│   ├── config.ts                  # Configurazione Phaser
│   └── main.ts                    # Entry point
│
├── index.html                     # HTML principale
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── vite.config.js                 # Vite config
├── netlify.toml                   # Deploy config
│
└── Documentation/
    ├── README.md                  # Guida completa
    ├── QUICK_START.md            # Setup rapido
    ├── TECHNICAL_DOC.md          # Documentazione tecnica
    └── CHANGELOG.md              # Versioni e modifiche
```

---

## 🎨 Game Design

### Character Generation System

Ogni personaggio è definito da:

#### 1. Archetype (6 tipi)
- **Bruiser**: Tank melee con alto danno
- **Striker**: Veloce, combo-oriented
- **Zoner**: Controllo spazio, attacchi distanza
- **Summoner**: Evocazioni e minions
- **Tank**: Difesa estrema, mobilità ridotta
- **Wildcard**: Abilità imprevedibili e creative

#### 2. Stats (scala 1-10)
```typescript
{
  hp: number,           // Punti vita
  power: number,        // Danno base
  speed: number,        // Velocità movimento
  defense: number,      // Resistenza danni
  stamina: number,      // Resistenza azioni
  range: number,        // Portata attacchi
  special_gain: number  // Velocità carica speciale
}
```

#### 3. Moveset
- **Light Attack**: Veloce, basso danno, buona per combo
- **Heavy Attack**: Lento, alto danno, knockback
- **Special Move**: Costa 30% energia, effetti unici
- **Ultimate**: Costa 100% energia, devastante
- **Dash**: Movimento rapido per positioning
- **Passive**: Abilità sempre attiva

#### 4. Sprite Pack
Descrizioni per 8 animazioni:
- Idle (4 frame)
- Walk (6 frame)
- Jump (2 frame)
- Light Attack (4 frame)
- Heavy Attack (6 frame)
- Special (variabile)
- Hit reaction (2 frame)
- KO (1-2 frame)

### Combat System

**Flow di Combattimento:**
```
Match Start (120s timer)
  ↓
Combat Phase
  ↓
Round End (KO o Timeout)
  ↓
Voice Creation Phase (5s per player)
  ↓
New Characters Generated
  ↓
Next Round
```

**Meccaniche di Combattimento:**
- **Hit Detection**: Distance-based collision
- **Damage Formula**: `actualDamage = baseDamage - (defense * 2)`
- **Special Energy**: Si carica colpendo avversario
- **Knockback**: Varia per tipo attacco e stats
- **Stun System**: Alcuni attacchi stordiscono temporaneamente

---

## 🚀 Features Implementate

### ✅ Core Gameplay
- [x] Sistema di combattimento 2D funzionante
- [x] Controlli responsive per 2 giocatori
- [x] Sistema di round e timer
- [x] Barre HP e Special Energy
- [x] Vittoria per KO o timeout
- [x] Best of 3 rounds

### ✅ Voice & AI Integration
- [x] Recording vocale (5 secondi)
- [x] Integrazione Claude API
- [x] Generazione JSON strutturato
- [x] Fallback character in caso errore
- [x] Text input alternativo

### ✅ Characters
- [x] 6 personaggi predefiniti per test
- [x] Sistema archetype bilanciato
- [x] Stats scaling funzionante
- [x] Moveset differenziato
- [x] Passive abilities

### ✅ UI/UX
- [x] Menu principale
- [x] How to Play
- [x] Quick Test mode
- [x] Character info display
- [x] Visual feedback attacchi
- [x] Health/Special bars

### ✅ Technical
- [x] TypeScript per type safety
- [x] Modulare e estensibile
- [x] Configurazione Vite
- [x] Deploy ready (Netlify)
- [x] Documentazione completa

---

## 📊 Statistics & Balancing

### Personaggi Predefiniti

| Name | Archetype | HP | Power | Speed | Defense |
|------|-----------|----|----|-------|---------|
| Blaze Striker | Striker | 7 | 7 | 9 | 5 |
| Iron Colossus | Tank | 10 | 8 | 3 | 10 |
| Phantom Assassin | Striker | 6 | 8 | 10 | 4 |
| Volt Mage | Zoner | 6 | 9 | 6 | 5 |
| Cyber Glitch | Wildcard | 7 | 7 | 8 | 6 |
| Beast Master | Summoner | 7 | 6 | 6 | 6 |

### Balance Philosophy
- Total stats ≈ 45 punti per personaggio
- Tradeoff: HP/Defense vs Speed/Power
- Ogni archetype ha punti forti e deboli
- Passiva bilancia eventuali svantaggi

---

## 🔮 Roadmap Future

### Short Term (v1.1 - v1.3)
1. **Arcade Mode**: Single player con AI
2. **Visual Upgrade**: Sprite generation via DALL-E
3. **Advanced Combat**: Combo system, blocking, counters

### Medium Term (v1.4 - v2.0)
4. **Progression**: Character saving, achievements
5. **Online Multiplayer**: WebSocket + rollback netcode
6. **Game Modes**: Tournament, survival, training

### Long Term (v2.1+)
7. **Customization**: Character editor, custom arenas
8. **Mobile Version**: Touch controls, cross-platform
9. **Community**: Workshop, mod support

Dettagli completi in `CHANGELOG.md`

---

## 🎓 Come Estendere il Gioco

### Esempio 1: Aggiungere Nuovo Personaggio Predefinito
```typescript
// In src/data/DefaultCharacters.ts
{
  name: 'Shadow Warrior',
  description: 'Un ninja dell\'ombra',
  archetype: 'Striker',
  stats: {
    hp: 6, power: 8, speed: 9,
    defense: 4, stamina: 7, range: 6,
    special_gain: 8
  },
  // ... resto della configurazione
}
```

### Esempio 2: Aggiungere Status Effect
```typescript
// Usa CustomMechanics.example.ts
import { StatusEffectSystem } from './extensions/CustomMechanics';

// In BattleScene
const statusSystem = new StatusEffectSystem();
statusSystem.applyEffect(fighter, {
  type: 'burning',
  duration: 5000,
  power: 10
});
```

### Esempio 3: Aggiungere AI Opponent
```typescript
import { AIController } from './extensions/CustomMechanics';

// In create()
this.aiController = new AIController(this.player2, this.player1);

// In update()
this.aiController.update(delta);
```

Vedi `src/extensions/CustomMechanics.example.ts` per più esempi!

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **Voice Input**: Funziona solo su Chrome/Edge
2. **Sprite**: Placeholder rettangoli colorati (no pixel art)
3. **Single Device**: No online multiplayer (yet)
4. **No Persistence**: Personaggi non salvati tra sessioni
5. **Basic AI**: Nessuna AI per single player

### Workarounds
- Voice fallback → Text input automatico
- Quick Test → Salta voice input completamente
- 6 personaggi predefiniti per testing

---

## 📚 Risorse & Links

### Documentation
- `README.md` - Guida completa del progetto
- `QUICK_START.md` - Setup in 3 step
- `TECHNICAL_DOC.md` - Architettura e API
- `CHANGELOG.md` - Versioni e roadmap

### External Resources
- [Phaser 3 Docs](https://photonstorm.github.io/phaser3-docs/)
- [Claude API](https://docs.anthropic.com/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🤝 Contributing

Il progetto è open source e accetta contributi!

**Come contribuire:**
1. Fork del repository
2. Crea branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push branch (`git push origin feature/AmazingFeature`)
5. Apri Pull Request

**Aree dove contribuire:**
- Nuovi personaggi predefiniti
- Sprite pixel art
- Sound effects
- Modalità di gioco
- Bilanciamento
- Bug fixes

---

## 📄 License

MIT License - Free to use, modify, and distribute!

---

## 👨‍💻 Author

**Simone**
- Expertise: TypeScript, NestJS, Angular, Game Development
- Tools: Phaser 3, Claude AI, Web APIs
- Date: November 2024

---

## 🎮 Quick Commands

```bash
# Install
npm install

# Develop
npm run dev

# Build
npm run build

# Quick start
./start.sh
```

---

## 🌟 Highlights

**Cosa rende Neoverse Brawl unico:**

1. **Voice-Driven Creation**: Nessun altro fighting game genera personaggi da voice input
2. **AI-Powered Design**: Claude crea moveset, stats e backstory coerenti
3. **Instant Gameplay**: Da idea vocale a combattimento in 10 secondi
4. **Infinitely Replayable**: Ogni match può avere personaggi completamente nuovi
5. **Easy to Mod**: Architettura modulare, TypeScript, documentazione completa

---

**Ready to fight with your imagination? 🥊✨**

Per iniziare: `npm install && npm run dev`
