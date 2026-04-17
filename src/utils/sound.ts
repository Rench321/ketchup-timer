// Web Audio API beep generator
// Two distinct tones: low = start work, high = start break

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(frequency: number, duration: number, volume = 0.4): void {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Smooth attack + decay envelope
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio playback failed:', e);
  }
}

/** Play a double-beep to signal start of WORK phase */
export function beepWork(): void {
  // Two low tones — "get back to work" feel
  playTone(440, 0.18, 0.5);
  setTimeout(() => playTone(440, 0.25, 0.5), 200);
}

/** Play a triple high-pitched tone to signal start of BREAK phase */
export function beepBreak(): void {
  // Two high tones — cheerful "break time!"
  playTone(660, 0.15, 0.45);
  setTimeout(() => playTone(880, 0.15, 0.45), 170);
  setTimeout(() => playTone(880, 0.25, 0.45), 340);
}

/** Play a gentle completion chime */
export function beepCycleComplete(): void {
  playTone(523, 0.15, 0.4);  // C5
  setTimeout(() => playTone(659, 0.15, 0.4), 180);  // E5
  setTimeout(() => playTone(784, 0.3, 0.4), 360);   // G5
}
