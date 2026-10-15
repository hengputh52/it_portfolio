"use client";

/**
 * Ambient race-weekend audio, synthesised with the Web Audio API (no files).
 * Off by default; it only starts when the visitor presses the audio toggle.
 * - distant engine notes: cars passing the grandstand, with a Doppler drop
 * - the pit-lane crowd: a low, swelling murmur
 * - team radio chatter: squelch, a burst of band-limited "voice", squelch
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let crowd: AudioBufferSourceNode | null = null;
let timers: ReturnType<typeof setTimeout>[] = [];

const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));
const rand = (a: number, b: number) => a + Math.random() * (b - a);

function noiseBuffer(c: AudioContext, seconds: number, brown = false) {
  const buf = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = last * 0.98 + white * 0.02;
      d[i] = last * 3.5;
    } else d[i] = white;
  }
  return buf;
}

// ---------- a car passing at speed ----------
function passBy() {
  if (!ctx || !master) return;
  const c = ctx;
  const t = c.currentTime + 0.05;
  const dur = rand(2.2, 3.4);
  const base = rand(140, 190); // engine fundamental, high-revving
  const fromLeft = Math.random() < 0.5;

  const out = c.createGain();
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(rand(0.08, 0.14), t + dur * 0.48);
  out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const pan = c.createStereoPanner();
  pan.pan.setValueAtTime(fromLeft ? -0.9 : 0.9, t);
  pan.pan.linearRampToValueAtTime(fromLeft ? 0.9 : -0.9, t + dur);
  const tone = c.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.setValueAtTime(900, t);
  tone.frequency.linearRampToValueAtTime(2600, t + dur * 0.5);
  tone.frequency.linearRampToValueAtTime(700, t + dur);
  out.connect(tone).connect(pan).connect(master);

  // two detuned saws an octave apart, with a Doppler drop as the car goes past
  [1, 2.01].forEach((mult, i) => {
    const osc = c.createOscillator();
    osc.type = "sawtooth";
    const f = base * mult;
    osc.frequency.setValueAtTime(f * 1.12, t);
    osc.frequency.linearRampToValueAtTime(f * 1.1, t + dur * 0.45);
    osc.frequency.exponentialRampToValueAtTime(f * 0.84, t + dur * 0.58);
    osc.frequency.linearRampToValueAtTime(f * 0.8, t + dur);
    const g = c.createGain();
    g.gain.value = i ? 0.35 : 1;
    // fast tremolo for the engine's growl
    const lfo = c.createOscillator();
    lfo.frequency.value = rand(28, 40);
    const depth = c.createGain();
    depth.gain.value = 0.3;
    lfo.connect(depth).connect(g.gain);
    osc.connect(g).connect(out);
    osc.start(t);
    lfo.start(t);
    osc.stop(t + dur + 0.1);
    lfo.stop(t + dur + 0.1);
  });
  // sometimes a second car close behind, fighting for the position
  later(passBy, Math.random() < 0.3 ? rand(500, 1100) : rand(6000, 14000));
}

// ---------- team radio ----------
function squelch(c: AudioContext, out: AudioNode, at: number) {
  const osc = c.createOscillator();
  osc.type = "square";
  osc.frequency.value = 1150;
  const g = c.createGain();
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(0.03, at + 0.005);
  g.gain.setValueAtTime(0.03, at + 0.06);
  g.gain.linearRampToValueAtTime(0, at + 0.07);
  osc.connect(g).connect(out);
  osc.start(at);
  osc.stop(at + 0.08);
}

function radio() {
  if (!ctx || !master) return;
  const c = ctx;
  const t = c.currentTime + 0.05;
  // a narrow radio band, slightly distorted
  const band = c.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 1400;
  band.Q.value = 1.2;
  const shaper = c.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i / 255) * 2 - 1;
    curve[i] = Math.tanh(x * 3);
  }
  shaper.curve = curve;
  const out = c.createGain();
  out.gain.value = 0.05;
  band.connect(shaper).connect(out).connect(master);

  squelch(c, out, t);
  // "voice": a buzzy source with syllable-like bursts and moving formants
  const words = Math.floor(rand(4, 9));
  const voice = c.createOscillator();
  voice.type = "sawtooth";
  voice.frequency.value = rand(110, 150);
  const hiss = c.createBufferSource();
  hiss.buffer = noiseBuffer(c, 3);
  const hissG = c.createGain();
  hissG.gain.value = 0.25;
  const env = c.createGain();
  env.gain.value = 0;
  const formant = c.createBiquadFilter();
  formant.type = "bandpass";
  formant.Q.value = 4;
  voice.connect(env);
  hiss.connect(hissG).connect(env);
  env.connect(formant).connect(band);

  let at = t + 0.12;
  for (let i = 0; i < words; i++) {
    const len = rand(0.08, 0.22);
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(1, at + 0.02);
    env.gain.setValueAtTime(0.8, at + len - 0.03);
    env.gain.linearRampToValueAtTime(0, at + len);
    formant.frequency.setValueAtTime(rand(600, 2200), at);
    voice.frequency.setValueAtTime(rand(110, 160), at);
    at += len + rand(0.03, 0.14);
  }
  squelch(c, out, at + 0.05);
  voice.start(t);
  hiss.start(t);
  voice.stop(at + 0.2);
  hiss.stop(at + 0.2);
  later(() => out.disconnect(), (at - c.currentTime) * 1000 + 600);
  later(radio, rand(14000, 26000));
}

export function startAudio() {
  ctx ??= new AudioContext();
  void ctx.resume();
  if (master) return;

  master = ctx.createGain();
  master.gain.value = 0;
  master.gain.linearRampToValueAtTime(0.85, ctx.currentTime + 1.5);
  master.connect(ctx.destination);

  // the crowd in the grandstand: low murmur, swelling slowly
  crowd = ctx.createBufferSource();
  crowd.buffer = noiseBuffer(ctx, 6, true);
  crowd.loop = true;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 600;
  bp.Q.value = 0.6;
  const cg = ctx.createGain();
  cg.gain.value = 0.06;
  const swell = ctx.createOscillator();
  swell.frequency.value = 0.07;
  const swellDepth = ctx.createGain();
  swellDepth.gain.value = 0.03;
  swell.connect(swellDepth).connect(cg.gain);
  crowd.connect(bp).connect(cg).connect(master);
  crowd.start();
  swell.start();

  later(passBy, 800);
  later(radio, 6000);
}

export function stopAudio() {
  timers.forEach(clearTimeout);
  timers = [];
  if (!ctx || !master) return;
  const m = master;
  const cr = crowd;
  m.gain.cancelScheduledValues(ctx.currentTime);
  m.gain.setValueAtTime(m.gain.value, ctx.currentTime);
  m.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
  setTimeout(() => {
    cr?.stop();
    m.disconnect();
  }, 600);
  master = null;
  crowd = null;
}
