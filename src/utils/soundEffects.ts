/**
 * Subtle, warm studio sound effects synthesized cleanly via Web Audio API.
 * Zero external audio files, zero network cost, instant response.
 */

export type SoundKind = 'check' | 'uncheck' | 'nudge' | 'celebrate' | 'jar';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) {
    try {
      audioCtx = new Ctor();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  ctx: AudioContext,
  freq: number,
  startOffset: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
  slideToFreq?: number
) {
  const now = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (slideToFreq) {
    osc.frequency.exponentialRampToValueAtTime(slideToFreq, now + duration);
  }

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function playSound(kind: SoundKind, enabled = true): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    switch (kind) {
      case 'check':
        // Warm soft marimba tick (Things-style tactile pop)
        playTone(ctx, 540, 0, 0.09, 0.075, 'sine', 760);
        playTone(ctx, 810, 0.045, 0.11, 0.05, 'triangle');
        break;

      case 'uncheck':
        // Gentle downward soft tap
        playTone(ctx, 440, 0, 0.08, 0.055, 'sine', 330);
        break;

      case 'nudge':
        // Dreamy pastel two-note heart chime (C5 -> G5)
        playTone(ctx, 523.25, 0, 0.24, 0.07, 'sine');
        playTone(ctx, 783.99, 0.11, 0.34, 0.065, 'triangle');
        break;

      case 'jar':
        // Delicate glass-bell chime (E5 -> B5 -> E6)
        playTone(ctx, 659.25, 0, 0.22, 0.055, 'sine');
        playTone(ctx, 987.77, 0.09, 0.26, 0.048, 'sine');
        playTone(ctx, 1318.5, 0.19, 0.36, 0.036, 'triangle');
        break;

      case 'celebrate':
        // Sparkling ascending pastel triad (C5 -> E5 -> G5 -> C6)
        playTone(ctx, 523.25, 0, 0.18, 0.06, 'triangle');
        playTone(ctx, 659.25, 0.075, 0.2, 0.06, 'triangle');
        playTone(ctx, 783.99, 0.15, 0.24, 0.06, 'sine');
        playTone(ctx, 1046.5, 0.23, 0.38, 0.055, 'sine');
        break;
    }
  } catch {
    // Ignore audio context edge errors silently
  }
}
