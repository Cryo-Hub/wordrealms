import { useSettingsStore } from '../stores/settingsStore';

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function enabled(): boolean {
  try {
    return useSettingsStore.getState().soundEnabled;
  } catch {
    return true;
  }
}

/** Erste Nutzerinteraktion: AudioContext aktivieren. */
export function initAudioOnGesture(): void {
  void getCtx();
}

export const soundService = {
  letterSelect(): void {
    if (!enabled()) return;
    const c = getCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = 800;
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.1, c.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.05);
    osc.connect(g);
    g.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.06);
  },

  wordValid(): void {
    if (!enabled()) return;
    const c = getCtx();
    if (!c) return;
    const notes = [523, 659, 784];
    const noteDur = 0.08;
    notes.forEach((f, i) => {
      const t = c.currentTime + i * noteDur * 0.85;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.15, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + noteDur);
      osc.connect(g);
      g.connect(c.destination);
      osc.start(t);
      osc.stop(t + noteDur + 0.02);
    });
  },

  wordInvalid(): void {
    if (!enabled()) return;
    const c = getCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 150;
    g.gain.setValueAtTime(0.1, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.2);
    osc.connect(g);
    g.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.22);
  },

  wordExcellent(): void {
    if (!enabled()) return;
    const c = getCtx();
    if (!c) return;
    const notes = [523, 587, 659, 698, 784];
    const d = 0.11;
    notes.forEach((f, i) => {
      const t = c.currentTime + i * d * 0.88;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      osc.connect(g);
      g.connect(c.destination);
      osc.start(t);
      osc.stop(t + d + 0.06);
    });
  },

  buildingPlaced(): void {
    if (!enabled()) return;
    const c = getCtx();
    if (!c) return;
    const t0 = c.currentTime;
    [
      { f: 100, t: 'sine' as const },
      { f: 1200, t: 'sine' as const },
    ].forEach(({ f }) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.2, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3);
      osc.connect(g);
      g.connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + 0.32);
    });
  },

  puzzleComplete(): void {
    if (!enabled()) return;
    const c = getCtx();
    if (!c) return;
    const scale = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25];
    const step = 0.12;
    scale.forEach((f, i) => {
      const t = c.currentTime + i * step;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + step * 0.92);
      osc.connect(g);
      g.connect(c.destination);
      osc.start(t);
      osc.stop(t + step + 0.04);
    });
  },

  dailyStreak(): void {
    if (!enabled()) return;
    const c = getCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.15, c.currentTime + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.5);
    osc.connect(g);
    g.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.52);
  },
};
