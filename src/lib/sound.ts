type SoundName =
  | 'click'
  | 'hover'
  | 'toggle-on'
  | 'toggle-off'
  | 'whoosh'
  | 'select'
  | 'deselect'
  | 'tick'
  | 'success'
  | 'open'
  | 'close';

let context: AudioContext | null = null;
let enabled = false;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!context) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  if (context.state === 'suspended') void context.resume();
  return context;
}

interface ToneOptions {
  type?: OscillatorType;
  frequency: number;
  duration: number;
  gain?: number;
  delay?: number;
  sweepTo?: number;
}

function playTone(ctx: AudioContext, options: ToneOptions) {
  const now = ctx.currentTime + (options.delay ?? 0);
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = options.type ?? 'sine';
  oscillator.frequency.setValueAtTime(options.frequency, now);
  if (options.sweepTo) {
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, options.sweepTo), now + options.duration);
  }

  const peak = options.gain ?? 0.08;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + options.duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(now);
  oscillator.stop(now + options.duration + 0.05);
}

const SOUND_PRESETS: Record<SoundName, ToneOptions[]> = {
  click: [{ type: 'sine', frequency: 520, duration: 0.09, gain: 0.07 }],
  hover: [{ type: 'sine', frequency: 720, duration: 0.05, gain: 0.025 }],
  'toggle-on': [
    { type: 'triangle', frequency: 440, duration: 0.12, gain: 0.07 },
    { type: 'triangle', frequency: 880, duration: 0.14, gain: 0.06, delay: 0.06 },
  ],
  'toggle-off': [
    { type: 'triangle', frequency: 660, duration: 0.12, gain: 0.07 },
    { type: 'triangle', frequency: 330, duration: 0.16, gain: 0.06, delay: 0.06 },
  ],
  whoosh: [{ type: 'sine', frequency: 180, sweepTo: 900, duration: 0.22, gain: 0.05 }],
  select: [
    { type: 'sine', frequency: 660, duration: 0.1, gain: 0.07 },
    { type: 'sine', frequency: 990, duration: 0.12, gain: 0.05, delay: 0.05 },
  ],
  deselect: [{ type: 'sine', frequency: 440, duration: 0.1, gain: 0.06 }],
  tick: [{ type: 'square', frequency: 1200, duration: 0.02, gain: 0.02 }],
  success: [
    { type: 'sine', frequency: 523, duration: 0.12, gain: 0.07 },
    { type: 'sine', frequency: 659, duration: 0.12, gain: 0.07, delay: 0.1 },
    { type: 'sine', frequency: 784, duration: 0.18, gain: 0.07, delay: 0.2 },
  ],
  open: [{ type: 'sine', frequency: 300, sweepTo: 600, duration: 0.18, gain: 0.06 }],
  close: [{ type: 'sine', frequency: 600, sweepTo: 300, duration: 0.18, gain: 0.06 }],
};

export function setSoundEnabled(value: boolean): void {
  enabled = value;
  if (value) getAudioContext();
}

export function isSoundEnabled(): boolean {
  return enabled;
}

export function playSound(name: SoundName): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  for (const tone of SOUND_PRESETS[name]) playTone(ctx, tone);
}

export function unlockAudio(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') void ctx.resume();
}
