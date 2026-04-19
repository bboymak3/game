'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Monster, MonsterType, DrawingHero, DamageNumber, Particle, FloatingText, SkillEffect, GamePhase, WaveConfig, CharacterAnalysis } from './types';
import { drawSlime, drawGhost, drawBat, drawSkeleton, drawBoss, drawDrawingHero, drawAwakeningEffect, drawHealthBar } from './PixelSprites';

// ============================================
// RANDOM CHARACTER GENERATOR (offline/static)
// ============================================
const HERO_NAMES = [
  'Sparkle Knight', 'Thunder Paws', 'Shadow Fox', 'Cosmic Tiger', 'Blaze Unicorn',
  'Storm Eagle', 'Crystal Wolf', 'Nova Dragon', 'Pixel Warrior', 'Star Knight',
  'Frost Bear', 'Ember Cat', 'Galaxy Frog', 'Neon Shark', 'Dream Owl',
  'Lightning Bunny', 'Sapphire Lion', 'Ruby Phoenix', 'Turbo Snail', 'Mystic Panda',
  'Super Chango', 'Rocket Llama', 'Captain Gato', 'Zap Dino', 'Glow Worm',
  'Iron Butterfly', 'Steel Duck', 'Mega Turtle', 'Ultra Sloth', 'Power Penguin',
];

const HERO_TYPES = ['guerrero', 'mago', 'tanque', 'asassino'];
const HERO_ELEMENTS = ['fuego', 'agua', 'rayo', 'hielo', 'naturaleza', 'luz', 'oscuridad', 'viento'];
const HERO_POWERS = [
  'Golpe Explosivo', 'Tormenta Electrica', 'Llamarada Infernal', 'Escudo de Cristal',
  'Tajo Hurricane', 'Impacto Cosmico', 'Onda de Choque', 'Puño de Trueno',
  'Rayo Laser', 'Bola de Fuego', 'Tornado Furioso', 'Explosion Solar',
  'Avalancha Glacial', 'Terremoto', 'Corte Dimensional', 'Flecha Fantasma',
];

const HERO_COLORS: [string, string][] = [
  ['#FF6B6B', '#EE5A24'], ['#00E5FF', '#00BCD4'], ['#FFD740', '#FFC107'],
  ['#69F0AE', '#00C853'], ['#FF4081', '#F50057'], ['#7C4DFF', '#651FFF'],
  ['#FF6E40', '#FF3D00'], ['#40C4FF', '#0091EA'], ['#FFAB40', '#FF6D00'],
  ['#B2FF59', '#64DD17'], ['#E040FB', '#AA00FF'], ['#18FFFF', '#00E5FF'],
];

const HERO_DESCRIPTIONS = [
  'Un dibujo valiente que cobra vida con poderes magicos',
  'Un guerrero nacido del papel con corazon de dragon',
  'Un heroe legendario que salta desde tu dibujo',
  'Un campeon animado con una mision de destruccion',
  'Un protector de mundos creado con colores y amor',
  'Un guardian invencible forjado con imaginacion pura',
];

function generateRandomCharacter(): CharacterAnalysis {
  const name = HERO_NAMES[Math.floor(Math.random() * HERO_NAMES.length)];
  const type = HERO_TYPES[Math.floor(Math.random() * HERO_TYPES.length)];
  const element = HERO_ELEMENTS[Math.floor(Math.random() * HERO_ELEMENTS.length)];
  const power = HERO_POWERS[Math.floor(Math.random() * HERO_POWERS.length)];
  const [color1, color2] = HERO_COLORS[Math.floor(Math.random() * HERO_COLORS.length)];
  const desc = HERO_DESCRIPTIONS[Math.floor(Math.random() * HERO_DESCRIPTIONS.length)];

  const baseAttack = 8 + Math.floor(Math.random() * 10);
  const baseDefense = 3 + Math.floor(Math.random() * 8);
  const baseSpeed = 3 + Math.floor(Math.random() * 6);
  const baseHp = 80 + Math.floor(Math.random() * 60);

  return {
    characterName: name,
    characterType: type,
    description: desc,
    power,
    color1,
    color2,
    stats: { attack: baseAttack, defense: baseDefense, speed: baseSpeed, hp: baseHp },
    element,
  };
}

// ============================================
// CONSTANTS
// ============================================
const MONSTER_STATS: Record<MonsterType, { hp: number; speed: number; damage: number; size: number }> = {
  slime: { hp: 40, speed: 0.6, damage: 5, size: 1.5 },
  ghost: { hp: 35, speed: 0.9, damage: 7, size: 1.4 },
  bat: { hp: 30, speed: 1.2, damage: 6, size: 1.2 },
  skeleton: { hp: 55, speed: 0.7, damage: 9, size: 1.6 },
  boss: { hp: 200, speed: 0.5, damage: 15, size: 2.2 },
};

const MONSTER_NAMES: Record<MonsterType, string> = {
  slime: 'Slime Verde',
  ghost: 'Fantasmita',
  bat: 'Murcielago',
  skeleton: 'Esqueletito',
  boss: 'JEFE FINAL',
};

const MONSTER_DRAW: Record<MonsterType, typeof drawSlime> = {
  slime: drawSlime,
  ghost: drawGhost,
  bat: drawBat,
  skeleton: drawSkeleton,
  boss: drawBoss,
};

const MONSTER_COLORS: Record<MonsterType, [string, string][]> = {
  slime: [['#4CAF50', '#81C784'], ['#2196F3', '#64B5F6'], ['#FF9800', '#FFB74D']],
  ghost: [['#E1BEE7', '#CE93D8']],
  bat: [['#7B1FA2', '#9C27B0']],
  skeleton: [['#F5F5DC', '#D7CCC8']],
  boss: [['#C62828', '#FFCDD2']],
};

function createDrawingHero(analysis: CharacterAnalysis | null, image: HTMLImageElement | null): DrawingHero {
  return {
    x: 0, y: 0, targetX: 0, targetY: 0,
    hp: analysis?.stats.hp || 100,
    maxHp: analysis?.stats.hp || 100,
    mana: 50, maxMana: 50,
    frame: 0, attacking: false, attackTimer: 0, hitTimer: 0,
    direction: 1,
    image, imageWidth: image?.width || 100, imageHeight: image?.height || 100,
    attack: analysis?.stats.attack || 10,
    defense: analysis?.stats.defense || 5,
    speed: (analysis?.stats.speed || 3) * 0.8,
    element: analysis?.element || 'naturaleza',
    power: analysis?.power || 'Golpe Sorpresa',
    characterName: analysis?.characterName || 'Dibujo',
    characterType: analysis?.characterType || 'guerrero',
    level: 1, exp: 0, combo: 0,
    skillActive: false, skillTimer: 0,
    glowIntensity: 1, scale: 1, bobOffset: 0,
  };
}

// Helper to apply character info to hero ref
function applyCharacterInfo(heroRef: React.MutableRefObject<DrawingHero>, info: CharacterAnalysis) {
  const h = heroRef.current;
  h.attack = info.stats?.attack || 10;
  h.defense = info.stats?.defense || 5;
  h.speed = (info.stats?.speed || 3) * 0.8;
  h.hp = info.stats?.hp || 100;
  h.maxHp = info.stats?.hp || 100;
  h.power = info.power || 'Golpe';
  h.element = info.element || 'naturaleza';
  h.characterName = info.characterName || 'Dibujo';
  h.characterType = info.characterType || 'guerrero';
}

export default function GameEngine() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>(0);
  const heroRef = useRef<DrawingHero>(createDrawingHero(null, null));
  const monstersRef = useRef<Monster[]>([]);
  const damageNumbersRef = useRef<DamageNumber[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const skillEffectsRef = useRef<SkillEffect[]>([]);
  const waveRef = useRef<WaveConfig>({ wave: 1, monstersPerWave: 3, score: 0, highScore: 0, totalKills: 0, monsterTypes: ['slime'] });
  const frameRef = useRef(0);
  const cameraReadyRef = useRef(false);
  const spawnTimerRef = useRef(0);
  const monsterIdRef = useRef(0);
  const effectIdRef = useRef(0);
  const awakeningProgressRef = useRef(0);

  const [phase, setPhase] = useState<GamePhase>('menu');
  const [cameraReady, setCameraReady] = useState(false);
  const [characterInfo, setCharacterInfo] = useState<CharacterAnalysis | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);

  // Display state (synced from refs)
  const [dScore, setDScore] = useState(0);
  const [dWave, setDWave] = useState(1);
  const [dHp, setDHp] = useState(100);
  const [dMaxHp, setDMaxHp] = useState(100);
  const [dMana, setDMana] = useState(50);
  const [dMaxMana, setDMaxMana] = useState(50);
  const [dLevel, setDLevel] = useState(1);
  const [dExp, setDExp] = useState(0);
  const [dCombo, setDCombo] = useState(0);
  const [dKills, setDKills] = useState(0);
  const [dHighScore, setDHighScore] = useState(0);
  const [dHeroName, setDHeroName] = useState('Dibujo');

  // ============================================
  // CAMERA SETUP
  // ============================================
  useEffect(() => {
    let cancelled = false;

    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) return;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          cameraReadyRef.current = true;
          setCameraReady(true);
        }
      } catch (_err) {
        if (cancelled) return;
        cameraReadyRef.current = false;
        setCameraReady(false);
      }
    }

    setupCamera();

    return () => {
      cancelled = true;
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
      }
    };
  }, []);

  // ============================================
  // START AWAKENING (shared helper)
  // ============================================
  const beginAwakening = useCallback((info: CharacterAnalysis, imageSrc: string) => {
    setCharacterInfo(info);
    setDHeroName(info.characterName || 'Dibujo');
    applyCharacterInfo(heroRef, info);

    // Load image as hero sprite
    const img = new Image();
    img.onload = () => {
      heroRef.current.image = img;
      heroRef.current.imageWidth = img.width;
      heroRef.current.imageHeight = img.height;
    };
    img.src = imageSrc;

    // Stop camera to save battery during battle
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(t => t.stop());
    }

    setPhase('awakening');
    awakeningProgressRef.current = 0;
  }, []);

  // ============================================
  // SCAN DRAWING (no API call - random character)
  // ============================================
  const scanDrawing = useCallback(async () => {
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw center crop (focus on the drawing)
    const size = Math.min(canvas.width, canvas.height) * 0.6;
    const sx = (canvas.width - size) / 2;
    const sy = (canvas.height - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setHeroImage(imageData);

    // Generate random character (no API needed!)
    const character = generateRandomCharacter();
    beginAwakening(character, imageData);
  }, [beginAwakening]);

  // ============================================
  // AWAKENING ANIMATION
  // ============================================
  useEffect(() => {
    if (phase !== 'awakening') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    const loop = () => {
      if (!running) return;
      awakeningProgressRef.current += 0.008;

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Dark mystical background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#0d0d2b');
      bgGrad.addColorStop(0.5, '#1a1a3e');
      bgGrad.addColorStop(1, '#0d0d2b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Stars
      for (let i = 0; i < 50; i++) {
        const sx = (i * 137.5 + frameRef.current * 0.1) % W;
        const sy = (i * 97.3 + frameRef.current * 0.05) % H;
        const twinkle = Math.sin(frameRef.current * 0.05 + i) * 0.5 + 0.5;
        ctx.globalAlpha = twinkle * 0.8;
        ctx.fillStyle = '#fff';
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;

      // Awakening effect
      const color = characterInfo?.color1 || '#00E5FF';
      drawAwakeningEffect(ctx, W / 2, H / 2, awakeningProgressRef.current, heroRef.current.image, color);

      // Text
      if (awakeningProgressRef.current > 0.3 && characterInfo) {
        const textAlpha = Math.min(1, (awakeningProgressRef.current - 0.3) / 0.3);
        ctx.globalAlpha = textAlpha;
        ctx.fillStyle = color;
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.fillText(`"${characterInfo.characterName}"`, W / 2, H / 2 + 70);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px monospace';
        ctx.fillText(characterInfo.description || '', W / 2, H / 2 + 95);

        if (characterInfo.power) {
          ctx.fillStyle = '#FFD740';
          ctx.font = 'bold 13px monospace';
          ctx.fillText(`Poder: ${characterInfo.power}`, W / 2, H / 2 + 120);
        }
        ctx.globalAlpha = 1;
      }

      frameRef.current++;

      if (awakeningProgressRef.current >= 1.0) {
        // Start battle
        setPhase('playing');
        return;
      }

      gameLoopRef.current = requestAnimationFrame(loop);
    };
    gameLoopRef.current = requestAnimationFrame(loop);

    return () => { running = false; cancelAnimationFrame(gameLoopRef.current); };
  }, [phase, characterInfo]);

  // ============================================
  // SPAWN MONSTER
  // ============================================
  function spawnMonster(canvas: HTMLCanvasElement): Monster {
    const wave = waveRef.current.wave;
    const availableTypes: MonsterType[] = ['slime', 'ghost', 'bat'];
    if (wave >= 3) availableTypes.push('skeleton');
    if (wave >= 5 && wave % 3 === 0) availableTypes.push('boss');

    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    const stats = MONSTER_STATS[type];
    const hpMult = 1 + (wave - 1) * 0.25;

    // Spawn at random edges and positions across the "room"
    const edge = Math.floor(Math.random() * 4);
    let x: number, y: number;
    switch (edge) {
      case 0: x = Math.random() * canvas.width; y = 30; break; // top
      case 1: x = Math.random() * canvas.width; y = canvas.height - 60; break; // bottom
      case 2: x = 30; y = Math.random() * canvas.height * 0.6 + 30; break; // left
      default: x = canvas.width - 30; y = Math.random() * canvas.height * 0.6 + 30; break; // right
    }

    const tx = canvas.width * 0.2 + Math.random() * canvas.width * 0.6;
    const ty = canvas.height * 0.15 + Math.random() * canvas.height * 0.4;

    return {
      id: monsterIdRef.current++,
      x, y, targetX: tx, targetY: ty,
      hp: Math.floor(stats.hp * hpMult),
      maxHp: Math.floor(stats.hp * hpMult),
      type,
      frame: Math.random() * 100,
      frameTimer: 0,
      direction: 1,
      speed: stats.speed * (0.7 + Math.random() * 0.6),
      hitTimer: 0,
      attackTimer: 0,
      alive: true,
      deathTimer: 0,
      size: stats.size,
      moveTimer: 0,
    };
  }

  // ============================================
  // ATTACK MONSTER
  // ============================================
  function attackMonster(monster: Monster, isSkill: boolean) {
    const hero = heroRef.current;
    const baseDmg = hero.attack + hero.level * 2;
    const comboMult = 1 + hero.combo * 0.08;
    const skillMult = isSkill ? 2.5 : 1;
    const isCrit = Math.random() < 0.12 + hero.level * 0.015;
    const critMult = isCrit ? 2.2 : 1;
    const dmg = Math.floor(baseDmg * comboMult * skillMult * critMult * (0.85 + Math.random() * 0.3));

    monster.hp -= dmg;
    monster.hitTimer = 8;
    hero.combo = Math.min(hero.combo + 1, 12);

    damageNumbersRef.current.push({
      id: effectIdRef.current++,
      value: dmg,
      x: monster.x + (Math.random() - 0.5) * 20,
      y: monster.y - 30,
      color: isCrit ? '#FFD700' : '#ffffff',
      life: 35,
      vy: -1.5,
    });

    // Hit particles
    const pColor = characterInfo?.color1 || '#00E5FF';
    for (let i = 0; i < (isCrit ? 12 : 4); i++) {
      particlesRef.current.push({
        x: monster.x + (Math.random() - 0.5) * 30,
        y: monster.y + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5 - 1,
        life: 15 + Math.random() * 10,
        maxLife: 25,
        color: isCrit ? '#FFD700' : pColor,
        size: 2 + Math.random() * 4,
      });
    }

    if (monster.hp <= 0) {
      monster.alive = false;
      monster.deathTimer = 25;
      hero.exp += 15 + monster.maxHp * 0.15;
      waveRef.current.score += Math.floor(monster.maxHp * 1.2);
      waveRef.current.totalKills++;

      floatingTextsRef.current.push({
        id: effectIdRef.current++,
        text: `+${Math.floor(monster.maxHp * 1.2)} pts`,
        x: monster.x, y: monster.y - 50,
        color: '#FFD700', life: 45, size: 14,
      });

      // Level up
      const expNeeded = hero.level * 60;
      if (hero.exp >= expNeeded) {
        hero.level++;
        hero.exp -= expNeeded;
        hero.maxHp += 10;
        hero.hp = Math.min(hero.hp + 20, hero.maxHp);
        hero.attack += 2;
        hero.maxMana += 3;
        hero.mana = Math.min(hero.mana + 10, hero.maxMana);
        floatingTextsRef.current.push({
          id: effectIdRef.current++,
          text: `NIVEL ${hero.level}!`,
          x: hero.x, y: hero.y - 70,
          color: '#00FF88', life: 70, size: 22,
        });
      }

      // Death particles
      for (let i = 0; i < 20; i++) {
        const mColors = MONSTER_COLORS[monster.type] || [['#aaa', '#888']];
        const mc = mColors[0][0];
        particlesRef.current.push({
          x: monster.x, y: monster.y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 20 + Math.random() * 15, maxLife: 35,
          color: mc, size: 3 + Math.random() * 5,
        });
      }
    }
  }

  // ============================================
  // HANDLE TAP (move hero or attack)
  // ============================================
  const handleTap = (e: React.TouchEvent | React.MouseEvent) => {
    if (phase !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let cx: number, cy: number;
    if ('touches' in e) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
    else { cx = e.clientX; cy = e.clientY; }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const tapX = (cx - rect.left) * scaleX;
    const tapY = (cy - rect.top) * scaleY;

    const hero = heroRef.current;

    // Check if tapped on a monster
    let hitMonster: Monster | null = null;
    let closest = Infinity;
    monstersRef.current.forEach(m => {
      if (!m.alive) return;
      const d = Math.sqrt((tapX - m.x) ** 2 + (tapY - m.y) ** 2);
      const hitRadius = 40 * m.size;
      if (d < hitRadius && d < closest) { closest = d; hitMonster = m; }
    });

    if (hitMonster) {
      // Attack the monster
      hero.attacking = true;
      hero.attackTimer = 15;
      hero.direction = hitMonster.x > hero.x ? 1 : -1;
      // Move toward monster
      hero.targetX = hitMonster.x;
      hero.targetY = hitMonster.y;
      attackMonster(hitMonster, false);
    } else {
      // Move hero to tap position
      hero.targetX = tapX;
      hero.targetY = tapY;
      hero.combo = 0;
    }
  };

  // ============================================
  // USE SKILL
  // ============================================
  const useSkill = () => {
    if (phase !== 'playing') return;
    const hero = heroRef.current;
    if (hero.mana < 15) return;

    hero.mana -= 15;
    hero.skillActive = true;
    hero.skillTimer = 25;
    hero.attacking = true;
    hero.attackTimer = 15;

    const sColor = characterInfo?.color1 || '#00E5FF';
    skillEffectsRef.current.push({
      x: hero.x, y: hero.y,
      radius: 0, maxRadius: 180,
      life: 25, color: sColor,
    });

    monstersRef.current.forEach(m => {
      if (!m.alive) return;
      const d = Math.sqrt((m.x - hero.x) ** 2 + (m.y - hero.y) ** 2);
      if (d < 180) attackMonster(m, true);
    });
  };

  // ============================================
  // MAIN GAME LOOP
  // ============================================
  function gameLoop(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    frameRef.current++;
    const frame = frameRef.current;
    const hero = heroRef.current;
    const W = canvas.width;
    const H = canvas.height;
    const wave = waveRef.current;

    // Hero stays at bottom center by default
    if (hero.targetX === 0 && hero.targetY === 0) {
      hero.targetX = W / 2;
      hero.targetY = H * 0.75;
    }

    // Move hero toward target
    const dx = hero.targetX - hero.x;
    const dy = hero.targetY - hero.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 3) {
      hero.x += (dx / dist) * hero.speed;
      hero.y += (dy / dist) * hero.speed;
      if (dx !== 0) hero.direction = dx > 0 ? 1 : -1;
    }

    // Keep hero in bounds
    hero.x = Math.max(40, Math.min(W - 40, hero.x));
    hero.y = Math.max(40, Math.min(H - 40, hero.y));

    // Hero animation
    hero.frame++;
    hero.bobOffset = Math.sin(hero.frame * 0.08) * 4;
    if (hero.hitTimer > 0) hero.hitTimer--;
    if (hero.attackTimer > 0) { hero.attackTimer--; if (hero.attackTimer <= 0) hero.attacking = false; }
    if (hero.skillTimer > 0) hero.skillTimer--;
    else hero.skillActive = false;

    // Mana regen
    if (frame % 45 === 0) hero.mana = Math.min(hero.mana + 2, hero.maxMana);

    // Spawn monsters
    const aliveMonsters = monstersRef.current.filter(m => m.alive);
    if (aliveMonsters.length < Math.min(wave.monstersPerWave, 2 + wave.wave)) {
      spawnTimerRef.current++;
      if (spawnTimerRef.current > 80) {
        monstersRef.current.push(spawnMonster(canvas));
        spawnTimerRef.current = 0;
      }
    }

    // Auto-attack nearest monster when close enough
    aliveMonsters.forEach(m => {
      const md = Math.sqrt((hero.x - m.x) ** 2 + (hero.y - m.y) ** 2);
      if (md < 50 * m.size && !hero.attacking) {
        hero.attacking = true;
        hero.attackTimer = 12;
        hero.direction = m.x > hero.x ? 1 : -1;
        attackMonster(m, false);
      }
    });

    // Update monsters
    monstersRef.current.forEach(m => {
      if (!m.alive) { m.deathTimer--; return; }

      m.frame++;
      if (m.hitTimer > 0) m.hitTimer--;

      // Move monster toward its target or toward hero
      m.moveTimer++;
      if (m.moveTimer > 120) {
        m.moveTimer = 0;
        // Pick new random target near hero or random room position
        if (Math.random() > 0.3) {
          m.targetX = hero.x + (Math.random() - 0.5) * 200;
          m.targetY = hero.y + (Math.random() - 0.5) * 150;
        } else {
          m.targetX = W * 0.1 + Math.random() * W * 0.8;
          m.targetY = H * 0.1 + Math.random() * H * 0.5;
        }
        m.targetX = Math.max(30, Math.min(W - 30, m.targetX));
        m.targetY = Math.max(30, Math.min(H - 50, m.targetY));
      }

      const mdx = m.targetX - m.x;
      const mdy = m.targetY - m.y;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mDist > 5) {
        m.x += (mdx / mDist) * m.speed;
        m.y += (mdy / mDist) * m.speed * 0.7;
        if (mdx !== 0) m.direction = mdx > 0 ? 1 : -1;
      }

      // Monster attack hero
      const heroDist = Math.sqrt((hero.x - m.x) ** 2 + (hero.y - m.y) ** 2);
      if (heroDist < 45 * m.size) {
        m.attackTimer++;
        if (m.attackTimer > 50) {
          m.attackTimer = 0;
          const mDmg = Math.max(1, MONSTER_STATS[m.type].damage - Math.floor(hero.defense * 0.3));
          hero.hp -= mDmg;
          hero.hitTimer = 8;
          floatingTextsRef.current.push({
            id: effectIdRef.current++,
            text: `-${mDmg}`,
            x: hero.x + (Math.random() - 0.5) * 15,
            y: hero.y - 40,
            color: '#ff4444', life: 35, size: 18,
          });
        }
      }

      // Bounds
      m.x = Math.max(20, Math.min(W - 20, m.x));
      m.y = Math.max(20, Math.min(H - 40, m.y));
    });

    // Remove dead
    monstersRef.current = monstersRef.current.filter(m => m.alive || m.deathTimer > 0);

    // Update effects
    damageNumbersRef.current = damageNumbersRef.current.filter(d => { d.life--; d.y += d.vy; d.vy -= 0.04; return d.life > 0; });
    particlesRef.current = particlesRef.current.filter(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life--; return p.life > 0; });
    floatingTextsRef.current = floatingTextsRef.current.filter(t => { t.life--; t.y -= 0.4; return t.life > 0; });
    skillEffectsRef.current = skillEffectsRef.current.filter(e => { e.life--; e.radius = e.maxRadius * (1 - e.life / 25); return e.life > 0; });

    // Wave check
    if (aliveMonsters.length === 0 && monstersRef.current.length > 0 && monstersRef.current.every(m => !m.alive)) {
      wave.wave++;
      wave.monstersPerWave = Math.min(2 + wave.wave, 7);
      monstersRef.current = [];
      spawnTimerRef.current = 0;
      hero.hp = Math.min(hero.hp + Math.floor(hero.maxHp * 0.15), hero.maxHp);
      floatingTextsRef.current.push({
        id: effectIdRef.current++,
        text: `OLEADA ${wave.wave}!`,
        x: W / 2, y: H / 3,
        color: '#00FF88', life: 80, size: 26,
      });
    }

    // Game over
    if (hero.hp <= 0) {
      hero.hp = 0;
      if (wave.score > wave.highScore) wave.highScore = wave.score;
      setDKills(wave.totalKills);
      setDHighScore(wave.highScore);
      setPhase('gameover');
    }

    // Victory
    if (wave.wave > 8) {
      setDKills(wave.totalKills);
      setDHighScore(wave.highScore);
      setPhase('victory');
    }

    // ========== RENDER ==========
    ctx.clearRect(0, 0, W, H);

    // Virtual background (since camera is stopped during battle)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#1a1a2e');
    bgGrad.addColorStop(0.4, '#16213e');
    bgGrad.addColorStop(1, '#0f3460');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Stars
    for (let i = 0; i < 30; i++) {
      const sx = (i * 137.5) % W;
      const sy = (i * 97.3) % (H * 0.5);
      const tw = Math.sin(frame * 0.03 + i) * 0.5 + 0.5;
      ctx.globalAlpha = tw * 0.5;
      ctx.fillStyle = '#fff';
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }
    ctx.globalAlpha = 1;

    // Floor
    ctx.fillStyle = '#1a3a1a';
    ctx.fillRect(0, H * 0.82, W, H * 0.18);
    ctx.fillStyle = '#2a5a2a';
    ctx.fillRect(0, H * 0.82, W, 3);

    // Skill effects
    skillEffectsRef.current.forEach(e => {
      ctx.save();
      ctx.globalAlpha = e.life / 25 * 0.35;
      ctx.strokeStyle = e.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = e.life / 25 * 0.1;
      ctx.fillStyle = e.color;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Monsters
    monstersRef.current.forEach(m => {
      const drawFn = MONSTER_DRAW[m.type];
      if (drawFn) {
        const colors = MONSTER_COLORS[m.type];
        const colorPair = colors ? colors[0] : undefined;
        drawFn(ctx, m.x, m.y, m.size, m.frame, m.direction, m.hitTimer, m.deathTimer,
          m.type === 'slime' ? colorPair?.[0] : undefined,
          m.type === 'slime' ? colorPair?.[1] : undefined
        );
      }
      if (m.alive) {
        drawHealthBar(ctx, m.x - 30, m.y - 35 * m.size, 60, 8, m.hp, m.maxHp, '#e74c3c');
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.max(9, 11 - m.type === 'boss' ? 0 : 2)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(MONSTER_NAMES[m.type], m.x, m.y - 40 * m.size);
      }
    });

    // Hero - pass characterInfo color1 for glow effect
    drawDrawingHero(ctx, {
      ...hero,
      color1: characterInfo?.color1 || '#00E5FF',
      skillActive: hero.skillActive,
      level: hero.level,
    });

    // Particles
    particlesRef.current.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.restore();
    });

    // Damage numbers
    damageNumbersRef.current.forEach(d => {
      ctx.save();
      ctx.globalAlpha = Math.min(1, d.life / 15);
      ctx.fillStyle = d.color;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = d.value > 25 ? 3 : 2;
      const sz = d.value > 25 ? 22 : 16;
      ctx.font = `bold ${sz}px monospace`;
      ctx.textAlign = 'center';
      ctx.strokeText(`${d.value}`, d.x, d.y);
      ctx.fillText(`${d.value}`, d.x, d.y);
      ctx.restore();
    });

    // Floating texts
    floatingTextsRef.current.forEach(t => {
      ctx.save();
      ctx.globalAlpha = Math.min(1, t.life / 12);
      ctx.fillStyle = t.color;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2.5;
      ctx.font = `bold ${t.size}px monospace`;
      ctx.textAlign = 'center';
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });

    // Sync display state
    if (frame % 5 === 0) {
      setDScore(wave.score);
      setDWave(wave.wave);
      setDHp(hero.hp);
      setDMaxHp(hero.maxHp);
      setDMana(hero.mana);
      setDMaxMana(hero.maxMana);
      setDLevel(hero.level);
      setDExp(hero.exp);
      setDCombo(hero.combo);
      setDKills(wave.totalKills);
      setDHighScore(wave.highScore);
    }
  }

  // ============================================
  // GAME LOOP EFFECT
  // ============================================
  useEffect(() => {
    if (phase !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    const loop = () => {
      if (!running) return;
      gameLoop(canvas, ctx);
      gameLoopRef.current = requestAnimationFrame(loop);
    };
    gameLoopRef.current = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(gameLoopRef.current); };
  }, [phase]);

  // ============================================
  // DEMO FALLBACK - Pre-defined character
  // ============================================
  const startDemoFallback = useCallback(() => {
    const drawingUrl = '/demo-drawing.jpg';
    setHeroImage(drawingUrl);
    const info: CharacterAnalysis = {
      characterName: 'Blob Warrior',
      characterType: 'guerrero',
      description: 'Un valiente dibujo blob que cobra vida',
      power: 'Choque Cosmico',
      color1: '#00E5FF',
      color2: '#00BCD4',
      stats: { attack: 12, defense: 6, speed: 7, hp: 120 },
      element: 'luz',
    };
    beginAwakening(info, drawingUrl);
  }, [beginAwakening]);

  // ============================================
  // DEMO MODE - Uses demo-drawing.jpg + random character
  // ============================================
  const startDemoMode = useCallback(() => {
    const drawingUrl = '/demo-drawing.jpg';
    setHeroImage(drawingUrl);
    const character = generateRandomCharacter();
    beginAwakening(character, drawingUrl);
  }, [beginAwakening]);

  // ============================================
  // START / RESTART
  // ============================================
  const startBattle = useCallback(() => {
    const h = heroRef.current;
    h.hp = h.maxHp;
    h.mana = h.maxMana;
    h.combo = 0;
    h.exp = 0;
    h.level = 1;
    h.x = 320; h.y = 380;
    h.targetX = 320; h.targetY = 380;
    h.attacking = false; h.attackTimer = 0; h.hitTimer = 0;
    monstersRef.current = [];
    damageNumbersRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    skillEffectsRef.current = [];
    waveRef.current = { wave: 1, monstersPerWave: 3, score: 0, highScore: waveRef.current.highScore, totalKills: 0, monsterTypes: ['slime'] };
    spawnTimerRef.current = 0;
    setPhase('playing');
  }, []);

  const goToScan = useCallback(() => {
    setPhase('scanning');
    setCharacterInfo(null);
    setHeroImage(null);
    frameRef.current = 0;
    awakeningProgressRef.current = 0;
    // Re-start camera for scanning
    if (videoRef.current) {
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      }).then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          cameraReadyRef.current = true;
          setCameraReady(true);
        }
      }).catch(() => setCameraReady(false));
    }
  }, []);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'e') {
        if (phase === 'playing') {
          const hero = heroRef.current;
          if (hero.mana >= 15) {
            hero.mana -= 15;
            hero.skillActive = true; hero.skillTimer = 25; hero.attacking = true; hero.attackTimer = 15;
            const sColor = characterInfo?.color1 || '#00E5FF';
            skillEffectsRef.current.push({ x: hero.x, y: hero.y, radius: 0, maxRadius: 180, life: 25, color: sColor });
            monstersRef.current.forEach(m => {
              if (!m.alive) return;
              if (Math.sqrt((m.x - hero.x) ** 2 + (m.y - hero.y) ** 2) < 180) attackMonster(m, true);
            });
          }
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, characterInfo]);

  // ============================================
  // RENDER
  // ============================================
  const expNeeded = dLevel * 60;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black select-none" style={{ touchAction: 'none' }}>
      {/* Hidden capture canvas */}
      <canvas ref={captureCanvasRef} className="hidden" />

      {/* Camera video (only during scanning) */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline muted
        style={{ zIndex: 0, display: phase === 'scanning' ? 'block' : 'none' }}
      />

      {/* Scan overlay guide */}
      {phase === 'scanning' && (
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          {/* Corner guides */}
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-white/60 rounded-lg">
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-yellow-400 rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-yellow-400 rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-yellow-400 rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-yellow-400 rounded-br-lg" />
          </div>

          {/* Instructions */}
          <div className="absolute top-8 left-0 right-0 text-center">
            <p className="text-white font-bold text-lg" style={{ textShadow: '2px 2px 4px #000' }}>
              Apunta la camara al dibujo
            </p>
            <p className="text-white/70 text-sm mt-1">Coloca el dibujo dentro del recuadro</p>
          </div>

          {/* Scan button */}
          <button
            onClick={scanDrawing}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-auto active:scale-90 transition-transform"
            style={{ zIndex: 5 }}
          >
            <div className="w-20 h-20 rounded-full border-4 border-white bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">SCAN</span>
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setPhase('menu')}
            className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 pointer-events-auto active:scale-95 transition-transform"
            style={{ zIndex: 5 }}
          >
            <span className="text-white text-sm">Atras</span>
          </button>
        </div>
      )}

      {/* Game canvas (awakening + playing) */}
      {(phase === 'awakening' || phase === 'playing' || phase === 'gameover' || phase === 'victory') && (
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 1 }}
          onTouchStart={(e) => { e.preventDefault(); handleTap(e); }}
          onClick={handleTap}
        />
      )}

      {/* Battle HUD */}
      {phase === 'playing' && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 p-2 flex flex-col gap-1 safe-area-top">
            <div className="flex justify-between items-center px-1">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                <span className="text-yellow-400 font-bold text-xs">OLEADA {dWave}/8</span>
              </div>
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                <span className="text-white font-bold text-xs">{dHeroName}</span>
              </div>
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                <span className="text-white font-bold text-xs">{dScore} pts</span>
              </div>
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                <span className="text-cyan-400 font-bold text-xs">NV.{dLevel}</span>
              </div>
            </div>

            {/* HP */}
            <div className="mx-1">
              <div className="flex items-center gap-1">
                <span className="text-red-400 text-xs font-bold">HP</span>
                <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${(dHp / dMaxHp) * 100}%`, background: 'linear-gradient(to bottom, #ff6b6b, #ee5a24)' }} />
                </div>
                <span className="text-white text-xs font-bold min-w-[40px] text-right">{dHp}/{dMaxHp}</span>
              </div>
            </div>
            {/* MP */}
            <div className="mx-1">
              <div className="flex items-center gap-1">
                <span className="text-blue-400 text-xs font-bold">MP</span>
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${(dMana / dMaxMana) * 100}%`, background: 'linear-gradient(to bottom, #74b9ff, #0984e3)' }} />
                </div>
              </div>
            </div>
            {/* EXP */}
            <div className="mx-1">
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${(dExp / expNeeded) * 100}%`, background: 'linear-gradient(to bottom, #a29bfe, #6c5ce7)' }} />
              </div>
            </div>
            {dCombo > 1 && (
              <div className="text-center">
                <span className="text-yellow-400 font-black text-base animate-pulse">COMBO x{dCombo}!</span>
              </div>
            )}
          </div>

          {/* Skill button */}
          <div className="absolute bottom-4 right-4 pointer-events-auto safe-area-bottom">
            <button onClick={useSkill}
              className={`w-16 h-16 rounded-full border-4 border-cyan-400 flex items-center justify-center shadow-lg active:scale-90 transition-transform ${dMana >= 15 ? 'bg-cyan-600/80' : 'bg-gray-700/80 border-gray-500'}`}>
              <span className="text-white font-black text-lg">{characterInfo?.power?.charAt(0) || '?'}</span>
            </button>
            <div className="text-center mt-1">
              <span className="text-cyan-300 text-xs font-bold">{characterInfo?.power || 'Poder'}</span>
            </div>
          </div>

          <div className="absolute bottom-4 left-4">
            <button onClick={() => setPhase('paused')}
              className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 pointer-events-auto active:scale-95 transition-transform">
              <span className="text-white text-lg">| |</span>
            </button>
          </div>
        </div>
      )}

      {/* MENU */}
      {phase === 'menu' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-950 via-indigo-950/50 to-gray-950" style={{ zIndex: 10 }}>
          <div className="text-center px-6 max-w-md">
            <div className="text-6xl mb-3 animate-bounce">✏️</div>
            <h1 className="text-4xl font-black text-white mb-1" style={{ textShadow: '2px 2px 0 #000' }}>
              DIBUJO WARRIOR
            </h1>
            <h2 className="text-xl font-bold text-cyan-400 mb-1">Realidad Aumentada</h2>
            <p className="text-yellow-300/80 text-sm mb-8">Tu dibujo cobra vida y pelea contra monstruos</p>

            <div className="space-y-2 mb-8 text-left bg-black/40 rounded-xl p-4">
              <p className="text-white/80 text-sm">1. Escanea un dibujo con la camara</p>
              <p className="text-white/80 text-sm">2. Se generan poderes al azar</p>
              <p className="text-white/80 text-sm">3. El dibujo cobra vida como guerrero</p>
              <p className="text-white/80 text-sm">4. Monstruos aparecen en la habitacion</p>
              <p className="text-white/80 text-sm">5. Toca los monstruos para pelear</p>
            </div>

            <button onClick={goToScan}
              className="bg-gradient-to-b from-yellow-400 to-orange-500 text-black font-black text-xl px-10 py-4 rounded-xl shadow-lg active:scale-95 transition-transform pointer-events-auto">
              ESCANEAR DIBUJO
            </button>

            {/* Demo mode - uses demo drawing + random character */}
            <button onClick={startDemoMode}
              className="block w-full mt-3 bg-gradient-to-b from-purple-500 to-pink-600 text-white font-bold text-base px-8 py-3 rounded-xl active:scale-95 transition-transform pointer-events-auto">
              MODO DEMO (Dibujo del Nino)
            </button>

            {heroImage && (
              <button onClick={() => { setPhase('awakening'); awakeningProgressRef.current = 0; }}
                className="block w-full mt-3 bg-gradient-to-b from-green-400 to-emerald-600 text-black font-bold text-base px-8 py-3 rounded-xl active:scale-95 transition-transform pointer-events-auto">
                JUGAR CON ULTIMO DIBUJO
              </button>
            )}
          </div>
        </div>
      )}

      {/* PAUSED */}
      {phase === 'paused' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm" style={{ zIndex: 10 }}>
          <div className="text-center px-6">
            <h2 className="text-4xl font-black text-white mb-6">PAUSA</h2>
            <div className="space-y-3">
              <button onClick={() => setPhase('playing')} className="block w-full bg-green-600 text-white font-bold text-lg px-8 py-3 rounded-xl pointer-events-auto active:scale-95 transition-transform">Continuar</button>
              <button onClick={startBattle} className="block w-full bg-red-600 text-white font-bold text-lg px-8 py-3 rounded-xl pointer-events-auto active:scale-95 transition-transform">Reiniciar Batalla</button>
              <button onClick={goToScan} className="block w-full bg-blue-600 text-white font-bold text-lg px-8 py-3 rounded-xl pointer-events-auto active:scale-95 transition-transform">Escanear Otro Dibujo</button>
              <button onClick={() => setPhase('menu')} className="block w-full bg-gray-600 text-white font-bold text-lg px-8 py-3 rounded-xl pointer-events-auto active:scale-95 transition-transform">Menu</button>
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER */}
      {phase === 'gameover' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm" style={{ zIndex: 10 }}>
          <div className="text-center px-6 max-w-sm">
            <h2 className="text-5xl font-black text-red-500 mb-4">GAME OVER</h2>
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 mb-6 space-y-2">
              <p className="text-yellow-400 font-bold text-lg">Puntos: {dScore}</p>
              <p className="text-white/80">Oleada: {dWave}/8</p>
              <p className="text-white/80">Monstruos derrotados: {dKills}</p>
              <p className="text-white/80">Nivel: {dLevel}</p>
              {dHighScore > 0 && <p className="text-cyan-400 font-bold">Mejor: {dHighScore}</p>}
            </div>
            <div className="space-y-3">
              <button onClick={startBattle} className="block w-full bg-gradient-to-b from-yellow-400 to-orange-500 text-black font-bold text-lg px-8 py-3 rounded-xl pointer-events-auto active:scale-95 transition-transform">Reintentar</button>
              <button onClick={goToScan} className="block w-full bg-blue-600 text-white font-bold text-lg px-8 py-3 rounded-xl pointer-events-auto active:scale-95 transition-transform">Escanear Otro Dibujo</button>
              <button onClick={() => setPhase('menu')} className="block w-full bg-gray-600 text-white font-bold text-lg px-8 py-3 rounded-xl pointer-events-auto active:scale-95 transition-transform">Menu</button>
            </div>
          </div>
        </div>
      )}

      {/* VICTORY */}
      {phase === 'victory' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm" style={{ zIndex: 10 }}>
          <div className="text-center px-6 max-w-sm">
            <h2 className="text-5xl font-black text-yellow-400 mb-4">VICTORIA!</h2>
            <p className="text-white text-lg mb-4">Tu dibujo derroto a todos los monstruos!</p>
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 mb-6 space-y-2">
              <p className="text-yellow-400 font-bold text-2xl">Puntos: {dScore}</p>
              <p className="text-white/80">Monstruos derrotados: {dKills}</p>
              <p className="text-white/80">Nivel: {dLevel}</p>
              <p className="text-cyan-400 font-bold">Eres un legendario Dibujo Warrior!</p>
            </div>
            <div className="space-y-3">
              <button onClick={startBattle} className="block w-full bg-gradient-to-b from-yellow-400 to-orange-500 text-black font-bold text-lg px-8 py-3 rounded-xl pointer-events-auto active:scale-95 transition-transform">Jugar de nuevo</button>
              <button onClick={goToScan} className="block w-full bg-blue-600 text-white font-bold text-lg px-8 py-3 rounded-xl pointer-events-auto active:scale-95 transition-transform">Escanear Otro Dibujo</button>
              <button onClick={() => setPhase('menu')} className="block w-full bg-gray-600 text-white font-bold text-lg px-8 py-3 rounded-xl pointer-events-auto active:scale-95 transition-transform">Menu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
