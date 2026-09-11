export type Gesture = "left" | "right" | "jump";

type Handler = (g: Gesture) => void;

const SWIPE = 28;

export function bindInput(canvas: HTMLCanvasElement, onGesture: Handler): () => void {
  let sx = 0;
  let sy = 0;
  let st = 0;
  let tracking = false;

  const onKey = (e: KeyboardEvent) => {
    const k = e.key;
    if (
      k === "ArrowLeft" ||
      k === "ArrowRight" ||
      k === "ArrowUp" ||
      k === " " ||
      k === "a" ||
      k === "A" ||
      k === "d" ||
      k === "D" ||
      k === "w" ||
      k === "W"
    ) {
      e.preventDefault();
    }
    if (k === "ArrowLeft" || k === "a" || k === "A") onGesture("left");
    else if (k === "ArrowRight" || k === "d" || k === "D") onGesture("right");
    else if (k === "ArrowUp" || k === "w" || k === "W" || k === " ") onGesture("jump");
  };

  const start = (x: number, y: number) => {
    tracking = true;
    sx = x;
    sy = y;
    st = performance.now();
  };

  const end = (x: number, y: number) => {
    if (!tracking) return;
    tracking = false;
    const dx = x - sx;
    const dy = y - sy;
    const dt = performance.now() - st;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (dt < 500 && (absX > SWIPE || absY > SWIPE)) {
      if (absY > absX && dy < 0) {
        onGesture("jump");
        return;
      }
      if (absX > absY) {
        onGesture(dx < 0 ? "left" : "right");
        return;
      }
    }

    const rect = canvas.getBoundingClientRect();
    const nx = (x - rect.left) / Math.max(1, rect.width);
    if (nx < 0.3) onGesture("left");
    else if (nx > 0.7) onGesture("right");
    else onGesture("jump");
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    canvas.setPointerCapture(e.pointerId);
    start(e.clientX, e.clientY);
  };

  const onPointerUp = (e: PointerEvent) => {
    end(e.clientX, e.clientY);
  };

  const onContext = (e: Event) => e.preventDefault();

  window.addEventListener("keydown", onKey, { passive: false });
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("contextmenu", onContext);

  return () => {
    window.removeEventListener("keydown", onKey);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointercancel", onPointerUp);
    canvas.removeEventListener("contextmenu", onContext);
  };
}
