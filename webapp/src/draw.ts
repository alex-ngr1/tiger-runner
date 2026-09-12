import { sprites } from "./sprites";

export const FUR = "#f08c2e";
export const FUR_DARK = "#c65d12";
export const STRIPE = "#1c140e";
export const CREAM = "#fff1d0";

export interface Cam {
  w: number;
  h: number;
  horizon: number;
  nearY: number;
}

export function makeCam(w: number, h: number): Cam {
  return {
    w,
    h,
    horizon: h * 0.3,
    nearY: h * 0.78,
  };
}

export function persp(z: number): number {
  return 7 / Math.max(1.2, z + 7);
}

export function laneX(cam: Cam, lane: number, t: number): number {
  const spread = Math.min(cam.w * 0.4, 230) * t;
  return cam.w * 0.5 + (lane - 1) * spread;
}

export function groundY(cam: Cam, t: number): number {
  return cam.horizon + (cam.nearY - cam.horizon) * Math.min(1.15, t);
}

function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function drawSky(ctx: CanvasRenderingContext2D, cam: Cam, time: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, cam.h);
  g.addColorStop(0, "#0b1224");
  g.addColorStop(0.22, "#1b2a4a");
  g.addColorStop(0.42, "#6a3d58");
  g.addColorStop(0.58, "#e07a3a");
  g.addColorStop(0.72, "#3d2a18");
  g.addColorStop(1, "#1a140e");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cam.w, cam.h);

  ctx.fillStyle = "rgba(255, 236, 190, 0.95)";
  ctx.beginPath();
  ctx.arc(cam.w * 0.78, cam.horizon - 36, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 200, 120, 0.16)";
  ctx.beginPath();
  ctx.arc(cam.w * 0.78, cam.horizon - 36, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 248, 220, 0.85)";
  for (let i = 0; i < 28; i++) {
    const sx = hash(i + 3) * cam.w;
    const sy = hash(i + 19) * (cam.horizon - 18);
    const tw = 0.55 + 0.45 * Math.sin(time * 1.4 + i * 1.7);
    ctx.globalAlpha = 0.25 + tw * 0.6;
    ctx.fillRect(sx, sy, 1.6, 1.6);
  }
  ctx.globalAlpha = 1;

  drawHorizonTown(ctx, cam);
  drawHorizonSunflowers(ctx, cam, time);
}

function drawHorizonTown(ctx: CanvasRenderingContext2D, cam: Cam): void {
  const base = cam.horizon + 6;
  const blocks = [
    { x: 0.04, w: 0.13, h: 52, hue: "#243044" },
    { x: 0.16, w: 0.1, h: 38, hue: "#1c2838" },
    { x: 0.28, w: 0.15, h: 64, hue: "#2a3548" },
    { x: 0.55, w: 0.12, h: 46, hue: "#223046" },
    { x: 0.68, w: 0.18, h: 70, hue: "#1a2436" },
    { x: 0.88, w: 0.12, h: 42, hue: "#263248" },
  ];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (!b) continue;
    const x = b.x * cam.w;
    const w = b.w * cam.w;
    const y = base - b.h;
    ctx.fillStyle = b.hue;
    ctx.fillRect(x, y, w, b.h + 8);
    ctx.fillStyle = "#151c28";
    ctx.fillRect(x, y, w, 4);
    const cols = 4;
    const rows = Math.max(3, Math.floor(b.h / 10));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const on = hash(i * 40 + r * 7 + c) > 0.28;
        ctx.fillStyle = on ? "#f4d27a" : "#121820";
        ctx.fillRect(x + 5 + c * (w / cols), y + 8 + r * 8, 3.2, 3.6);
      }
    }
  }

  ctx.fillStyle = "#1a2230";
  ctx.beginPath();
  ctx.moveTo(cam.w * 0.46, base);
  ctx.lineTo(cam.w * 0.5, base - 34);
  ctx.lineTo(cam.w * 0.54, base);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cam.w * 0.5, base - 38, 7, Math.PI, 0);
  ctx.fill();
}

function drawHorizonSunflowers(ctx: CanvasRenderingContext2D, cam: Cam, time: number): void {
  const base = cam.horizon + 10;
  ctx.fillStyle = "#1c2a14";
  ctx.beginPath();
  ctx.moveTo(0, base + 18);
  for (let x = 0; x <= cam.w; x += 14) {
    const n = Math.sin(x * 0.05 + time * 0.12) * 6 + 10;
    ctx.lineTo(x, base - n);
  }
  ctx.lineTo(cam.w, base + 28);
  ctx.lineTo(0, base + 28);
  ctx.fill();

  for (let i = 0; i < 11; i++) {
    const x = (i / 11) * cam.w + 8;
    const sway = Math.sin(time * 0.8 + i) * 2;
    ctx.strokeStyle = "#2d441c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, base + 4);
    ctx.lineTo(x + sway, base - 16);
    ctx.stroke();
    ctx.fillStyle = "#d4a017";
    ctx.beginPath();
    ctx.arc(x + sway, base - 18, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4a2c10";
    ctx.beginPath();
    ctx.arc(x + sway, base - 18, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawTrack(ctx: CanvasRenderingContext2D, cam: Cam, distance: number): void {
  const leftFar = laneX(cam, -0.72, persp(88));
  const rightFar = laneX(cam, 2.72, persp(88));
  const leftNear = laneX(cam, -0.72, persp(0));
  const rightNear = laneX(cam, 2.72, persp(0));

  ctx.beginPath();
  ctx.moveTo(0, cam.horizon + 8);
  ctx.lineTo(cam.w, cam.horizon + 8);
  ctx.lineTo(cam.w, cam.h);
  ctx.lineTo(0, cam.h);
  ctx.closePath();
  const grass = ctx.createLinearGradient(0, cam.horizon, 0, cam.h);
  grass.addColorStop(0, "#3a5428");
  grass.addColorStop(1, "#243818");
  ctx.fillStyle = grass;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(leftFar, cam.horizon);
  ctx.lineTo(rightFar, cam.horizon);
  ctx.lineTo(rightNear, cam.nearY + 36);
  ctx.lineTo(leftNear, cam.nearY + 36);
  ctx.closePath();
  const soil = ctx.createLinearGradient(0, cam.horizon, 0, cam.h);
  soil.addColorStop(0, "#3f3c39");
  soil.addColorStop(0.45, "#2b2927");
  soil.addColorStop(1, "#1c1a18");
  ctx.fillStyle = soil;
  ctx.fill();

  for (let lane = 0; lane < 3; lane++) {
    const zSteps = 10;
    for (let i = 0; i < zSteps; i++) {
      const z0 = (i / zSteps) * 90;
      const z1 = ((i + 1) / zSteps) * 90;
      const t0 = persp(z0);
      const t1 = persp(z1);
      const x0a = laneX(cam, lane - 0.42, t0);
      const x0b = laneX(cam, lane + 0.42, t0);
      const x1a = laneX(cam, lane - 0.42, t1);
      const x1b = laneX(cam, lane + 0.42, t1);
      const y0 = groundY(cam, t0);
      const y1 = groundY(cam, t1);
      const stripe = Math.floor((distance * 0.28 + i) % 2) === 0;
      ctx.beginPath();
      ctx.moveTo(x0a, y0);
      ctx.lineTo(x0b, y0);
      ctx.lineTo(x1b, y1);
      ctx.lineTo(x1a, y1);
      ctx.closePath();
      ctx.fillStyle = stripe ? "#35322f" : "#2a2826";
      ctx.fill();
    }
  }

  ctx.lineCap = "round";
  for (const edge of [0.5, 1.5]) {
    ctx.beginPath();
    for (let z = 0; z <= 90; z += 3) {
      const t = persp(z);
      const x = laneX(cam, edge, t);
      const y = groundY(cam, t);
      if (z === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(240, 200, 70, 0.8)";
    ctx.lineWidth = 2.2;
    ctx.setLineDash([14, 16]);
    ctx.lineDashOffset = -distance * 1.6;
    ctx.stroke();
  }
  ctx.setLineDash([]);

  ctx.strokeStyle = "rgba(236, 232, 220, 0.55)";
  ctx.lineWidth = 3;
  for (const edge of [-0.5, 2.5]) {
    ctx.beginPath();
    for (let z = 0; z <= 90; z += 4) {
      const t = persp(z);
      const x = laneX(cam, edge, t);
      const y = groundY(cam, t);
      if (z === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

export function drawWayside(ctx: CanvasRenderingContext2D, cam: Cam, distance: number, time: number): void {
  const spacing = 16;
  const first = Math.floor(distance / spacing) - 1;
  for (let i = 0; i < 8; i++) {
    const id = first + i;
    const z = id * spacing - distance + 10;
    if (z < -3 || z > 86) continue;
    const t = persp(z);
    const s = Math.max(0.12, t);
    const side = hash(id * 3) > 0.5 ? -1.15 : 3.15;
    const x = laneX(cam, side, t);
    const y = groundY(cam, t);
    if (hash(id + 8) > 0.45) drawLamp(ctx, x, y, s, time + id);
    else drawSunflower(ctx, x, y, s, time + id);
  }
}

function drawLamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(0, 6, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2c3038";
  ctx.fillRect(-3, -78, 6, 80);
  ctx.fillStyle = "#3d424c";
  ctx.fillRect(-14, -82, 18, 5);
  const glow = 0.28 + 0.08 * Math.sin(time * 3);
  ctx.fillStyle = `rgba(255, 210, 120, ${glow})`;
  ctx.beginPath();
  ctx.arc(-12, -78, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f6d889";
  ctx.beginPath();
  ctx.arc(-12, -78, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSunflower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const sway = Math.sin(time * 1.3) * 4;
  ctx.strokeStyle = "#3f6a24";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.quadraticCurveTo(sway * 0.4, -30, sway, -62);
  ctx.stroke();
  ctx.fillStyle = "#4f8a2c";
  ctx.beginPath();
  ctx.ellipse(-10 + sway * 0.3, -28, 10, 5, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.translate(sway, -66);
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 ? "#f2c230" : "#e0a61a";
    ctx.beginPath();
    ctx.rotate(0.63);
    ctx.ellipse(0, -12, 5, 11, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#4a2c12";
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2c1a0c";
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawAltushka(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  spin: number,
): void {
  const bob = Math.sin(spin) * 7 * s;
  const img = sprites.altushka;
  const h = 58 * s;
  const ratio = img && img.naturalWidth ? img.naturalWidth / img.naturalHeight : 0.36;
  const w = h * ratio;
  ctx.save();
  ctx.fillStyle = "rgba(255, 122, 182, 0.28)";
  ctx.beginPath();
  ctx.ellipse(x, y + 6 * s + bob, 14 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  if (img && img.naturalWidth) {
    ctx.drawImage(img, x - w / 2, y - h + bob, w, h);
  } else {
    drawAltushkaFallback(ctx, x, y + bob, s);
  }
  ctx.restore();
}

function drawAltushkaFallback(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(0, -38, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f2b8c8";
  ctx.beginPath();
  ctx.arc(-6, -40, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#151515";
  roundBox(ctx, -12, -30, 24, 20, 6, "#151515");
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(-8, -10, 16, 7);
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-5 + i * 5, -2);
    ctx.lineTo(-5 + i * 5, 8);
    ctx.stroke();
  }
  ctx.fillStyle = "#111";
  ctx.fillRect(-7, 8, 6, 5);
  ctx.fillRect(1, 8, 6, 5);
  ctx.restore();
}

export function drawBottle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  hop: number,
): void {
  const img = sprites.bottle;
  const h = 84 * s;
  const ratio = img && img.naturalWidth ? img.naturalWidth / img.naturalHeight : 0.55;
  const w = h * ratio;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(x, y + 4 * s, 16 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  if (img && img.naturalWidth) {
    ctx.drawImage(img, x - w / 2, y - h - hop, w, h);
  } else {
    drawBottleFallback(ctx, x, y - hop, s);
  }
  ctx.restore();
}

function drawBottleFallback(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "rgba(190, 220, 230, 0.55)";
  roundBox(ctx, -16, -62, 32, 58, 6, "rgba(190, 220, 230, 0.55)");
  ctx.strokeStyle = "rgba(255,255,255,0.65)";
  ctx.lineWidth = 2;
  ctx.strokeRect(-16, -62, 32, 58);
  ctx.fillStyle = "#c41e3a";
  ctx.fillRect(-13, -52, 26, 30);
  ctx.strokeStyle = "#d4b24a";
  ctx.strokeRect(-13, -52, 26, 30);
  ctx.fillStyle = "#111";
  ctx.fillRect(-4, -46, 10, 8);
  ctx.fillStyle = "#e6c86a";
  ctx.font = "bold 6px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("RADA", 0, -32);
  ctx.fillStyle = "#8a5a28";
  ctx.fillRect(-5, -70, 10, 8);
  ctx.fillStyle = "#d4b24a";
  ctx.fillRect(-7, -64, 14, 3);
  ctx.restore();
}

export function drawBarrier(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(0, 8, 30, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#6b4a22";
  ctx.beginPath();
  ctx.moveTo(-24, -36);
  ctx.lineTo(18, -42);
  ctx.lineTo(30, -8);
  ctx.lineTo(-12, -4);
  ctx.closePath();
  ctx.fill();

  roundBox(ctx, -28, -32, 44, 36, 3, "#8a5a28");
  ctx.fillStyle = "#6e431c";
  ctx.fillRect(-26, -28, 40, 5);
  ctx.fillRect(-26, -16, 40, 5);
  ctx.fillRect(-26, -5, 40, 5);
  ctx.fillStyle = "#c4b08a";
  ctx.fillRect(-28, -22, 44, 3);
  ctx.fillRect(-28, -10, 44, 3);
  ctx.fillStyle = "#d9a441";
  ctx.beginPath();
  ctx.arc(-2, -18, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4a2c10";
  ctx.beginPath();
  ctx.arc(-2, -18, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawTall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(0, 8, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  roundBox(ctx, -22, -78, 44, 80, 4, "#d8c39a");
  ctx.fillStyle = "#2f6b46";
  ctx.fillRect(-22, -78, 44, 14);
  ctx.fillStyle = "#c41e3a";
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(-22 + i * 9, -92, 7, 14);
  }
  ctx.fillStyle = "#f4f0e4";
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(-18 + i * 9, -92, 4, 14);
  }
  ctx.fillStyle = "#7ec8e8";
  ctx.fillRect(-14, -58, 28, 22);
  ctx.strokeStyle = "#2a3540";
  ctx.lineWidth = 2;
  ctx.strokeRect(-14, -58, 28, 22);
  ctx.fillStyle = "#1c2430";
  ctx.fillRect(-10, -28, 20, 18);
  ctx.fillStyle = "#f0c14b";
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("24", 0, -68);
  ctx.restore();
}

export function drawThreatVignette(
  ctx: CanvasRenderingContext2D,
  cam: Cam,
  threat: number,
): void {
  const a = Math.min(0.55, (threat - 0.35) * 0.9);
  if (a <= 0) return;
  const g = ctx.createRadialGradient(
    cam.w * 0.5,
    cam.h * 0.55,
    cam.h * 0.2,
    cam.w * 0.5,
    cam.h * 0.6,
    cam.h * 0.78,
  );
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(110, 8, 18, ${a})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cam.w, cam.h);
}

export interface TigerPose {
  phase: number;
  airborne: boolean;
  lean: number;
  dead?: boolean;
}

export function drawTiger(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  pose: TigerPose,
): void {
  const { phase, airborne, lean, dead } = pose;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.rotate(lean * 0.16 + (dead ? 0.6 : 0));

  const bob = airborne ? -14 : Math.sin(phase * 2) * 2.4;
  ctx.translate(0, bob);

  const a = airborne ? 0.35 : Math.sin(phase);
  const b = airborne ? -0.25 : Math.sin(phase + Math.PI);

  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 38 - bob * 0.2, 28, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail
  ctx.strokeStyle = FUR;
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(18, 8);
  ctx.quadraticCurveTo(42, -8 + a * 10, 36, -34 + a * 16);
  ctx.stroke();
  ctx.strokeStyle = STRIPE;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(30, -8);
  ctx.lineTo(33, -16);
  ctx.moveTo(34, -22);
  ctx.lineTo(35, -28);
  ctx.stroke();
  ctx.fillStyle = CREAM;
  ctx.beginPath();
  ctx.arc(36, -34 + a * 16, 5, 0, Math.PI * 2);
  ctx.fill();

  drawLeg(ctx, 10, 18, b, 1);
  drawLeg(ctx, -12, 20, a, -1);

  // Body
  ctx.fillStyle = FUR;
  ctx.beginPath();
  ctx.ellipse(0, 6, 26, 20, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = CREAM;
  ctx.beginPath();
  ctx.ellipse(-4, 12, 12, 10, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = STRIPE;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  for (const [x0, y0, x1, y1] of [
    [8, -4, 10, 10],
    [-2, -6, 0, 8],
    [16, 0, 14, 12],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  drawLeg(ctx, 6, 16, a * 0.9, 1, true);
  drawLeg(ctx, -16, 16, b * 0.9, -1, true);

  // Head
  ctx.fillStyle = FUR;
  ctx.beginPath();
  ctx.ellipse(-10, -22, 22, 20, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  drawEar(ctx, -26, -38, -1);
  drawEar(ctx, 4, -40, 1);

  // Forehead stripes
  ctx.strokeStyle = STRIPE;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-10, -34);
  ctx.lineTo(-12, -18);
  ctx.moveTo(-2, -32);
  ctx.lineTo(-6, -16);
  ctx.moveTo(-18, -30);
  ctx.lineTo(-16, -16);
  ctx.stroke();

  // Muzzle
  ctx.fillStyle = CREAM;
  ctx.beginPath();
  ctx.ellipse(-18, -14, 11, 9, -0.25, 0, Math.PI * 2);
  ctx.fill();

  // Eyes — amber, clearly a tiger
  ctx.fillStyle = "#1a120c";
  ctx.beginPath();
  ctx.ellipse(-20, -24, 5.2, 5.6, 0, 0, Math.PI * 2);
  ctx.ellipse(-6, -26, 4.4, 4.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f4c430";
  ctx.beginPath();
  ctx.ellipse(-19.5, -24, 3.2, 3.4, 0, 0, Math.PI * 2);
  ctx.ellipse(-5.8, -26, 2.6, 2.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a120c";
  ctx.beginPath();
  ctx.ellipse(-18.6, -24, 1.4, 2.4, 0, 0, Math.PI * 2);
  ctx.ellipse(-5.2, -26, 1.2, 2.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-21, -25.5, 1.1, 0, Math.PI * 2);
  ctx.arc(-7, -27.2, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Nose + mouth
  ctx.fillStyle = "#e23d3d";
  ctx.beginPath();
  ctx.moveTo(-26, -14);
  ctx.lineTo(-20, -16);
  ctx.lineTo(-20, -12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1a120c";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-22, -12);
  ctx.quadraticCurveTo(-24, -6, -28, -8);
  ctx.moveTo(-22, -12);
  ctx.quadraticCurveTo(-18, -6, -16, -9);
  ctx.stroke();

  // Cheek fluff
  ctx.fillStyle = FUR_DARK;
  ctx.beginPath();
  ctx.ellipse(4, -16, 7, 6, 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawEar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: number,
): void {
  ctx.fillStyle = STRIPE;
  ctx.beginPath();
  ctx.moveTo(x, y + 10);
  ctx.lineTo(x + dir * 10, y - 10);
  ctx.lineTo(x + dir * 18, y + 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = FUR;
  ctx.beginPath();
  ctx.moveTo(x + dir * 2, y + 8);
  ctx.lineTo(x + dir * 10, y - 5);
  ctx.lineTo(x + dir * 15, y + 7);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f4b8c5";
  ctx.beginPath();
  ctx.moveTo(x + dir * 5, y + 6);
  ctx.lineTo(x + dir * 10, y - 1);
  ctx.lineTo(x + dir * 13, y + 6);
  ctx.closePath();
  ctx.fill();
}

function drawLeg(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  swing: number,
  side: number,
  front = false,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(swing * 0.55);
  ctx.fillStyle = front ? FUR : FUR_DARK;
  roundBox(ctx, -6, 0, 12, 22, 5, front ? FUR : FUR_DARK);
  ctx.fillStyle = CREAM;
  ctx.beginPath();
  ctx.ellipse(side * 1, 22, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = STRIPE;
  ctx.fillRect(-3, 8, 6, 3);
  ctx.restore();
}

function roundBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}
