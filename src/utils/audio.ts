let sharedAudioCtx: AudioContext | null = null;

export const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!sharedAudioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      sharedAudioCtx = new AudioContextClass();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
};

// --- STUDIO-GRADE AMBIENT SOUNDTRACK CONTROLLER ---
// Plays the authentic 48kHz stereo cyberpunk ambient soundtrack (/story/ambient-soundtrack.mp3)
// Handles loop, volume normalization, and browser autoplay unlock gracefully.
let sharedAmbientAudio: HTMLAudioElement | null = null;
let isAudioActive = false;

export const isAmbientPlaying = (): boolean => {
  return isAudioActive;
};

export const startAmbientScore = () => {
  if (typeof window === "undefined") return;
  isAudioActive = true;
  try {
    if (!sharedAmbientAudio) {
      sharedAmbientAudio = new Audio("/story/ambient-soundtrack.mp3");
      sharedAmbientAudio.loop = true;
      sharedAmbientAudio.volume = 0.45;
    }
    sharedAmbientAudio.volume = 0.45;
    const playPromise = sharedAmbientAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay policy prevented immediate playback, hook onto next user interaction
        const unlock = () => {
          if (sharedAmbientAudio && isAudioActive) {
            sharedAmbientAudio.play().catch(() => {});
          }
          window.removeEventListener("click", unlock);
          window.removeEventListener("keydown", unlock);
          window.removeEventListener("scroll", unlock);
        };
        window.addEventListener("click", unlock, { once: true });
        window.addEventListener("keydown", unlock, { once: true });
        window.addEventListener("scroll", unlock, { once: true });
      });
    }
  } catch {}
};

export const stopAmbientScore = () => {
  isAudioActive = false;
  if (!sharedAmbientAudio) return;
  try {
    sharedAmbientAudio.pause();
    sharedAmbientAudio.currentTime = 0;
  } catch {}
};

export const playSound = (type: "click" | "hover" | "flash" | "boot") => {
  if (typeof window === "undefined") return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } 
    else if (type === "hover") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
    else if (type === "flash") {
      // Dramatic sub-bass drop and digital chord for transition
      
      // Bass
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(150, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 1);
      gain1.gain.setValueAtTime(0.5, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      
      // High chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "square";
      osc2.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc2.frequency.setValueAtTime(1760, ctx.currentTime + 0.1); // A6
      gain2.gain.setValueAtTime(0, ctx.currentTime);
      gain2.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      
      // Noise burst for dramatic impact
      const bufferSize = ctx.sampleRate * 1.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "lowpass";
      noiseFilter.frequency.setValueAtTime(1000, ctx.currentTime);
      noiseFilter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 1);
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      noise.start();
      
      osc1.stop(ctx.currentTime + 2);
      osc2.stop(ctx.currentTime + 1.5);
      noise.stop(ctx.currentTime + 1.5);
    }
  } catch {
    // Ignore audio context errors if browser blocks autoplay
  }
};
