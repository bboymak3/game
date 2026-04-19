// ============================================
// Monster Sprite Renderer - Cute childish monsters
// All sprites drawn programmatically with Canvas
// Simple, minimal, infantile style
// ============================================

const PX = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
};

const rect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
};

const circle = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
};

// ============================================
// SLIME - Cute green blob
// ============================================
export function drawSlime(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, scale: number,
  frame: number, direction: 1 | -1,
  hitTimer: number, deathTimer: number,
  color1: string = '#4CAF50', color2: string = '#81C784'
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (direction === -1) ctx.scale(-1, 1);

  const s = 3;
  const squish = Math.sin(frame * 0.1) * 0.1;
  const bobY = Math.sin(frame * 0.08) * 3;
  const flash = hitTimer > 0 && Math.floor(hitTimer / 3) % 2 === 0;

  if (deathTimer > 0) ctx.globalAlpha = Math.max(0, 1 - deathTimer / 25);

  // Shadow
  ctx.globalAlpha *= 0.3;
  ellipse(ctx, 0, 14 * s, 10 * s, 3 * s, '#000');
  ctx.globalAlpha = deathTimer > 0 ? Math.max(0, 1 - deathTimer / 25) : 1;

  const bodyColor = flash ? '#fff' : color1;
  const bodyColor2 = flash ? '#eee' : color2;
  const eyeColor = '#fff';

  // Body (rounded blob)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, (4 + bobY) * s, (10 - squish * 5) * s, (8 + squish * 3) * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Highlight
  ctx.fillStyle = bodyColor2;
  ctx.globalAlpha *= 0.5;
  ctx.beginPath();
  ctx.ellipse(-3 * s, (0 + bobY) * s, 4 * s, 3 * s, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = deathTimer > 0 ? Math.max(0, 1 - deathTimer / 25) : 1;

  // Eyes
  circle(ctx, -3 * s, (2 + bobY) * s, 2.5 * s, eyeColor);
  circle(ctx, 3 * s, (2 + bobY) * s, 2.5 * s, eyeColor);
  PX(ctx, -4 * s, (1 + bobY) * s, '#333');
  PX(ctx, 4 * s, (1 + bobY) * s, '#333');
  circle(ctx, -2.5 * s, (1 + bobY) * s, 1 * s, '#333');
  circle(ctx, 3.5 * s, (1 + bobY) * s, 1 * s, '#333');

  // Mouth (cute open smile)
  ctx.fillStyle = flash ? '#ddd' : '#333';
  ctx.beginPath();
  ctx.arc(0, (5 + bobY) * s, 2 * s, 0, Math.PI);
  ctx.fill();

  // Cheeks
  ctx.globalAlpha = 0.3;
  circle(ctx, -6 * s, (4 + bobY) * s, 1.5 * s, '#FF8A80');
  circle(ctx, 6 * s, (4 + bobY) * s, 1.5 * s, '#FF8A80');

  ctx.restore();
}

// ============================================
// GHOST - Friendly little ghost
// ============================================
export function drawGhost(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, scale: number,
  frame: number, direction: 1 | -1,
  hitTimer: number, deathTimer: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (direction === -1) ctx.scale(-1, 1);

  const s = 3;
  const floatY = Math.sin(frame * 0.06) * 6;
  const wobble = Math.sin(frame * 0.08) * 2;
  const flash = hitTimer > 0 && Math.floor(hitTimer / 3) % 2 === 0;

  if (deathTimer > 0) ctx.globalAlpha = Math.max(0, 1 - deathTimer / 25);

  // Ghost body
  ctx.fillStyle = flash ? '#fff' : 'rgba(200, 210, 255, 0.85)';
  ctx.beginPath();
  ctx.arc(0, (-2 + floatY) * s, 8 * s, Math.PI, 0);
  ctx.lineTo(8 * s, (10 + floatY) * s);
  // Wavy bottom
  for (let i = 7; i >= -7; i -= 3.5) {
    ctx.quadraticCurveTo(
      (i + 1.75) * s, (10 + Math.sin(frame * 0.1 + i) * 2 + floatY) * s,
      i * s, (7 + floatY) * s
    );
  }
  ctx.closePath();
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#333';
  const eyeOffsetX = Math.sin(frame * 0.05) * s;
  circle(ctx, (-3 + eyeOffsetX / s) * s, (-3 + floatY) * s, 2 * s, '#333');
  circle(ctx, (3 + eyeOffsetX / s) * s, (-3 + floatY) * s, 2 * s, '#333');
  ctx.fillStyle = '#fff';
  circle(ctx, (-2.5 + eyeOffsetX / s) * s, (-4 + floatY) * s, 0.8 * s, '#fff');
  circle(ctx, (3.5 + eyeOffsetX / s) * s, (-4 + floatY) * s, 0.8 * s, '#fff');

  // Blush
  ctx.globalAlpha = 0.25;
  circle(ctx, -6 * s, (0 + floatY) * s, 1.5 * s, '#FF8A80');
  circle(ctx, 6 * s, (0 + floatY) * s, 1.5 * s, '#FF8A80');

  ctx.restore();
}

// ============================================
// BAT - Cute little bat
// ============================================
export function drawBat(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, scale: number,
  frame: number, direction: 1 | -1,
  hitTimer: number, deathTimer: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (direction === -1) ctx.scale(-1, 1);

  const s = 3;
  const wingFlap = Math.sin(frame * 0.2) * 15;
  const bobY = Math.sin(frame * 0.1) * 4;
  const flash = hitTimer > 0 && Math.floor(hitTimer / 3) % 2 === 0;

  if (deathTimer > 0) ctx.globalAlpha = Math.max(0, 1 - deathTimer / 25);

  // Wings
  ctx.fillStyle = flash ? '#fff' : '#7B1FA2';
  // Left wing
  ctx.save();
  ctx.translate(-4 * s, (-2 + bobY) * s);
  ctx.rotate((-30 + wingFlap) * Math.PI / 180);
  ctx.beginPath();
  ctx.ellipse(-5 * s, 0, 7 * s, 3 * s, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Wing detail
  ctx.fillStyle = flash ? '#eee' : '#9C27B0';
  ctx.beginPath();
  ctx.ellipse(-4 * s, 0, 4 * s, 1.5 * s, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right wing
  ctx.fillStyle = flash ? '#fff' : '#7B1FA2';
  ctx.save();
  ctx.translate(4 * s, (-2 + bobY) * s);
  ctx.rotate((30 - wingFlap) * Math.PI / 180);
  ctx.beginPath();
  ctx.ellipse(5 * s, 0, 7 * s, 3 * s, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = flash ? '#eee' : '#9C27B0';
  ctx.beginPath();
  ctx.ellipse(4 * s, 0, 4 * s, 1.5 * s, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Body
  ctx.fillStyle = flash ? '#fff' : '#6A1B9A';
  ctx.beginPath();
  ctx.ellipse(0, (0 + bobY) * s, 4 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = flash ? '#fff' : '#7B1FA2';
  ctx.beginPath();
  ctx.moveTo(-3 * s, (-5 + bobY) * s);
  ctx.lineTo(-5 * s, (-10 + bobY) * s);
  ctx.lineTo(-1 * s, (-6 + bobY) * s);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(3 * s, (-5 + bobY) * s);
  ctx.lineTo(5 * s, (-10 + bobY) * s);
  ctx.lineTo(1 * s, (-6 + bobY) * s);
  ctx.closePath();
  ctx.fill();

  // Eyes (cute)
  circle(ctx, -2 * s, (-2 + bobY) * s, 2 * s, '#FF5722');
  circle(ctx, 2 * s, (-2 + bobY) * s, 2 * s, '#FF5722');
  ctx.fillStyle = '#fff';
  circle(ctx, -1.5 * s, (-3 + bobY) * s, 0.8 * s, '#fff');
  circle(ctx, 2.5 * s, (-3 + bobY) * s, 0.8 * s, '#fff');

  // Tiny fangs
  ctx.fillStyle = '#fff';
  PX(ctx, -1 * s, (1 + bobY) * s, '#fff');
  PX(ctx, 1 * s, (1 + bobY) * s, '#fff');

  ctx.restore();
}

// ============================================
// SKELETON - Cute little skeleton
// ============================================
export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, scale: number,
  frame: number, direction: 1 | -1,
  hitTimer: number, deathTimer: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (direction === -1) ctx.scale(-1, 1);

  const s = 3;
  const walk = Math.sin(frame * 0.12) * 2;
  const bobY = Math.abs(Math.sin(frame * 0.12)) * -2;
  const flash = hitTimer > 0 && Math.floor(hitTimer / 3) % 2 === 0;
  const boneColor = flash ? '#fff' : '#F5F5DC';
  const outlineColor = flash ? '#eee' : '#D7CCC8';

  if (deathTimer > 0) ctx.globalAlpha = Math.max(0, 1 - deathTimer / 25);

  // Shadow
  ctx.globalAlpha *= 0.2;
  ellipse(ctx, 0, 12 * s, 5 * s, 2 * s, '#000');
  ctx.globalAlpha = deathTimer > 0 ? Math.max(0, 1 - deathTimer / 25) : 1;

  // Body
  rect(ctx, -2 * s, (-2 + bobY) * s, 4 * s, 6 * s, boneColor);
  // Ribcage lines
  ctx.fillStyle = outlineColor;
  rect(ctx, -1 * s, (0 + bobY) * s, 2 * s, s);
  rect(ctx, -1 * s, (2 + bobY) * s, 2 * s, s);

  // Head (round skull)
  ctx.fillStyle = boneColor;
  ctx.beginPath();
  ctx.arc(0, (-6 + bobY) * s, 5 * s, 0, Math.PI * 2);
  ctx.fill();
  // Jaw
  rect(ctx, -3 * s, (-3 + bobY) * s, 6 * s, 2 * s, boneColor);

  // Eyes (dark hollow)
  ctx.fillStyle = '#333';
  circle(ctx, -2 * s, (-7 + bobY) * s, 1.8 * s, '#333');
  circle(ctx, 2 * s, (-7 + bobY) * s, 1.8 * s, '#333');
  // Eye glow
  ctx.fillStyle = '#FF5722';
  circle(ctx, -2 * s, (-7 + bobY) * s, 0.8 * s, '#FF5722');
  circle(ctx, 2 * s, (-7 + bobY) * s, 0.8 * s, '#FF5722');

  // Nose
  ctx.fillStyle = '#333';
  PX(ctx, 0, (-5 + bobY) * s, '#333');
  PX(ctx, 1 * s, (-4 + bobY) * s, '#333');
  PX(ctx, -1 * s, (-4 + bobY) * s, '#333');

  // Smile (teeth)
  ctx.fillStyle = '#333';
  rect(ctx, -2 * s, (-3 + bobY) * s, 4 * s, s);
  ctx.fillStyle = boneColor;
  for (let i = -1; i <= 1; i++) {
    PX(ctx, i * s, (-3 + bobY) * s, boneColor);
  }

  // Arms
  ctx.strokeStyle = boneColor;
  ctx.lineWidth = 2 * s;
  ctx.lineCap = 'round';
  // Left arm
  ctx.beginPath();
  ctx.moveTo(-2 * s, (0 + bobY) * s);
  ctx.lineTo((-5 - walk) * s, (3 + bobY) * s);
  ctx.stroke();
  // Right arm
  ctx.beginPath();
  ctx.moveTo(2 * s, (0 + bobY) * s);
  ctx.lineTo((5 + walk) * s, (3 + bobY) * s);
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(-1 * s, (4 + bobY) * s);
  ctx.lineTo((-2 + walk) * s, (10 + bobY) * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(1 * s, (4 + bobY) * s);
  ctx.lineTo((2 - walk) * s, (10 + bobY) * s);
  ctx.stroke();

  // Feet
  ctx.fillStyle = boneColor;
  rect(ctx, (-3 + walk) * s, (9 + bobY) * s, 3 * s, 2 * s, boneColor);
  rect(ctx, (1 - walk) * s, (9 + bobY) * s, 3 * s, 2 * s, boneColor);

  ctx.restore();
}

// ============================================
// BOSS - Big scary but cute monster
// ============================================
export function drawBoss(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, scale: number,
  frame: number, direction: 1 | -1,
  hitTimer: number, deathTimer: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (direction === -1) ctx.scale(-1, 1);

  const s = 3;
  const breathe = Math.sin(frame * 0.05) * 2;
  const flash = hitTimer > 0 && Math.floor(hitTimer / 3) % 2 === 0;

  if (deathTimer > 0) ctx.globalAlpha = Math.max(0, 1 - deathTimer / 35);

  // Shadow
  ctx.globalAlpha *= 0.3;
  ellipse(ctx, 0, 14 * s, 14 * s, 4 * s, '#000');
  ctx.globalAlpha = deathTimer > 0 ? Math.max(0, 1 - deathTimer / 35) : 1;

  // Body
  ctx.fillStyle = flash ? '#fff' : '#C62828';
  ctx.beginPath();
  ctx.ellipse(0, (4 + breathe) * s, (12 + breathe) * s, 10 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly
  ctx.fillStyle = flash ? '#eee' : '#FFCDD2';
  ctx.beginPath();
  ctx.ellipse(0, (6 + breathe) * s, 7 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Horns
  ctx.fillStyle = flash ? '#fff' : '#4E342E';
  ctx.beginPath();
  ctx.moveTo(-6 * s, (-6 + breathe) * s);
  ctx.lineTo(-10 * s, (-16 + breathe) * s);
  ctx.lineTo(-3 * s, (-8 + breathe) * s);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(6 * s, (-6 + breathe) * s);
  ctx.lineTo(10 * s, (-16 + breathe) * s);
  ctx.lineTo(3 * s, (-8 + breathe) * s);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.fillStyle = flash ? '#fff' : '#D32F2F';
  ctx.beginPath();
  ctx.arc(0, (-6 + breathe) * s, 7 * s, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (big and angry but cute)
  ctx.fillStyle = '#FFD600';
  ctx.beginPath();
  ctx.ellipse(-3 * s, (-7 + breathe) * s, 3 * s, 2.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(3 * s, (-7 + breathe) * s, 3 * s, 2.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  // Pupils (angry slit)
  ctx.fillStyle = '#000';
  rect(ctx, -3.5 * s, (-8.5 + breathe) * s, 1.5 * s, 3 * s, '#000');
  rect(ctx, 2.5 * s, (-8.5 + breathe) * s, 1.5 * s, 3 * s, '#000');

  // Angry eyebrows
  ctx.strokeStyle = flash ? '#ddd' : '#4E342E';
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(-6 * s, (-10 + breathe) * s);
  ctx.lineTo(-1 * s, (-9 + breathe) * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(6 * s, (-10 + breathe) * s);
  ctx.lineTo(1 * s, (-9 + breathe) * s);
  ctx.stroke();

  // Mouth (fangs)
  ctx.fillStyle = flash ? '#eee' : '#333';
  ctx.beginPath();
  ctx.arc(0, (-3 + breathe) * s, 4 * s, 0, Math.PI);
  ctx.fill();
  // Fangs
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(-3 * s, (-3 + breathe) * s);
  ctx.lineTo(-2 * s, (0 + breathe) * s);
  ctx.lineTo(-1 * s, (-3 + breathe) * s);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(1 * s, (-3 + breathe) * s);
  ctx.lineTo(2 * s, (0 + breathe) * s);
  ctx.lineTo(3 * s, (-3 + breathe) * s);
  ctx.closePath();
  ctx.fill();

  // Spikes on body
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI * 0.6 + (i / 4) * Math.PI * 0.5 - Math.PI * 0.5;
    ctx.fillStyle = flash ? '#eee' : '#B71C1C';
    const spikeX = Math.cos(angle) * (12 + breathe) * s;
    const spikeY = Math.sin(angle) * 10 * s + (4 + breathe) * s;
    ctx.beginPath();
    ctx.moveTo(spikeX - 2 * s, spikeY);
    ctx.lineTo(spikeX, spikeY - 5 * s);
    ctx.lineTo(spikeX + 2 * s, spikeY);
    ctx.closePath();
    ctx.fill();
  }

  // Arms
  ctx.fillStyle = flash ? '#fff' : '#C62828';
  ctx.beginPath();
  ctx.ellipse((-13 + breathe) * s, (2 + breathe) * s, 4 * s, 3 * s, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse((13 + breathe) * s, (2 + breathe) * s, 4 * s, 3 * s, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Claws
  ctx.fillStyle = flash ? '#eee' : '#4E342E';
  for (let i = -1; i <= 1; i++) {
    rect(ctx, (-16 + breathe) * s, (3 + i * 2 + breathe) * s, 3 * s, s, '#4E342E');
    rect(ctx, (13 + breathe) * s, (3 + i * 2 + breathe) * s, 3 * s, s, '#4E342E');
  }

  ctx.restore();
}

// ============================================
// DRAWING HERO - Render scanned drawing with effects
// ============================================
export function drawDrawingHero(
  ctx: CanvasRenderingContext2D,
  hero: {
    x: number;
    y: number;
    image: HTMLImageElement | null;
    imageWidth: number;
    imageHeight: number;
    frame: number;
    direction: 1 | -1;
    attacking: boolean;
    attackTimer: number;
    hitTimer: number;
    glowIntensity: number;
    scale: number;
    bobOffset: number;
    color1: string;
    skillActive: boolean;
    level: number;
  }
) {
  if (!hero.image) return;

  ctx.save();
  ctx.translate(hero.x, hero.y + hero.bobOffset);

  const drawSize = 60 * hero.scale;
  const ratio = hero.imageWidth / hero.imageHeight;
  const w = drawSize * Math.min(ratio, 1.5);
  const h = drawSize * Math.min(1 / ratio, 1.5);

  if (hero.direction === -1) ctx.scale(-1, 1);

  // Glow aura (makes drawing look magical/alive)
  if (hero.glowIntensity > 0 || hero.skillActive) {
    const glowColor = hero.color1 || '#00E5FF';
    const glowSize = hero.skillActive ? 25 + Math.sin(hero.frame * 0.3) * 10 : 15 + Math.sin(hero.frame * 0.1) * 5;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowSize * (hero.skillActive ? 2 : 1);
  }

  // Shake on hit
  if (hero.hitTimer > 0) {
    const shake = Math.sin(hero.hitTimer * 2) * 4;
    ctx.translate(shake, 0);
  }

  // Draw the actual scanned image
  ctx.drawImage(hero.image, -w / 2, -h / 2, w, h);

  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  // Attack slash effect
  if (hero.attacking && hero.attackTimer > 0) {
    const progress = 1 - hero.attackTimer / 15;
    ctx.globalAlpha = 0.6 * (1 - progress);
    ctx.strokeStyle = hero.color1 || '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const slashAngle = progress * Math.PI * 1.5;
    const slashRadius = 35 + progress * 25;
    ctx.arc(w * 0.3, -h * 0.2, slashRadius, -Math.PI / 4 + slashAngle - 0.5, -Math.PI / 4 + slashAngle + 0.5);
    ctx.stroke();

    // Second slash arc
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(w * 0.3, -h * 0.2, slashRadius * 0.8, -Math.PI / 4 + slashAngle - 0.3, -Math.PI / 4 + slashAngle + 0.3);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Level badge
  ctx.fillStyle = '#FFD700';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.5;
  const badgeX = -w / 2 - 5;
  const badgeY = -h / 2 - 5;
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#000';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${hero.level}`, badgeX, badgeY);

  ctx.restore();
}

// ============================================
// AWAKENING ANIMATION - Drawing comes to life
// ============================================
export function drawAwakeningEffect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  progress: number, // 0 to 1
  image: HTMLImageElement | null,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);

  // Phase 1 (0-0.3): Sparkles gather
  if (progress < 0.3) {
    const p = progress / 0.3;
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + progress * 5;
      const radius = (80 - p * 60) * (0.5 + (i % 3) * 0.3);
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      const size = 2 + Math.sin(progress * 20 + i) * 1.5;
      ctx.globalAlpha = p * (0.5 + Math.sin(i + progress * 10) * 0.3);
      ctx.fillStyle = color;
      ctx.fillRect(px - size / 2, py - size / 2, size, size);
    }
  }

  // Phase 2 (0.2-0.6): Image materializes with glow
  if (progress >= 0.2 && progress < 0.7 && image) {
    const p = Math.min(1, (progress - 0.2) / 0.3);
    const drawSize = 80 * p;
    const ratio = image.width / image.height;
    const w = drawSize * Math.min(ratio, 1.5);
    const h = drawSize * Math.min(1 / ratio, 1.5);

    // Growing glow
    ctx.globalAlpha = 0.4 * p;
    ctx.shadowColor = color;
    ctx.shadowBlur = 30 * p;

    ctx.drawImage(image, -w / 2, -h / 2, w, h);

    // Rising energy lines
    ctx.globalAlpha = 0.6 * (1 - p);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = 60 * (1 - p);
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * dist, Math.sin(angle) * dist);
      ctx.lineTo(Math.cos(angle) * dist * 0.3, Math.sin(angle) * dist * 0.3);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
  }

  // Phase 3 (0.6-1.0): Final burst
  if (progress >= 0.6 && image) {
    const p = (progress - 0.6) / 0.4;
    const drawSize = 80;
    const ratio = image.width / image.height;
    const w = drawSize * Math.min(ratio, 1.5);
    const h = drawSize * Math.min(1 / ratio, 1.5);

    // Fully visible with pulsing glow
    ctx.globalAlpha = 1;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15 + Math.sin(progress * 15) * 5;

    ctx.drawImage(image, -w / 2, -h / 2, w, h);

    ctx.shadowBlur = 0;

    // Expanding ring
    ctx.globalAlpha = 0.5 * (1 - p);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3 * (1 - p);
    ctx.beginPath();
    ctx.arc(0, 0, p * 100, 0, Math.PI * 2);
    ctx.stroke();

    // Burst particles
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dist = p * 80;
      ctx.globalAlpha = (1 - p) * 0.8;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(
        Math.cos(angle) * dist,
        Math.sin(angle) * dist,
        3 * (1 - p),
        0, Math.PI * 2
      );
      ctx.fill();
    }
  }

  ctx.restore();
}

// ============================================
// HEALTH BAR
// ============================================
export function drawHealthBar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number, height: number,
  current: number, max: number,
  color: string, bgColor: string = '#333'
) {
  const ratio = Math.max(0, current / max);
  ctx.fillStyle = bgColor;
  ctx.fillRect(x, y, width, height);
  if (ratio > 0) {
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, color);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width * ratio, height);
  }
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, width * ratio, height * 0.4);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, width, height);
}

function ellipse(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}
