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
  const hz = cam.horizon / cam.h;
  const g = ctx.createLinearGradient(0, 0, 0, cam.h);
  g.addColorStop(0, "#0a1020");
  g.addColorStop(Math.max(0.02, hz - 0.22), "#1a2a4c");
  g.addColorStop(Math.max(0.08, hz - 0.1), "#7a3d5c");
  g.addColorStop(Math.max(0.12, hz - 0.02), "#f08a40");
  g.addColorStop(hz + 0.02, "#c45c28");
  g.addColorStop(1, "#1a140e");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cam.w, cam.h);

  ctx.fillStyle = "rgba(255, 220, 140, 0.28)";
  ctx.beginPath();
  ctx.ellipse(cam.w * 0.55, cam.horizon - 4, cam.w * 0.55, 26, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 236, 190, 0.95)";
  ctx.beginPath();
  ctx.arc(cam.w * 0.78, cam.horizon - 28, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 200, 120, 0.2)";
  ctx.beginPath();
  ctx.arc(cam.w * 0.78, cam.horizon - 28, 44, 0, Math.PI * 2);
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
    { x: 0.04, w: 0.13, h: 52, hue: "#141820" },
    { x: 0.16, w: 0.1, h: 38, hue: "#10141c" },
    { x: 0.28, w: 0.15, h: 64, hue: "#181c26" },
    { x: 0.55, w: 0.12, h: 46, hue: "#12161e" },
    { x: 0.68, w: 0.18, h: 70, hue: "#0e1218" },
    { x: 0.88, w: 0.12, h: 42, hue: "#161a22" },
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
  soil.addColorStop(0, "#6a5a48");
  soil.addColorStop(0.45, "#4a3f34");
  soil.addColorStop(1, "#2e261e");
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
      ctx.fillStyle = stripe ? "#5c4d3d" : "#463a2e";
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
    ctx.strokeStyle = "rgba(255, 214, 80, 0.92)";
    ctx.lineWidth = 3;
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
    const y = groundY(cam, t);
    for (const side of [-1.2, 3.2] as const) {
      const x = laneX(cam, side, t);
      drawKiosk(ctx, x, y, s * 1.15, id + (side > 0 ? 17 : 0));
    }
    if (id % 3 === 0) {
      drawLamp(ctx, laneX(cam, -1.5, t), y, s * 0.9, time + id);
    }
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

function drawKiosk(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  id: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 8, 28, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  roundBox(ctx, -26, -70, 52, 72, 3, id % 2 ? "#d8c39a" : "#c4b48a");
  ctx.fillStyle = "#2f6b46";
  ctx.fillRect(-26, -70, 52, 12);
  ctx.fillStyle = "#c41e3a";
  for (let i = 0; i < 6; i++) ctx.fillRect(-26 + i * 9, -82, 7, 12);
  ctx.fillStyle = "#f4f0e4";
  for (let i = 0; i < 6; i++) ctx.fillRect(-22 + i * 9, -82, 4, 12);
  ctx.fillStyle = "#7ec8e8";
  ctx.fillRect(-16, -52, 32, 20);
  ctx.strokeStyle = "#2a3540";
  ctx.lineWidth = 2;
  ctx.strokeRect(-16, -52, 32, 20);
  ctx.fillStyle = "#f0c14b";
  ctx.font = "bold 9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("ПИВО", 0, -58);
  ctx.fillStyle = "#1c2430";
  ctx.fillRect(-8, -24, 16, 20);
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
  const h = Math.max(14, 40 * s);
  const ratio = img && img.naturalWidth ? img.naturalWidth / img.naturalHeight : 0.36;
  const w = h * ratio;
  ctx.save();
  ctx.fillStyle = "rgba(255, 122, 182, 0.22)";
  ctx.beginPath();
  ctx.ellipse(x, y + 3 * s + bob, 7 * s, 2.4 * s, 0, 0, Math.PI * 2);
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
  lean = 0,
  squash = 1,
): void {
  const img = sprites.bottle;
  const h = 92 * s * squash;
  const ratio = img && img.naturalWidth ? img.naturalWidth / img.naturalHeight : 0.55;
  const w = (h / squash) * ratio * (2 - squash);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath();
  ctx.ellipse(0, 6 * s, 18 * s, 5.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  // Cheap "running feet" so they read as pursuers, not pickups.
  const gait = Math.sin(hop * 0.35 + lean * 4);
  ctx.fillStyle = "#1a1410";
  ctx.beginPath();
  ctx.ellipse(-9 * s + gait * 7 * s, 5 * s, 7 * s, 2.6 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(9 * s - gait * 7 * s, 5 * s, 7 * s, 2.6 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  if (img && img.naturalWidth) {
    ctx.drawImage(img, -w / 2, -h - hop, w, h);
  } else {
    drawBottleFallback(ctx, 0, -hop, s);
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

  // Low Subway-style hurdle — jump it.
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(-6, -28, 5, 30);
  ctx.fillRect(10, -28, 5, 30);
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i % 2 ? "#f0c14b" : "#1a1a1a";
    ctx.fillRect(-22 + i * 10, -32, 10, 10);
  }
  ctx.fillStyle = "#c41e3a";
  ctx.fillRect(-24, -22, 52, 5);
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

  // Tall lane blocker — cannot jump.
  ctx.fillStyle = "#3a3a40";
  ctx.fillRect(-20, -96, 40, 98);
  ctx.fillStyle = "#f0c14b";
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(-20, -90 + i * 12, 40, 4);
  }
  ctx.fillStyle = "#c41e3a";
  ctx.fillRect(-22, -100, 44, 8);
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

/** Horizontal run sheet from КоржВидео, served from webapp/public/. */
const RUN_FRAME_W = 157;
const RUN_FRAME_H = 256;
const RUN_SHEET_SRC = `${import.meta.env.BASE_URL}korzh-run-sheet.png`;

/** Local-space height used to match on-screen size. */
const RUNNER_LOCAL_H = 82;
/** Same ground contact as the old tiger shadow / hind paws. */
const RUNNER_FEET_Y = 38;

function sheetFrameCount(sheet: HTMLImageElement): number {
  const guess = Math.round(sheet.naturalWidth / (sheet.naturalHeight * (RUN_FRAME_W / RUN_FRAME_H)));
  return Math.min(8, Math.max(4, guess || 5));
}

let runSheet: HTMLImageElement | null = null;
let runSheetState: "idle" | "loading" | "ready" | "error" = "idle";

function ensureRunSheet(): HTMLImageElement | null {
  if (runSheetState === "ready" && runSheet && runSheet.naturalWidth > 0) {
    return runSheet;
  }
  if (runSheetState === "error") return null;
  if (runSheetState === "loading") {
    return runSheet && runSheet.complete && runSheet.naturalWidth > 0 ? runSheet : null;
  }

  runSheetState = "loading";
  const img = new Image();
  img.decoding = "async";
  img.onload = () => {
    runSheet = img;
    runSheetState = img.naturalWidth > 0 ? "ready" : "error";
    if (runSheetState === "error") {
      console.warn(
        `[draw] ${RUN_SHEET_SRC} loaded but is empty. Place korzh-run-sheet.png in webapp/public/.`,
      );
    }
  };
  img.onerror = () => {
    runSheetState = "error";
    console.warn(
      `[draw] Failed to load ${RUN_SHEET_SRC}. Copy korzh-run-sheet.png into webapp/public/.`,
    );
  };
  img.src = RUN_SHEET_SRC;
  runSheet = img;
  return img.complete && img.naturalWidth > 0 ? img : null;
}

ensureRunSheet();

function runFrameIndex(pose: TigerPose, frames: number): number {
  if (pose.airborne) return 0;
  const i = Math.floor(pose.phase) % frames;
  return i < 0 ? i + frames : i;
}

export function drawTiger(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  pose: TigerPose,
): void {
  const { airborne, lean, dead } = pose;
  const sheet = ensureRunSheet();

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.rotate(lean * 0.16 + (dead ? 0.6 : 0));

  const bob = airborne ? -14 : 0;
  ctx.translate(0, bob);

  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(0, RUNNER_FEET_Y - bob * 0.2, 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  if (sheet && sheet.naturalWidth > 0) {
    const frames = sheetFrameCount(sheet);
    const fw = sheet.naturalWidth / frames || RUN_FRAME_W;
    const fh = sheet.naturalHeight || RUN_FRAME_H;
    const frame = runFrameIndex(pose, frames);
    const localW = RUNNER_LOCAL_H * (fw / fh);
    const destX = -localW / 2;
    const destY = RUNNER_FEET_Y - RUNNER_LOCAL_H;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(sheet, frame * fw, 0, fw, fh, destX, destY, localW, RUNNER_LOCAL_H);
  }

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
