import { getAudioContext } from '@/lib/sound';

/**
 * Procedural ambient soundscapes for the page.
 *
 * Everything is synthesised with the Web Audio API (filtered noise, short
 * tones and slow LFOs), so there are no audio files to download and no
 * licensing to worry about. Each scene is a small graph of looping beds plus
 * randomly scheduled one-shots (cars, birds, cups, thunder...).
 */

export type AmbienceScene = 'city' | 'rain' | 'cafe' | 'night';

export interface AmbienceSceneInfo {
  id: AmbienceScene;
  label: string;
  description: string;
}

export const AMBIENCE_SCENES: AmbienceSceneInfo[] = [
  { id: 'city', label: 'Місто', description: 'Гул траси, далекі гудки, птахи' },
  { id: 'rain', label: 'Дощ', description: 'Дощ по даху і тихий грім' },
  { id: 'cafe', label: 'Кав’ярня', description: 'Розмови, чашки, кавомашина' },
  { id: 'night', label: 'Ніч', description: 'Цвіркуни, вітер, далекі авто' },
];

type NoiseColor = 'white' | 'pink' | 'brown';

interface SceneHandle {
  output: GainNode;
  fadeOutAndStop: (ctx: AudioContext, seconds: number) => void;
}

interface ActiveScene {
  scene: AmbienceScene;
  handle: SceneHandle;
}

const noiseCache = new Map<NoiseColor, AudioBuffer>();

let master: GainNode | null = null;
let masterContext: AudioContext | null = null;
let active: ActiveScene | null = null;
let volume = 0.45;
let running = false;
let pendingStart: { scene: AmbienceScene; token: symbol } | null = null;

type RunningListener = (running: boolean) => void;
const runningListeners = new Set<RunningListener>();

function setRunning(value: boolean): void {
  if (running === value) return;
  running = value;
  for (const listener of runningListeners) listener(value);
}

/* ------------------------------------------------------------------ */
/*  Noise + node helpers                                              */
/* ------------------------------------------------------------------ */

function getNoiseBuffer(ctx: AudioContext, color: NoiseColor): AudioBuffer {
  const cached = noiseCache.get(color);
  if (cached) return cached;

  const seconds = 4;
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let last = 0;
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;

  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    if (color === 'white') {
      data[i] = white * 0.6;
    } else if (color === 'brown') {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    } else {
      // Paul Kellet's economy pink-noise filter.
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.18;
    }
  }

  noiseCache.set(color, buffer);
  return buffer;
}

function noiseSource(ctx: AudioContext, color: NoiseColor): AudioBufferSourceNode {
  const source = ctx.createBufferSource();
  source.buffer = getNoiseBuffer(ctx, color);
  source.loop = true;
  return source;
}

function makeGain(ctx: AudioContext, value: number): GainNode {
  const gain = ctx.createGain();
  gain.gain.value = value;
  return gain;
}

function makeFilter(ctx: AudioContext, type: BiquadFilterType, frequency: number, q = 1): BiquadFilterNode {
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = frequency;
  filter.Q.value = q;
  return filter;
}

function addLfo(ctx: AudioContext, param: AudioParam, rate: number, depth: number, sources: AudioScheduledSourceNode[]): void {
  const oscillator = ctx.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.value = rate;
  const gain = makeGain(ctx, depth);
  oscillator.connect(gain);
  gain.connect(param);
  oscillator.start();
  sources.push(oscillator);
}

/** Repeat `fn` at a random interval, returning a cancel function. */
function every(minMs: number, maxMs: number, fn: () => void): () => void {
  let timer = 0;
  let cancelled = false;

  const tick = () => {
    if (cancelled) return;
    fn();
    timer = window.setTimeout(tick, minMs + Math.random() * (maxMs - minMs));
  };

  timer = window.setTimeout(tick, minMs + Math.random() * (maxMs - minMs));

  return () => {
    cancelled = true;
    window.clearTimeout(timer);
  };
}

/* ------------------------------------------------------------------ */
/*  One-shot details                                                  */
/* ------------------------------------------------------------------ */

function playCarPass(ctx: AudioContext, destination: AudioNode, peak: number): void {
  const now = ctx.currentTime;
  const source = ctx.createBufferSource();
  source.buffer = getNoiseBuffer(ctx, 'pink');
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 1.2;
  filter.frequency.setValueAtTime(280, now);
  filter.frequency.exponentialRampToValueAtTime(950, now + 1.1);
  filter.frequency.exponentialRampToValueAtTime(220, now + 3);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.8);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.9);

  const panner = ctx.createStereoPanner();
  panner.pan.value = Math.random() * 1.6 - 0.8;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(panner);
  panner.connect(destination);
  source.start(now);
  source.stop(now + 3.1);
  source.onended = () => {
    source.disconnect();
    filter.disconnect();
    gain.disconnect();
    panner.disconnect();
  };
}

function playHorn(ctx: AudioContext, destination: AudioNode): void {
  const now = ctx.currentTime + 0.05;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.016, now + 0.06);
  gain.gain.setValueAtTime(0.016, now + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
  gain.connect(destination);

  for (const frequency of [392, 494]) {
    const oscillator = ctx.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    oscillator.start(now);
    oscillator.stop(now + 0.55);
    oscillator.onended = () => oscillator.disconnect();
  }

  window.setTimeout(() => gain.disconnect(), 800);
}

function playBird(ctx: AudioContext, destination: AudioNode): void {
  const now = ctx.currentTime;
  const chirps = 2 + Math.floor(Math.random() * 3);
  const panner = ctx.createStereoPanner();
  panner.pan.value = Math.random() * 1.4 - 0.7;
  panner.connect(destination);

  for (let i = 0; i < chirps; i += 1) {
    const start = now + i * 0.12;
    const base = 2400 + Math.random() * 1600;
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(base, start);
    oscillator.frequency.exponentialRampToValueAtTime(base * 1.4, start + 0.06);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.028, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);

    oscillator.connect(gain);
    gain.connect(panner);
    oscillator.start(start);
    oscillator.stop(start + 0.16);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }

  window.setTimeout(() => panner.disconnect(), (chirps * 0.12 + 0.4) * 1000);
}

function playDroplet(ctx: AudioContext, destination: AudioNode): void {
  const now = ctx.currentTime;
  const source = ctx.createBufferSource();
  source.buffer = getNoiseBuffer(ctx, 'white');

  const filter = makeFilter(ctx, 'bandpass', 1800 + Math.random() * 3000, 6);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.05, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  source.start(now, Math.random() * 3, 0.12);
  source.onended = () => {
    source.disconnect();
    filter.disconnect();
    gain.disconnect();
  };
}

function playThunder(ctx: AudioContext, destination: AudioNode): void {
  const now = ctx.currentTime;
  const source = noiseSource(ctx, 'brown');
  const filter = makeFilter(ctx, 'lowpass', 120, 0.6);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.3, now + 1.2);
  gain.gain.exponentialRampToValueAtTime(0.14, now + 2.6);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.2);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  source.start(now);
  source.stop(now + 5.3);
  source.onended = () => {
    source.disconnect();
    filter.disconnect();
    gain.disconnect();
  };
}

function playCupClink(ctx: AudioContext, destination: AudioNode): void {
  const now = ctx.currentTime;
  const base = 1700 + Math.random() * 1100;
  const panner = ctx.createStereoPanner();
  panner.pan.value = Math.random() * 1.2 - 0.6;
  panner.connect(destination);

  for (const [frequency, peak] of [
    [base, 0.02],
    [base * 1.62, 0.012],
  ] as const) {
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    oscillator.connect(gain);
    gain.connect(panner);
    oscillator.start(now);
    oscillator.stop(now + 0.4);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }

  window.setTimeout(() => panner.disconnect(), 600);
}

function playEspresso(ctx: AudioContext, destination: AudioNode): void {
  const now = ctx.currentTime;
  const source = ctx.createBufferSource();
  source.buffer = getNoiseBuffer(ctx, 'white');

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(900, now);
  filter.frequency.exponentialRampToValueAtTime(2200, now + 1.2);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.04, now + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.02, now + 1.2);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  source.start(now, Math.random() * 3, 2);
  source.onended = () => {
    source.disconnect();
    filter.disconnect();
    gain.disconnect();
  };
}

function playCricket(ctx: AudioContext, destination: AudioNode): void {
  const now = ctx.currentTime;
  const pulses = 3 + Math.floor(Math.random() * 4);
  const base = 4100 + Math.random() * 800;
  const peak = 0.01 + Math.random() * 0.008;

  const oscillator = ctx.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(base, now);

  const gain = ctx.createGain();
  for (let i = 0; i < pulses; i += 1) {
    const start = now + i * 0.085;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.055);
  }

  const panner = ctx.createStereoPanner();
  panner.pan.value = Math.random() * 1.6 - 0.8;

  oscillator.connect(gain);
  gain.connect(panner);
  panner.connect(destination);
  oscillator.start(now);
  oscillator.stop(now + pulses * 0.085 + 0.06);
  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
    panner.disconnect();
  };
}

function playOwl(ctx: AudioContext, destination: AudioNode): void {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(destination);

  for (const offset of [0, 0.55]) {
    const start = now + offset;
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(360, start);
    oscillator.frequency.exponentialRampToValueAtTime(300, start + 0.3);

    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0.0001, start);
    noteGain.gain.exponentialRampToValueAtTime(0.014, start + 0.06);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);

    oscillator.connect(noteGain);
    noteGain.connect(gain);
    oscillator.start(start);
    oscillator.stop(start + 0.45);
    oscillator.onended = () => {
      oscillator.disconnect();
      noteGain.disconnect();
    };
  }

  window.setTimeout(() => gain.disconnect(), 1600);
}

/* ------------------------------------------------------------------ */
/*  Scene graphs                                                      */
/* ------------------------------------------------------------------ */

function createScene(ctx: AudioContext, scene: AmbienceScene, destination: AudioNode): SceneHandle {
  const output = makeGain(ctx, 1);
  output.connect(destination);

  const sources: AudioScheduledSourceNode[] = [];
  const cancellers: Array<() => void> = [];

  const bed = (color: NoiseColor, type: BiquadFilterType, frequency: number, q: number, level: number): GainNode => {
    const source = noiseSource(ctx, color);
    const filter = makeFilter(ctx, type, frequency, q);
    const gain = makeGain(ctx, level);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(output);
    source.start();
    sources.push(source);
    return gain;
  };

  if (scene === 'city') {
    bed('brown', 'lowpass', 170, 0.8, 0.5);
    const air = bed('pink', 'bandpass', 520, 0.55, 0.09);
    addLfo(ctx, air.gain, 0.07, 0.03, sources);
    bed('white', 'highpass', 3200, 0.5, 0.012);

    cancellers.push(every(4000, 9500, () => playCarPass(ctx, output, 0.085)));
    cancellers.push(every(15000, 32000, () => playHorn(ctx, output)));
    cancellers.push(every(6000, 14000, () => playBird(ctx, output)));
  }

  if (scene === 'rain') {
    bed('white', 'highpass', 900, 0.7, 0.13);
    bed('pink', 'lowpass', 450, 0.7, 0.07);
    const patter = bed('pink', 'bandpass', 2200, 1.4, 0.028);
    addLfo(ctx, patter.gain, 2.3, 0.012, sources);

    cancellers.push(every(350, 1100, () => playDroplet(ctx, output)));
    cancellers.push(every(28000, 62000, () => playThunder(ctx, output)));
  }

  if (scene === 'cafe') {
    const murmur = bed('pink', 'bandpass', 650, 0.9, 0.11);
    addLfo(ctx, murmur.gain, 0.23, 0.035, sources);
    bed('brown', 'lowpass', 220, 0.8, 0.08);
    const room = bed('white', 'bandpass', 3000, 0.5, 0.008);
    addLfo(ctx, room.gain, 0.13, 0.004, sources);

    cancellers.push(every(2600, 6800, () => playCupClink(ctx, output)));
    cancellers.push(every(12000, 26000, () => playEspresso(ctx, output)));
  }

  if (scene === 'night') {
    const wind = bed('pink', 'lowpass', 320, 0.7, 0.12);
    addLfo(ctx, wind.gain, 0.09, 0.035, sources);
    bed('brown', 'lowpass', 150, 0.8, 0.05);

    cancellers.push(every(1100, 2400, () => playCricket(ctx, output)));
    cancellers.push(every(14000, 30000, () => playCarPass(ctx, output, 0.035)));
    cancellers.push(every(35000, 75000, () => playOwl(ctx, output)));
  }

  const stop = () => {
    for (const cancel of cancellers) cancel();
    for (const source of sources) {
      try {
        source.stop();
      } catch {
        // A source may already have ended; ignore.
      }
      source.disconnect();
    }
    output.disconnect();
  };

  return {
    output,
    fadeOutAndStop: (audio, seconds) => {
      const now = audio.currentTime;
      output.gain.cancelScheduledValues(now);
      output.gain.setValueAtTime(Math.max(0.0001, output.gain.value), now);
      output.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
      window.setTimeout(stop, (seconds + 0.1) * 1000);
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Public controls                                                   */
/* ------------------------------------------------------------------ */

function targetGain(): number {
  if (volume <= 0.001) return 0.0001;
  return 0.7 * Math.pow(volume, 1.4);
}

function ensureMaster(ctx: AudioContext): GainNode {
  if (!master || masterContext !== ctx) {
    masterContext = ctx;
    master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);
  }
  return master;
}

function rampMaster(ctx: AudioContext, seconds: number, value = targetGain()): void {
  if (!master) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setTargetAtTime(Math.max(0.0001, value), now, Math.max(0.05, seconds / 3));
}

/**
 * Browsers only allow audio after a user gesture. If the context is still
 * suspended (e.g. the preference was restored on page load), wait for the
 * first tap or key press and start the scene then.
 */
function waitForGesture(ctx: AudioContext, scene: AmbienceScene): void {
  if (pendingStart?.scene === scene) return;
  setRunning(false);
  const token = Symbol(scene);
  pendingStart = { scene, token };

  const handler = () => {
    window.removeEventListener('pointerdown', handler);
    window.removeEventListener('keydown', handler);
    window.removeEventListener('touchstart', handler);
    void ctx.resume().then(() => {
      if (pendingStart?.token !== token) return;
      pendingStart = null;
      startAmbience(scene);
    });
  };

  window.addEventListener('pointerdown', handler);
  window.addEventListener('keydown', handler);
  window.addEventListener('touchstart', handler, { passive: true });
}

export function startAmbience(scene: AmbienceScene): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    waitForGesture(ctx, scene);
    return;
  }

  const masterNode = ensureMaster(ctx);

  if (active?.scene === scene) {
    setRunning(true);
    rampMaster(ctx, 0.3);
    return;
  }

  if (active) {
    const previous = active;
    active = null;
    previous.handle.fadeOutAndStop(ctx, 0.7);
  }

  const handle = createScene(ctx, scene, masterNode);
  const now = ctx.currentTime;
  handle.output.gain.setValueAtTime(0.0001, now);
  handle.output.gain.exponentialRampToValueAtTime(1, now + 1.5);

  active = { scene, handle };
  setRunning(true);
  rampMaster(ctx, 0.6);
}

export function stopAmbience(): void {
  setRunning(false);
  pendingStart = null;

  if (!masterContext) return;
  const ctx = masterContext;
  rampMaster(ctx, 0.3, 0.0001);

  if (!active) return;
  const previous = active;
  active = null;
  previous.handle.fadeOutAndStop(ctx, 0.8);
}

export function setAmbienceVolume(value: number): void {
  volume = Math.min(1, Math.max(0, value));
  if (running && master && masterContext) rampMaster(masterContext, 0.2);
}

export function isAmbienceRunning(): boolean {
  return running && active !== null;
}

export function subscribeAmbienceRunning(listener: RunningListener): () => void {
  runningListeners.add(listener);
  return () => {
    runningListeners.delete(listener);
  };
}
