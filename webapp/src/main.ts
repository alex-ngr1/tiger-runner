import { Sfx } from "./audio";
import { bindInput } from "./input";
import { Game } from "./game";
import { initTelegram } from "./telegram";

const canvas = document.querySelector<HTMLCanvasElement>("#game")!;
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Canvas 2D is required");

const overlay = document.querySelector<HTMLElement>("#overlay")!;
const panelMenu = document.querySelector<HTMLElement>("#panel-menu")!;
const panelOver = document.querySelector<HTMLElement>("#panel-over")!;
const hud = document.querySelector<HTMLElement>("#hud")!;
const hudScore = document.querySelector<HTMLElement>("#hud-score")!;
const hudCoins = document.querySelector<HTMLElement>("#hud-coins")!;
const hudBest = document.querySelector<HTMLElement>("#hud-best")!;
const menuBest = document.querySelector<HTMLElement>("#menu-best")!;
const overScore = document.querySelector<HTMLElement>("#over-score")!;
const overMeta = document.querySelector<HTMLElement>("#over-meta")!;
const playBtn = document.querySelector<HTMLButtonElement>("#play-btn")!;
const retryBtn = document.querySelector<HTMLButtonElement>("#retry-btn")!;
const menuBtn = document.querySelector<HTMLButtonElement>("#menu-btn")!;
const muteBtn = document.querySelector<HTMLButtonElement>("#mute-btn")!;

const tg = initTelegram();
const sfx = new Sfx();
const game = new Game(canvas, ctx, sfx, tg);

menuBest.textContent = String(game.best);
muteBtn.textContent = sfx.muted ? "🔇" : "🔊";

function showMenu(): void {
  game.mode = "menu";
  overlay.hidden = false;
  panelMenu.hidden = false;
  panelOver.hidden = true;
  hud.hidden = true;
  menuBest.textContent = String(game.best);
}

function showPlaying(): void {
  overlay.hidden = true;
  hud.hidden = false;
}

function showOver(): void {
  const snap = game.hud();
  overlay.hidden = false;
  panelMenu.hidden = true;
  panelOver.hidden = false;
  hud.hidden = false;
  overScore.textContent = String(snap.score);
  overMeta.textContent = `Coins ${snap.coins} · Distance ${Math.floor(snap.distance)}m · Best ${snap.best}`;
}

function play(): void {
  sfx.unlock();
  game.start();
  showPlaying();
}

playBtn.addEventListener("click", play);
retryBtn.addEventListener("click", play);
menuBtn.addEventListener("click", showMenu);
muteBtn.addEventListener("click", () => {
  sfx.setMuted(!sfx.muted);
  muteBtn.textContent = sfx.muted ? "🔇" : "🔊";
});

bindInput(canvas, (g) => {
  sfx.unlock();
  game.gesture(g);
});

const resize = () => game.resize();
window.addEventListener("resize", resize);
window.addEventListener("orientationchange", resize);
resize();

let last = performance.now();
let deadShown = false;

function frame(now: number): void {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  game.tick(dt);
  game.draw();

  if (game.mode === "playing") {
    deadShown = false;
    const snap = game.hud();
    hudScore.textContent = String(snap.score);
    hudCoins.textContent = String(snap.coins);
    hudBest.textContent = String(snap.best);
  } else if (game.mode === "dead" && !deadShown) {
    deadShown = true;
    showOver();
  }

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
showMenu();
