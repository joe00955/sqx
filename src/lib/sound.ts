// Short UI blips synthesized with the Web Audio API — no audio assets needed,
// and it sidesteps having to ship/host sound files for a couple of clicks.

let sharedContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextCtor) return null;
  if (!sharedContext) {
    sharedContext = new AudioContextCtor();
  }
  if (sharedContext.state === 'suspended') {
    sharedContext.resume().catch(() => {});
  }
  return sharedContext;
}

function playTone(frequencies: number[], duration: number, gainPeak: number) {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    frequencies.forEach((freq, index) => {
      const start = now + index * duration;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(gainPeak, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + duration);
    });
  } catch {
    // Audio is a nice-to-have — never let it break the app.
  }
}

export function playSentSound() {
  playTone([700, 900], 0.09, 0.05);
}

export function playReceivedSound() {
  playTone([880, 660], 0.11, 0.06);
}
