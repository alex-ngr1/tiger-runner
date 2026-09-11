export type TelegramWebApp = NonNullable<Window["Telegram"]>["WebApp"];

export function initTelegram(): TelegramWebApp | null {
  const tg = window.Telegram?.WebApp;
  if (!tg) return null;

  tg.ready();
  tg.expand();
  try {
    tg.setHeaderColor?.("#071016");
    tg.setBackgroundColor?.("#071016");
    tg.disableVerticalSwipes?.();
  } catch {
    // Older Telegram clients may not support every method.
  }
  return tg;
}

export function haptic(
  tg: TelegramWebApp | null,
  kind: "lane" | "jump" | "coin" | "crash",
): void {
  const h = tg?.HapticFeedback;
  if (!h) return;
  try {
    if (kind === "coin") h.notificationOccurred("success");
    else if (kind === "crash") h.notificationOccurred("error");
    else h.impactOccurred(kind === "jump" ? "medium" : "light");
  } catch {
    /* ignore */
  }
}
