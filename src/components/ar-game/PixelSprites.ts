// ============================================
// Pixel Art Sprite Renderer - MapleStory Inspired
// All sprites drawn programmatically using Canvas
// ============================================

const PX = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
};

const rect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
};

// ============================================
// HERO SPRITE - Cute MapleStory-style Warrior
// ============================================
export function drawHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  frame: number,
  direction: 1 | -1,
  attacking: boolean,
  attackFrame: number,
  hitTimer: number,
  level: number
) {
  ctx.save();
  ctx.translate(x, y);
  if (direction === -1) {
    ctx.scale(-1, 1);
  }
  ctx.scale(scale, scale);

  const s = 4; // pixel size
  const bobY = Math.sin(frame * 0.15) * 2;
  const flash = hitTimer > 0 && Math.floor(hitTimer / 3) % 2 === 0;

  // Shadow
  ctx.globalAlpha = 0.3;
  rect(ctx, -4 * s, 12 * s, 8 * s, 2 * s, '#000000');
  ctx.globalAlpha = 1;

  // Body flash white when hit
  const bodyColor = flash ? '#ffffff' : '#4a90d9';
  const hairColor = flash ? '#ffffff' : '#8B4513';
  const skinColor = flash ? '#ffffff' : '#FFDAB9';
  const armorColor = flash ? '#ffffff' : level >= 5 ? '#FFD700' : level >= 3 ? '#C0C0C0' : '#CD853F';

  // Hair (big maplestory-style hair)
  rect(ctx, -5 * s, (-10 + bobY) * s, 10 * s, 2 * s, hairColor);
  rect(ctx, -6 * s, (-9 + bobY) * s, 12 * s, 3 * s, hairColor);
  rect(ctx, -5 * s, (-8 + bobY) * s, 3 * s, 2 * s, hairColor);
  rect(ctx, 2 * s, (-8 + bobY) * s, 3 * s, 2 * s, hairColor);
  // Hair tips
  rect(ctx, -6 * s, (-8 + bobY) * s, 2 * s, 4 * s, hairColor);
  rect(ctx, 4 * s, (-8 + bobY) * s, 2 * s, 3 * s, hairColor);
  rect(ctx, -5 * s, (-11 + bobY) * s, 8 * s, s, hairColor);

  // Head
  rect(ctx, -4 * s, (-8 + bobY) * s, 8 * s, 7 * s, skinColor);
  rect(ctx, -3 * s, (-9 + bobY) * s, 6 * s, s, skinColor);

  // Eyes (big cute MapleStory eyes)
  rect(ctx, -3 * s, (-6 + bobY) * s, 2 * s, 2 * s, '#ffffff');
  rect(ctx, 1 * s, (-6 + bobY) * s, 2 * s, 2 * s, '#ffffff');
  rect(ctx, -2 * s, (-5 + bobY) * s, s, 2 * s, '#2c1810');
  rect(ctx, 2 * s, (-5 + bobY) * s, s, 2 * s, '#2c1810');
  // Eye shine
  PX(ctx, -3 * s, (-6 + bobY) * s, '#ffffff');
  PX(ctx, 1 * s, (-6 + bobY) * s, '#ffffff');

  // Mouth (cute small smile)
  rect(ctx, -s, (-4 + bobY) * s, 2 * s, s, '#cc6655');

  // Body / Armor
  rect(ctx, -4 * s, (-1 + bobY) * s, 8 * s, 6 * s, armorColor);
  rect(ctx, -3 * s, (0 + bobY) * s, 6 * s, 4 * s, bodyColor);
  // Armor detail
  rect(ctx, -2 * s, (-1 + bobY) * s, 4 * s, s, '#FFD700');
  rect(ctx, -s, (0 + bobY) * s, 2 * s, 3 * s, armorColor);

  // Arms
  const armSwing = attacking ? Math.sin(attackFrame * 0.5) * 3 : Math.sin(frame * 0.1) * 2;
  rect(ctx, (-6 + armSwing) * s, (-1 + bobY) * s, 2 * s, 5 * s, skinColor);
  rect(ctx, (4 - armSwing) * s, (-1 + bobY) * s, 2 * s, 5 * s, skinColor);

  // Sword
  if (attacking) {
    const swordAngle = attackFrame;
    ctx.save();
    ctx.translate(5 * s, (-1 + bobY) * s);
    ctx.rotate((-45 + swordAngle * 15) * Math.PI / 180);
    // Sword handle
    rect(ctx, -s, -2 * s, 2 * s, 3 * s, '#8B4513');
    // Guard
    rect(ctx, -2 * s, -3 * s, 4 * s, s, '#FFD700');
    // Blade
    rect(ctx, -s, (-8 - swordAngle) * s, 2 * s, 6 * s, '#E0E0E0');
    rect(ctx, 0, (-9 - swordAngle) * s, s, s, '#ffffff');
    // Slash effect
    if (attackFrame > 3 && attackFrame < 8) {
      ctx.globalAlpha = 0.6;
      rect(ctx, -3 * s, (-6 - swordAngle) * s, 6 * s, 2 * s, '#FFD700');
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  } else {
    // Sword at rest
    rect(ctx, 5 * s, (1 + bobY) * s, 2 * s, 8 * s, '#C0C0C0');
    rect(ctx, 4 * s, (0 + bobY) * s, 4 * s, s, '#FFD700');
    rect(ctx, 5 * s, (1 + bobY) * s, 2 * s, 2 * s, '#8B4513');
    PX(ctx, 5 * s, (9 + bobY) * s, '#ffffff');
  }

  // Legs
  const legSwing = Math.sin(frame * 0.15) * 1.5;
  rect(ctx, -3 * s, (5 + bobY) * s, 2 * s, 4 * s + legSwing * s, '#2c3e50');
  rect(ctx, 1 * s, (5 + bobY) * s, 2 * s, 4 * s - legSwing * s, '#2c3e50');
  // Boots
  rect(ctx, -4 * s, (8 + bobY + legSwing) * s, 3 * s, 2 * s, '#654321');
  rect(ctx, 1 * s, (8 + bobY - legSwing) * s, 3 * s, 2 * s, '#654321');

  // Level badge
  ctx.globalAlpha = 0.9;
  rect(ctx, -2 * s, (-13 + bobY) * s, 4 * s, 3 * s, '#FFD700');
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#000';
  ctx.font = `bold ${s * 2}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`${level}`, 0, (-11 + bobY) * s);

  ctx.restore();
}

// ============================================
// DRAGON SPRITES - Cute but fierce dragons
// ============================================
const dragonColors: Record<string, { body: string; belly: string; wing: string; eye: string; fire: string }> = {
  green: { body: '#2ecc71', belly: '#a9dfbf', wing: '#27ae60', eye: '#e74c3c', fire: '#f39c12' },
  red: { body: '#e74c3c', belly: '#f1948a', wing: '#c0392b', eye: '#f1c40f', fire: '#e67e22' },
  blue: { body: '#3498db', belly: '#aed6f1', wing: '#2980b9', eye: '#e74c3c', fire: '#00d4ff' },
  gold: { body: '#f1c40f', belly: '#f9e79f', wing: '#d4ac0d', eye: '#8e44ad', fire: '#FFD700' },
  shadow: { body: '#5b2c6f', belly: '#8e44ad', wing: '#4a235a', eye: '#e74c3c', fire: '#9b59b6' },
};

export function drawDragon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  type: string,
  frame: number,
  direction: 1 | -1,
  hitTimer: number,
  deathTimer: number
) {
  ctx.save();
  ctx.translate(x, y);
  if (direction === -1) {
    ctx.scale(-1, 1);
  }
  ctx.scale(scale, scale);

  const s = 4;
  const colors = dragonColors[type] || dragonColors.green;
  const bobY = Math.sin(frame * 0.08) * 3;
  const wingFlap = Math.sin(frame * 0.12) * 4;
  const flash = hitTimer > 0 && Math.floor(hitTimer / 3) % 2 === 0;

  if (deathTimer > 0) {
    ctx.globalAlpha = Math.max(0, 1 - deathTimer / 30);
  }

  // Shadow
  ctx.globalAlpha = Math.min(ctx.globalAlpha, 0.3);
  rect(ctx, -6 * s, 10 * s, 12 * s, 3 * s, '#000000');
  ctx.globalAlpha = deathTimer > 0 ? Math.max(0, 1 - deathTimer / 30) : 1;

  // Tail
  const tailWag = Math.sin(frame * 0.1) * 2;
  rect(ctx, (-8 + tailWag) * s, (2 + bobY) * s, 5 * s, 2 * s, colors.body);
  rect(ctx, (-12 + tailWag) * s, (0 + bobY) * s, 5 * s, 2 * s, colors.body);
  rect(ctx, (-14 + tailWag) * s, (-1 + bobY) * s, 3 * s, 2 * s, colors.body);
  // Tail spike
  PX(ctx, (-15 + tailWag) * s, (-1 + bobY) * s, colors.wing);
  PX(ctx, (-14 + tailWag) * s, (-2 + bobY) * s, colors.wing);

  // Wings
  ctx.globalAlpha *= 0.8;
  rect(ctx, (-3) * s, (-6 + bobY - wingFlap) * s, 6 * s, 2 * s, colors.wing);
  rect(ctx, (-5) * s, (-8 + bobY - wingFlap) * s, 4 * s, 2 * s, colors.wing);
  rect(ctx, (-6) * s, (-9 + bobY - wingFlap) * s, 2 * s, 2 * s, colors.wing);
  rect(ctx, (0) * s, (-8 + bobY - wingFlap) * s, 3 * s, 2 * s, colors.wing);
  ctx.globalAlpha = deathTimer > 0 ? Math.max(0, 1 - deathTimer / 30) : 1;

  // Body
  const bodyColor = flash ? '#ffffff' : colors.body;
  const bellyColor = flash ? '#ffffff' : colors.belly;
  rect(ctx, -5 * s, (-4 + bobY) * s, 10 * s, 10 * s, bodyColor);
  rect(ctx, -3 * s, (-2 + bobY) * s, 6 * s, 6 * s, bellyColor);

  // Belly scales pattern
  rect(ctx, -2 * s, (-1 + bobY) * s, s, s, bodyColor);
  rect(ctx, 1 * s, (0 + bobY) * s, s, s, bodyColor);
  rect(ctx, -s, (1 + bobY) * s, s, s, bodyColor);

  // Head
  rect(ctx, -4 * s, (-8 + bobY) * s, 10 * s, 5 * s, bodyColor);
  rect(ctx, -3 * s, (-9 + bobY) * s, 8 * s, 2 * s, bodyColor);

  // Snout
  rect(ctx, 2 * s, (-7 + bobY) * s, 5 * s, 3 * s, bodyColor);
  rect(ctx, 5 * s, (-6 + bobY) * s, 3 * s, 2 * s, bellyColor);

  // Nostrils
  rect(ctx, 5 * s, (-7 + bobY) * s, s, s, '#1a1a1a');
  rect(ctx, 7 * s, (-7 + bobY) * s, s, s, '#1a1a1a');

  // Smoke from nostrils (sometimes)
  if (frame % 60 < 15) {
    ctx.globalAlpha = 0.3;
    rect(ctx, 8 * s, (-8 + bobY) * s, 2 * s, 2 * s, '#999');
    rect(ctx, 9 * s, (-9 + bobY) * s, 2 * s, 2 * s, '#999');
    ctx.globalAlpha = deathTimer > 0 ? Math.max(0, 1 - deathTimer / 30) : 1;
  }

  // Horns
  rect(ctx, (-3) * s, (-11 + bobY) * s, s, 3 * s, '#654321');
  rect(ctx, (3) * s, (-11 + bobY) * s, s, 3 * s, '#654321');
  rect(ctx, (-4) * s, (-12 + bobY) * s, s, 2 * s, '#654321');
  rect(ctx, (4) * s, (-12 + bobY) * s, s, 2 * s, '#654321');
  PX(ctx, (-5) * s, (-13 + bobY) * s, '#8B4513');
  PX(ctx, (5) * s, (-13 + bobY) * s, '#8B4513');

  // Eyes (fierce!)
  rect(ctx, 0 * s, (-7 + bobY) * s, 3 * s, 2 * s, '#ffffff');
  rect(ctx, 1 * s, (-6 + bobY) * s, 2 * s, s, colors.eye);
  PX(ctx, 0 * s, (-7 + bobY) * s, '#ffffff'); // eye shine

  // Teeth
  rect(ctx, 5 * s, (-5 + bobY) * s, s, s, '#ffffff');
  rect(ctx, 7 * s, (-5 + bobY) * s, s, s, '#ffffff');
  rect(ctx, 3 * s, (-4 + bobY) * s, s, s, '#ffffff');

  // Feet / Claws
  rect(ctx, -4 * s, (6 + bobY) * s, 3 * s, 3 * s, bodyColor);
  rect(ctx, 2 * s, (6 + bobY) * s, 3 * s, 3 * s, bodyColor);
  rect(ctx, -5 * s, (8 + bobY) * s, 2 * s, s, '#654321');
  rect(ctx, 4 * s, (8 + bobY) * s, 2 * s, s, '#654321');

  // Spikes on back
  for (let i = 0; i < 4; i++) {
    rect(ctx, (-1 + i * 2) * s, (-5 + bobY - (i % 2)) * s, s, s, colors.wing);
    if (i % 2 === 0) {
      PX(ctx, (-1 + i * 2) * s, (-6 + bobY) * s, colors.wing);
    }
  }

  ctx.restore();
}

// ============================================
// FIRE BREATH EFFECT
// ============================================
export function drawFireBreath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  type: string,
  frame: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const s = 4;
  const fireColor = dragonColors[type]?.fire || '#f39c12';

  const progress = frame / 20;

  for (let i = 0; i < 8; i++) {
    const dist = 5 + i * 3 + progress * 20;
    const spread = Math.sin(i * 0.5 + frame * 0.3) * (i * 1.5);
    const alpha = Math.max(0, 0.8 - i * 0.1 - progress * 0.3);
    const size = Math.max(1, 4 - i * 0.4);

    ctx.globalAlpha = alpha;
    ctx.fillStyle = i < 3 ? '#ffff00' : i < 6 ? fireColor : '#ff4500';
    ctx.fillRect((dist) * s, (spread) * s, size * s, size * s);
    ctx.fillRect((dist + 1) * s, (spread + 1) * s, size * s * 0.8, size * s * 0.8);
  }

  ctx.restore();
}

// ============================================
// UI ELEMENTS
// ============================================
export function drawHealthBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  current: number,
  max: number,
  color: string,
  bgColor: string = '#333',
  label: string = ''
) {
  const ratio = Math.max(0, current / max);

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(x, y, width, height);

  // Health fill with gradient
  if (ratio > 0) {
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    if (ratio > 0.5) {
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, shadeColor(color, -20));
    } else {
      gradient.addColorStop(0, '#e74c3c');
      gradient.addColorStop(1, '#c0392b');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width * ratio, height);
  }

  // Border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  // Shine effect
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, width * ratio, height * 0.4);
  ctx.globalAlpha = 1;

  // Label
  if (label) {
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(10, height - 4)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(label, x + width / 2, y + height - 3);
  }
}

function shadeColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function drawDamageNumber(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  value: number,
  color: string,
  life: number,
  isCrit: boolean
) {
  ctx.save();
  const alpha = Math.min(1, life / 20);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = isCrit ? 4 : 2;

  const size = isCrit ? 28 : 18;
  ctx.font = `bold ${size}px monospace`;
  ctx.textAlign = 'center';

  if (isCrit) {
    ctx.fillText(`CRIT! ${value}`, x, y);
    ctx.strokeText(`CRIT! ${value}`, x, y);
  } else {
    ctx.fillText(`${value}`, x, y);
    ctx.strokeText(`${value}`, x, y);
  }
  ctx.restore();
}

export function drawParticle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x - size / 2, y - size / 2, size, size);
  ctx.restore();
}

// ============================================
// BACKGROUND STARS / SPARKLES
// ============================================
export function drawStars(ctx: CanvasRenderingContext2D, width: number, height: number, frame: number) {
  const starPositions = [
    [50, 30], [150, 60], [250, 20], [350, 80], [100, 100],
    [200, 40], [300, 70], [400, 50], [60, 90], [320, 30],
  ];

  starPositions.forEach(([sx, sy], i) => {
    const twinkle = Math.sin(frame * 0.05 + i) * 0.5 + 0.5;
    ctx.globalAlpha = twinkle * 0.6;
    ctx.fillStyle = '#FFD700';
    const size = 2 + twinkle * 2;
    // 4-point star
    ctx.fillRect(sx - size / 2, sy - size / 6, size, size / 3);
    ctx.fillRect(sx - size / 6, sy - size / 2, size / 3, size);
  });
  ctx.globalAlpha = 1;
}

// ============================================
// PIXEL HEART for lives
// ============================================
export function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, filled: boolean) {
  ctx.save();
  ctx.fillStyle = filled ? '#e74c3c' : '#555';
  const s = size / 8;

  // Heart shape pixel art
  const heart = [
    [0, 1, 1, 0, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
  ];

  heart.forEach((row, ry) => {
    row.forEach((pixel, rx) => {
      if (pixel) {
        ctx.fillRect(x + rx * s, y + ry * s, s, s);
      }
    });
  });

  ctx.restore();
}

// ============================================
// COIN / EXP ICON
// ============================================
export function drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, frame: number) {
  ctx.save();
  const shimmer = Math.sin(frame * 0.1) * 0.3 + 0.7;

  ctx.globalAlpha = shimmer;
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.fillStyle = '#FFA500';
  ctx.beginPath();
  ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFD700';
  ctx.font = `bold ${size}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('$', x, y + 1);

  ctx.restore();
}
