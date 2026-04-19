export interface Position {
  x: number;
  y: number;
}

export interface DamageNumber {
  id: number;
  value: number;
  x: number;
  y: number;
  color: string;
  life: number;
  vy: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Dragon {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  type: DragonType;
  frame: number;
  frameTimer: number;
  direction: 1 | -1;
  speed: number;
  hitTimer: number;
  attackTimer: number;
  alive: boolean;
  deathTimer: number;
}

export type DragonType = 'green' | 'red' | 'blue' | 'gold' | 'shadow';

export interface Hero {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  frame: number;
  frameTimer: number;
  attacking: boolean;
  attackTimer: number;
  attackFrame: number;
  direction: 1 | -1;
  hitTimer: number;
  combo: number;
  exp: number;
  level: number;
  skillActive: boolean;
  skillTimer: number;
}

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover' | 'victory';

export interface GameConfig {
  wave: number;
  dragonsPerWave: number;
  score: number;
  highScore: number;
  totalKills: number;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
  size: number;
}

export interface SkillEffect {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  color: string;
}
