// Speaks court zone calls aloud via the Web Speech API — this is what lets the
// on-court drill actually work as real training: the player doesn't have to
// stare at their phone mid-sprint, they just listen for the next corner.

import { Zone, ZONE_LABELS } from '../logic/ghostingGame';

export const isSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

export function speakZone(zone: Zone) {
  if (!isSpeechSupported) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(ZONE_LABELS[zone]);
    utterance.rate = 1.05;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Voice is a nice-to-have — the on-screen call-out still works without it.
  }
}

export function stopSpeaking() {
  if (!isSpeechSupported) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore — nothing to clean up if this throws.
  }
}
