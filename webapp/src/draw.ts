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
    horizon: h * 0.28,
    nearY: h * 0.76,
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

export function drawSky(ctx: CanvasRenderingContext2D, cam: Cam, time: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, cam.h);
  g.addColorStop(0, "#071016");
  g.addColorStop(0.28, "#123043");
  g.addColorStop(0.55, "#c45c28");
  g.addColorStop(1, "#2a150c");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cam.w, cam.h);

  ctx.fillStyle = "rgba(255, 210, 130, 0.85)";
  ctx.beginPath();
  ctx.arc(cam.w * 0.78, cam.horizon - 18, 26, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#08140f";
  const base = cam.horizon + 8;
  ctx.beginPath();
  ctx.moveTo(0, base + 40);
  for (let x = 0; x <= cam.w; x += 18) {
    const n = Math.sin(x * 0.04 + time * 0.15) * 10 + Math.sin(x * 0.11) * 16;
    ctx.lineTo(x, base - 28 - n);
  }
  ctx.lineTo(cam.w, base + 80);
  ctx.lineTo(0, base + 80);
  ctx.fill();
}

export function drawTrack(
  ctx: CanvasRenderingContext2D,
  cam: Cam,
  distance: number,
): void {
  const leftFar = laneX(cam, -0.65, persp(88));
  const rightFar = laneX(cam, 2.65, persp(88));
  const leftNear = laneX(cam, -0.65, persp(0));
  const rightNear = laneX(cam, 2.65, persp(0));

  ctx.beginPath();
  ctx.moveTo(leftFar, cam.horizon);
  ctx.lineTo(rightFar, cam.horizon);
  ctx.lineTo(rightNear, cam.nearY + 30);
  ctx.lineTo(leftNear, cam.nearY + 30);
  ctx.closePath();
  const soil = ctx.createLinearGradient(0, cam.horizon, 0, cam.h);
  soil.addColorStop(0, "#4a3118");
  soil.addColorStop(1, "#2b1a0d");
  ctx.fillStyle = soil;
  ctx.fill();

  for (let lane = 0; lane < 3; lane++) {
    const zSteps = 14;
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
      const stripe = Math.floor((distance * 0.35 + i) % 2) === 0;
      ctx.beginPath();
      ctx.moveTo(x0a, y0);
      ctx.lineTo(x0b, y0);
      ctx.lineTo(x1b, y1);
      ctx.lineTo(x1a, y1);
      ctx.closePath();
      ctx.fillStyle = stripe ? "#5c3b1a" : "#4e3116";
      ctx.fill();
    }
  }

  ctx.strokeStyle = "rgba(255, 214, 90, 0.55)";
  ctx.lineWidth = 2;
  for (const edge of [0.5, 1.5]) {
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

export function drawCoin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  spin: number,
): void {
  const squash = 0.35 + Math.abs(Math.cos(spin)) * 0.65;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s * squash, s);
  ctx.fillStyle = "#b8860b";
  ctx.beginPath();
  ctx.ellipse(0, 3, 12, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffd60a";
  ctx.beginPath();
  ctx.ellipse(0, 0, 12, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fff3a0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 7, 7, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.ellipse(-3, -3, 3, 2, -0.5, 0, Math.PI * 2);
  ctx.fill();
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
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 6, 28, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  roundBox(ctx, -26, -34, 52, 38, 6, "#8b4e1a");
  ctx.fillStyle = "#6e3910";
  ctx.fillRect(-22, -28, 8, 26);
  ctx.fillRect(-4, -28, 8, 26);
  ctx.fillRect(14, -28, 8, 26);
  ctx.fillStyle = "#c4c4c4";
  ctx.fillRect(-28, -18, 56, 6);
  ctx.fillRect(-28, -8, 56, 6);
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
  ctx.ellipse(0, 8, 22, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3d4f3a";
  ctx.beginPath();
  ctx.moveTo(-16, 6);
  ctx.lineTo(-20, -88);
  ctx.lineTo(0, -108);
  ctx.lineTo(22, -86);
  ctx.lineTo(16, 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2a3729";
  ctx.beginPath();
  ctx.moveTo(-6, 6);
  ctx.lineTo(-8, -80);
  ctx.lineTo(6, -80);
  ctx.lineTo(8, 6);
  ctx.fill();
  ctx.fillStyle = "#1e1510";
  ctx.fillRect(-10, -70, 5, 22);
  ctx.fillRect(2, -50, 6, 18);
  ctx.fillRect(-4, -30, 4, 16);
  ctx.restore();
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
