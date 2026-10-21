/**
 * Procedurally generates crisp sample images on an offscreen canvas
 * so users can test steganography immediately without hunting for local files.
 */

export interface SampleImageOption {
  id: string;
  name: string;
  tag: string;
  generateDataUrl: () => string;
}

function createSunsetLandscape(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Sky gradient
  const skyGradient = ctx.createLinearGradient(0, 0, 0, 480);
  skyGradient.addColorStop(0, '#1e1b4b');
  skyGradient.addColorStop(0.3, '#4338ca');
  skyGradient.addColorStop(0.6, '#ec4899');
  skyGradient.addColorStop(0.85, '#f97316');
  skyGradient.addColorStop(1, '#fde047');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, 640, 480);

  // Glowing Sun
  ctx.beginPath();
  ctx.arc(320, 260, 65, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#fbbf24';
  ctx.shadowBlur = 40;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Mountain range 1 (far)
  ctx.beginPath();
  ctx.moveTo(0, 360);
  ctx.lineTo(120, 290);
  ctx.lineTo(260, 340);
  ctx.lineTo(400, 270);
  ctx.lineTo(520, 330);
  ctx.lineTo(640, 280);
  ctx.lineTo(640, 480);
  ctx.lineTo(0, 480);
  ctx.closePath();
  ctx.fillStyle = 'rgba(76, 29, 149, 0.7)';
  ctx.fill();

  // Mountain range 2 (near)
  ctx.beginPath();
  ctx.moveTo(0, 400);
  ctx.lineTo(160, 320);
  ctx.lineTo(340, 380);
  ctx.lineTo(480, 310);
  ctx.lineTo(640, 370);
  ctx.lineTo(640, 480);
  ctx.lineTo(0, 480);
  ctx.closePath();
  ctx.fillStyle = '#1e1135';
  ctx.fill();

  // Water / reflection foreground
  const lakeGrad = ctx.createLinearGradient(0, 410, 0, 480);
  lakeGrad.addColorStop(0, '#0f172a');
  lakeGrad.addColorStop(1, '#020617');
  ctx.fillStyle = lakeGrad;
  ctx.fillRect(0, 410, 640, 70);

  // Gentle lake ripples
  ctx.strokeStyle = 'rgba(253, 224, 71, 0.4)';
  ctx.lineWidth = 1.5;
  for (let y = 425; y < 475; y += 8) {
    ctx.beginPath();
    ctx.moveTo(270 - (y - 410) * 2, y);
    ctx.lineTo(370 + (y - 410) * 2, y);
    ctx.stroke();
  }

  return canvas.toDataURL('image/png');
}

function createEmeraldForest(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 450;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const grad = ctx.createLinearGradient(0, 0, 600, 450);
  grad.addColorStop(0, '#064e3b');
  grad.addColorStop(0.5, '#047857');
  grad.addColorStop(1, '#10b981');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 600, 450);

  // Soft ambient circular lights
  const circles = [
    { x: 150, y: 120, r: 90, color: 'rgba(52, 211, 153, 0.35)' },
    { x: 450, y: 180, r: 130, color: 'rgba(16, 185, 129, 0.4)' },
    { x: 280, y: 320, r: 110, color: 'rgba(110, 231, 183, 0.3)' },
  ];
  for (const c of circles) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fillStyle = c.color;
    ctx.fill();
  }

  // Pine tree silhouettes
  ctx.fillStyle = '#022c22';
  for (let x = 30; x <= 570; x += 65) {
    const h = 120 + ((x * 13) % 70);
    const yBase = 430;
    // Tree tiers
    for (let t = 0; t < 3; t++) {
      const tierY = yBase - (t * (h / 3));
      const tierW = 35 - t * 8;
      ctx.beginPath();
      ctx.moveTo(x, tierY - h / 3);
      ctx.lineTo(x - tierW, tierY);
      ctx.lineTo(x + tierW, tierY);
      ctx.closePath();
      ctx.fill();
    }
  }

  return canvas.toDataURL('image/png');
}

function createCyberpunkCity(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Dark violet-indigo backdrop
  const bg = ctx.createLinearGradient(0, 0, 0, 480);
  bg.addColorStop(0, '#0f051d');
  bg.addColorStop(1, '#270838');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 640, 480);

  // Neon Grid lines
  ctx.strokeStyle = 'rgba(236, 72, 153, 0.25)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 640; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 480);
    ctx.stroke();
  }
  for (let y = 0; y <= 480; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(640, y);
    ctx.stroke();
  }

  // Neon glowing polygons
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 15;
  ctx.strokeRect(60, 80, 220, 160);

  ctx.strokeStyle = '#f43f5e';
  ctx.shadowColor = '#f43f5e';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(440, 220, 85, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  return canvas.toDataURL('image/png');
}

export const SAMPLE_IMAGES: SampleImageOption[] = [
  {
    id: 'sunset',
    name: 'Hoàng hôn rực rỡ',
    tag: 'Phong cảnh 640x480',
    generateDataUrl: createSunsetLandscape,
  },
  {
    id: 'forest',
    name: 'Rừng thông ngọc bích',
    tag: 'Thiên nhiên 600x450',
    generateDataUrl: createEmeraldForest,
  },
  {
    id: 'cyber',
    name: 'Cyberpunk Neon',
    tag: 'Nghệ thuật 640x480',
    generateDataUrl: createCyberpunkCity,
  },
];
