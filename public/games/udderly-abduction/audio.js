// ============================================================
// Udderly Abduction - Procedural Audio Engine
// Web Audio API with file-based audio support
// ============================================================

const AudioManager = (() => {
  let ctx = null;
  let masterGain = null;
  let sfxGain = null;
  let musicGain = null;
  let ambientGain = null;
  let muted = false;
  let initialized = false;
  let beamOsc1 = null, beamOsc2 = null, beamGain = null;
  let beamPlaying = false;

  // File-based audio buffers and sources
  const audioBuffers = {};
  let musicSource = null;
  let musicPlaying = false;
  let ambientSource = null;
  let ambientPlaying = false;
  let introSource = null;
  let introPlaying = false;

  function init() {
    if (initialized) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.4;
      masterGain.connect(ctx.destination);

      // Separate gain nodes for SFX, music, and ambient
      sfxGain = ctx.createGain();
      sfxGain.gain.value = 1.0;
      sfxGain.connect(masterGain);

      musicGain = ctx.createGain();
      musicGain.gain.value = 0.3;
      musicGain.connect(masterGain);

      ambientGain = ctx.createGain();
      ambientGain.gain.value = 0.15;
      ambientGain.connect(masterGain);

      initialized = true;
      loadAudioFiles();
      loadComboAudio();
      loadLevelAudio();
    } catch (e) {
      console.warn('Web Audio not available:', e);
    }
  }

  // Load all audio files asynchronously
  function loadAudioFiles() {
    const files = {
      'gameMusic': 'game-music.ogg',
      'introShip': 'intro space ship sound.ogg',
      'lowHum': 'low hum.ogg',
      'ouch': 'ouch.ogg',
      'spaceshipDeath': 'spaceship death.ogg',
      'hurtMale': '413178__micahlg__male_hurt2.ogg'
    };
    for (const [key, file] of Object.entries(files)) {
      fetch(file)
        .then(r => r.arrayBuffer())
        .then(buf => ctx.decodeAudioData(buf))
        .then(decoded => { audioBuffers[key] = decoded; })
        .catch(e => console.warn('Failed to load ' + file + ':', e));
    }
  }

  function playBuffer(key, gainNode, loop, volume) {
    if (!ctx || !initialized || !audioBuffers[key]) return null;
    const source = ctx.createBufferSource();
    source.buffer = audioBuffers[key];
    source.loop = !!loop;
    const vol = ctx.createGain();
    vol.gain.value = volume !== undefined ? volume : 1.0;
    source.connect(vol);
    vol.connect(gainNode || sfxGain);
    source.start(0);
    return { source: source, gain: vol };
  }

  // Music control
  function startGameMusic() {
    if (musicPlaying) stopGameMusic();
    stopIntroSound();
    stopAmbientHum();
    const result = playBuffer('gameMusic', musicGain, true, 1.0);
    if (result) {
      musicSource = result;
      musicPlaying = true;
    }
  }

  function stopGameMusic() {
    if (!musicPlaying || !musicSource) return;
    try {
      musicSource.gain.gain.setValueAtTime(musicSource.gain.gain.value, ctx.currentTime);
      musicSource.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      const src = musicSource.source;
      setTimeout(() => { try { src.stop(); } catch(e) {} }, 600);
    } catch(e) {}
    musicSource = null;
    musicPlaying = false;
  }

  // Intro spaceship sound
  function startIntroSound() {
    if (introPlaying) return;
    const result = playBuffer('introShip', ambientGain, true, 0.6);
    if (result) {
      introSource = result;
      introPlaying = true;
    }
  }

  function stopIntroSound() {
    if (!introPlaying || !introSource) return;
    try {
      introSource.gain.gain.setValueAtTime(introSource.gain.gain.value, ctx.currentTime);
      introSource.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      const src = introSource.source;
      setTimeout(() => { try { src.stop(); } catch(e) {} }, 400);
    } catch(e) {}
    introSource = null;
    introPlaying = false;
  }

  // Ambient low hum for menu
  function startAmbientHum() {
    if (ambientPlaying) return;
    const result = playBuffer('lowHum', ambientGain, true, 0.4);
    if (result) {
      ambientSource = result;
      ambientPlaying = true;
    }
  }

  function stopAmbientHum() {
    if (!ambientPlaying || !ambientSource) return;
    try {
      ambientSource.gain.gain.setValueAtTime(ambientSource.gain.gain.value, ctx.currentTime);
      ambientSource.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      const src = ambientSource.source;
      setTimeout(() => { try { src.stop(); } catch(e) {} }, 600);
    } catch(e) {}
    ambientSource = null;
    ambientPlaying = false;
  }

  // Play ouch sound when UFO takes damage
  function playOuch() {
    playBuffer('ouch', sfxGain, false, 0.7);
  }

  // Play spaceship death on game over
  function playSpaceshipDeath() {
    playBuffer('spaceshipDeath', sfxGain, false, 0.8);
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  function toggleMute() {
    muted = !muted;
    if (masterGain) {
      masterGain.gain.value = muted ? 0 : 0.4;
    }
    return muted;
  }

  function isMuted() {
    return muted;
  }

  // Helper: create a simple envelope
  function env(param, peakVal, attackTime, decayTime, sustainVal, releaseTime, startTime) {
    param.setValueAtTime(0, startTime);
    param.linearRampToValueAtTime(peakVal, startTime + attackTime);
    param.linearRampToValueAtTime(sustainVal, startTime + attackTime + decayTime);
    param.linearRampToValueAtTime(0, startTime + attackTime + decayTime + releaseTime);
  }

  // Helper: noise buffer
  function createNoiseBuffer(duration) {
    if (!ctx) return null;
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Tractor beam hum - continuous looping sound
  function startBeam() {
    if (!ctx || !initialized || beamPlaying) return;
    beamPlaying = true;
    const t = ctx.currentTime;

    beamGain = ctx.createGain();
    beamGain.gain.setValueAtTime(0, t);
    beamGain.gain.linearRampToValueAtTime(0.15, t + 0.1);
    beamGain.connect(masterGain);

    // Triangle oscillator - main hum
    beamOsc1 = ctx.createOscillator();
    beamOsc1.type = 'triangle';
    beamOsc1.frequency.value = 85;
    beamOsc1.connect(beamGain);
    beamOsc1.start(t);

    // Sine LFO for wobble
    beamOsc2 = ctx.createOscillator();
    beamOsc2.type = 'sine';
    beamOsc2.frequency.value = 110;
    const beamGain2 = ctx.createGain();
    beamGain2.gain.value = 0.08;
    beamOsc2.connect(beamGain2);
    beamGain2.connect(beamGain);
    beamOsc2.start(t);

    // LFO to modulate frequency
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 3;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 8;
    lfo.connect(lfoGain);
    lfoGain.connect(beamOsc1.frequency);
    lfo.start(t);
    beamOsc1._lfo = lfo;
    beamOsc1._lfoGain = lfoGain;
  }

  function stopBeam() {
    if (!beamPlaying) return;
    beamPlaying = false;
    const t = ctx.currentTime;
    if (beamGain) {
      beamGain.gain.setValueAtTime(beamGain.gain.value, t);
      beamGain.gain.linearRampToValueAtTime(0, t + 0.1);
    }
    setTimeout(() => {
      try {
        if (beamOsc1) { beamOsc1.stop(); beamOsc1._lfo.stop(); beamOsc1 = null; }
        if (beamOsc2) { beamOsc2.stop(); beamOsc2 = null; }
        beamGain = null;
      } catch(e) {}
    }, 150);
  }

  // Cow moo - pitch bend sawtooth with bandpass
  function playCowMoo() {
    if (!ctx || !initialized) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(250, t);
    osc.frequency.linearRampToValueAtTime(320, t + 0.1);
    osc.frequency.linearRampToValueAtTime(200, t + 0.35);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 600;
    filter.Q.value = 2;

    const gain = ctx.createGain();
    env(gain.gain, 0.12, 0.02, 0.05, 0.08, 0.25, t);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  // Farmer pitchfork throw - whoosh
  function playPitchfork() {
    if (!ctx || !initialized) return;
    const t = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(0.15);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.linearRampToValueAtTime(2000, t + 0.08);
    filter.frequency.linearRampToValueAtTime(500, t + 0.15);
    filter.Q.value = 3;

    const gain = ctx.createGain();
    env(gain.gain, 0.12, 0.01, 0.03, 0.06, 0.1, t);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start(t);
  }

  // Farmer shotgun - noise burst
  function playShotgun() {
    if (!ctx || !initialized) return;
    const t = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(0.2);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4000, t);
    filter.frequency.linearRampToValueAtTime(800, t + 0.15);

    const gain = ctx.createGain();
    env(gain.gain, 0.2, 0.005, 0.02, 0.08, 0.15, t);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start(t);
  }

  // Sniper shot - sharp crack
  function playSniper() {
    if (!ctx || !initialized) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);

    const gain = ctx.createGain();
    env(gain.gain, 0.15, 0.003, 0.02, 0.04, 0.12, t);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  // Shield activate - ascending harmonics
  function playShieldOn() {
    if (!ctx || !initialized) return;
    const t = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 400 + i * 200;
      const gain = ctx.createGain();
      const offset = i * 0.04;
      env(gain.gain, 0.08, 0.01, 0.02, 0.04, 0.15, t + offset);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t + offset);
      osc.stop(t + offset + 0.25);
    }
  }

  // Shield block - metallic ping
  function playShieldBlock() {
    if (!ctx || !initialized) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1600, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);

    const gain = ctx.createGain();
    env(gain.gain, 0.12, 0.003, 0.01, 0.06, 0.1, t);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Power-up collect - 3-note ascending chiptune jingle
  function playPowerUp() {
    if (!ctx || !initialized) return;
    const t = ctx.currentTime;
    const notes = [523, 659, 784]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      const offset = i * 0.08;
      env(gain.gain, 0.1, 0.005, 0.02, 0.06, 0.08, t + offset);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t + offset);
      osc.stop(t + offset + 0.12);
    });
  }

  // UFO hit - noise + distorted sawtooth
  function playUfoHit() {
    if (!ctx || !initialized) return;
    const t = ctx.currentTime;

    // Noise component
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(0.25);
    const noiseGain = ctx.createGain();
    env(noiseGain.gain, 0.15, 0.005, 0.03, 0.06, 0.18, t);
    noise.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start(t);

    // Distorted sawtooth
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.2);

    const dist = ctx.createWaveShaper ? ctx.createWaveShaper() : null;
    const oscGain = ctx.createGain();
    env(oscGain.gain, 0.1, 0.005, 0.03, 0.05, 0.18, t);

    if (dist) {
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i / 128) - 1;
        curve[i] = Math.tanh(x * 3);
      }
      dist.curve = curve;
      osc.connect(dist);
      dist.connect(oscGain);
    } else {
      osc.connect(oscGain);
    }
    oscGain.connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  // Cow collected (abducted successfully)
  function playCowCollected() {
    if (!ctx || !initialized) return;
    const t = ctx.currentTime;
    const notes = [440, 554, 659]; // A4, C#5, E5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      const offset = i * 0.06;
      env(gain.gain, 0.1, 0.005, 0.015, 0.06, 0.1, t + offset);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t + offset);
      osc.stop(t + offset + 0.15);
    });
  }

  // Level complete jingle
  function playLevelComplete() {
    if (!ctx || !initialized) return;
    const t = ctx.currentTime;
    const notes = [523, 587, 659, 784, 1047]; // C5 D5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      const offset = i * 0.12;
      const dur = i === notes.length - 1 ? 0.4 : 0.1;
      env(gain.gain, 0.08, 0.005, 0.02, 0.05, dur, t + offset);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t + offset);
      osc.stop(t + offset + dur + 0.1);
    });
  }

  // Game over jingle - descending sad notes
  function playGameOver() {
    if (!ctx || !initialized) return;
    const t = ctx.currentTime;
    const notes = [392, 349, 330, 262]; // G4 F4 E4 C4
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      const offset = i * 0.2;
      const dur = i === notes.length - 1 ? 0.5 : 0.15;
      env(gain.gain, 0.1, 0.01, 0.03, 0.06, dur, t + offset);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t + offset);
      osc.stop(t + offset + dur + 0.1);
    });
  }

  // Menu select blip
  function playMenuSelect() {
    if (!ctx || !initialized) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.linearRampToValueAtTime(900, t + 0.05);
    const gain = ctx.createGain();
    env(gain.gain, 0.08, 0.005, 0.01, 0.04, 0.05, t);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  // Menu navigate blip
  function playMenuNav() {
    if (!ctx || !initialized) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 440;
    const gain = ctx.createGain();
    env(gain.gain, 0.05, 0.005, 0.01, 0.02, 0.03, t);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Energy depleted warning
  function playEnergyDepleted() {
    if (!ctx || !initialized) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.linearRampToValueAtTime(100, t + 0.15);
    const gain = ctx.createGain();
    env(gain.gain, 0.1, 0.005, 0.02, 0.05, 0.1, t);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  // UFO laser shot - sci-fi pew
  function playUfoLaser() {
    if (!ctx || !initialized) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.12);
    const gain = ctx.createGain();
    env(gain.gain, 0.12, 0.005, 0.02, 0.06, 0.1, t);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Farmer killed - short explosion
  function playFarmerHit() {
    if (!ctx || !initialized) return;
    const t = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(0.2);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, t);
    filter.frequency.linearRampToValueAtTime(500, t + 0.15);
    const gain = ctx.createGain();
    env(gain.gain, 0.15, 0.005, 0.02, 0.06, 0.12, t);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start(t);
  }

  // Combo sound
  function playCombo() {
    if (!ctx || !initialized) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.linearRampToValueAtTime(1200, t + 0.08);
    const gain = ctx.createGain();
    env(gain.gain, 0.08, 0.005, 0.01, 0.04, 0.06, t);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  // Graze sound - chromatic escalation with streak
  let _grazeMultiplier = 1.0;
  function playGraze(multiplier, streak) {
    if (!ctx || !initialized) return;
    _grazeMultiplier = multiplier || _grazeMultiplier;
    const t = ctx.currentTime;
    const baseFreq = 523.25; // C5
    const semitone = 1.05946;
    const noteIndex = (streak || 0) % 12;
    const octave = Math.floor((streak || 0) / 12);
    const freq = baseFreq * Math.pow(semitone, noteIndex) * Math.pow(2, octave);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(sfxGain);

    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.start();
    osc.stop(t + 0.12);

    // Add harmony at streak 5+
    if (streak >= 5) {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(sfxGain);
      osc2.type = 'sine';
      osc2.frequency.value = freq * 1.5; // perfect fifth
      gain2.gain.setValueAtTime(0.04, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc2.start();
      osc2.stop(t + 0.1);
    }

    // Add chord at streak 10+
    if (streak >= 10) {
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.connect(gain3);
      gain3.connect(sfxGain);
      osc3.type = 'sine';
      osc3.frequency.value = freq * 1.26; // major third
      gain3.gain.setValueAtTime(0.03, t);
      gain3.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc3.start();
      osc3.stop(t + 0.1);
    }
  }

  // Bullet cancel - whoosh sweep sound
  function playBulletCancel() {
    if (!ctx || !initialized) return;
    const t = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(0.35);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.3);
    filter.Q.value = 2;
    const gain = ctx.createGain();
    env(gain.gain, 0.15, 0.01, 0.05, 0.08, 0.2, t);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(sfxGain);
    noise.start(t);
  }

  // Boss warning siren - oscillating between two frequencies
  function playBossWarning() {
    if (!ctx || !initialized) return;
    const t = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      const startTime = t + i * 1.0;
      osc.frequency.setValueAtTime(300, startTime);
      osc.frequency.linearRampToValueAtTime(600, startTime + 0.5);
      osc.frequency.linearRampToValueAtTime(300, startTime + 1.0);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.05);
      gain.gain.setValueAtTime(0.12, startTime + 0.9);
      gain.gain.linearRampToValueAtTime(0, startTime + 1.0);
      osc.connect(gain);
      gain.connect(sfxGain);
      osc.start(startTime);
      osc.stop(startTime + 1.0);
    }
  }

  // Boss death - big explosion (low freq noise burst + descending tone)
  function playBossDeath() {
    if (!ctx || !initialized) return;
    const t = ctx.currentTime;
    // Low frequency descending tone
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.8);
    const oscGain = ctx.createGain();
    env(oscGain.gain, 0.2, 0.01, 0.05, 0.15, 0.7, t);
    osc.connect(oscGain);
    oscGain.connect(sfxGain);
    osc.start(t);
    osc.stop(t + 0.9);
    // Noise burst
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(0.6);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, t);
    filter.frequency.linearRampToValueAtTime(200, t + 0.5);
    const noiseGain = ctx.createGain();
    env(noiseGain.gain, 0.25, 0.005, 0.03, 0.12, 0.5, t);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(sfxGain);
    noise.start(t);
    // Sub bass punch
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(80, t);
    sub.frequency.exponentialRampToValueAtTime(20, t + 0.5);
    const subGain = ctx.createGain();
    env(subGain.gain, 0.3, 0.005, 0.02, 0.2, 0.4, t);
    sub.connect(subGain);
    subGain.connect(sfxGain);
    sub.start(t);
    sub.stop(t + 0.5);
  }

  // Boss entrance freeze - low bass hit with noise burst
  function playBossFreeze() {
    if (!ctx || !initialized) return;
    const t = ctx.currentTime;
    // Low 50Hz sine wave with quick decay
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(50, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.3);
    const oscGain = ctx.createGain();
    env(oscGain.gain, 0.3, 0.005, 0.03, 0.15, 0.25, t);
    osc.connect(oscGain);
    oscGain.connect(sfxGain);
    osc.start(t);
    osc.stop(t + 0.35);
    // Brief noise burst
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(0.15);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, t);
    filter.frequency.linearRampToValueAtTime(200, t + 0.1);
    const noiseGain = ctx.createGain();
    env(noiseGain.gain, 0.15, 0.005, 0.02, 0.06, 0.1, t);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(sfxGain);
    noise.start(t);
  }

  // Boss hit - heavier impact than farmer hit
  function playBossHit() {
    if (!ctx || !initialized) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
    const gain = ctx.createGain();
    env(gain.gain, 0.15, 0.005, 0.02, 0.06, 0.08, t);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Bomb - deep bass explosion + high sweep
  function playBomb() {
    if (!ctx || !initialized) return;
    const t = ctx.currentTime;
    // Deep bass
    const bass = ctx.createOscillator();
    bass.type = 'sine';
    bass.frequency.setValueAtTime(60, t);
    bass.frequency.exponentialRampToValueAtTime(30, t + 0.3);
    const bassGain = ctx.createGain();
    env(bassGain.gain, 0.25, 0.005, 0.03, 0.15, 0.25, t);
    bass.connect(bassGain);
    bassGain.connect(sfxGain);
    bass.start(t);
    bass.stop(t + 0.35);
    // High noise sweep
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(0.4);
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.setValueAtTime(4000, t);
    hpf.frequency.exponentialRampToValueAtTime(200, t + 0.35);
    const noiseGain = ctx.createGain();
    env(noiseGain.gain, 0.12, 0.005, 0.03, 0.06, 0.3, t);
    noise.connect(hpf);
    hpf.connect(noiseGain);
    noiseGain.connect(sfxGain);
    noise.start(t);
  }

  // Combo announcer audio
  const comboAudioFiles = {
    4: 'audio/combos/combo-04-mootastic.mp3',
    5: 'audio/combos/combo-05-mootacular.mp3',
    6: 'audio/combos/combo-06-udder-mageddon.mp3',
    7: 'audio/combos/combo-07-cow-lateral-damage.mp3',
    8: 'audio/combos/combo-08-bovine-blitzkrieg.mp3',
    9: 'audio/combos/combo-09-milky-melee.mp3',
    10: 'audio/combos/combo-10-deca-moo.mp3',
    11: 'audio/combos/combo-11-herd-ocalypse.mp3',
    12: 'audio/combos/combo-12-dirty-dozen-dairy.mp3',
    13: 'audio/combos/combo-13-unlucky-for-them.mp3',
    14: 'audio/combos/combo-14-calf-catastrophe.mp3',
    15: 'audio/combos/combo-15-full-cream-frenzy.mp3',
    16: 'audio/combos/combo-16-sweet-sixteen-stampede.mp3',
    17: 'audio/combos/combo-17-pasture-prime.mp3',
    18: 'audio/combos/combo-18-steaks-are-high.mp3',
    20: 'audio/combos/combo-20-total-cow-nage.mp3',
    25: 'audio/combos/combo-25-legendary-herd.mp3',
  };
  const comboAudioBuffers = {};

  function loadComboAudio() {
    for (const [combo, file] of Object.entries(comboAudioFiles)) {
      fetch(file)
        .then(r => r.arrayBuffer())
        .then(buf => ctx.decodeAudioData(buf))
        .then(decoded => { comboAudioBuffers[combo] = decoded; })
        .catch(e => console.warn('Failed to load combo audio ' + file + ':', e));
    }
  }

  function playComboAnnouncer(comboCount) {
    if (!initialized || !ctx) return;
    // Find exact match first, then highest threshold below comboCount
    const key = String(comboCount);
    if (comboAudioBuffers[key]) {
      playOneShot(comboAudioBuffers[key], 0.7);
      return;
    }
    // Fall back to highest matching threshold
    const thresholds = Object.keys(comboAudioBuffers).map(Number).sort((a, b) => b - a);
    for (const t of thresholds) {
      if (comboCount >= t && comboAudioBuffers[String(t)]) {
        playOneShot(comboAudioBuffers[String(t)], 0.7);
        return;
      }
    }
  }

  // Helper: play a buffer as a one-shot sound at given volume
  function playOneShot(buffer, volume) {
    if (!buffer || !ctx) return;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(masterGain);
    gain.gain.value = volume;
    source.start();
  }

  // Level start audio
  const levelAudioFiles = {};
  for (let i = 1; i <= 34; i++) {
    const num = i < 10 ? '0' + i : '' + i;
    levelAudioFiles[i] = 'audio/levels/level-' + num + '.mp3';
  }
  const levelAudioBuffers = {};

  function loadLevelAudio() {
    for (const [lv, file] of Object.entries(levelAudioFiles)) {
      fetch(file)
        .then(r => r.arrayBuffer())
        .then(buf => ctx.decodeAudioData(buf))
        .then(decoded => { levelAudioBuffers[lv] = decoded; })
        .catch(() => {}); // silently skip missing levels
    }
  }

  function playLevelStart(level) {
    if (!initialized || !ctx) return;
    // Try exact level, then fall back to highest available below
    let lv = level;
    while (lv > 0 && !levelAudioBuffers[String(lv)]) lv--;
    if (lv > 0 && levelAudioBuffers[String(lv)]) {
      playOneShot(levelAudioBuffers[String(lv)], 0.6);
    }
  }

  return {
    init,
    resume,
    toggleMute,
    isMuted,
    startBeam,
    stopBeam,
    playCowMoo,
    playCowCollected,
    playPitchfork,
    playShotgun,
    playSniper,
    playShieldOn,
    playShieldBlock,
    playPowerUp,
    playUfoHit,
    playLevelComplete,
    playGameOver,
    playMenuSelect,
    playMenuNav,
    playEnergyDepleted,
    playCombo,
    playUfoLaser,
    playFarmerHit,
    playGraze,
    playBulletCancel,
    playBomb,
    playBossWarning,
    playBossDeath,
    playBossHit,
    playBossFreeze,
    // File-based audio
    startGameMusic,
    stopGameMusic,
    startIntroSound,
    stopIntroSound,
    startAmbientHum,
    stopAmbientHum,
    playOuch,
    playSpaceshipDeath,
    playComboAnnouncer,
    playLevelStart
  };
})();
