'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Dragon, DragonType, Hero, DamageNumber, Particle, FloatingText, SkillEffect, GameState, GameConfig } from './types';
import { drawHero, drawDragon, drawHealthBar, drawDamageNumber, drawParticle, drawStars as drawBgStars } from './PixelSprites';

// ============================================
// CONSTANTS
// ============================================
const HERO_SCALE = 2.2;
const DRAGON_SCALE = 1.8;
const DRAGON_TYPES: DragonType[] = ['green', 'red', 'blue', 'gold', 'shadow'];
const DRAGON_STATS = {
  green: { hp: 60, speed: 0.8, damage: 8 },
  red: { hp: 100, speed: 1.0, damage: 12 },
  blue: { hp: 80, speed: 1.3, damage: 10 },
  gold: { hp: 150, speed: 0.6, damage: 18 },
  shadow: { hp: 200, speed: 1.1, damage: 15 },
};

const DRAGON_NAMES: Record<DragonType, string> = {
  green: 'Dragón Bosque',
  red: 'Dragón Fuego',
  blue: 'Dragón Hielo',
  gold: 'Dragón Dorado',
  shadow: 'Dragón Sombra',
};

function createHero(): Hero {
  return {
    x: 0, y: 0,
    hp: 100, maxHp: 100,
    mana: 50, maxMana: 50,
    frame: 0, frameTimer: 0,
    attacking: false, attackTimer: 0, attackFrame: 0,
    direction: 1,
    hitTimer: 0,
    combo: 0, exp: 0, level: 1,
    skillActive: false, skillTimer: 0,
  };
}

export default function GameEngine() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>(0);
  const heroRef = useRef<Hero>(createHero());
  const dragonsRef = useRef<Dragon[]>([]);
  const damageNumbersRef = useRef<DamageNumber[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const skillEffectsRef = useRef<SkillEffect[]>([]);
  const configRef = useRef<GameConfig>({ wave: 1, dragonsPerWave: 3, score: 0, highScore: 0, totalKills: 0 });
  const frameRef = useRef(0);
  const cameraReadyRef = useRef(false);
  const spawnTimerRef = useRef(0);
  const dragonIdCounterRef = useRef(0);
  const effectIdCounterRef = useRef(0);

  // React state for UI rendering
  const [gameState, setGameState] = useState<GameState>('menu');
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [displayWave, setDisplayWave] = useState(1);
  const [displayHp, setDisplayHp] = useState(100);
  const [displayMaxHp, setDisplayMaxHp] = useState(100);
  const [displayMana, setDisplayMana] = useState(50);
  const [displayMaxMana, setDisplayMaxMana] = useState(50);
  const [displayLevel, setDisplayLevel] = useState(1);
  const [displayExp, setDisplayExp] = useState(0);
  const [displayCombo, setDisplayCombo] = useState(0);
  const [displayKills, setDisplayKills] = useState(0);
  const [displayHighScore, setDisplayHighScore] = useState(0);

  // ============================================
  // SPAWN DRAGON
  // ============================================
  function spawnDragon(canvas: HTMLCanvasElement): Dragon {
    const wave = configRef.current.wave;
    const typeIndex = Math.min(Math.floor(Math.random() * Math.min(wave, DRAGON_TYPES.length)), DRAGON_TYPES.length - 1);
    const type = DRAGON_TYPES[typeIndex];
    const stats = DRAGON_STATS[type];
    const hpMultiplier = 1 + (wave - 1) * 0.3;

    const side = Math.random() > 0.5 ? 1 : -1;
    return {
      id: dragonIdCounterRef.current++,
      x: side === 1 ? canvas.width + 60 : -60,
      y: canvas.height * 0.3 + Math.random() * (canvas.height * 0.4),
      hp: Math.floor(stats.hp * hpMultiplier),
      maxHp: Math.floor(stats.hp * hpMultiplier),
      type,
      frame: Math.random() * 100,
      frameTimer: 0,
      direction: side === 1 ? -1 : 1,
      speed: stats.speed * (0.8 + Math.random() * 0.4),
      hitTimer: 0,
      attackTimer: 0,
      alive: true,
      deathTimer: 0,
    };
  }

  // ============================================
  // COMBAT LOGIC
  // ============================================
  function attackDragon(dragon: Dragon, isSkill: boolean) {
    const hero = heroRef.current;
    const baseDamage = 10 + hero.level * 3;
    const comboMultiplier = 1 + hero.combo * 0.1;
    const skillMultiplier = isSkill ? 3 : 1;
    const isCrit = Math.random() < 0.15 + hero.level * 0.02;
    const critMultiplier = isCrit ? 2 : 1;
    const damage = Math.floor(baseDamage * comboMultiplier * skillMultiplier * critMultiplier * (0.8 + Math.random() * 0.4));

    dragon.hp -= damage;
    dragon.hitTimer = 10;
    hero.combo = Math.min(hero.combo + 1, 10);

    // Damage number
    damageNumbersRef.current.push({
      id: effectIdCounterRef.current++,
      value: damage,
      x: dragon.x + (Math.random() - 0.5) * 30,
      y: dragon.y - 40,
      color: isCrit ? '#FFD700' : '#ffffff',
      life: 40,
      vy: -2,
    });

    // Particles
    for (let i = 0; i < (isCrit ? 15 : 5); i++) {
      particlesRef.current.push({
        x: dragon.x + (Math.random() - 0.5) * 40,
        y: dragon.y + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
        life: 20 + Math.random() * 15,
        maxLife: 35,
        color: isCrit ? '#FFD700' : isSkill ? '#00d4ff' : '#f39c12',
        size: 3 + Math.random() * 5,
      });
    }

    if (dragon.hp <= 0) {
      dragon.alive = false;
      dragon.deathTimer = 30;
      const expGain = 20 + dragon.maxHp * 0.2;
      hero.exp += expGain;
      configRef.current.score += Math.floor(dragon.maxHp * 1.5);
      configRef.current.totalKills++;

      // Floating text
      floatingTextsRef.current.push({
        id: effectIdCounterRef.current++,
        text: `+${Math.floor(dragon.maxHp * 1.5)} pts`,
        x: dragon.x,
        y: dragon.y - 60,
        color: '#FFD700',
        life: 50,
        size: 16,
      });

      // Level up check
      const expNeeded = hero.level * 80;
      if (hero.exp >= expNeeded) {
        hero.level++;
        hero.exp -= expNeeded;
        hero.maxHp += 15;
        hero.hp = Math.min(hero.hp + 30, hero.maxHp);
        hero.maxMana += 5;
        hero.mana = Math.min(hero.mana + 15, hero.maxMana);
        floatingTextsRef.current.push({
          id: effectIdCounterRef.current++,
          text: `¡NIVEL ${hero.level}!`,
          x: hero.x,
          y: hero.y - 80,
          color: '#00ff88',
          life: 80,
          size: 24,
        });
      }

      // Death explosion particles
      for (let i = 0; i < 25; i++) {
        particlesRef.current.push({
          x: dragon.x,
          y: dragon.y,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          life: 30 + Math.random() * 20,
          maxLife: 50,
          color: dragon.type === 'gold' ? '#FFD700' : dragon.type === 'shadow' ? '#9b59b6' : '#2ecc71',
          size: 4 + Math.random() * 6,
        });
      }
    }
  }

  // ============================================
  // HERO TAP / ATTACK
  // ============================================
  const handleCanvasTap = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const tapX = (clientX - rect.left) * scaleX;
    const tapY = (clientY - rect.top) * scaleY;

    const hero = heroRef.current;
    hero.attacking = true;
    hero.attackTimer = 15;
    hero.attackFrame = 0;

    // Check if tapped on a dragon
    let hitDragon: Dragon | null = null;
    let closestDist = Infinity;

    dragonsRef.current.forEach(dragon => {
      if (!dragon.alive) return;
      const dist = Math.sqrt((tapX - dragon.x) ** 2 + (tapY - dragon.y) ** 2);
      if (dist < 80 * DRAGON_SCALE && dist < closestDist) {
        closestDist = dist;
        hitDragon = dragon;
      }
    });

    if (hitDragon) {
      attackDragon(hitDragon, false);
      hero.direction = hitDragon.x > hero.x ? 1 : -1;
    } else {
      hero.combo = 0; // Reset combo on miss
    }
  }, [gameState]);

  // ============================================
  // SKILL (MANA SPECIAL)
  // ============================================
  const useSkill = useCallback(() => {
    if (gameState !== 'playing') return;
    const hero = heroRef.current;
    if (hero.mana < 20) return;

    hero.mana -= 20;
    hero.skillActive = true;
    hero.skillTimer = 20;

    // Skill effect
    skillEffectsRef.current.push({
      x: hero.x,
      y: hero.y,
      radius: 0,
      maxRadius: 200,
      life: 20,
      color: '#00d4ff',
    });

    // Hit all dragons in range
    dragonsRef.current.forEach(dragon => {
      if (!dragon.alive) return;
      const dist = Math.sqrt((dragon.x - hero.x) ** 2 + (dragon.y - hero.y) ** 2);
      if (dist < 200) {
        attackDragon(dragon, true);
      }
    });
  }, [gameState]);

  // ============================================
  // MAIN GAME LOOP
  // ============================================
  function gameLoop(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    frameRef.current++;
    const frame = frameRef.current;
    const hero = heroRef.current;

    const W = canvas.width;
    const H = canvas.height;

    // Position hero at bottom center
    hero.x = W / 2;
    hero.y = H * 0.78;

    // Update hero animation
    hero.frame++;
    if (hero.hitTimer > 0) hero.hitTimer--;
    if (hero.attackTimer > 0) {
      hero.attackTimer--;
      hero.attackFrame++;
      if (hero.attackTimer <= 0) {
        hero.attacking = false;
        hero.attackFrame = 0;
      }
    }
    if (hero.skillTimer > 0) hero.skillTimer--;
    else hero.skillActive = false;

    // Mana regeneration
    if (frame % 60 === 0) {
      hero.mana = Math.min(hero.mana + 2, hero.maxMana);
    }

    // Spawn dragons
    const aliveDragons = dragonsRef.current.filter(d => d.alive);
    if (aliveDragons.length < Math.min(configRef.current.dragonsPerWave, 3 + configRef.current.wave)) {
      spawnTimerRef.current++;
      if (spawnTimerRef.current > 90) {
        dragonsRef.current.push(spawnDragon(canvas));
        spawnTimerRef.current = 0;
      }
    }

    // Check wave completion
    if (aliveDragons.length === 0 && dragonsRef.current.length > 0) {
      const deadAll = dragonsRef.current.every(d => !d.alive);
      if (deadAll && dragonsRef.current.length >= configRef.current.dragonsPerWave) {
        configRef.current.wave++;
        configRef.current.dragonsPerWave = Math.min(3 + configRef.current.wave, 8);
        dragonsRef.current = [];
        spawnTimerRef.current = 0;
        floatingTextsRef.current.push({
          id: effectIdCounterRef.current++,
          text: `¡OLEADA ${configRef.current.wave}!`,
          x: W / 2,
          y: H / 3,
          color: '#00ff88',
          life: 90,
          size: 28,
        });
        // Small heal between waves
        hero.hp = Math.min(hero.hp + Math.floor(hero.maxHp * 0.2), hero.maxHp);
      }
    }

    // Update dragons
    dragonsRef.current.forEach(dragon => {
      if (!dragon.alive) {
        dragon.deathTimer--;
        return;
      }

      dragon.frame++;
      if (dragon.hitTimer > 0) dragon.hitTimer--;

      // Move towards hero
      const dx = hero.x - dragon.x;
      const dy = hero.y - dragon.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 60 * DRAGON_SCALE) {
        dragon.x += (dx / dist) * dragon.speed;
        dragon.y += (dy / dist) * dragon.speed * 0.5;
        dragon.direction = dx > 0 ? 1 : -1;
      }

      // Dragon attack
      if (dist < 70 * DRAGON_SCALE) {
        dragon.attackTimer++;
        if (dragon.attackTimer > 60) {
          dragon.attackTimer = 0;
          const damage = DRAGON_STATS[dragon.type].damage;
          hero.hp -= damage;
          hero.hitTimer = 10;

          // Floating text for damage taken
          floatingTextsRef.current.push({
            id: effectIdCounterRef.current++,
            text: `-${damage}`,
            x: hero.x + (Math.random() - 0.5) * 20,
            y: hero.y - 50,
            color: '#ff4444',
            life: 40,
            size: 20,
          });
        }
      }

      // Keep dragon in bounds
      dragon.x = Math.max(30, Math.min(W - 30, dragon.x));
      dragon.y = Math.max(30, Math.min(H - 50, dragon.y));
    });

    // Remove fully dead dragons
    dragonsRef.current = dragonsRef.current.filter(d => d.alive || d.deathTimer > 0);

    // Update effects
    damageNumbersRef.current = damageNumbersRef.current.filter(d => {
      d.life--;
      d.y += d.vy;
      d.vy -= 0.05;
      return d.life > 0;
    });

    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.life--;
      return p.life > 0;
    });

    floatingTextsRef.current = floatingTextsRef.current.filter(t => {
      t.life--;
      t.y -= 0.5;
      return t.life > 0;
    });

    skillEffectsRef.current = skillEffectsRef.current.filter(e => {
      e.life--;
      e.radius = e.maxRadius * (1 - e.life / 20);
      return e.life > 0;
    });

    // Check game over
    if (hero.hp <= 0) {
      hero.hp = 0;
      if (configRef.current.score > configRef.current.highScore) {
        configRef.current.highScore = configRef.current.score;
      }
      setDisplayKills(configRef.current.totalKills);
      setDisplayHighScore(configRef.current.highScore);
      setGameState('gameover');
    }

    // Check victory
    if (configRef.current.wave > 10) {
      setDisplayKills(configRef.current.totalKills);
      setDisplayHighScore(configRef.current.highScore);
      setGameState('victory');
    }

    // ============================================
    // RENDER
    // ============================================
    ctx.clearRect(0, 0, W, H);

    // Background (if no camera)
    if (!cameraReadyRef.current) {
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#1a1a2e');
      bgGrad.addColorStop(0.5, '#16213e');
      bgGrad.addColorStop(1, '#0f3460');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Stars
      drawBgStars(ctx, W, H, frame);

      // Ground
      ctx.fillStyle = '#2d5a27';
      ctx.fillRect(0, H * 0.85, W, H * 0.15);
      ctx.fillStyle = '#3a7a33';
      ctx.fillRect(0, H * 0.85, W, 4);

      // Pixel grass tufts
      for (let i = 0; i < W; i += 20) {
        const grassHeight = 4 + Math.sin(i * 0.1 + frame * 0.02) * 2;
        ctx.fillStyle = '#4a9a43';
        ctx.fillRect(i, H * 0.85 - grassHeight, 3, grassHeight);
        ctx.fillRect(i + 6, H * 0.85 - grassHeight + 1, 2, grassHeight - 1);
        ctx.fillRect(i + 12, H * 0.85 - grassHeight + 2, 2, grassHeight - 2);
      }
    }

    // Skill effects
    skillEffectsRef.current.forEach(e => {
      ctx.save();
      ctx.globalAlpha = e.life / 20 * 0.4;
      ctx.strokeStyle = e.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = e.life / 20 * 0.15;
      ctx.fillStyle = e.color;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Dragons
    dragonsRef.current.forEach(dragon => {
      drawDragon(ctx, dragon.x, dragon.y, DRAGON_SCALE, dragon.type, dragon.frame, dragon.direction, dragon.hitTimer, dragon.deathTimer);

      // Health bar above dragon
      if (dragon.alive) {
        drawHealthBar(ctx, dragon.x - 40, dragon.y - 55, 80, 10, dragon.hp, dragon.maxHp, '#e74c3c');
        // Name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(DRAGON_NAMES[dragon.type], dragon.x, dragon.y - 60);
      }
    });

    // Hero
    drawHero(ctx, hero.x, hero.y, HERO_SCALE, hero.frame, hero.direction, hero.attacking, hero.attackFrame, hero.hitTimer, hero.level);

    // Particles
    particlesRef.current.forEach(p => {
      drawParticle(ctx, p.x, p.y, p.size, p.color, p.life / p.maxLife);
    });

    // Damage numbers
    damageNumbersRef.current.forEach(d => {
      drawDamageNumber(ctx, d.x, d.y, d.value, d.color, d.life, d.value > 30);
    });

    // Floating texts
    floatingTextsRef.current.forEach(t => {
      ctx.save();
      ctx.globalAlpha = Math.min(1, t.life / 15);
      ctx.fillStyle = t.color;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.font = `bold ${t.size}px monospace`;
      ctx.textAlign = 'center';
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });

    // HUD - Update React state periodically
    if (frame % 5 === 0) {
      setDisplayScore(configRef.current.score);
      setDisplayWave(configRef.current.wave);
      setDisplayHp(hero.hp);
      setDisplayMaxHp(hero.maxHp);
      setDisplayMana(hero.mana);
      setDisplayMaxMana(hero.maxMana);
      setDisplayLevel(hero.level);
      setDisplayExp(hero.exp);
      setDisplayCombo(hero.combo);
      setDisplayKills(configRef.current.totalKills);
      setDisplayHighScore(configRef.current.highScore);
    }
  }

  // ============================================
  // GAME START / RESTART
  // ============================================
  const startGame = useCallback(() => {
    heroRef.current = createHero();
    dragonsRef.current = [];
    damageNumbersRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    skillEffectsRef.current = [];
    configRef.current = { wave: 1, dragonsPerWave: 3, score: 0, highScore: configRef.current.highScore, totalKills: 0 };
    frameRef.current = 0;
    spawnTimerRef.current = 0;
    setGameState('playing');
  }, []);

  // ============================================
  // GAME LOOP EFFECT
  // ============================================
  useEffect(() => {
    if (gameState !== 'playing') return;

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

    return () => {
      running = false;
      cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState]);

  // ============================================
  // CAMERA INIT ON MOUNT
  // ============================================
  useEffect(() => {
    let cancelled = false;

    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
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
        console.warn('Camera not available, using virtual background');
        cameraReadyRef.current = false;
        setCameraReady(false);
        setCameraError('camera_unavailable');
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
  // KEYBOARD CONTROLS
  // ============================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'e') {
        // Trigger skill via hero ref directly to avoid stale closure
        if (gameState !== 'playing') return;
        const hero = heroRef.current;
        if (hero.mana < 20) return;
        hero.mana -= 20;
        hero.skillActive = true;
        hero.skillTimer = 20;
        skillEffectsRef.current.push({
          x: hero.x,
          y: hero.y,
          radius: 0,
          maxRadius: 200,
          life: 20,
          color: '#00d4ff',
        });
        dragonsRef.current.forEach(dragon => {
          if (!dragon.alive) return;
          const dist = Math.sqrt((dragon.x - hero.x) ** 2 + (dragon.y - hero.y) ** 2);
          if (dist < 200) {
            attackDragon(dragon, true);
          }
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // ============================================
  // RENDER
  // ============================================
  const expNeeded = displayLevel * 80;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black select-none" style={{ touchAction: 'none' }}>
      {/* Camera Video (AR Background) */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
        style={{ zIndex: 0, display: cameraReady ? 'block' : 'none' }}
      />

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
        onTouchStart={(e) => { e.preventDefault(); handleCanvasTap(e); }}
        onClick={handleCanvasTap}
      />

      {/* HUD Overlay */}
      {gameState === 'playing' && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-2 safe-area-top flex flex-col gap-1">
            {/* Wave & Score */}
            <div className="flex justify-between items-center px-2">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="text-yellow-400 font-bold text-xs">OLEADA {displayWave}/10</span>
              </div>
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="text-white font-bold text-xs">{displayScore} pts</span>
              </div>
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="text-cyan-400 font-bold text-xs">NV.{displayLevel}</span>
              </div>
            </div>

            {/* Health Bar */}
            <div className="mx-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(5, Math.ceil(displayHp / 20)) }).map((_, i) => (
                    <div key={i} className="w-3 h-3 bg-red-500 rounded-sm border border-red-300" />
                  ))}
                  {Array.from({ length: Math.max(0, 5 - Math.ceil(displayHp / 20)) }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-3 h-3 bg-gray-700 rounded-sm border border-gray-600" />
                  ))}
                </div>
                <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(displayHp / displayMaxHp) * 100}%`,
                      background: displayHp / displayMaxHp > 0.5
                        ? 'linear-gradient(to bottom, #ff6b6b, #ee5a24)'
                        : 'linear-gradient(to bottom, #ff4757, #c0392b)',
                    }}
                  />
                </div>
                <span className="text-white text-xs font-bold min-w-[50px] text-right">
                  {displayHp}/{displayMaxHp}
                </span>
              </div>
            </div>

            {/* Mana Bar */}
            <div className="mx-2">
              <div className="flex items-center gap-2">
                <span className="text-blue-400 text-xs font-bold">MP</span>
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(displayMana / displayMaxMana) * 100}%`,
                      background: 'linear-gradient(to bottom, #74b9ff, #0984e3)',
                    }}
                  />
                </div>
                <span className="text-blue-300 text-xs font-bold min-w-[40px] text-right">
                  {displayMana}/{displayMaxMana}
                </span>
              </div>
            </div>

            {/* EXP Bar */}
            <div className="mx-2">
              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(displayExp / expNeeded) * 100}%`,
                    background: 'linear-gradient(to bottom, #a29bfe, #6c5ce7)',
                  }}
                />
              </div>
            </div>

            {/* Combo */}
            {displayCombo > 1 && (
              <div className="text-center">
                <span className="text-yellow-400 font-black text-lg animate-pulse">
                  COMBO x{displayCombo}!
                </span>
              </div>
            )}
          </div>

          {/* Skill Button */}
          <div className="absolute bottom-4 right-4 pointer-events-auto safe-area-bottom">
            <button
              onClick={useSkill}
              className={`w-16 h-16 rounded-full border-4 border-cyan-400 flex items-center justify-center shadow-lg active:scale-90 transition-transform ${
                displayMana >= 20 ? 'bg-cyan-600/80' : 'bg-gray-700/80 border-gray-500'
              }`}
            >
              <span className="text-white font-black text-lg">&#9889;</span>
            </button>
            <div className="text-center mt-1">
              <span className="text-cyan-300 text-xs font-bold">Habilidad</span>
            </div>
          </div>

          {/* Pause hint */}
          <div className="absolute bottom-4 left-4">
            <button
              onClick={() => setGameState('paused')}
              className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 pointer-events-auto active:scale-95 transition-transform"
            >
              <span className="text-white text-xl">&#9208;&#65039;</span>
            </button>
          </div>

          {/* Camera indicator */}
          {cameraError && (
            <div className="absolute bottom-16 left-4 bg-yellow-900/80 backdrop-blur-sm rounded-lg px-3 py-2">
              <span className="text-yellow-300 text-xs">Modo fondo virtual (sin camara)</span>
            </div>
          )}
        </div>
      )}

      {/* MENU SCREEN */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
          <div className="text-center px-6 max-w-md">
            <h1 className="text-5xl font-black text-yellow-400 mb-2 drop-shadow-lg"
              style={{ textShadow: '3px 3px 0 #000, -1px -1px 0 #000' }}>
              DRAGON QUEST
            </h1>
            <h2 className="text-2xl font-bold text-white mb-1"
              style={{ textShadow: '2px 2px 0 #000' }}>
              Realidad Aumentada
            </h2>
            <div className="text-cyan-300 text-sm mb-8">Pixel Art Adventure</div>

            <div className="space-y-3 mb-8">
              <p className="text-white/80 text-sm">
                Usa tu camara como escenario AR
              </p>
              <p className="text-white/80 text-sm">
                Toca los dragones para atacarlos
              </p>
              <p className="text-white/80 text-sm">
                Usa la habilidad especial con el boton azul
              </p>
              <p className="text-white/80 text-sm">
                Sobrevive 10 oleadas para ganar
              </p>
            </div>

            <button
              onClick={startGame}
              className="bg-gradient-to-b from-yellow-400 to-orange-500 text-black font-black text-xl px-10 py-4 rounded-xl shadow-lg active:scale-95 transition-transform pointer-events-auto"
              style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.5)' }}
            >
              JUGAR!
            </button>

            <div className="mt-6 text-white/50 text-xs">
              {cameraError ? 'Modo sin camara activo' : 'Mejor experiencia en movil con camara'}
            </div>
          </div>
        </div>
      )}

      {/* PAUSE SCREEN */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm" style={{ zIndex: 10 }}>
          <div className="text-center px-6">
            <h2 className="text-4xl font-black text-white mb-6">PAUSA</h2>
            <div className="space-y-3">
              <button
                onClick={() => setGameState('playing')}
                className="block w-full bg-green-600 text-white font-bold text-lg px-8 py-3 rounded-xl active:scale-95 transition-transform pointer-events-auto"
              >
                Continuar
              </button>
              <button
                onClick={startGame}
                className="block w-full bg-red-600 text-white font-bold text-lg px-8 py-3 rounded-xl active:scale-95 transition-transform pointer-events-auto"
              >
                Reiniciar
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="block w-full bg-gray-600 text-white font-bold text-lg px-8 py-3 rounded-xl active:scale-95 transition-transform pointer-events-auto"
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm" style={{ zIndex: 10 }}>
          <div className="text-center px-6 max-w-sm">
            <h2 className="text-5xl font-black text-red-500 mb-4">GAME OVER</h2>
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 mb-6 space-y-2">
              <p className="text-yellow-400 font-bold text-lg">Puntuacion: {displayScore}</p>
              <p className="text-white/80">Oleada alcanzada: {displayWave}</p>
              <p className="text-white/80">Dragones derrotados: {displayKills}</p>
              <p className="text-white/80">Nivel alcanzado: {displayLevel}</p>
              {displayHighScore > 0 && (
                <p className="text-cyan-400 font-bold">Mejor puntuacion: {displayHighScore}</p>
              )}
            </div>
            <div className="space-y-3">
              <button
                onClick={startGame}
                className="block w-full bg-gradient-to-b from-yellow-400 to-orange-500 text-black font-bold text-lg px-8 py-3 rounded-xl active:scale-95 transition-transform pointer-events-auto"
              >
                Reintentar!
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="block w-full bg-gray-600 text-white font-bold text-lg px-8 py-3 rounded-xl active:scale-95 transition-transform pointer-events-auto"
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VICTORY SCREEN */}
      {gameState === 'victory' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm" style={{ zIndex: 10 }}>
          <div className="text-center px-6 max-w-sm">
            <h2 className="text-5xl font-black text-yellow-400 mb-4">VICTORIA!</h2>
            <p className="text-white text-lg mb-4">Has derrotado a todos los dragones!</p>
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 mb-6 space-y-2">
              <p className="text-yellow-400 font-bold text-2xl">Puntuacion Final: {displayScore}</p>
              <p className="text-white/80">Dragones derrotados: {displayKills}</p>
              <p className="text-white/80">Nivel final: {displayLevel}</p>
              <p className="text-cyan-400 font-bold">Eres un legendario Dragon Slayer!</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={startGame}
                className="block w-full bg-gradient-to-b from-yellow-400 to-orange-500 text-black font-bold text-lg px-8 py-3 rounded-xl active:scale-95 transition-transform pointer-events-auto"
              >
                Jugar de nuevo!
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="block w-full bg-gray-600 text-white font-bold text-lg px-8 py-3 rounded-xl active:scale-95 transition-transform pointer-events-auto"
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
