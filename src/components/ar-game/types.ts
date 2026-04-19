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

export interface Monster {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  hp: number;
  maxHp: number;
  type: MonsterType;
  frame: number;
  frameTimer: number;
  direction: 1 | -1;
  speed: number;
  hitTimer: number;
  attackTimer: number;
  alive: boolean;
  deathTimer: number;
  size: number;
  moveTimer: number;
}

export type MonsterType = 'slime' | 'ghost' | 'bat' | 'skeleton' | 'boss';

export interface DrawingHero {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  frame: number;
  attacking: boolean;
  attackTimer: number;
  hitTimer: number;
  direction: 1 | -1;
  image: HTMLImageElement | null;
  imageWidth: number;
  imageHeight: number;
  // Stats from VLM
  attack: number;
  defense: number;
  speed: number;
  element: string;
  power: string;
  characterName: string;
  characterType: string;
  level: number;
  exp: number;
  combo: number;
  skillActive: boolean;
  skillTimer: number;
  // Visual effects
  glowIntensity: number;
  scale: number;
  bobOffset: number;
}

export type GamePhase = 'menu' | 'scanning' | 'analyzing' | 'awakening' | 'playing' | 'gameover' | 'victory';

export interface WaveConfig {
  wave: number;
  monstersPerWave: number;
  score: number;
  highScore: number;
  totalKills: number;
  monsterTypes: MonsterType[];
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

export interface CharacterAnalysis {
  characterName: string;
  characterType: string;
  description: string;
  power: string;
  color1: string;
  color2: string;
  stats: {
    attack: number;
    defense: number;
    speed: number;
    hp: number;
  };
  element: string;
}
