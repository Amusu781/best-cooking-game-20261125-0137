// Sounds made on the fly with WebAudio (no audio files): a knife thunk, a sizzle hiss, a pot
// bloop, the service bell, a sour buzz for a walked-out guest, and a tick for the last seconds.
// Starts silent until the first key or click, as browsers require.

export function createAudio() {
  let ac = null;
  let muted = false;
  function ctx() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(freq, dur, type = 'sine', vol = 0.15, slide = 0) {
    const a = ctx();
    if (!a || muted) return;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, a.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), a.currentTime + dur);
    g.gain.setValueAtTime(vol, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
    o.connect(g).connect(a.destination);
    o.start();
    o.stop(a.currentTime + dur);
  }
  function noise(dur, vol = 0.12, cutoff = 2000) {
    const a = ctx();
    if (!a || muted) return;
    const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = a.createBufferSource();
    src.buffer = buf;
    const f = a.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = cutoff;
    const g = a.createGain();
    g.gain.value = vol;
    src.connect(f).connect(g).connect(a.destination);
    src.start();
  }
  return {
    unlock: () => ctx(),
    toggle: () => { muted = !muted; return muted; },
    play(ev) {
      switch (ev.type) {
        case 'chop': noise(0.06, 0.25, 1200); tone(180, 0.06, 'square', 0.05); break;
        case 'chopped': tone(660, 0.08, 'triangle', 0.1); tone(880, 0.1, 'triangle', 0.08); break;
        case 'sizzle': noise(0.4, 0.08, 6000); break;
        case 'splash': tone(300, 0.2, 'sine', 0.12, -150); break;
        case 'cooked': tone(520, 0.12, 'triangle', 0.12); break;
        case 'burnt': tone(140, 0.4, 'sawtooth', 0.08, -60); break;
        case 'pick': tone(420, 0.05, 'triangle', 0.08); break;
        case 'drop': case 'plate': tone(320, 0.06, 'triangle', 0.09); break;
        case 'ready': tone(784, 0.12, 'sine', 0.1); tone(1046, 0.18, 'sine', 0.08); break;
        case 'serve': tone(1318, 0.5, 'sine', 0.16); tone(1975, 0.4, 'sine', 0.06); break;
        case 'miss': case 'lose': tone(160, 0.5, 'sawtooth', 0.1, -80); break;
        case 'nope': tone(200, 0.12, 'square', 0.06); break;
        case 'order': tone(990, 0.08, 'sine', 0.07); break;
        case 'tick': tone(1200, 0.03, 'square', 0.04); break;
        case 'open': case 'close': case 'win': tone(523, 0.2, 'triangle', 0.1); tone(784, 0.35, 'triangle', 0.1); break;
        case 'buy': tone(880, 0.1, 'triangle', 0.1); tone(1320, 0.15, 'triangle', 0.08); break;
        default: break;
      }
    },
  };
}
