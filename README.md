# Tiger Runner

Telegram Mini App (WebApp) endless runner inspired by Subway Surfers. You play as a **tiger** on a 3-lane jungle track: swipe, jump, grab coins, don’t eat a tree.

Playable inside Telegram and in a normal mobile/desktop browser.

## Features (MVP)

- Endless 3-lane runner, `requestAnimationFrame` canvas (no heavy 3D)
- Swipe / tap sides / arrow keys to change lanes
- Jump: swipe up, tap center, Space / ArrowUp
- Crates (jumpable) and tall trees (not jumpable) — collision ends the run
- Coins; score = distance + coins; best score in `localStorage`
- Start / Game Over / Restart UI, mobile-first for Telegram WebApp
- Drawn tiger sprite (stripes, ears, tail — not a blank box)
- aiogram 3.x bot with **Play · Грати** WebApp button

## Layout

```
bot/        Telegram bot (Python, aiogram 3)
webapp/     Vite + TypeScript canvas game
```

## Run the game locally (browser)

Needs Node 20+.

```bash
cd webapp
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`). On a phone, use your LAN IP from the Vite output, or `npm run preview` after `npm run build`.

Keyboard: **A/D** or arrows to switch lanes, **Space / W / ↑** to jump.
Touch: swipe left/right, swipe up to jump; tap left/right thirds of the screen, tap center to jump.

## Run the Telegram bot

1. Create a bot with [@BotFather](https://t.me/BotFather) → `/newbot`. Copy the token.
2. Host the WebApp over **HTTPS**. Telegram will not open `http://localhost` as a Mini App.
   - Deploy `webapp/dist` (after `npm run build`) to any static host, or run Docker and put a tunnel in front.
   - For a quick public URL: `npx ngrok http 5173` (or `cloudflared tunnel`) while `npm run dev` is running.
3. Copy `.env.example` to `.env` and fill it in:

```bash
cp .env.example .env
```

```
BOT_TOKEN=123456:ABC...
WEBAPP_URL=https://your-public-https-origin
```

`WEBAPP_URL` must be the origin that serves the game (no trailing path required if the app is at `/`).

4. Install and start the bot:

```bash
cd bot
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python bot.py
```

5. In Telegram, open your bot → **Start**. Tap **Play · Грати** (inline button, reply keyboard, and the chat menu button all open the same WebApp).

### BotFather checklist

- `/setmenubutton` is set automatically by the bot on startup.
- If the WebApp refuses to open, in BotFather use `/setdomain` for your HTTPS host (needed on some clients).

## Docker Compose (optional)

```bash
cp .env.example .env
# set BOT_TOKEN and WEBAPP_URL (public HTTPS URL that points at the webapp service)
docker compose up --build
```

The `webapp` service listens on `http://localhost:8080`. Point `WEBAPP_URL` at a public HTTPS reverse-proxy/tunnel to that port. The bot still needs a reachable HTTPS Mini App URL; Compose does not magically give you TLS.

## Phase 2 (out of scope)

Not in this MVP, on purpose:

- Multiplayer
- Telegram Stars / payments / shop
- Heavy 3D / Phaser stack
- Server-side leaderboard (best score is device-local for now)

## Notes

- Mid-range phones: canvas DPR is capped at 2, assets are drawn (no image atlases).
- Mute persists in `localStorage` (`tigerRunner.muted`).
- Best score key: `tigerRunner.bestScore`.
