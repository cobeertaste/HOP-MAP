/**
 * Synthesized Christmas Web Audio effects for December 1–25 holiday UI.
 * Automatically bypassed outside December 1–25 so base retro arcade sounds remain untouched.
 */

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

function playBellTone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  volume = 0.08,
  type: OscillatorType = 'triangle'
) {
  const osc = ctx.createOscillator();
  const harmonic = ctx.createOscillator();
  const gain = ctx.createGain();
  const harmonicGain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  // Bell overtone (octave + crisp shimmer)
  harmonic.type = 'sine';
  harmonic.frequency.setValueAtTime(freq * 2, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  harmonicGain.gain.setValueAtTime(0.0001, startTime);
  harmonicGain.gain.linearRampToValueAtTime(volume * 0.45, startTime + 0.008);
  harmonicGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.75);

  osc.connect(gain);
  harmonic.connect(harmonicGain);
  gain.connect(ctx.destination);
  harmonicGain.connect(ctx.destination);

  osc.start(startTime);
  harmonic.start(startTime);
  osc.stop(startTime + duration + 0.02);
  harmonic.stop(startTime + duration + 0.02);
}

/**
 * Light sleigh-bell chime for navigation taps & button interactions.
 */
export function playChristmasTapBell() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Crisp high sleigh-bell double chime (E6 -> B6)
    playBellTone(ctx, 1318.51, now, 0.14, 0.075, 'triangle');
    playBellTone(ctx, 1975.53, now + 0.055, 0.16, 0.06, 'sine');
  } catch (err) {
    console.warn('Christmas tap bell synthesis error:', err);
  }
}

/**
 * Festive 3-note Jingle Bells chime for stamps and check-in actions.
 */
export function playChristmasStampChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // "Jin-gle bells!" (E5 - E5 - E5 with rising sparkle)
    const notes = [
      { freq: 659.25, offset: 0.0, dur: 0.14 },
      { freq: 659.25, offset: 0.12, dur: 0.14 },
      { freq: 659.25, offset: 0.24, dur: 0.28 },
      { freq: 1318.51, offset: 0.26, dur: 0.30 },
    ];
    notes.forEach(n => playBellTone(ctx, n.freq, now + n.offset, n.dur, 0.085, 'triangle'));
  } catch (err) {
    console.warn('Christmas stamp chime synthesis error:', err);
  }
}

/**
 * Joyful "Jingle Bells" hook arpeggio for HOPS, badges, and milestone rewards.
 */
export function playChristmasRewardMelody() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // E5 - G5 - C5 - D5 - E5
    const melody = [
      { freq: 659.25, offset: 0.0, dur: 0.14 },
      { freq: 783.99, offset: 0.10, dur: 0.14 },
      { freq: 523.25, offset: 0.20, dur: 0.16 },
      { freq: 587.33, offset: 0.31, dur: 0.12 },
      { freq: 659.25, offset: 0.41, dur: 0.42 },
      { freq: 1046.5, offset: 0.43, dur: 0.40 },
    ];
    melody.forEach(n => playBellTone(ctx, n.freq, now + n.offset, n.dur, 0.085, 'triangle'));
  } catch (err) {
    console.warn('Christmas reward melody synthesis error:', err);
  }
}

/**
 * Triumphant Christmas holiday fanfare for Stage Clear / Spot Check-In celebration.
 */
export function playChristmasStageClearFanfare() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // "Jingle bells, jingle all the way" cadence: E5 E5 E5 | E5 G5 C5 D5 E5!
    const melody = [
      { freq: 659.25, offset: 0.0, dur: 0.12 },
      { freq: 659.25, offset: 0.13, dur: 0.12 },
      { freq: 659.25, offset: 0.26, dur: 0.22 },
      { freq: 659.25, offset: 0.48, dur: 0.12 },
      { freq: 783.99, offset: 0.60, dur: 0.12 },
      { freq: 523.25, offset: 0.72, dur: 0.14 },
      { freq: 587.33, offset: 0.85, dur: 0.10 },
      { freq: 659.25, offset: 0.96, dur: 0.46 },
      { freq: 1046.5, offset: 0.96, dur: 0.48 },
      { freq: 1318.51, offset: 0.98, dur: 0.48 },
    ];
    melody.forEach((n, i) => {
      playBellTone(ctx, n.freq, now + n.offset, n.dur, i >= 7 ? 0.095 : 0.08, i >= 7 ? 'sine' : 'triangle');
    });
  } catch (err) {
    console.warn('Christmas stage clear fanfare error:', err);
  }
}

/**
 * Glockenspiel note for PIN keypad digits during Christmas.
 */
export function playChristmasKeypadBell(digit?: string | number) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const festiveScale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98, 1760.0];
    const index = typeof digit === 'number' ? Math.abs(digit) % festiveScale.length : 2;
    playBellTone(ctx, festiveScale[index], now, 0.12, 0.075, 'sine');
  } catch {}
}

/**
 * Low sleigh-bell error tone for wrong PIN during Christmas.
 */
export function playChristmasErrorTone() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(164.81, now + 0.13);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.38);
  } catch {}
}
