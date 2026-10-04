"use client";

// Simple Web Audio API synthesizer for cinematic sound effects

let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playKeystroke = () => {
  const ctx = initAudio();
  if (!ctx) return;

  
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);

  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.1);
};

export const playErrorBuzz = () => {
  const ctx = initAudio();
  if (!ctx) return;

  
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);

  gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.3);
};

export const playSuccessChime = () => {
  const ctx = initAudio();
  if (!ctx) return;

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc1.type = "sine";
  osc1.frequency.setValueAtTime(440, ctx.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);

  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(554.37, ctx.currentTime); // C#
  osc2.frequency.exponentialRampToValueAtTime(1108.73, ctx.currentTime + 0.1);

  gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc1.start();
  osc2.start();
  osc1.stop(ctx.currentTime + 0.5);
  osc2.stop(ctx.currentTime + 0.5);
};

export const playAlarm = () => {
  const ctx = initAudio();
  if (!ctx) return;

  
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = "square";
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  
  // Wailing effect
  for (let i = 0; i < 6; i++) {
    osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + (i * 0.5) + 0.25);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + (i * 0.5) + 0.5);
  }

  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
  gainNode.gain.setValueAtTime(0.1, ctx.currentTime + 2.8);
  gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 3.0);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 3.0);
};

export const playEmpBlast = () => {
  const ctx = initAudio();
  if (!ctx) return;

  
  const gainNode = ctx.createGain();
  
  // White noise buffer for explosion
  const bufferSize = ctx.sampleRate * 2; // 2 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;

  // Filter to make it sound like a deep bass blast
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1000, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 2);

  gainNode.gain.setValueAtTime(1, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);

  noiseSource.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  noiseSource.start();
};
