import Phaser from 'phaser';
import {CharacterData} from '../types/Character';

export class Fighter extends Phaser.GameObjects.Container {
    public characterData: CharacterData;
    public sprite: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics; // Supporta sia sprite AI che fallback Graphics
    public nameText: Phaser.GameObjects.Text;
    public healthBar: Phaser.GameObjects.Rectangle;
    public healthBarBg: Phaser.GameObjects.Rectangle;
    public specialBar: Phaser.GameObjects.Rectangle;
    public specialBarBg: Phaser.GameObjects.Rectangle;

    // Per sprite generate
    private spriteTexture?: Phaser.Textures.Texture;
    public isUsingGeneratedSprite: boolean = false;

    // Effetti visivi
    private auraGraphics!: Phaser.GameObjects.Graphics;
    private particleEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
    private glowEffect!: Phaser.GameObjects.Graphics;
    private shadowGraphics!: Phaser.GameObjects.Graphics;
    private statsIndicator!: Phaser.GameObjects.Container;
    private statsText!: Phaser.GameObjects.Text;

    // Animazione
    private idleAnimation: { time: number; offsetY: number } = {time: 0, offsetY: 0};
    private breathingScale: number = 1;
    private isMoving: boolean = false;

    private currentHealth: number;
    private maxHealth: number;
    private specialEnergy: number = 50; // Inizia con energia per usare subito le mosse speciali
    private maxSpecialEnergy: number = 100;
    private isAttacking: boolean = false;
    private stunned: boolean = false;
    private velocityX: number = 0;
    private velocityY: number = 0;
    private gravity: number = 0.8;
    private jumpPower: number = -15;
    private isGrounded: boolean = true;
    private facing: number = 1; // 1 = right, -1 = left
    private originalColor: number = 0xffffff; // Store original color

    constructor(scene: Phaser.Scene, x: number, y: number, characterData: CharacterData, player: number) {
        super(scene, x, y);

        this.characterData = characterData;
        // Assicurati che HP sia almeno 1 per evitare KO immediato
        const hpStat = characterData.stats.hp || 5; // Default a 5 se undefined/0
        this.maxHealth = hpStat * 100;
        this.currentHealth = this.maxHealth;

        console.log(`Fighter created: ${characterData.name}, HP: ${this.currentHealth}/${this.maxHealth}, Stats:`, characterData.stats);

        // Verifica che il fighter non sia già KO
        if (this.currentHealth <= 0) {
            console.error(`Fighter ${characterData.name} has 0 HP at creation!`);
            this.currentHealth = 500; // Emergency fallback
            this.maxHealth = 500;
        }

        // Create shadow (sotto il personaggio)
        this.shadowGraphics = scene.add.graphics();
        this.add(this.shadowGraphics);
        this.drawShadow();

        // Create glow effect (dietro lo sprite)
        this.glowEffect = scene.add.graphics();
        this.add(this.glowEffect);

        // Create sprite - prova a usare sprite generata se disponibile
        const color = this.getArchetypeColor(characterData.archetype);
        this.originalColor = color;

        // Verifica se esiste una texture generata per questo personaggio
        const textureKey = `fighter_${characterData.name.replace(/\s/g, '_').toLowerCase()}`;

        if (scene.textures.exists(textureKey)) {
            // Usa la sprite generata dall'AI
            this.sprite = scene.add.image(0, 0, textureKey);
            this.isUsingGeneratedSprite = true;
            console.log(`✨ Using generated sprite for ${characterData.name}`);
        } else {
            // Fallback a Graphics procedurale
            this.sprite = scene.add.graphics();
            this.createPixelArtSprite(this.sprite as Phaser.GameObjects.Graphics, characterData.archetype, color);
            this.isUsingGeneratedSprite = false;
            console.log(`📝 Using procedural sprite for ${characterData.name}`);
        }

        this.add(this.sprite);

        // Create aura effect (davanti allo sprite)
        this.auraGraphics = scene.add.graphics();
        this.add(this.auraGraphics);

        // Name tag
        this.nameText = scene.add.text(0, -60, characterData.name, {
            fontSize: '12px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.add(this.nameText);

        // Health bar background
        this.healthBarBg = scene.add.rectangle(-30, -50, 60, 6, 0x000000);
        this.add(this.healthBarBg);

        // Health bar
        this.healthBar = scene.add.rectangle(-30, -50, 60, 6, 0x00ff00);
        this.add(this.healthBar);

        // Special bar background
        this.specialBarBg = scene.add.rectangle(-30, -42, 60, 4, 0x000000);
        this.add(this.specialBarBg);

        // Special bar
        this.specialBar = scene.add.rectangle(-30, -42, 30, 4, 0xffff00); // 50% iniziale
        this.add(this.specialBar);

        scene.add.existing(this);

        // Set initial facing based on player position
        if (player === 2) {
            this.facing = -1;
            this.sprite.setScale(-1, 1);
        }

        // Scala sprite in base alle stats (Tank più grande, Striker più piccolo)
        const baseSizeMultiplier = this.getSizeMultiplierFromStats();
        this.sprite.setScale(this.facing * baseSizeMultiplier, baseSizeMultiplier);

        // Update special bar to reflect initial energy
        this.updateSpecialBar();

        // Create stats indicator
        this.createStatsIndicator();
    }

    private getArchetypeColor(archetype: string): number {
        const colors: { [key: string]: number } = {
            'Bruiser': 0xff3333,
            'Striker': 0x33ff33,
            'Zoner': 0x3333ff,
            'Summoner': 0xff33ff,
            'Tank': 0x888888,
            'Wildcard': 0xffff33
        };
        return colors[archetype] || 0xffffff;
    }

    update(time: number, delta: number) {
        // Apply gravity
        if (!this.isGrounded) {
            this.velocityY += this.gravity;
        }

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Detect movement
        this.isMoving = Math.abs(this.velocityX) > 0.5;

        // Ground collision (simple, assuming ground at y = 500)
        if (this.y >= 500) {
            this.y = 500;
            this.velocityY = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }

        // Deceleration
        this.velocityX *= 0.85;

        // Screen bounds
        if (this.x < 50) this.x = 50;
        if (this.x > 950) this.x = 950;

        // Update animations
        this.updateIdleAnimation(time);
        this.updateVisualEffects();

        // Crea scia se si sta muovendo velocemente
        if (this.isMoving && Math.abs(this.velocityX) > 2) {
            this.createMotionTrail();
        }
    }

    moveLeft() {
        if (this.stunned || this.isAttacking) return;
        const speed = this.characterData.stats.speed * 2;
        this.velocityX = -speed;
        this.facing = -1;
        this.sprite.setScale(-1, 1);
    }

    moveRight() {
        if (this.stunned || this.isAttacking) return;
        const speed = this.characterData.stats.speed * 2;
        this.velocityX = speed;
        this.facing = 1;
        this.sprite.setScale(1, 1);
    }

    jump() {
        if (!this.isGrounded || this.stunned) return;
        this.velocityY = this.jumpPower * (this.characterData.stats.speed / 5);
        this.isGrounded = false;
    }

    lightAttack(opponent: Fighter) {
        if (this.isAttacking || this.stunned) return;

        this.isAttacking = true;
        const damage = this.characterData.stats.power * 25;

        // Visual feedback - più evidente
        const flashColor = 0xffff00;


        // Crea un effetto visivo di punch
        const punchEffect = this.scene.add.circle(
            this.x + (this.facing * 60),
            this.y,
            20,
            flashColor,
            0.7
        );

        this.scene.tweens.add({
            targets: punchEffect,
            alpha: 0,
            scale: 2,
            duration: 100,
            onComplete: () => punchEffect.destroy()
        });

        this.scene.time.delayedCall(100, () => {

            this.isAttacking = false;
        });

        // Check if hit - semplificato
        const distance = Phaser.Math.Distance.Between(this.x, this.y, opponent.x, opponent.y);
        console.log(`Light attack! Distance: ${distance}, Facing: ${this.facing}, Opponent direction: ${opponent.x > this.x ? 'right' : 'left'}`);

        if (distance < 150) { // Aumentato il range
            opponent.takeDamage(damage, this);
            this.gainSpecialEnergy(10);
            console.log('HIT!');
        }
    }

    heavyAttack(opponent: Fighter) {
        if (this.isAttacking || this.stunned) return;

        this.isAttacking = true;
        const damage = this.characterData.stats.power * 60;

        // Visual feedback - più evidente
        const flashColor = 0xff0000;


        // Crea un effetto visivo di heavy punch
        const punchEffect = this.scene.add.circle(
            this.x + (this.facing * 70),
            this.y,
            30,
            flashColor,
            0.7
        );

        this.scene.tweens.add({
            targets: punchEffect,
            alpha: 0,
            scale: 2.5,
            duration: 200,
            onComplete: () => punchEffect.destroy()
        });

        this.scene.time.delayedCall(200, () => {

            this.isAttacking = false;
        });

        // Check if hit - semplificato
        const distance = Phaser.Math.Distance.Between(this.x, this.y, opponent.x, opponent.y);
        console.log(`Heavy attack! Distance: ${distance}`);

        if (distance < 170) { // Aumentato il range
            opponent.takeDamage(damage, this);
            opponent.knockback(this.facing * 10);
            this.gainSpecialEnergy(20);
            console.log('HEAVY HIT!');
        }
    }

    special1(opponent: Fighter) {
        if (this.specialEnergy < 30 || this.isAttacking || this.stunned) return;

        this.specialEnergy -= 30;
        this.updateSpecialBar();
        this.isAttacking = true;

        const damage = this.characterData.stats.power * 100;

        // Visual feedback


        // Create projectile or effect based on archetype
        if (this.characterData.archetype === 'Zoner' || this.characterData.archetype === 'Summoner') {
            this.createProjectile(opponent, damage);
        } else {
            // Melee special
            const distance = Phaser.Math.Distance.Between(this.x, this.y, opponent.x, opponent.y);
            if (distance < 150) {
                opponent.takeDamage(damage, this);
                opponent.knockback(this.facing * 15);
            }
        }

        this.scene.time.delayedCall(300, () => {

            this.isAttacking = false;
        });
    }

    ultimate(opponent: Fighter) {
        if (this.specialEnergy < 100 || this.isAttacking || this.stunned) return;

        this.specialEnergy = 0;
        this.updateSpecialBar();
        this.isAttacking = true;

        const damage = this.characterData.stats.power * 200;

        // Ultimate visual con MEGA esplosione di particelle
        this.showPowerVisual('ultimate');
        this.sprite.setScale(this.facing * 1.5, 1.5);

        opponent.takeDamage(damage, this);
        opponent.stun(1000);

        this.scene.time.delayedCall(500, () => {

            this.sprite.setScale(this.facing, 1);
            this.isAttacking = false;
        });
    }

    dash() {
        if (this.stunned) return;
        const dashPower = this.characterData.stats.speed * 2;
        this.velocityX = this.facing * dashPower;
    }

    private createProjectile(opponent: Fighter, damage: number) {
        // Calculate absolute position for projectile
        const startX = this.x + (this.facing * 40);
        const startY = this.y;
        const projectile = this.scene.add.circle(startX, startY, 10, 0xffff00);

        // Track if projectile has hit
        let hasHit = false;

        this.scene.tweens.add({
            targets: projectile,
            x: startX + (this.facing * 400),
            duration: 1000,
            onUpdate: () => {
                if (hasHit) return;

                const distance = Phaser.Math.Distance.Between(projectile.x, projectile.y, opponent.x, opponent.y);
                if (distance < 50) {
                    hasHit = true;
                    opponent.takeDamage(damage, this);
                    projectile.destroy();
                }
            },
            onComplete: () => {
                if (!hasHit && projectile.active) {
                    projectile.destroy();
                }
            }
        });
    }

    takeDamage(amount: number, attacker: Fighter) {
        const actualDamage = Math.max(0, amount - (this.characterData.stats.defense * 10));
        this.currentHealth -= actualDamage;

        if (this.currentHealth < 0) this.currentHealth = 0;

        this.updateHealthBar();

        // Hit flash

        this.scene.time.delayedCall(100, () => {

        });

        if (this.currentHealth <= 0) {
            this.knockout();
        }

        // Show damage number
        this.showDamageNumber(actualDamage);
    }

    knockback(force: number) {
        this.velocityX += force;
    }

    stun(duration: number) {
        this.stunned = true;
        this.sprite.setAlpha(0.5);
        this.scene.time.delayedCall(duration, () => {
            this.stunned = false;
            this.sprite.setAlpha(1);
        });
    }

    gainSpecialEnergy(amount: number) {
        this.specialEnergy += amount * (this.characterData.stats.special_gain * 2); // Cambiato da /5 a *2!
        if (this.specialEnergy > this.maxSpecialEnergy) {
            this.specialEnergy = this.maxSpecialEnergy;
        }
        this.updateSpecialBar();
    }

    private updateHealthBar() {
        const healthPercent = this.currentHealth / this.maxHealth;
        this.healthBar.width = 60 * healthPercent;
        this.healthBar.x = -30 + (60 - this.healthBar.width) / 2;

        // Color changes based on health
        if (healthPercent > 0.5) {
            this.healthBar.setFillStyle(0x00ff00);
        } else if (healthPercent > 0.25) {
            this.healthBar.setFillStyle(0xffff00);
        } else {
            this.healthBar.setFillStyle(0xff0000);
        }
    }

    private updateSpecialBar() {
        const specialPercent = this.specialEnergy / this.maxSpecialEnergy;
        this.specialBar.width = 60 * specialPercent;
        this.specialBar.x = -30 + (60 - this.specialBar.width) / 2;
    }

    knockout() {
        this.stunned = true;
        this.sprite.setAlpha(0.3);
        this.velocityX = 0;
        this.velocityY = 0;
    }

    isKO(): boolean {
        return this.currentHealth <= 0;
    }

    getHealth(): number {
        return this.currentHealth;
    }

    reset() {
        this.currentHealth = this.maxHealth;
        this.specialEnergy = 50; // Riparti con energia
        this.stunned = false;
        this.isAttacking = false;
        this.velocityX = 0;
        this.velocityY = 0;
        this.sprite.setAlpha(1);

        this.updateHealthBar();
        this.updateSpecialBar();
    }

    private createPixelArtSprite(graphics: Phaser.GameObjects.Graphics, archetype: string, color: number) {
        graphics.clear();

        // Colori per dettagli
        const darkColor = Phaser.Display.Color.IntegerToColor(color).darken(30).color;
        const lightColor = Phaser.Display.Color.IntegerToColor(color).lighten(20).color;

        switch (archetype) {
            case 'Bruiser':
                this.drawBruiser(graphics, color, darkColor, lightColor);
                break;
            case 'Striker':
                this.drawStriker(graphics, color, darkColor, lightColor);
                break;
            case 'Zoner':
                this.drawZoner(graphics, color, darkColor, lightColor);
                break;
            case 'Summoner':
                this.drawSummoner(graphics, color, darkColor, lightColor);
                break;
            case 'Tank':
                this.drawTank(graphics, color, darkColor, lightColor);
                break;
            case 'Wildcard':
                this.drawWildcard(graphics, color, darkColor, lightColor);
                break;
            default:
                this.drawDefault(graphics, color, darkColor, lightColor);
        }
    }

    private drawBruiser(g: Phaser.GameObjects.Graphics, color: number, dark: number, light: number) {
        // OUTLINE NERO
        g.lineStyle(3, 0x000000, 1);

        // Corpo muscoloso - outline
        g.strokeRect(-25, -10, 50, 42);
        g.strokeRect(-30, 0, 8, 26);
        g.strokeRect(22, 0, 8, 26);
        g.strokeRect(-18, 32, 15, 30);
        g.strokeRect(3, 32, 15, 30);
        g.strokeRect(-13, -32, 26, 27);

        // Riempi corpo
        g.fillStyle(dark);
        g.fillRect(-25, -10, 50, 42); // Ombra torso

        g.fillStyle(color);
        g.fillRect(-23, -8, 46, 38);

        // Muscoli del petto
        g.fillStyle(light);
        g.fillRect(-18, 0, 16, 18);
        g.fillRect(2, 0, 16, 18);

        // Addominali
        g.fillStyle(dark);
        for (let i = 0; i < 3; i++) {
            g.fillRect(-10, 5 + i * 8, 8, 6);
            g.fillRect(2, 5 + i * 8, 8, 6);
        }

        // Braccia muscolose con dettagli
        g.fillStyle(color);
        g.fillRect(-30, 0, 8, 26);
        g.fillRect(22, 0, 8, 26);

        // Bicipiti
        g.fillStyle(light);
        g.fillCircle(-26, 8, 5);
        g.fillCircle(26, 8, 5);

        // Gambe robuste
        g.fillStyle(dark);
        g.fillRect(-18, 32, 15, 30);
        g.fillRect(3, 32, 15, 30);

        g.fillStyle(color);
        g.fillRect(-17, 33, 13, 28);
        g.fillRect(4, 33, 13, 28);

        // Ginocchia
        g.fillStyle(dark);
        g.fillRect(-16, 46, 11, 3);
        g.fillRect(5, 46, 11, 3);

        // Testa
        g.fillStyle(dark);
        g.fillRect(-13, -32, 26, 27);

        g.fillStyle(light);
        g.fillRect(-12, -31, 24, 25);

        // Fronte muscolosa
        g.fillStyle(light, 1);
        g.fillRect(-10, -28, 20, 6);

        // Occhi feroci
        g.fillStyle(0xffffff);
        g.fillRect(-9, -21, 6, 6);
        g.fillRect(3, -21, 6, 6);

        // Pupille
        g.fillStyle(0xff0000);
        g.fillRect(-7, -19, 3, 3);
        g.fillRect(5, -19, 3, 3);

        // Sopracciglia
        g.fillStyle(0x000000);
        g.fillRect(-10, -23, 7, 2);
        g.fillRect(3, -23, 7, 2);

        // Bocca
        g.lineStyle(2, 0x000000);
        g.strokeRect(-6, -12, 12, 4);
    }

    private drawStriker(g: Phaser.GameObjects.Graphics, color: number, dark: number, light: number) {
        // OUTLINE
        g.lineStyle(3, 0x000000, 1);
        g.strokeRect(-16, -6, 32, 37);
        g.strokeRect(-21, -1, 6, 32);
        g.strokeRect(15, -1, 6, 32);
        g.strokeRect(-13, 31, 11, 37);
        g.strokeRect(2, 31, 11, 37);
        g.strokeRect(-11, -27, 22, 24);

        // Corpo snello e atletico
        g.fillStyle(dark);
        g.fillRect(-16, -6, 32, 37);

        g.fillStyle(color);
        g.fillRect(-15, -5, 30, 35);

        // Cintura/fascia
        g.fillStyle(dark);
        g.fillRect(-15, 15, 30, 4);

        // Dettagli torace (muscoli definiti)
        g.lineStyle(1, dark);
        g.lineBetween(-5, 0, -5, 12);
        g.lineBetween(5, 0, 5, 12);

        // Braccia snelle ma muscolose
        g.fillStyle(color);
        g.fillRect(-21, 0, 6, 31);
        g.fillRect(15, 0, 6, 31);

        // Gomiti
        g.fillStyle(dark);
        g.fillCircle(-18, 15, 3);
        g.fillCircle(18, 15, 3);

        // Polsi con bande
        g.fillStyle(light);
        g.fillRect(-21, 25, 6, 3);
        g.fillRect(15, 25, 6, 3);

        // Gambe lunghe e agili
        g.fillStyle(dark);
        g.fillRect(-13, 31, 11, 37);
        g.fillRect(2, 31, 11, 37);

        g.fillStyle(color);
        g.fillRect(-12, 32, 9, 35);
        g.fillRect(3, 32, 9, 35);

        // Ginocchiere
        g.fillStyle(dark);
        g.fillCircle(-8, 48, 4);
        g.fillCircle(6, 48, 4);

        // Testa con maschera ninja
        g.fillStyle(dark);
        g.fillRect(-11, -27, 22, 24);

        g.fillStyle(light);
        g.fillRect(-10, -26, 20, 22);

        // Maschera ninja
        g.fillStyle(color);
        g.fillRect(-10, -15, 20, 10);

        // Banda sulla testa con nodo
        g.fillStyle(dark);
        g.fillRect(-12, -22, 24, 5);

        // Nodo laterale
        g.fillRect(10, -24, 6, 4);
        g.fillRect(13, -22, 8, 2);

        // Occhi affilati e intensi
        g.fillStyle(0xffffff);
        g.fillRect(-8, -19, 5, 5);
        g.fillRect(3, -19, 5, 5);

        g.fillStyle(0x000000);
        g.fillRect(-7, -18, 4, 4);
        g.fillRect(4, -18, 4, 4);

        // Highlight negli occhi
        g.fillStyle(0xffffff);
        g.fillRect(-7, -18, 2, 2);
        g.fillRect(4, -18, 2, 2);
    }

    private drawZoner(g: Phaser.GameObjects.Graphics, color: number, dark: number, light: number) {
        // OUTLINE
        g.lineStyle(3, 0x000000, 1);

        // Mantello outline (forma organica)
        g.beginPath();
        g.moveTo(-22, -5);
        g.lineTo(-25, 20);
        g.lineTo(-23, 45);
        g.lineTo(-10, 62);
        g.lineTo(10, 62);
        g.lineTo(23, 45);
        g.lineTo(25, 20);
        g.lineTo(22, -5);
        g.closePath();
        g.strokePath();

        // Mantello con texture
        g.fillStyle(dark, 0.9);
        g.beginPath();
        g.moveTo(-22, -5);
        g.lineTo(-25, 20);
        g.lineTo(-23, 45);
        g.lineTo(-10, 62);
        g.lineTo(10, 62);
        g.lineTo(23, 45);
        g.lineTo(25, 20);
        g.lineTo(22, -5);
        g.closePath();
        g.fillPath();

        // Dettagli mantello
        g.lineStyle(1, light, 0.3);
        for (let i = 0; i < 6; i++) {
            g.lineBetween(-20, 5 + i * 9, 20, 5 + i * 9);
        }

        // Corpo sotto il mantello
        g.lineStyle(2, 0x000000);
        g.strokeRect(-13, 1, 26, 36);

        g.fillStyle(color);
        g.fillRect(-12, 2, 24, 35);

        // Rune sul corpo
        g.fillStyle(0x00ffff, 0.6);
        g.fillCircle(-8, 10, 2);
        g.fillCircle(0, 10, 2);
        g.fillCircle(8, 10, 2);
        g.fillCircle(-4, 18, 2);
        g.fillCircle(4, 18, 2);

        // Braccia con maniche lunghe (postura casting)
        g.lineStyle(2, 0x000000);
        g.fillStyle(dark);

        // Braccio sinistro
        g.beginPath();
        g.moveTo(-13, 8);
        g.lineTo(-28, 12);
        g.lineTo(-30, 20);
        g.lineTo(-15, 18);
        g.closePath();
        g.fillPath();
        g.strokePath();

        // Braccio destro
        g.beginPath();
        g.moveTo(13, 8);
        g.lineTo(28, 12);
        g.lineTo(30, 20);
        g.lineTo(15, 18);
        g.closePath();
        g.fillPath();
        g.strokePath();

        // Mani con energia magica
        g.fillStyle(0x00ffff, 0.7);
        g.fillCircle(-30, 20, 5);
        g.fillCircle(30, 20, 5);

        // Gambe coperte
        g.fillStyle(color);
        g.fillRect(-11, 37, 9, 26);
        g.fillRect(2, 37, 9, 26);

        // Cappuccio profondo
        g.lineStyle(2, 0x000000);
        g.fillStyle(dark);

        // Forma cappuccio
        g.beginPath();
        g.moveTo(-16, -32);
        g.lineTo(-18, -25);
        g.lineTo(-15, -5);
        g.lineTo(15, -5);
        g.lineTo(18, -25);
        g.lineTo(16, -32);
        g.closePath();
        g.fillPath();
        g.strokePath();

        // Viso nell'ombra
        g.fillStyle(light, 0.6);
        g.fillRect(-11, -24, 22, 18);

        // Occhi brillanti mistici
        g.fillStyle(0x00ffff, 1);
        g.fillCircle(-6, -16, 4);
        g.fillCircle(6, -16, 4);

        // Glow degli occhi
        g.fillStyle(0x00ffff, 0.3);
        g.fillCircle(-6, -16, 6);
        g.fillCircle(6, -16, 6);

        // Simbolo magico complesso sul petto
        g.lineStyle(2, 0xffff00, 0.8);
        g.strokeCircle(0, 18, 7);

        g.fillStyle(0xffff00, 0.6);
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            const x = Math.cos(angle) * 6;
            const y = Math.sin(angle) * 6 + 18;
            g.fillCircle(x, y, 2);
        }
    }

    private drawSummoner(g: Phaser.GameObjects.Graphics, color: number, dark: number, light: number) {
        // Corpo mistico con vesti
        g.fillStyle(color);
        g.fillRect(-15, 0, 30, 40); // Veste

        // Braccia con maniche larghe
        g.fillRect(-22, 8, 10, 20);
        g.fillRect(12, 8, 10, 20);

        // Base della veste
        g.fillStyle(dark);
        g.beginPath();
        g.moveTo(-15, 40);
        g.lineTo(-20, 60);
        g.lineTo(20, 60);
        g.lineTo(15, 40);
        g.closePath();
        g.fillPath();

        // Testa
        g.fillStyle(light);
        g.fillRect(-12, -28, 24, 28);

        // Occhi mistici
        g.fillStyle(color);
        g.fillRect(-8, -20, 5, 6);
        g.fillRect(3, -20, 5, 6);

        // Cristalli fluttuanti intorno
        g.fillStyle(0xff00ff);
        g.fillCircle(-25, -10, 4);
        g.fillCircle(25, -10, 4);
        g.fillCircle(0, -35, 4);
    }

    private drawTank(g: Phaser.GameObjects.Graphics, color: number, dark: number, light: number) {
        // OUTLINE MASSICCIO
        g.lineStyle(4, 0x000000, 1);
        g.strokeRect(-30, -12, 60, 54);
        g.strokeRect(-35, 3, 13, 34);
        g.strokeRect(22, 3, 13, 34);
        g.strokeRect(-22, 37, 19, 30);
        g.strokeRect(3, 37, 19, 30);
        g.strokeRect(-18, -35, 36, 30);

        // Armatura corpo - layer esterno
        g.fillStyle(0x333333);
        g.fillRect(-30, -12, 60, 54);

        // Piastre armatura
        g.fillStyle(dark);
        g.fillRect(-28, -10, 56, 50);

        // Dettagli metallici
        g.fillStyle(light);
        g.fillRect(-26, -8, 52, 3);
        g.fillRect(-26, 0, 52, 3);
        g.fillRect(-26, 8, 52, 3);
        g.fillRect(-26, 16, 52, 3);
        g.fillRect(-26, 24, 52, 3);
        g.fillRect(-26, 32, 52, 3);

        // Corpo principale
        g.fillStyle(color);
        g.fillRect(-24, -6, 48, 42);

        // Rivetti dell'armatura
        g.fillStyle(0x666666);
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 4; col++) {
                g.fillCircle(-18 + col * 12, -4 + row * 10, 2);
            }
        }

        // Spallacci massicci
        g.fillStyle(dark);
        g.fillRect(-35, 3, 13, 18);
        g.fillRect(22, 3, 13, 18);

        g.fillStyle(light);
        g.fillRect(-34, 4, 11, 16);
        g.fillRect(23, 4, 11, 16);

        // Punte sulle spalle
        g.fillStyle(0xaaaaaa);
        g.beginPath();
        g.moveTo(-29, 0);
        g.lineTo(-25, -8);
        g.lineTo(-21, 0);
        g.closePath();
        g.fillPath();

        g.beginPath();
        g.moveTo(21, 0);
        g.lineTo(25, -8);
        g.lineTo(29, 0);
        g.closePath();
        g.fillPath();

        // Braccia corazzate spesse
        g.fillStyle(dark);
        g.fillRect(-34, 22, 12, 16);
        g.fillRect(22, 22, 12, 16);

        g.fillStyle(color);
        g.fillRect(-33, 23, 10, 14);
        g.fillRect(23, 23, 10, 14);

        // Guanti metallici
        g.fillStyle(0x555555);
        g.fillCircle(-28, 35, 5);
        g.fillCircle(28, 35, 5);

        // Gambe corazzate massicce
        g.fillStyle(dark);
        g.fillRect(-22, 37, 19, 30);
        g.fillRect(3, 37, 19, 30);

        g.fillStyle(color);
        g.fillRect(-21, 38, 17, 28);
        g.fillRect(4, 38, 17, 28);

        // Ginocchiere rinforzate
        g.fillStyle(0x666666);
        g.fillRect(-20, 50, 15, 6);
        g.fillRect(5, 50, 15, 6);

        // Stivali pesanti
        g.fillStyle(dark);
        g.fillRect(-22, 64, 19, 5);
        g.fillRect(3, 64, 19, 5);

        // Elmo massiccio
        g.fillStyle(0x222222);
        g.fillRect(-18, -35, 36, 30);

        g.fillStyle(dark);
        g.fillRect(-17, -34, 34, 28);

        // Cresta dell'elmo
        g.fillStyle(0xff0000);
        g.fillRect(-2, -38, 4, 6);
        g.fillRect(-6, -36, 12, 4);

        // Fessura dell'elmo - visiera minacciosa
        g.fillStyle(0x000000);
        g.fillRect(-13, -24, 26, 8);

        // Glow rosso negli occhi
        g.fillStyle(0xff0000, 0.8);
        g.fillRect(-11, -22, 8, 4);
        g.fillRect(3, -22, 8, 4);

        // Highlight intenso
        g.fillStyle(0xff6666);
        g.fillRect(-10, -22, 3, 2);
        g.fillRect(4, -22, 3, 2);

        // Griglia respirazione
        g.fillStyle(0x333333);
        for (let i = 0; i < 5; i++) {
            g.fillRect(-8 + i * 4, -14, 2, 6);
        }
    }

    private drawWildcard(g: Phaser.GameObjects.Graphics, color: number, dark: number, light: number) {
        // Corpo con effetti glitch
        g.fillStyle(color);
        g.fillRect(-15, -5, 30, 40);

        // Glitch effects
        g.fillStyle(0x00ff00);
        g.fillRect(-18, 5, 5, 8);
        g.fillRect(13, 15, 5, 8);

        g.fillStyle(0xff00ff);
        g.fillRect(-17, 20, 6, 5);
        g.fillRect(11, 0, 6, 5);

        // Braccia
        g.fillStyle(color);
        g.fillRect(-20, 0, 7, 28);
        g.fillRect(13, 0, 7, 28);

        // Gambe
        g.fillRect(-13, 35, 11, 28);
        g.fillRect(2, 35, 11, 28);

        // Testa distorta
        g.fillStyle(light);
        g.fillRect(-11, -28, 22, 25);

        // Occhi con colori diversi
        g.fillStyle(0x00ff00);
        g.fillRect(-8, -20, 5, 5);
        g.fillStyle(0xff00ff);
        g.fillRect(3, -20, 5, 5);

        // Pixel glitch fluttuanti
        g.fillStyle(0xffff00);
        g.fillRect(-22, -15, 3, 3);
        g.fillRect(19, -8, 3, 3);
        g.fillRect(-10, -32, 3, 3);
    }

    private drawDefault(g: Phaser.GameObjects.Graphics, color: number, dark: number, light: number) {
        // Figura umanoide generica
        g.fillStyle(color);
        g.fillRect(-15, 0, 30, 35);
        g.fillRect(-18, 5, 6, 25);
        g.fillRect(12, 5, 6, 25);
        g.fillRect(-12, 35, 10, 28);
        g.fillRect(2, 35, 10, 28);

        g.fillStyle(light);
        g.fillRect(-10, -25, 20, 25);

        g.fillStyle(0x000000);
        g.fillRect(-7, -18, 4, 4);
        g.fillRect(3, -18, 4, 4);
    }

    // ============= NUOVI METODI PER ANIMAZIONI E EFFETTI VISIVI =============

    private drawShadow() {
        this.shadowGraphics.clear();
        this.shadowGraphics.fillStyle(0x000000, 0.3);
        this.shadowGraphics.fillEllipse(0, 65, 40, 10);
    }

    private updateIdleAnimation(time: number) {
        if (this.isAttacking || !this.isGrounded) return;

        // Idle bobbing animation
        this.idleAnimation.time += 0.05;
        this.idleAnimation.offsetY = Math.sin(this.idleAnimation.time) * 2;

        // Breathing effect
        this.breathingScale = 1 + Math.sin(this.idleAnimation.time * 0.5) * 0.03;

        // Applica l'animazione allo sprite
        this.sprite.y = this.idleAnimation.offsetY;
        this.sprite.setScale(this.facing * this.breathingScale, this.breathingScale);
    }

    private updateVisualEffects() {
        // Update glow effect
        this.glowEffect.clear();

        if (this.specialEnergy > 30) {
            const glowIntensity = (this.specialEnergy / this.maxSpecialEnergy) * 0.4;
            const glowColor = this.originalColor;

            // Glow pulsante
            const pulseGlow = glowIntensity + Math.sin(Date.now() * 0.005) * 0.1;

            this.glowEffect.fillStyle(glowColor, pulseGlow);
            this.glowEffect.fillCircle(0, 0, 50 + Math.sin(Date.now() * 0.003) * 5);
        }

        // Update aura effect
        this.auraGraphics.clear();

        if (this.specialEnergy >= 100) {
            // Aura completa quando ultimate è pronto
            const auraTime = Date.now() * 0.01;
            this.auraGraphics.lineStyle(2, this.originalColor, 0.6);

            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI * 2 / 6) * i + auraTime;
                const radius = 45 + Math.sin(auraTime + i) * 5;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                this.auraGraphics.strokeCircle(x, y, 8);
            }
        } else if (this.isMoving) {
            // Particelle di movimento
            const particleColor = Phaser.Display.Color.IntegerToColor(this.originalColor).lighten(30).color;
            this.auraGraphics.fillStyle(particleColor, 0.3);

            for (let i = 0; i < 3; i++) {
                const offsetX = -this.facing * (10 + i * 5);
                const offsetY = (Math.random() - 0.5) * 30;
                this.auraGraphics.fillCircle(offsetX, offsetY, 3 - i);
            }
        }
    }

    private createMotionTrail() {
        // Crea una scia fantasma che svanisce
        const trail = this.scene.add.graphics();
        trail.setDepth(this.depth - 1);

        // Copia lo sprite corrente come trail
        const trailColor = Phaser.Display.Color.IntegerToColor(this.originalColor).darken(20).color;
        trail.fillStyle(trailColor, 0.3);
        trail.fillRect(this.x - 30, this.y - 40, 60, 80);

        // Fade out animation
        this.scene.tweens.add({
            targets: trail,
            alpha: 0,
            duration: 200,
            onComplete: () => trail.destroy()
        });
    }

    // Ridisegna lo sprite con animazione (solo per Graphics)
    private redrawSprite() {
        if (this.sprite instanceof Phaser.GameObjects.Graphics) {
            this.sprite.clear();
            this.createPixelArtSprite(this.sprite, this.characterData.archetype, this.originalColor);
        }
    }

    // ============= METODI PER VISUALIZZARE LE STATS =============

    private createStatsIndicator() {
        this.statsIndicator = this.scene.add.container(0, -75);
        this.add(this.statsIndicator);

        const stats = this.characterData.stats;

        // Crea icone colorate per ogni stat
        const statsGraphics = this.scene.add.graphics();

        // PWR (Power) - Rosso
        const powerWidth = Math.min(stats.power * 3, 30);
        statsGraphics.fillStyle(0xff0000, 0.8);
        statsGraphics.fillRect(-35, 0, powerWidth, 4);

        // SPD (Speed) - Verde
        const speedWidth = Math.min(stats.speed * 3, 30);
        statsGraphics.fillStyle(0x00ff00, 0.8);
        statsGraphics.fillRect(-35, 5, speedWidth, 4);

        // DEF (Defense) - Blu
        const defenseWidth = Math.min(stats.defense * 3, 30);
        statsGraphics.fillStyle(0x0088ff, 0.8);
        statsGraphics.fillRect(5, 0, defenseWidth, 4);

        // SPG (Special Gain) - Giallo
        const specialWidth = Math.min(stats.special_gain * 3, 30);
        statsGraphics.fillStyle(0xffff00, 0.8);
        statsGraphics.fillRect(5, 5, specialWidth, 4);

        this.statsIndicator.add(statsGraphics);

        // Testo con valori
        this.statsText = this.scene.add.text(0, -8,
            `⚔${stats.power} ⚡${stats.speed} 🛡${stats.defense} ✨${stats.special_gain}`, {
                fontSize: '8px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);

        this.statsIndicator.add(this.statsText);
    }

    private showDamageNumber(damage: number) {
        const damageText = this.scene.add.text(
            this.x + (Math.random() - 0.5) * 20,
            this.y - 20,
            `-${Math.round(damage)}`,
            {
                fontSize: damage > 100 ? '24px' : '18px',
                color: damage > 100 ? '#ff0000' : '#ffaa00',
                stroke: '#000000',
                strokeThickness: 4,
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // Animazione del damage number
        this.scene.tweens.add({
            targets: damageText,
            y: damageText.y - 40,
            alpha: 0,
            scale: damage > 100 ? 1.5 : 1.2,
            duration: 800,
            ease: 'Power2',
            onComplete: () => damageText.destroy()
        });
    }

    private getSizeMultiplierFromStats(): number {
        const stats = this.characterData.stats;

        // Personaggi con HP alto e defense alta = più grandi (Tank)
        // Personaggi con speed alta e power bassa = più piccoli (Striker)
        const tankiness = (stats.hp + stats.defense) / 20;
        const agility = stats.speed / 10;

        // Range: 0.8 (piccolo/agile) a 1.4 (grande/tank)
        const size = 1 + (tankiness * 0.3) - (agility * 0.15);
        return Math.max(0.8, Math.min(1.4, size));
    }

    // Mostra effetti visivi basati sulle stats durante gli attacchi
    private showPowerVisual(attackType: 'light' | 'heavy' | 'special' | 'ultimate') {
        const power = this.characterData.stats.power;
        const particleCount = Math.floor(power / 2) + 3;

        const colors = {
            light: 0xffff00,
            heavy: 0xff0000,
            special: 0x00ffff,
            ultimate: 0xff00ff
        };

        const color = colors[attackType];

        // Crea particelle in base al power
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const distance = 30 + Math.random() * 20;

            const particle = this.scene.add.circle(
                this.x + Math.cos(angle) * distance,
                this.y + Math.sin(angle) * distance,
                3 + (power / 5),
                color,
                0.8
            );

            this.scene.tweens.add({
                targets: particle,
                x: this.x + Math.cos(angle) * (distance + 40),
                y: this.y + Math.sin(angle) * (distance + 40),
                alpha: 0,
                scale: 0,
                duration: 400,
                onComplete: () => particle.destroy()
            });
        }
    }
}
