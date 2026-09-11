const MUTE_KEY = "tigerRunner.muted";

export class Sfx {
  private ctx: AudioContext | null = null;
  muted = localStorage.getItem(MUTE_KEY) === "1";

  setMuted(muted: boolean): void {
    this.muted = muted;
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
    if (muted) this.ctx?.suspend().catch(() => undefined);
    else this.ctx?.resume().catch(() => undefined);
  }

  unlock(): void {
    if (this.muted) return;
    const ctx = this.ensure();
    if (ctx.state === "suspended") ctx.resume().catch(() => undefined);
  }

  coin(): void {
    this.beep(880, 0.07, "triangle", 0.08);
    this.beep(1320, 0.09, "sine", 0.05, 0.04);
  }

  jump(): void {
    this.sweep(220, 520, 0.12, 0.07);
  }

  lane(): void {
    this.beep(180, 0.05, "square", 0.04);
  }

  crash(): void {
    this.sweep(180, 40, 0.28, 0.12, "sawtooth");
  }

  private ensure(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    return this.ctx;
  }

  private beep(
    freq: number,
    dur: number,
    type: OscillatorType,
    gain: number,
    delay = 0,
  ): void {
    if (this.muted) return;
    const ctx = this.ensure();
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private sweep(
    from: number,
    to: number,
    dur: number,
    gain: number,
    type: OscillatorType = "sine",
  ): void {
    if (this.muted) return;
    const ctx = this.ensure();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
}
