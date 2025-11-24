# 🎨 Sistema di Generazione Sprite AI

## 📋 Panoramica

Il gioco ora supporta la generazione automatica di sprite per i personaggi usando AI! La descrizione del personaggio influenza **direttamente** l'aspetto visivo.

---

## 🚀 Come Funziona

### 1. **Con DALL-E (Opzionale)**

Se hai una API key di OpenAI, il sistema può generare sprite pixel art uniche usando DALL-E 3.

#### Setup:

1. Ottieni una API key da: https://platform.openai.com/api-keys
2. Crea un file `.env` nella root del progetto:
   ```
   VITE_OPENAI_API_KEY=sk-your-api-key-here
   ```
3. Riavvia il server dev

#### Cosa fa:

- Costruisce un prompt dettagliato basandosi su:
  - Descrizione del personaggio
  - Archetipo
  - Stats (determinano build fisico, postura, dimensioni)
- Chiama DALL-E 3 per generare sprite 32x32 pixel art
- Carica automaticamente la sprite in Phaser
- **COSTO**: ~$0.04 per sprite (DALL-E 3 standard quality)

### 2. **Sprite Procedurali Migliorate (Gratis - Default)**

Se non hai API key, usa sprite procedurali che analizzano la descrizione:

#### Analizza la descrizione per:

- ✅ **Armi**: sword, blade, weapon, axe, hammer, gun → Aggiunge arma visibile
- ✅ **Armatura**: armor, plate, shield, helmet → Aggiunge piastre e spallacci
- ✅ **Mantello**: cloak, cape, robe → Aggiunge mantello fluttuante
- ✅ **Robotico**: robot, mech, cyborg, android → Occhi LED, giunture metalliche
- ✅ **Magico**: magic, mage, wizard, arcane → Aura magica, occhi brillanti

#### Esempio:

**Input vocale**: "un cavaliere robotico con una grande spada"
**Risultato**: 
- Corpo base
- Armatura con piastre
- Spada visibile nella mano
- Occhi LED ciano
- Giunture meccaniche

---

## 📊 Influenza delle Stats sull'Aspetto

Le stats influenzano **automaticamente** l'aspetto:

| Stats | Effetto Visivo |
|-------|----------------|
| **HP + Defense alti** | Personaggio più GRANDE e massiccio |
| **Speed alta** | Personaggio più PICCOLO e snello |
| **Power + Defense alti** | Build muscolosa e bulky |
| **Speed alta, Defense bassa** | Build snella e agile |

**Esempio**:
- Tank (HP:10, DEF:8, SPD:3) → Grande, stance difensiva
- Striker (HP:5, DEF:2, SPD:10) → Piccolo, stance dinamica

---

## 🎯 Workflow Completo

```
1. Utente parla al microfono
   ↓
2. Claude genera personaggio con descrizione dettagliata
   ↓
3. Sistema analizza descrizione + stats
   ↓
4. [SE API key] DALL-E genera sprite pixel art
   [SENZA] Genera sprite procedurale intelligente
   ↓
5. Sprite caricata in Phaser
   ↓
6. Personaggio appare nel gioco con aspetto unico!
```

---

## 🔧 Prompt per DALL-E

Il sistema costruisce automaticamente un prompt dettagliato:

```
Create a pixel art fighting game character sprite for "[Nome]".

DESCRIPTION: [Descrizione completa da Claude]

ARCHETYPE: [Bruiser/Striker/Tank/etc]

PHYSICAL TRAITS (based on stats):
- Build: [muscular/lean/bulky/average]
- Size: [large/medium/smaller]
- Posture: [aggressive/defensive/balanced/dynamic]

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
```

---

## 💡 Pro Tips

### Per Risultati Migliori:

1. **Descrizioni specifiche**: "un ninja con katana" > "combattente"
2. **Dettagli visivi**: Menziona colori, equipaggiamento, stile
3. **Archetipi coerenti**: La descrizione dovrebbe matchare l'archetipo

### Esempi di Input Vocali Ottimi:

✅ "Un samurai corazzato con armatura dorata e katana infuocata"
✅ "Mago oscuro con mantello viola e bastone magico"
✅ "Cyborg da combattimento con cannone al braccio"
✅ "Lottatore muscoloso stile wrestler con maschera"

❌ "combattente" (troppo generico)
❌ "persona" (non descrive nulla)

---

## 🔄 Fallback System

Il sistema ha 3 livelli di fallback:

1. **DALL-E** (se API key disponibile)
2. **Sprite procedurale intelligente** (analizza descrizione)
3. **Sprite archetipo base** (se tutto fallisce)

**Non rompe mai il gioco!**

---

## 📈 Confronto Sistemi

| Feature | Graphics (Vecchio) | Procedurale | DALL-E |
|---------|-------------------|-------------|--------|
| **Costo** | Gratis | Gratis | ~$0.04/sprite |
| **Velocità** | Istantaneo | Istantaneo | 5-10 sec |
| **Varietà** | 6 archetipi | Infinite variazioni | Infinite |
| **Qualità** | Bassa | Media | Alta |
| **Descrizione influisce** | ❌ No | ✅ Sì | ✅✅ Molto |

---

## 🎮 Esperienza Utente

### Prima (Graphics):
```
Input: "ninja con katana"
Risultato: Rettangolo verde (Striker)
```

### Dopo (Procedurale):
```
Input: "ninja con katana"
Risultato: Personaggio snello + maschera + arma visibile
```

### Con DALL-E:
```
Input: "ninja con katana"
Risultato: Sprite pixel art unica, ninja completo con katana dettagliata
```

---

## ⚙️ Configurazione Avanzata

### Modificare Dimensioni Sprite:

In `SpriteGeneratorService.ts`:
```typescript
size: "1024x1024" // Cambia dimensione immagine DALL-E
canvas.width = 128  // Cambia dimensione canvas procedurale
```

### Aggiungere Pattern di Analisi:

```typescript
const hasWings = /wing|winged|angel/i.test(description);
if (hasWings) {
  // Disegna ali
}
```

---

## 🐛 Troubleshooting

### "Sprite non appare":
- Controlla console per errori
- Verifica che API key sia corretta
- Sistema userà fallback automaticamente

### "CORS Policy Error":
✅ **RISOLTO DEFINITIVAMENTE!**
- DALL-E ora restituisce immagine come base64 (`response_format: "b64_json"`)
- Nessun URL esterno = Zero problemi CORS
- L'immagine è caricata direttamente come Data URL
- Nessuna azione richiesta dall'utente

### "Sprite troppo piccola/grande":
- Modifica `getSizeMultiplierFromStats()` in Fighter.ts

### "DALL-E timeout":
- Normale per prime richieste
- Riprova o usa sprite procedurale

### "DALL-E API error 401":
- API key non valida o scaduta
- Verifica su: https://platform.openai.com/api-keys
- Sistema userà fallback procedurale

---

## 📊 Performance

- **Sprite procedurale**: 0ms (instantanea)
- **DALL-E**: 5-10 secondi (non blocca il gioco)
- **Cache**: Le sprite generate vengono riutilizzate

---

## 🚀 Futuri Miglioramenti

- [ ] Cache locale sprite generate
- [ ] Stable Diffusion invece di DALL-E (gratis)
- [ ] Animazioni generate AI
- [ ] Editor sprite integrato
- [ ] Gallery di sprite salvate

---

## 📝 Note Tecniche

### Formati Supportati:
- HTMLImageElement (da DALL-E)
- Canvas-generated Image (procedurale)
- Phaser Texture (caricato dinamicamente)

### Architettura:
```
SpriteGeneratorService
  ↓
ClaudeCharacterGenerator
  ↓
VoiceCreationScene (listener)
  ↓
Fighter (usa texture)
```

---

**La descrizione del personaggio ORA influisce direttamente sull'aspetto!** 🎨✨

