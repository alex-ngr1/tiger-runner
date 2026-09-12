import { Sfx } from "./audio";
import {
  drawAltushka,
  drawBarrier,
  drawBottle,
  drawSky,
  drawTall,
  drawTiger,
  drawThreatVignette,
  drawTrack,
  drawWayside,
  groundY,
  laneX,
  makeCam,
  persp,
  type Cam,
} from "./draw";
import { haptic, type TelegramWebApp } from "./telegram";

export type GameMode = "menu" | "playing" | "dead";

const BEST_KEY = "tigerRunner.bestScore";
const PLAYER_Z = 0.95;
const SPAWN_Z = 86;
const GRAVITY = 32;
const JUMP_V = 12.2;
const LANE_SPEED = 10;
const BARRIER_CLEAR = 1.05;
const CHASE_GIVE_UP = 9.5;
const INVULN = 0.9;

type Kind = "altushka" | "barrier" | "tall";

interface Entity {
  kind: Kind;
  lane: number;
  z: number;
  taken: boolean;
  hit: boolean;
  missed: boolean;
}

interface Chaser {
  lane: number;
  targetLane: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
}

export interface HudSnap {
  score: number;
  coins: number;
  altushky: number;
  best: number;
  distance: number;
  threat: number;
}

export class Game {
  mode: GameMode = "menu";
  score = 0;
  coins = 0;
  best = Number(localStorage.getItem(BEST_KEY) || 0);
  distance = 0;

  private lane = 1;
  private targetLane = 1;
  private y = 0;
  private vy = 0;
  private speed = 22;
  private entities: Entity[] = [];
  private spawnZ = 18;
  private phase = 0;
  private shake = 0;
  private particles: Particle[] = [];
  private time = 0;
  private w = 360;
  private h = 640;
  private cam: Cam = makeCam(360, 640);
  private dpr = 1;
  private chasing = false;
  private chasers: Chaser[] = [];
  private chaseTick = 0;
  private chaseAge = 0;
  private stumble = 0;
  private invuln = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly ctx: CanvasRenderingContext2D,
    private readonly sfx: Sfx,
    private readonly tg: TelegramWebApp | null,
  ) {}

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.w = Math.max(1, rect.width);
    this.h = Math.max(1, rect.height);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(this.w * this.dpr);
    this.canvas.height = Math.floor(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.cam = makeCam(this.w, this.h);
  }

  start(): void {
    this.mode = "playing";
    this.score = 0;
    this.coins = 0;
    this.distance = 0;
    this.lane = 1;
    this.targetLane = 1;
    this.y = 0;
    this.vy = 0;
    this.speed = 22;
    this.entities = [];
    this.spawnZ = 16;
    this.shake = 0;
    this.particles = [];
    this.chasing = false;
    this.chasers = [];
    this.chaseTick = 0;
    this.chaseAge = 0;
    this.stumble = 0;
    this.invuln = 0;
    this.seedIntro();
  }

  gesture(g: "left" | "right" | "jump"): void {
    if (this.mode !== "playing") return;
    if (g === "left") {
      if (this.targetLane > 0) {
        this.targetLane -= 1;
        this.sfx.lane();
        haptic(this.tg, "lane");
      }
    } else if (g === "right") {
      if (this.targetLane < 2) {
        this.targetLane += 1;
        this.sfx.lane();
        haptic(this.tg, "lane");
      }
    } else if (g === "jump" && this.y <= 0.02) {
      this.vy = JUMP_V;
      this.sfx.jump();
      haptic(this.tg, "jump");
    }
  }

  hud(): HudSnap {
    return {
      score: this.score,
      coins: this.coins,
      altushky: this.coins,
      best: this.best,
      distance: this.distance,
      threat: this.threat(),
    };
  }

  tick(dt: number): void {
    this.time += dt;
    this.phase += dt * (this.mode === "playing" ? 10 + this.speed * 0.12 : 6);
    this.shake = Math.max(0, this.shake - dt * 8);
    this.stumble = Math.max(0, this.stumble - dt);
    this.invuln = Math.max(0, this.invuln - dt);

    if (this.mode === "playing") {
      const slow = this.stumble > 0 ? 0.72 : 1;
      this.distance += this.speed * dt * slow;
      this.speed = 22 + Math.min(26, this.distance / 90) + Math.min(8, this.distance / 420);
      this.score = Math.floor(this.distance * 2) + this.coins * 10;

      const dir = Math.sign(this.targetLane - this.lane);
      this.lane += dir * Math.min(Math.abs(this.targetLane - this.lane), LANE_SPEED * dt);

      this.vy -= GRAVITY * dt;
      this.y += this.vy * dt;
      if (this.y < 0) {
        this.y = 0;
        this.vy = 0;
      }

      for (const e of this.entities) e.z -= this.speed * dt * slow;
      this.spawnAhead();
      this.noteMisses();
      this.collide();
      this.tickChase(dt);
      this.entities = this.entities.filter((e) => e.z > -6 && !e.taken);
    } else if (this.mode === "menu") {
      this.distance += 8 * dt;
      for (const e of this.entities) e.z -= 10 * dt;
      if (this.entities.length < 6) this.spawnMenuBits();
      this.entities = this.entities.filter((e) => e.z > -4);
    }

    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 80 * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  draw(): void {
    const { ctx, cam } = this;
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.save();
    if (this.shake > 0) {
      ctx.translate((Math.random() - 0.5) * this.shake * 10, (Math.random() - 0.5) * this.shake * 8);
    }

    drawSky(ctx, cam, this.time);
    drawTrack(ctx, cam, this.distance);
    drawWayside(ctx, cam, this.distance, this.time);

    const drawList = [...this.entities].sort((a, b) => b.z - a.z);
    const playerDrawZ = PLAYER_Z;
    let playerDrawn = false;

    const paintPlayer = () => {
      playerDrawn = true;
      const t = persp(playerDrawZ);
      const x = laneX(cam, this.lane, t);
      const gy = groundY(cam, t);
      const jumpPx = this.y * 42 * t;
      const scale = (cam.h * 0.42) / 82;
      drawTiger(ctx, x, gy - 8 - jumpPx, scale, {
        phase: this.phase,
        airborne: this.y > 0.08,
        lean: this.targetLane - this.lane,
        dead: this.mode === "dead",
      });
    };

    if (this.mode === "menu") {
      for (const e of drawList) this.drawEntity(e);
      drawTiger(ctx, cam.w * 0.5, cam.h * 0.58, (cam.h * 0.36) / 82, {
        phase: this.phase,
        airborne: false,
        lean: Math.sin(this.time * 2) * 0.35,
      });
    } else {
      for (const e of drawList) {
        if (!playerDrawn && e.z < playerDrawZ) paintPlayer();
        this.drawEntity(e);
      }
      if (!playerDrawn) paintPlayer();
    }

    if (this.chasing || (this.mode === "dead" && this.chasers.length > 0)) {
      this.drawChasers();
    }

    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (this.chasing) {
      drawThreatVignette(ctx, cam, this.threat());
    }

    ctx.restore();
  }

  private threat(): number {
    if (!this.chasing) return 0;
    return Math.max(0.35, Math.min(1, 0.4 + this.chaseAge / CHASE_GIVE_UP));
  }

  private tickChase(dt: number): void {
    if (!this.chasing) return;
    this.chaseAge += dt;
    if (this.chaseAge >= CHASE_GIVE_UP) {
      this.chasing = false;
      this.chasers = [];
      return;
    }
    this.chaseTick += dt;
    const follow = Math.round(this.lane);
    const first = this.chasers[0];
    const second = this.chasers[1];
    if (first) first.targetLane = follow;
    if (this.chaseTick > 0.85) {
      this.chaseTick = 0;
      const others = [0, 1, 2].filter((l) => l !== follow);
      const pick = others[Math.floor(Math.random() * others.length)] ?? 0;
      if (second) second.targetLane = pick;
    }
    this.moveChasers(dt, 4.2);
  }

  /** Screenshot / debug: treat as crashing a barrier. */
  debugHit(): void {
    if (this.mode !== "playing") return;
    this.crashObstacle();
  }

  private moveChasers(dt: number, speed: number): void {
    for (const c of this.chasers) {
      const dir = Math.sign(c.targetLane - c.lane);
      c.lane += dir * Math.min(Math.abs(c.targetLane - c.lane), speed * dt);
    }
  }

  private drawChasers(): void {
    const { cam, ctx } = this;
    const caught = this.mode === "dead";
    const copZ = caught ? PLAYER_Z - 0.15 : 0.22;
    for (let i = 0; i < this.chasers.length; i++) {
      const c = this.chasers[i];
      if (!c) continue;
      const t = persp(copZ + i * 0.08);
      const x = laneX(cam, c.lane, t);
      const gy = groundY(cam, t);
      const step = Math.sin(this.time * 16 + i * 2.2);
      const hop = Math.abs(step) * 14;
      const lean = (c.targetLane - c.lane) * 0.28 + step * 0.09;
      const squash = 1 - Math.abs(step) * 0.1;
      const s = 1.35 + (caught ? 0.25 : 0);
      drawBottle(ctx, x, gy + 18, s, hop, lean, squash);
    }
  }

  private drawEntity(e: Entity): void {
    if (e.taken) return;
    const t = persp(e.z);
    const x = laneX(this.cam, e.lane, t);
    const y = groundY(this.cam, t);
    const s = Math.max(0.12, t);
    if (e.kind === "altushka") {
      drawAltushka(this.ctx, x, y - 10 * s, s * 0.95, this.time * 6 + e.z);
    } else if (e.kind === "barrier") drawBarrier(this.ctx, x, y, s * 1.05);
    else drawTall(this.ctx, x, y, s * 1.1);
  }

  private spawnAhead(): void {
    while (this.spawnZ < this.distance + SPAWN_Z) {
      this.placeWave(this.spawnZ - this.distance + SPAWN_Z);
      const gap = 13 - Math.min(5.5, this.distance / 220);
      this.spawnZ += gap + Math.random() * 3;
    }
  }

  private seedIntro(): void {
    this.entities.push(
      this.make("altushka", 1, 18),
      this.make("altushka", 1, 22),
      this.make("altushka", 1, 26),
      this.make("barrier", 0, 34),
      this.make("altushka", 2, 38),
    );
  }

  private spawnMenuBits(): void {
    const lane = Math.floor(Math.random() * 3);
    this.entities.push(this.make(Math.random() < 0.7 ? "altushka" : "barrier", lane, SPAWN_Z));
  }

  private placeWave(z: number): void {
    const r = Math.random();
    if (r < 0.22) {
      this.add("barrier", Math.floor(Math.random() * 3), z);
    } else if (r < 0.4) {
      const skip = Math.floor(Math.random() * 3);
      for (let lane = 0; lane < 3; lane++) {
        if (lane !== skip) this.add("barrier", lane, z);
      }
    } else if (r < 0.52) {
      const tallLane = Math.floor(Math.random() * 3);
      this.add("tall", tallLane, z);
      const coinLane = (tallLane + 1 + Math.floor(Math.random() * 2)) % 3;
      this.add("altushka", coinLane, z + 2);
    } else if (r < 0.72) {
      const lane = Math.floor(Math.random() * 3);
      for (let i = 0; i < 5; i++) this.add("altushka", lane, z + i * 2.2);
    } else if (r < 0.88) {
      const lane = Math.floor(Math.random() * 3);
      this.add("barrier", lane, z);
      this.add("altushka", lane, z - 0.4);
      this.add("altushka", lane, z + 1.8);
      this.add("altushka", lane, z + 3.6);
    } else {
      this.add("barrier", 0, z);
      this.add("barrier", 2, z + 7);
      this.add("altushka", 1, z + 3);
      this.add("altushka", 1, z + 5);
    }
  }

  private add(kind: Kind, lane: number, z: number): void {
    this.entities.push(this.make(kind, lane, z));
  }

  private make(kind: Kind, lane: number, z: number): Entity {
    return { kind, lane, z, taken: false, hit: false, missed: false };
  }

  private noteMisses(): void {
    for (const e of this.entities) {
      if (e.kind !== "altushka" || e.taken || e.missed) continue;
      if (e.z >= PLAYER_Z - 0.85) continue;
      e.missed = true;
      if (this.chasing) this.chaseAge = Math.max(0, this.chaseAge - 0.8);
    }
  }

  private collide(): void {
    const pLane = Math.round(this.lane);
    for (const e of this.entities) {
      if (e.taken || e.hit) continue;
      if (e.z > PLAYER_Z + 1.1 || e.z < PLAYER_Z - 0.7) continue;
      if (Math.abs(e.lane - pLane) > 0.45) continue;

      if (e.kind === "altushka") {
        e.taken = true;
        this.coins += 1;
        this.score = Math.floor(this.distance * 2) + this.coins * 10;
        this.sfx.coin();
        haptic(this.tg, "coin");
        this.burst(e, ["#ff7ab6", "#1a1a1a", "#ffe3f0"]);
        continue;
      }

      const jumped = e.kind === "barrier" && this.y >= BARRIER_CLEAR;
      if (jumped) continue;
      if (this.invuln > 0) {
        e.hit = true;
        continue;
      }

      e.hit = true;
      this.crashObstacle();
    }
  }

  private crashObstacle(): void {
    if (this.chasing) {
      this.die();
      return;
    }
    this.chasing = true;
    this.chaseAge = 0;
    this.invuln = INVULN;
    this.stumble = 0.4;
    this.shake = 0.75;
    const follow = Math.round(this.lane);
    this.chasers = [
      { lane: follow, targetLane: follow },
      { lane: (follow + 2) % 3, targetLane: (follow + 2) % 3 },
    ];
    this.sfx.stumble();
    haptic(this.tg, "miss");
    const t = persp(PLAYER_Z);
    const x = laneX(this.cam, this.lane, t);
    const y = groundY(this.cam, t);
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2;
      this.particles.push({
        x,
        y: y - 16,
        vx: Math.cos(a) * 90,
        vy: Math.sin(a) * 70 - 20,
        life: 0.4,
        max: 0.4,
        color: i % 2 ? "#c41e3a" : "#d4b24a",
        size: 3,
      });
    }
  }

  private burst(e: Entity, colors: string[]): void {
    const t = persp(Math.max(0.2, e.z));
    const x = laneX(this.cam, e.lane, t);
    const y = groundY(this.cam, t) - 24 * t;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * 80,
        vy: Math.sin(a) * 80 - 20,
        life: 0.35,
        max: 0.35,
        color: colors[i % colors.length] ?? "#ff7ab6",
        size: 3,
      });
    }
  }

  private die(): void {
    if (this.mode !== "playing") return;
    this.mode = "dead";
    this.shake = 1;
    this.sfx.crash();
    haptic(this.tg, "crash");
    if (this.score > this.best) {
      this.best = this.score;
      localStorage.setItem(BEST_KEY, String(this.best));
    }
    const t = persp(PLAYER_Z);
    const x = laneX(this.cam, this.lane, t);
    const y = groundY(this.cam, t);
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      this.particles.push({
        x,
        y: y - 20,
        vx: Math.cos(a) * 120,
        vy: Math.sin(a) * 90 - 40,
        life: 0.55,
        max: 0.55,
        color: i % 2 ? "#c41e3a" : "#d4b24a",
        size: 4,
      });
    }
  }
}
