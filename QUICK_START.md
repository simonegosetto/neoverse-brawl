# ⚡ NEOVERSE BRAWL - Quick Start

## 🚀 Setup in 3 Steps

### 1. Installa dipendenze
```bash
cd neoverse-brawl
npm install
```

### 2. Avvia il gioco
```bash
npm run dev
```

Oppure usa lo script:
```bash
./start.sh
```

### 3. Gioca!
Il browser si aprirà automaticamente su `http://localhost:3000`

---

## 🎮 Test Rapido (Senza Voice)

Dal menu principale, clicca **QUICK TEST** per un combattimento immediato con personaggi predefiniti!

**Controls:**
- Player 1: `WASD` + `F` `G` `H` `J`
- Player 2: `Arrow Keys` + `U` `I` `O` `P`

---

## 🎤 Modalità Voice Creation

1. Seleziona **VERSUS MODE** dal menu
2. Premi **SPACE** quando richiesto
3. Parla per 5 secondi descrivendo il tuo personaggio
   - Esempi: "un samurai veloce", "un robot gigante", "mago del fuoco"
4. Claude genera il personaggio
5. Ripeti per Player 2
6. **FIGHT!**

---

## 🔑 Comandi Principali

### Player 1
| Tasto | Azione |
|-------|--------|
| W A S D | Movimento |
| F | Light Attack |
| G | Heavy Attack |
| H | Special (costa 30 energia) |
| J | Ultimate (costa 100 energia) |
| SHIFT | Dash |

### Player 2
| Tasto | Azione |
|-------|--------|
| ↑ ← ↓ → | Movimento |
| U | Light Attack |
| I | Heavy Attack |
| O | Special (costa 30 energia) |
| P | Ultimate (costa 100 energia) |
| ENTER | Dash |

---

## 💡 Tips

1. **Carica la barra speciale** colpendo l'avversario
2. **Heavy attack** fa più danno ma è più lento
3. **Special** costa energia ma ignora parte della difesa
4. **Ultimate** è devastante ma serve barra piena
5. **Dash** è utile per evitare attacchi o avvicinarsi

---

## 🐛 Problemi Comuni

### Voice non funziona?
- Usa Chrome o Edge (migliore supporto)
- Controlla permessi microfono
- Altrimenti usa input testuale (fallback automatico)

### Gioco lento?
- Chiudi altre tab del browser
- Riduci zoom browser a 100%

### Claude API errore?
- Il gioco usa un fallback character
- Controlla console browser per dettagli

---

## 📂 Struttura Progetto

```
neoverse-brawl/
├── src/
│   ├── scenes/           # Scene del gioco
│   ├── entities/         # Fighter class
│   ├── services/         # Claude + Voice
│   ├── types/            # TypeScript types
│   └── data/             # Personaggi default
├── index.html
├── package.json
└── README.md
```

---

## 🎨 Personaggi Predefiniti

Il gioco include 6 personaggi di test:

1. **Blaze Striker** - Veloce, attacchi di fuoco
2. **Iron Colossus** - Tank indistruttibile
3. **Phantom Assassin** - Ninja invisibile
4. **Volt Mage** - Controllo elettrico
5. **Cyber Glitch** - Manipolazione realtà
6. **Beast Master** - Evocatore di creature

---

## 🔄 Prossimi Passi

Dopo il test, esplora:
- `TECHNICAL_DOC.md` - Documentazione tecnica avanzata
- `README.md` - Guida completa
- Codice sorgente in `src/`

---

**Have fun! 🎮✨**
