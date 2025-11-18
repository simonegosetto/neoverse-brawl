# 🎮 NEOVERSE BRAWL

Un picchiaduro 2D dove i personaggi vengono generati in runtime tramite input vocale e Claude AI.

## 🚀 Features

- **Voice-Driven Character Generation**: Parla per 5 secondi e Claude AI genera un personaggio completo
- **Real-time Combat System**: Sistema di combattimento 2D con mosse, combo e special
- **AI-Powered Design**: Ogni personaggio ha statistiche, moveset e passiva unici
- **Multiplayer Local**: Affronta un amico in match 1v1
- **Dynamic Roster**: Costruisci il tuo roster di guerrieri creativi

## 📋 Requisiti

- Node.js 18+
- Browser moderno con supporto Web Speech API (Chrome/Edge consigliati)
- Microfono per voice input

## 🛠️ Installazione

```bash
cd neoverse-brawl
npm install
```

## ▶️ Avvio del Gioco

```bash
npm run dev
```

Il gioco si aprirà automaticamente su `http://localhost:3000`

## 🎮 Come Giocare

### Voice Creation Phase

1. Premi **SPACE** per iniziare la registrazione
2. Parla per 5 secondi descrivendo il tuo personaggio
   - Esempi: "un samurai veloce con spade laser", "un orso gigante con armatura", "mago del ghiaccio"
3. Claude AI genererà:
   - Stats (HP, Power, Speed, Defense, ecc.)
   - Moveset completo
   - Abilità speciali
   - Passiva unica

### Combat Controls

**Player 1:**
- **WASD**: Movimento
- **F**: Light Attack
- **G**: Heavy Attack  
- **H**: Special Move
- **J**: Ultimate
- **SHIFT**: Dash

**Player 2:**
- **Arrow Keys**: Movimento
- **U**: Light Attack
- **I**: Heavy Attack
- **O**: Special Move
- **P**: Ultimate
- **ENTER**: Dash

### Obiettivo

- Riduci l'HP dell'avversario a zero
- Sopravvivi fino al timeout con più HP
- Vinci 2 round su 3

## 🏗️ Architettura Tecnica

```
neoverse-brawl/
├── src/
│   ├── entities/
│   │   └── Fighter.ts          # Classe personaggio con combat system
│   ├── scenes/
│   │   ├── MenuScene.ts        # Menu principale
│   │   ├── VoiceCreationScene.ts  # Fase creazione vocale
│   │   └── BattleScene.ts      # Arena di combattimento
│   ├── services/
│   │   ├── ClaudeCharacterGenerator.ts  # Integrazione Claude API
│   │   └── VoiceInputService.ts         # Web Speech API
│   ├── types/
│   │   └── Character.ts        # TypeScript interfaces
│   ├── config.ts               # Configurazione Phaser
│   └── main.ts                 # Entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.js
```

## 🎨 Sistema di Personaggi

Ogni personaggio generato ha:

### Archetype
- **Bruiser**: Melee pesante, alto danno
- **Striker**: Veloce, combo rapide
- **Zoner**: Attacchi a distanza
- **Summoner**: Evocazioni e minions
- **Tank**: Alta difesa, lenta mobilità
- **Wildcard**: Abilità imprevedibili

### Stats (1-10)
- HP: Punti vita
- Power: Danno inflitto
- Speed: Velocità movimento
- Defense: Resistenza danni
- Stamina: Resistenza mosse
- Range: Portata attacchi
- Special Gain: Velocità carica barra speciale

### Moveset
- Light Attack: Veloce, basso danno
- Heavy Attack: Lento, alto danno
- Special 1: Costo 30% special bar
- Ultimate: Costo 100% special bar
- Dash: Movimento rapido
- Passive: Abilità sempre attiva

## 🔧 Configurazione Claude API

Il gioco usa l'API di Claude senza bisogno di API key (gestita dal backend).

Per testing locale con API key propria, modifica `src/services/ClaudeCharacterGenerator.ts`:

```typescript
headers: {
  'Content-Type': 'application/json',
  'x-api-key': 'YOUR_API_KEY',  // Aggiungi questa riga
  'anthropic-version': '2023-06-01'
}
```

## 🎯 Roadmap Features

- [ ] Sistema di sprite generati da AI (DALL-E / Stable Diffusion)
- [ ] Modalità Boss Fight
- [ ] Endless Arcade Mode
- [ ] Online Multiplayer
- [ ] Sistema di unlock e progressione
- [ ] Replay system
- [ ] Custom arene
- [ ] Sound effects generati proceduralmente

## 🐛 Troubleshooting

### Voice Recognition non funziona
- Usa Chrome o Edge (migliore supporto Web Speech API)
- Controlla permessi microfono nel browser
- Fallback: usa input testuale (automatico se voice non disponibile)

### Claude API errori
- Verifica connessione internet
- Il gioco usa un fallback character in caso di errore
- Check console browser per dettagli errori

### Performance issues
- Riduci numero di particelle nel background
- Disabilita effetti grafici in `src/scenes/BattleScene.ts`

## 📝 Note di Sviluppo

- Engine: **Phaser 3** (v3.80.1)
- Language: **TypeScript**
- Build Tool: **Vite**
- AI: **Claude Sonnet 4**
- Voice: **Web Speech API**

## 📄 License

MIT License - Creato da Simone

---

**Enjoy fighting with your imagination! 🥊✨**
