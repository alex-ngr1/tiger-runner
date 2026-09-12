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

/** Horizontal run sheet: 6 frames × 157×256, served from webapp/public/. */
const RUN_FRAME_COUNT = 6;
const RUN_FRAME_W = 157;
const RUN_FRAME_H = 256;
const RUN_SHEET_SRC = `${import.meta.env.BASE_URL}korzh-run-sheet.png`;

/** Local-space height of the old vector tiger (ears to paws), used to match on-screen size. */
const RUNNER_LOCAL_H = 82;
/** Same ground contact as the old tiger shadow / hind paws. */
const RUNNER_FEET_Y = 38;

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

function runFrameIndex(pose: TigerPose): number {
  if (pose.airborne) return 0;
  const i = Math.floor(pose.phase) % RUN_FRAME_COUNT;
  return i < 0 ? i + RUN_FRAME_COUNT : i;
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
    const frames = RUN_FRAME_COUNT;
    const fw = sheet.naturalWidth / frames || RUN_FRAME_W;
    const fh = sheet.naturalHeight || RUN_FRAME_H;
    const frame = runFrameIndex(pose);
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
