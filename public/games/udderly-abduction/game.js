// ============================================================
// Udderly Abduction: Barrage - Bullet Hell Game Engine
// Retro pixel-art 2D browser game
// ============================================================

(() => {
'use strict';

// ============================================================
// Constants
// ============================================================
const W = 480, H = 270; // Internal resolution
const SCALE = 3;
const DISPLAY_W = W * SCALE, DISPLAY_H = H * SCALE;
const FPS = 60;
const DT = 1 / FPS;

// Game states
const STATE = {
  BOOT: 'BOOT',
  MENU: 'MENU',
  NAME_ENTRY: 'NAME_ENTRY',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE',
  GAME_OVER: 'GAME_OVER'
};

// Energy costs per second (sourced from BALANCE)
const BEAM_COST = BALANCE.ufo.beamCost;
const SHIELD_COST = BALANCE.ufo.shieldCost;
const ENERGY_REGEN = BALANCE.ufo.energyRegen;
const MAX_ENERGY = BALANCE.ufo.maxEnergy;
const MAX_HP = BALANCE.ufo.maxHp;
const ENERGY_COOLDOWN_TIME = BALANCE.ufo.energyCooldownTime;

// Scoring (sourced from BALANCE)
const COW_POINTS = BALANCE.scoring.cowPoints;
const COMBO_BONUS = BALANCE.scoring.comboBonus;
const COMBO_WINDOW = BALANCE.combo.window;
const LEVEL_COMPLETE_BASE = BALANCE.scoring.levelCompleteBase;

// Farmer types
const FARMER_PITCHFORK = 0;
const FARMER_SHOTGUN = 1;
const FARMER_SNIPER = 2;

// Power-up types
const PU_HEALTH = 0;
const PU_ENERGY = 1;
const PU_SHIELD = 2;
const PU_MAGNET = 3;
const PU_SPEED = 4;
const PU_INCINERATOR = 5;

// Cow types (sourced from BALANCE)
const COW_TYPES = BALANCE.cowTypes;

function pickCowType() {
  const types = Object.keys(COW_TYPES);
  const totalWeight = types.reduce((sum, t) => sum + COW_TYPES[t].weight, 0);
  let r = Math.random() * totalWeight;
  for (const t of types) {
    r -= COW_TYPES[t].weight;
    if (r <= 0) return t;
  }
  return 'normal';
}

// Level theme colors
const THEMES = [
  { // Prairie
    sky: '#4488cc', skyBottom: '#88bbee', ground: '#44aa44', groundAlt: '#338833',
    hills: '#55bb55', hillsBack: '#77cc77', clouds: '#ffffff', name: 'PRAIRIE'
  },
  { // Desert
    sky: '#cc8844', skyBottom: '#eebb77', ground: '#ccaa55', groundAlt: '#bb9944',
    hills: '#ddbb66', hillsBack: '#eedd88', clouds: '#eeeecc', name: 'DESERT'
  },
  { // Night
    sky: '#112244', skyBottom: '#223366', ground: '#224422', groundAlt: '#1a3a1a',
    hills: '#2a4a2a', hillsBack: '#335533', clouds: '#334455', name: 'NIGHT'
  },
  { // Snowfield
    sky: '#6688aa', skyBottom: '#99bbcc', ground: '#ddddee', groundAlt: '#ccccdd',
    hills: '#ccddee', hillsBack: '#ddeeff', clouds: '#eeeeff', name: 'SNOWFIELD'
  }
];

// ============================================================
// Canvas Setup
// ============================================================
const displayCanvas = document.getElementById('gameCanvas');
const displayCtx = displayCanvas.getContext('2d');
const offCanvas = document.createElement('canvas');
offCanvas.width = W;
offCanvas.height = H;
const ctx = offCanvas.getContext('2d');

displayCanvas.width = DISPLAY_W;
displayCanvas.height = DISPLAY_H;
displayCtx.imageSmoothingEnabled = false;

function resizeCanvas() {
  const ratio = W / H;
  let cw = window.innerWidth;
  let ch = window.innerHeight;
  if (cw / ch > ratio) {
    cw = ch * ratio;
  } else {
    ch = cw / ratio;
  }
  displayCanvas.style.width = Math.floor(cw) + 'px';
  displayCanvas.style.height = Math.floor(ch) + 'px';
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ============================================================
// Pixel Font (5x5 grid, proportional spacing)
// ============================================================
// Font data loaded from FONT_DATA_RAW (src/sprites.js)
const FONT_DATA = FONT_DATA_RAW;
const FONT_W = 5, FONT_H = 5;

function drawText(text, x, y, color, scale) {
  color = color || '#ffffff';
  scale = scale || 1;
  const str = text.toString().toUpperCase();
  let cx = x;
  ctx.fillStyle = color;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const data = FONT_DATA[ch];
    if (data) {
      for (let row = 0; row < FONT_H; row++) {
        for (let col = 0; col < FONT_W; col++) {
          if (data[row][col] === '1') {
            ctx.fillRect(cx + col * scale, y + row * scale, scale, scale);
          }
        }
      }
    }
    cx += (FONT_W + 1) * scale;
  }
}

function textWidth(text, scale) {
  scale = scale || 1;
  return text.length * (FONT_W + 1) * scale - scale;
}

function drawTextCentered(text, y, color, scale) {
  const w = textWidth(text, scale);
  drawText(text, Math.floor((W - w) / 2), y, color, scale);
}

// ============================================================
// Sprite Data & Renderer
// ============================================================
// Sprites: array of rows, each row a string of color indices
// Palette maps index chars to hex colors, '.' = transparent

// Palettes loaded from src/sprites.js (window.PALETTES already set)

// Sprites loaded from src/sprites.js (window.SPRITES already set)

function drawSprite(sprite, palette, x, y, flipX, flash, pixelScale, flashColor) {
  x = Math.round(x);
  y = Math.round(y);
  const ps = pixelScale || 1;
  for (let row = 0; row < sprite.length; row++) {
    const line = sprite[row];
    for (let col = 0; col < line.length; col++) {
      const ch = line[flipX ? line.length - 1 - col : col];
      if (ch !== '.') {
        if (flash) {
          ctx.fillStyle = flashColor || '#ffffff';
        } else {
          ctx.fillStyle = palette[ch] || '#ff00ff';
        }
        ctx.fillRect(x + col * ps, y + row * ps, ps, ps);
      }
    }
  }
}

function spriteWidth(sprite) {
  return sprite[0] ? sprite[0].length : 0;
}

function spriteHeight(sprite) {
  return sprite.length;
}

// ============================================================
// Input System
// ============================================================
const keys = {};
const justPressed = {};
let lastKeys = {};

const GAME_KEYS = new Set([
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'Space', 'KeyS', 'KeyD', 'KeyP', 'KeyM', 'KeyB', 'KeyF',
  'ShiftLeft', 'ShiftRight',
  'Enter', 'Escape', 'Backquote'
]);

document.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (gameState === STATE.NAME_ENTRY) {
    handleNameInput(e);
    e.preventDefault();
  } else if (GAME_KEYS.has(e.code)) {
    e.preventDefault();
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.code] = false;
  if (GAME_KEYS.has(e.code)) {
    e.preventDefault();
  }
});

// Also handle clicks for initial audio context resume
displayCanvas.addEventListener('click', () => {
  AudioManager.init();
  AudioManager.resume();
  if (gameState === STATE.BOOT) {
    fadeToState(STATE.MENU, 'fade');
  }
});

displayCanvas.addEventListener('keydown', (e) => {
  if (GAME_KEYS.has(e.code)) e.preventDefault();
});
displayCanvas.focus();

function updateInput() {
  for (const code in keys) {
    justPressed[code] = keys[code] && !lastKeys[code];
  }
  // Reuse lastKeys object: clear stale keys, copy current state
  for (const code in lastKeys) {
    if (!(code in keys)) delete lastKeys[code];
  }
  for (const code in keys) {
    lastKeys[code] = keys[code];
  }
}

function isDown(code) { return !!keys[code]; }
function isJust(code) { return !!justPressed[code]; }

// Movement helpers
function moveLeft() { return isDown('ArrowLeft'); }
function moveRight() { return isDown('ArrowRight'); }
function moveUp() { return isDown('ArrowUp'); }
function moveDown() { return isDown('ArrowDown'); }
function beamDown() { return isDown('Space'); }
function shieldToggle() { return isJust('KeyS'); }
function shootDown() { return isJust('KeyD'); }

// ============================================================
// Game State
// ============================================================
let gameState = STATE.BOOT;
let stateTimer = 0;
let bootTimer = 0;

// Player
let ufo = null;

// Entities
let cows = [];
let farmers = [];
let ufoLasers = [];
let powerups = [];
let scorePopups = [];

// Performance overlay
let showPerf = false;
let perfData = { fps: 0, frameMs: 0, bullets: 0, particles: 0, pickups: 0, entities: 0 };
let perfFrameCount = 0;
let perfAccum = 0;

// Particle Pool
const PARTICLE_POOL_SIZE = BALANCE.pools.particleCap;
const particlePool = new Array(PARTICLE_POOL_SIZE);
for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
  particlePool[i] = { alive: false, x: 0, y: 0, vx: 0, vy: 0, color: '', life: 0, maxLife: 0, size: 1 };
}

function spawnParticleFromPool(x, y, vx, vy, color, life, size) {
  for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
    if (!particlePool[i].alive) {
      const p = particlePool[i];
      p.alive = true;
      p.x = x; p.y = y; p.vx = vx; p.vy = vy;
      p.color = color; p.life = life; p.maxLife = life;
      p.size = size || 2;
      return p;
    }
  }
  return null;
}

function killParticle(p) { p.alive = false; }

function killAllParticles() {
  for (let i = 0; i < PARTICLE_POOL_SIZE; i++) particlePool[i].alive = false;
}

// Score Pickup Pool
const PICKUP_POOL_SIZE = BALANCE.pools.scorePickupCap;
const pickupPool = new Array(PICKUP_POOL_SIZE);
for (let i = 0; i < PICKUP_POOL_SIZE; i++) {
  pickupPool[i] = { alive: false, x: 0, y: 0, vx: 0, vy: 0, scoreValue: 0, life: 0, maxLife: 0 };
}

function spawnPickupFromPool(x, y, value) {
  for (let i = 0; i < PICKUP_POOL_SIZE; i++) {
    if (!pickupPool[i].alive) {
      const sp = pickupPool[i];
      sp.alive = true;
      sp.x = x; sp.y = y;
      sp.vx = (Math.random() - 0.5) * 40;
      sp.vy = (Math.random() - 0.5) * 40 - 20;
      sp.scoreValue = value || 10;
      sp.life = 3.0;
      sp.maxLife = 3.0;
      return sp;
    }
  }
  return null;
}

function killPickup(sp) { sp.alive = false; }

function killAllPickups() {
  for (let i = 0; i < PICKUP_POOL_SIZE; i++) pickupPool[i].alive = false;
}

// Bullet Pool (SYSTEM 1)
const BULLET_POOL_SIZE = BALANCE.pools.bulletPoolSize;
const bulletPool = [];
for (let i = 0; i < BULLET_POOL_SIZE; i++) {
  bulletPool.push({ alive: false, x: 0, y: 0, vx: 0, vy: 0, speed: 0, angle: 0, life: 0, color: '#ff0', type: 'normal', radius: 2, grazed: false, waveAmp: 0, waveFreq: 0, baseAngle: 0, spawnTime: 0 });
}

let bulletsSpawnedThisFrame = 0;
const MAX_BULLETS_PER_FRAME = BALANCE.pools.maxBulletsPerFrame;

function spawnBullet(x, y, angle, speed, color, type, life) {
  if (bulletsSpawnedThisFrame >= MAX_BULLETS_PER_FRAME) return null;
  for (let i = 0; i < BULLET_POOL_SIZE; i++) {
    if (!bulletPool[i].alive) {
      const b = bulletPool[i];
      b.alive = true;
      b.x = x; b.y = y;
      b.angle = angle;
      b.vx = Math.cos(angle) * speed;
      b.vy = Math.sin(angle) * speed;
      b.speed = speed;
      b.color = color;
      b.type = type || 'normal';
      b.life = life || 5;
      b.radius = type === 'large' ? 4 : 2;
      b.grazed = false;
      b.waveAmp = 0;
      b.waveFreq = 0;
      b.baseAngle = 0;
      b.spawnTime = 0;
      bulletsSpawnedThisFrame++;
      return b;
    }
  }
  return null;
}

function killBullet(b) { b.alive = false; }

function forEachBullet(fn) {
  for (let i = 0; i < BULLET_POOL_SIZE; i++) {
    if (bulletPool[i].alive) fn(bulletPool[i]);
  }
}

function countAliveBullets() {
  let c = 0;
  for (let i = 0; i < BULLET_POOL_SIZE; i++) if (bulletPool[i].alive) c++;
  return c;
}

function countAliveParticles() {
  let c = 0;
  for (let i = 0; i < PARTICLE_POOL_SIZE; i++) if (particlePool[i].alive) c++;
  return c;
}

function countAlivePickups() {
  let c = 0;
  for (let i = 0; i < PICKUP_POOL_SIZE; i++) if (pickupPool[i].alive) c++;
  return c;
}

function killAllBullets() {
  for (let i = 0; i < BULLET_POOL_SIZE; i++) bulletPool[i].alive = false;
}

// Graze system (SYSTEM 3)
let grazeMultiplier = 1.0;
let grazeDecayRate = BALANCE.graze.decayRate;
let grazeCount = 0;
let grazeFlashTimer = 0;

// Graze streak escalation (FEATURE 3)
let grazeStreak = 0;
let grazeStreakTimer = 0;

// Beam vacuum forgiveness (FEATURE 2)
let beamDeactivateTimer = 0;

// Screen flash timer (SYSTEM 6)
let screenFlashTimer = 0;

// Bomb restock tracking
let cowsSinceBomb = 0;
const BOMB_RESTOCK_EVERY = BALANCE.bombs.restockEvery;
const MAX_BOMBS = BALANCE.bombs.maxBombs;

// Boss system
let boss = null;
let bossWarningTimer = 0;

// Boss entrance freeze (FEATURE 6)
let bossFreezeTimer = 0;
let bossFreezeName = '';

// Tutorial prompts (FEATURE 7)
let tutorialSeen = {};
let tutorialActive = null; // { text, timer }

function loadTutorials() {
  try {
    const data = localStorage.getItem('udderlyBarrage_tutorials');
    tutorialSeen = data ? JSON.parse(data) : {};
  } catch(e) { tutorialSeen = {}; }
}

function saveTutorials() {
  try { localStorage.setItem('udderlyBarrage_tutorials', JSON.stringify(tutorialSeen)); } catch(e) {}
}

function showTutorial(id, text, duration) {
  if (tutorialSeen[id]) return;
  tutorialSeen[id] = true;
  saveTutorials();
  tutorialActive = { text: text, timer: duration || 3.0 };
}

// Narrative crew callout function
function showCrewCallout(speaker, text, color) {
  if (!BALANCE.narrative.enabled || !BALANCE.narrative.crewCalloutsEnabled) return;
  if (crewCalloutCooldown > 0) return;
  crewCallout = { speaker: speaker, text: text, timer: BALANCE.narrative.calloutDuration, color: color || '#ffffff' };
  crewCalloutCooldown = BALANCE.narrative.calloutCooldown;
}

// Golden Cow Prophecy persistence
function loadLoreProgress() {
  try {
    const data = localStorage.getItem('udderlyBarrage_lore');
    if (data) goldenLoreIndex = parseInt(data) || 0;
  } catch(e) { goldenLoreIndex = 0; }
}

function saveLoreProgress() {
  try { localStorage.setItem('udderlyBarrage_lore', String(goldenLoreIndex)); } catch(e) {}
}

function showLoreFragment(text) {
  loreFragment = { text: text, timer: BALANCE.narrative.loreDuration || 3.5 };
}

// Adaptive difficulty / Mercy system (FEATURE 8)
let mercyFactor = 0;

// Game progress
let score = 0;
let level = 1;
let cowsCollected = 0;
let cowsNeeded = 0;
let comboTimer = 0;
let comboCount = 0;

// Combo announcer system
const comboPhrases = {
  4:  'MOOTASTIC!',
  5:  'MOO-TACULAR!',
  6:  'UDDER-MAGEDDON!',
  7:  'COW-LATERAL DAMAGE!',
  8:  'BOVINE BLITZKRIEG!',
  9:  'MILKY MELEE!',
  10: 'DECA-MOO!',
  11: 'HERD-OCALYPSE!',
  12: 'DIRTY DOZEN DAIRY!',
  13: 'UNLUCKY FOR THEM!',
  14: 'CALF CATASTROPHE!',
  15: 'FULL CREAM FRENZY!',
  16: 'SWEET SIXTEEN STAMPEDE!',
  17: 'PASTURE PRIME!',
  18: 'STEAKS ARE HIGH!',
  20: 'TOTAL COW-NAGE!',
  25: 'LEGENDARY HERD!'
};
let announcerText = '';
let announcerTimer = 0;
let announcerScale = 1;

let levelTimer = 0;
let damageTaken = false;
let isNewGame = true;

// Screen effects
let shakeX = 0, shakeY = 0, shakeDur = 0;
let hitstopFrames = 0;
let flashTimer = 0;

// UI polish state
let displayScore = 0;
let transitionAlpha = 0;
let transitionTarget = null;
let transitionPhase = 'none'; // 'none', 'out', 'hold', 'in'
let transitionStyle = 'scanline'; // 'fade', 'scanline', 'pixelDissolve'
let transitionScanline = 0; // progress for scanline wipe
let transitionPixels = null; // pixel dissolve pattern
let bootPhase = 0;
let bootStars = [];
let bootUfoY = -30;
let bootTitleChars = 0;
let bootTitleTimer = 0;
let heartPulseTimers = [0, 0, 0, 0, 0, 0, 0];
let energyBarFlash = 0;
let comboDisplayScale = 1;
let comboDisplayTimer = 0;
let gameOverCountScore = 0;
let gameOverVoxLine = null;
let gameOverCountDone = false;
let gameOverShowStats = false;
let gameOverStatTimer = 0;
let maxComboThisGame = 0;
let totalCowsThisGame = 0;
let levelsCompletedThisGame = 0;
let levelBannerTimer = 0;
let levelBannerText = '';
let levelBannerSubtitle = '';
let menuBeamParticles = [];

// Narrative crew callout system
let crewCallout = null;  // { speaker: 'VOXXA', text: '...', timer: 0, color: '#fff' }
let crewCalloutCooldown = 0;

// Golden Cow Prophecy lore system
let goldenLoreIndex = 0;
let loreFragment = null; // { text, timer }
let cowCollectFlashTimer = 0;
let prevHp = MAX_HP;
let slowmoTimer = 0;
let slowmoFactor = 1;
let lowHpWarningTimer = 0;
let menuStarLayers = [[], [], []]; // 3 parallax layers for menu stars
let gameOverStars = [];
let gameOverCowSilhouettes = [];
let hudScoreFlashTimer = 0;

// Name entry
let playerName = '';
let nameBlinkTimer = 0;

// Leaderboard
let leaderboard = [];

// Spawn timers
let cowSpawnTimer = 0;
let farmerSpawnTimer = 0;
let powerupSpawnTimer = 0;

// Background
let bgStars = [];
let bgClouds = [];
let bgDecorations = [];
let parallaxOffset = 0;

// ============================================================
// Event Bus Listeners (COW_COLLECTED)
// ============================================================
// Scoring listener: adds points, creates score popup
GameEvents.on(EVT.COW_COLLECTED, function(d) {
  score += d.points;
  // Popup at top-left of cow (d.x/d.y are center coords)
  scorePopups.push(createScorePopup(d.x - d.w / 2, d.y - d.h / 2, '+' + d.points));
  hudScoreFlashTimer = 0.3;
});

// Combo listener: increments comboCount, resets comboTimer, checks announcer thresholds
GameEvents.on(EVT.COW_COLLECTED, function(d) {
  // combo already incremented before emit, so use d.combo
  comboTimer = COMBO_WINDOW;
  if (d.combo > maxComboThisGame) maxComboThisGame = d.combo;
  // Combo display animation
  if (d.combo > 1) {
    comboDisplayScale = 1.5 + Math.min(d.combo * 0.1, 1.0);
    comboDisplayTimer = 0.6;
  }
  // Combo announcer: find the highest matching phrase for current combo
  if (d.combo >= 4) {
    let bestMatch = null;
    for (const threshold of Object.keys(comboPhrases).map(Number).sort((a, b) => b - a)) {
      if (d.combo >= threshold) { bestMatch = threshold; break; }
    }
    if (bestMatch) {
      announcerText = comboPhrases[bestMatch];
      announcerTimer = 2.0;
      announcerScale = 1 + (bestMatch - 4) * 0.05;
      AudioManager.playComboAnnouncer(d.combo);
    }
  }
});

// Bullet cancel listener
GameEvents.on(EVT.COW_COLLECTED, function(d) {
  bulletCancel(d.x, d.y, d.combo);
});

// Effects listener: flash, shake, slowmo on big combos
GameEvents.on(EVT.COW_COLLECTED, function(d) {
  cowCollectFlashTimer = 0.1;
  // Slowmo on big combos
  if (d.combo >= BALANCE.combo.slowmoThreshold) {
    slowmoTimer = 0.4 + Math.min(d.combo * 0.05, 0.4);
  }
  // Hitstop on combo 5+
  if (d.combo >= 5) {
    triggerHitstop(BALANCE.hitstop.comboCow5);
  }
  // Screen shake scales with combo
  if (d.combo >= 3) {
    triggerShake(0.15 + d.combo * 0.02, 1 + d.combo * 0.3);
  }
  // Particles
  spawnCollectParticles(d.x, d.y);
  // Extra particle burst that scales with combo
  if (d.combo >= 3) {
    spawnCollectParticles(d.x, d.y);
  }
});

// Audio listener: plays cow collect sound, combo chime
GameEvents.on(EVT.COW_COLLECTED, function(d) {
  AudioManager.playCowCollected();
  if (d.combo > 1) {
    AudioManager.playCombo();
  }
});

// Bomb restock listener
GameEvents.on(EVT.COW_COLLECTED, function(d) {
  cowsSinceBomb++;
  if (cowsSinceBomb >= BOMB_RESTOCK_EVERY && ufo && ufo.bombs < MAX_BOMBS) {
    ufo.bombs++;
    cowsSinceBomb = 0;
    scorePopups.push(createScorePopup(ufo.x, ufo.y - 10, '+BOMB', '#44ddff'));
  }
});

// Stats listener
GameEvents.on(EVT.COW_COLLECTED, function(d) {
  totalCowsThisGame++;
});

// Heal listener
GameEvents.on(EVT.COW_COLLECTED, function(d) {
  if (ufo) {
    ufo.hp = Math.min(ufo.hp + 1, ufo.maxHp);
  }
});

// Mercy system cow collect listener (FEATURE 8)
GameEvents.on(EVT.COW_COLLECTED, function(d) {
  mercyFactor = Math.max(0, mercyFactor + BALANCE.mercy.onCowCollect);
});

// Narrative: Voxxa high combo callout
GameEvents.on(EVT.COW_COLLECTED, function(d) {
  if (d.combo >= 8 && typeof NARRATIVE !== 'undefined' && NARRATIVE.crew && NARRATIVE.crew.voxxa) {
    showCrewCallout('VOXXA', NARRATIVE.pick(NARRATIVE.crew.voxxa.highCombo), '#ff44ff');
  }
});

// Narrative: Golden Cow Prophecy lore trigger
GameEvents.on(EVT.COW_COLLECTED, function(d) {
  if (!BALANCE.narrative.enabled || !BALANCE.narrative.goldenLoreEnabled) return;
  if (d.type !== 'golden') return;
  if (typeof NARRATIVE === 'undefined' || !NARRATIVE.goldenProphecy || goldenLoreIndex >= NARRATIVE.goldenProphecy.length) return;

  showLoreFragment(NARRATIVE.goldenProphecy[goldenLoreIndex]);
  goldenLoreIndex++;
  saveLoreProgress();
});

// Power-up drop listener
GameEvents.on(EVT.COW_COLLECTED, function(d) {
  const cfg = getLevelConfig(level);
  const mercyPowerupBonus = mercyFactor * BALANCE.mercy.powerupSpawnBonus;
  if (Math.random() < (cfg.powerupChance + mercyPowerupBonus)) {
    powerups.push(createPowerup(d.x - d.w / 2, d.groundY - 80));
  }
});

// ============================================================
// Entity Factories
// ============================================================
function createUFO() {
  return {
    x: W / 2 - 11,
    y: 40,
    w: 22,
    h: 16,
    vx: 0,
    vy: 0,
    speed: BALANCE.ufo.baseSpeed,
    hp: MAX_HP,
    maxHp: MAX_HP,
    energy: MAX_ENERGY,
    maxEnergy: MAX_ENERGY,
    beamActive: false,
    shieldActive: false,
    energyCooldown: 0,
    iframes: 0,
    hitFlash: 0,
    tilt: 0,
    bobPhase: 0,
    // Beam properties
    beamX: 0,
    beamY: 0,
    beamW: 36,
    beamH: 50,
    // Laser shooting
    shootCooldown: 0,
    // Power-up timers
    magnetTimer: 0,
    speedTimer: 0,
    freeShieldTimer: 0,
    incineratorTimer: 0,
    // Shield animation
    shieldPhase: 0,
    shieldHitFlash: 0,
    // Anti-turtling
    turtleTimer: 0,
    // Focus mode (SYSTEM 4)
    focusing: false,
    baseSpeed: BALANCE.ufo.baseSpeed,
    // Bombs (SYSTEM 6)
    bombs: BALANCE.bombs.startBombs
  };
}

function createCow(x, cowType) {
  const type = cowType || pickCowType();
  const td = COW_TYPES[type];
  const sizeMult = td.sizeMult;
  const baseW = Math.round(24 * sizeMult);
  const baseH = Math.round(24 * sizeMult);
  return {
    x: x !== undefined ? x : Math.random() * (W - 20) + 10,
    y: H - 32 - baseH,
    w: baseW,
    h: baseH,
    vx: (Math.random() > 0.5 ? 1 : -1) * (60 + Math.random() * 40) * td.speedMult,
    vy: 0,
    state: 'wander', // wander, scared, abducting, collected
    walkTimer: 0,
    walkFrame: 0,
    dirChangeTimer: Math.random() * 3 + 1,
    scared: false,
    scaredTimer: 0,
    abductY: 0,
    abductProgress: 0,
    mooTimer: Math.random() * 8 + 4,
    sweatDrop: false,
    sweatTimer: 0,
    flipX: Math.random() > 0.5,
    groundY: H - 32 - baseH,
    // Cow type data
    cowType: type,
    sizeMult: sizeMult,
    speedMult: td.speedMult,
    points: td.points,
    // Flee AI state
    fleeing: false,
    fleeTimer: 0,
    // Golden sparkle
    sparkleTimer: 0
  };
}

function createFarmer(type, x) {
  const td = BALANCE.farmers.types[type];
  return {
    x: x !== undefined ? x : Math.random() * (W - 20) + 10,
    y: H - 56,
    w: 21,
    h: 24,
    vx: (Math.random() - 0.5) * td.speed,
    type: type,
    shootTimer: Math.random() * td.shootCooldown + 1,
    shootCooldown: td.shootCooldown,
    speed: td.speed,
    dirChangeTimer: Math.random() * 2 + 1,
    palette: td.color,
    aimTimer: 0,
    aiming: false,
    laserSight: false,
    flipX: false,
    walkTimer: 0,
    walkFrame: 0,
    // Alerting state
    alerted: false,
    alertTimer: 0
  };
}

// Bullet Patterns (SYSTEM 2)
const PATTERNS = {
  spiral(x, y, speed, color, count, spread) {
    const baseAngle = stateTimer * 3;
    for (let i = 0; i < count; i++) {
      const angle = baseAngle + (i / count) * Math.PI * 2;
      spawnBullet(x, y, angle, speed, color, 'normal', 5);
    }
  },
  fan(x, y, targetX, targetY, speed, color, count, arcWidth) {
    const baseAngle = Math.atan2(targetY - y, targetX - x);
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : (i / (count - 1)) - 0.5;
      const angle = baseAngle + t * arcWidth;
      spawnBullet(x, y, angle, speed, color, 'normal', 5);
    }
  },
  ring(x, y, speed, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      spawnBullet(x, y, angle, speed, color, 'normal', 5);
    }
  },
  stream(x, y, targetX, targetY, speed, color) {
    const angle = Math.atan2(targetY - y, targetX - x);
    const spread = (Math.random() - 0.5) * 0.15;
    spawnBullet(x, y, angle + spread, speed, color, 'normal', 5);
  },
  cross(x, y, speed, color) {
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + stateTimer * 2;
      spawnBullet(x, y, angle, speed, color, 'large', 5);
      spawnBullet(x, y, angle, speed * 0.7, color, 'normal', 5);
    }
  },
  wave(x, y, targetX, targetY, speed, color, count) {
    const baseAngle = Math.atan2(targetY - y, targetX - x);
    for (let i = 0; i < count; i++) {
      const offset = count <= 1 ? 0 : ((i / (count - 1)) - 0.5) * 0.8;
      const b = spawnBullet(x, y, baseAngle + offset, speed, color, 'wave', 5);
      if (b) { b.waveAmp = 40 + i * 10; b.waveFreq = 3 + Math.random(); b.baseAngle = baseAngle + offset; b.spawnTime = stateTimer; }
    }
  }
};

function createPowerup(x, y) {
  const types = [PU_HEALTH, PU_ENERGY, PU_SHIELD, PU_MAGNET, PU_SPEED, PU_INCINERATOR];
  const weights = BALANCE.powerupWeights;
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  let type = 0;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) { type = i; break; }
  }
  return {
    x: x,
    y: y,
    w: 14,
    h: 10,
    vy: -60,
    type: type,
    life: 8.0,
    bobPhase: Math.random() * Math.PI * 2,
    flash: 0
  };
}

// createParticle removed: use spawnParticle (pool-based) instead

function createScorePopup(x, y, text, color) {
  // Cap score popups to prevent unbounded array growth
  if (scorePopups.length >= 50) scorePopups.shift();
  return {
    x: x, y: y,
    text: text,
    color: color || '#ffff44',
    life: 1.2,
    maxLife: 1.2
  };
}

// ============================================================
// Boss System
// ============================================================
const BOSS_MECH = 0;
const BOSS_CROPDUSTER = 1;
const BOSS_COMBINE = 2;

function getBossTypeForLevel(lv) {
  if (lv % 25 === 0) return BOSS_COMBINE;
  if (lv % 10 === 0) return BOSS_CROPDUSTER;
  if (lv % 5 === 0) return BOSS_MECH;
  return -1;
}

function isBossWave(lv) {
  return lv % 5 === 0;
}

function createBoss(type) {
  // Scale boss HP with level for repeat encounters
  const hpScale = 1 + Math.floor((level - 1) / BALANCE.bosses.hpScale.baseDivisor) * BALANCE.bosses.hpScale.perCycle;
  const bm = BALANCE.bosses.mech;
  const bc = BALANCE.bosses.cropduster;
  const bco = BALANCE.bosses.combine;
  const defs = {
    [BOSS_MECH]: {
      hp: Math.floor(bm.baseHp * hpScale), w: bm.w, h: bm.h, speed: bm.speed, y: H - 104,
      name: bm.name, scoreBonus: bm.scoreBonus
    },
    [BOSS_CROPDUSTER]: {
      hp: Math.floor(bc.baseHp * hpScale), w: bc.w, h: bc.h, speed: bc.speed, y: 22,
      name: bc.name, scoreBonus: bc.scoreBonus
    },
    [BOSS_COMBINE]: {
      hp: Math.floor(bco.baseHp * hpScale), w: bco.w, h: bco.h, speed: bco.speed, y: H - 112,
      name: bco.name, scoreBonus: bco.scoreBonus
    }
  };
  const d = defs[type];
  return {
    x: type === BOSS_CROPDUSTER ? -d.w : W / 2 - d.w / 2,
    y: d.y,
    w: d.w,
    h: d.h,
    hp: d.hp,
    maxHp: d.hp,
    type: type,
    phase: 1,
    attackTimer: 2.0,
    attackTimer2: 0,
    moveDir: 1,
    speed: d.speed,
    alive: true,
    name: d.name,
    scoreBonus: d.scoreBonus,
    hitFlash: 0,
    addSpawnTimer: 5.0,
    spiralAngle: 0
  };
}

// Data-driven boss attack table: adding new attacks = adding a row, zero new code
const BOSS_ATTACK_TABLE = {
  [BOSS_MECH]: [
    { minPhase: 1, pattern: 'spiral', timerKey: 'attackTimer', cooldown: [2.0, 2.0, 1.2], speed: 55, color: '#ff4444', count: 12, audio: 'playShotgun', offsetY: -10 },
    { minPhase: 2, pattern: 'fan', timerKey: 'attackTimer2', cooldown: [0, 1.5, 1.5], speed: 70, color: '#ffaa44', count: 7, arcWidth: 1.0, aimed: true, audio: 'playPitchfork', offsetY: -10 },
    { minPhase: 3, pattern: 'stream', continuous: true, frameDiv: 4, speed: 90, color: '#ff6644', aimed: true, offsetY: -10 },
    { minPhase: 3, pattern: 'ring', timerKey: 'attackTimer', triggerWhen: 'mid', speed: 50, color: '#ff2222', count: 16, offsetY: -10 },
  ],
  [BOSS_CROPDUSTER]: [
    { minPhase: 1, pattern: 'column', timerKey: 'attackTimer', cooldown: [1.5, 1.5, 0.8], speed: 60, color: '#88ff44', count: 8, audio: 'playShotgun', offsetY: 10 },
    { minPhase: 2, pattern: 'cross', timerKey: 'attackTimer2', cooldown: [0, 2.0, 2.0], speed: 55, color: '#ffff44', audio: 'playPitchfork', offsetY: 10 },
    { minPhase: 3, pattern: 'wave', continuous: true, triggerRange: [0.3, 0.35], speed: 65, color: '#44ff88', count: 5, aimed: true, offsetY: 10 },
  ],
  [BOSS_COMBINE]: [
    { minPhase: 1, pattern: 'wall', timerKey: 'attackTimer', cooldown: [3.0, 3.0, 2.0], speed: 40, color: '#ff8844', count: 20, audio: 'playShotgun', offsetY: -10 },
    { minPhase: 2, pattern: 'spiral', timerKey: 'attackTimer2', cooldown: [0, 2.0, 2.0], speed: 50, color: '#ffaa22', count: 10, audio: 'playPitchfork', offsetY: -20 },
  ],
};

function executeBossAttacks(b, bx, by, ux, uy, dt) {
  const attacks = BOSS_ATTACK_TABLE[b.type];
  if (!attacks) return;

  for (let i = 0; i < attacks.length; i++) {
    const atk = attacks[i];
    if (b.phase < atk.minPhase) continue;

    const sx = bx;
    const sy = by + (atk.offsetY || 0);

    if (atk.continuous) {
      // Continuous attacks: fire based on frame timing or timer range
      if (atk.frameDiv) {
        if (Math.floor(stateTimer * 15) % atk.frameDiv === 0) {
          if (atk.aimed) {
            PATTERNS[atk.pattern](sx, sy, ux, uy, atk.speed, atk.color, atk.count);
          } else {
            PATTERNS[atk.pattern](sx, sy, atk.speed, atk.color, atk.count);
          }
        }
      } else if (atk.triggerRange) {
        if (b.attackTimer > atk.triggerRange[0] && b.attackTimer < atk.triggerRange[1]) {
          if (atk.aimed) {
            PATTERNS[atk.pattern](sx, sy, ux, uy, atk.speed, atk.color, atk.count);
          } else {
            PATTERNS[atk.pattern](sx, sy, atk.speed, atk.color, atk.count);
          }
        }
      }
    } else if (atk.triggerWhen === 'mid') {
      // Mid-timer trigger (ring bursts during attack cooldown)
      if (Math.floor(stateTimer * 2) % 4 === 0 && b[atk.timerKey] > 0.9) {
        PATTERNS[atk.pattern](sx, sy, atk.speed, atk.color, atk.count);
      }
    } else if (atk.timerKey) {
      // Timer-based attacks
      if (b[atk.timerKey] <= 0) {
        if (atk.pattern === 'column') {
          // Crop Duster column spawn logic
          for (let ci = 0; ci < atk.count; ci++) {
            spawnBullet(bx + (ci - 3.5) * 6, sy, Math.PI / 2, atk.speed + ci * 5, atk.color, 'normal', 5);
          }
        } else if (atk.pattern === 'wall') {
          // Combine wall spawn logic
          for (let wi = 0; wi < atk.count; wi++) {
            const wx = b.x + (wi / (atk.count - 1)) * b.w;
            spawnBullet(wx, sy, -Math.PI / 2, atk.speed, atk.color, 'large', 6);
          }
        } else if (atk.aimed) {
          PATTERNS[atk.pattern](sx, sy, ux, uy, atk.speed, atk.color, atk.count, atk.arcWidth);
        } else {
          PATTERNS[atk.pattern](sx, sy, atk.speed, atk.color, atk.count, 1);
        }
        b[atk.timerKey] = atk.cooldown[b.phase - 1];
        if (atk.audio) AudioManager[atk.audio]();
      }
    }
  }
}

function updateBoss(dt) {
  // Boss warning phase
  if (bossWarningTimer > 0) {
    bossWarningTimer -= dt;
    if (bossWarningTimer <= 0) {
      const bossType = getBossTypeForLevel(level);
      if (bossType >= 0) {
        boss = createBoss(bossType);
        // Boss entrance freeze (FEATURE 6)
        bossFreezeTimer = BALANCE.bossEntrance.freezeDuration;
        bossFreezeName = boss.name;
        triggerShake(0.3, 5);
        AudioManager.playBossFreeze();
        // Narrative: Voxxa boss intro callout
        if (typeof NARRATIVE !== 'undefined' && NARRATIVE.crew && NARRATIVE.crew.voxxa && NARRATIVE.crew.voxxa.bossIntro) {
          showCrewCallout('VOXXA', NARRATIVE.pick(NARRATIVE.crew.voxxa.bossIntro), '#ff44ff');
        }
      }
    }
    return;
  }

  if (!boss || !boss.alive) return;
  if (!ufo) return;

  const b = boss;
  const ux = ufo.x + ufo.w / 2;
  const uy = ufo.y + ufo.h / 2;
  const bx = b.x + b.w / 2;
  const by = b.y + b.h / 2;

  // Hit flash decay
  if (b.hitFlash > 0) b.hitFlash -= dt;

  // Phase transitions (thresholds from BALANCE)
  if (b.type === BOSS_MECH) {
    if (b.hp > BALANCE.bosses.mech.phase2Threshold) b.phase = 1;
    else if (b.hp > BALANCE.bosses.mech.phase3Threshold) b.phase = 2;
    else b.phase = 3;
  } else if (b.type === BOSS_CROPDUSTER) {
    if (b.hp > BALANCE.bosses.cropduster.phase2Threshold) b.phase = 1;
    else if (b.hp > BALANCE.bosses.cropduster.phase3Threshold) b.phase = 2;
    else b.phase = 3;
  } else if (b.type === BOSS_COMBINE) {
    if (b.hp > BALANCE.bosses.combine.phase2Threshold) b.phase = 1;
    else if (b.hp > BALANCE.bosses.combine.phase3Threshold) b.phase = 2;
    else b.phase = 3;
  }

  // Movement
  if (b.type === BOSS_MECH) {
    const spd = b.phase === 3 ? b.speed * 1.8 : b.speed;
    b.x += b.moveDir * spd * dt;
    if (b.x <= 5) { b.x = 5; b.moveDir = 1; }
    if (b.x + b.w >= W - 5) { b.x = W - 5 - b.w; b.moveDir = -1; }
  } else if (b.type === BOSS_CROPDUSTER) {
    const spd = b.phase >= 2 ? b.speed * 1.4 : b.speed;
    b.x += b.moveDir * spd * dt;
    if (b.x <= -10) { b.moveDir = 1; }
    if (b.x + b.w >= W + 10) { b.moveDir = -1; }
  } else if (b.type === BOSS_COMBINE) {
    b.x += b.moveDir * b.speed * dt;
    if (b.x <= 0) { b.x = 0; b.moveDir = 1; }
    if (b.x + b.w >= W) { b.x = W - b.w; b.moveDir = -1; }
  }

  // Spiral angle for patterns
  b.spiralAngle += dt * 2;

  // Attacks (data-driven via BOSS_ATTACK_TABLE)
  b.attackTimer -= dt;
  if (b.attackTimer2 > 0) b.attackTimer2 -= dt;

  executeBossAttacks(b, bx, by, ux, uy, dt);

  // Special case: Combine phase 3 spawns mini-farmer adds (not pattern-based)
  if (b.type === BOSS_COMBINE && b.phase === 3) {
    b.addSpawnTimer -= dt;
    if (b.addSpawnTimer <= 0 && farmers.length < 6) {
      for (let i = 0; i < 2; i++) {
        const fx = b.x + Math.random() * b.w;
        const f = createFarmer(FARMER_PITCHFORK, fx);
        farmers.push(f);
      }
      b.addSpawnTimer = 5.0;
    }
  }

  // Check boss death
  if (b.hp <= 0) {
    b.alive = false;
    boss = null;

    // Big explosion particles
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      spawnParticle(bx, by, Math.cos(angle) * speed, Math.sin(angle) * speed,
        ['#ff4444', '#ff8844', '#ffff44', '#ffffff'][Math.floor(Math.random() * 4)],
        0.5 + Math.random() * 0.5, 2 + Math.floor(Math.random() * 2));
    }

    // Score bonus
    score += b.scoreBonus;
    scorePopups.push(createScorePopup(bx - 20, by - 20, '+' + b.scoreBonus + ' BOSS', '#ff44ff'));

    // Drop 2 power-ups
    for (let i = 0; i < 2; i++) {
      const pu = createPowerup(bx + (i - 0.5) * 30, by);
      powerups.push(pu);
    }

    AudioManager.playBossDeath();
    triggerShake(0.6, 8);
    triggerHitstop(BALANCE.hitstop.bossDeath);
    screenFlashTimer = 0.5;

    // Complete the level
    cowsCollected = cowsNeeded;
  }
}

function renderBoss() {
  if (boss && boss.alive) {
    const b = boss;
    const isFlash = b.hitFlash > 0;

    if (b.type === BOSS_MECH) {
      // Large red rectangle body (mech farmer)
      ctx.fillStyle = isFlash ? '#ffffff' : '#cc2222';
      ctx.fillRect(Math.floor(b.x + 10), Math.floor(b.y + 5), b.w - 20, b.h - 10);
      // Legs
      ctx.fillStyle = isFlash ? '#ffffff' : '#882222';
      ctx.fillRect(Math.floor(b.x + 12), Math.floor(b.y + b.h - 15), 14, 15);
      ctx.fillRect(Math.floor(b.x + b.w - 26), Math.floor(b.y + b.h - 15), 14, 15);
      // Arms
      ctx.fillStyle = isFlash ? '#ffffff' : '#aa3333';
      ctx.fillRect(Math.floor(b.x), Math.floor(b.y + 15), 12, 30);
      ctx.fillRect(Math.floor(b.x + b.w - 12), Math.floor(b.y + 15), 12, 30);
      // Head/cockpit
      ctx.fillStyle = isFlash ? '#ffffff' : '#ffcc88';
      ctx.fillRect(Math.floor(b.x + 20), Math.floor(b.y), 23, 18);
      // Eyes
      if (!isFlash) {
        ctx.fillStyle = '#222222';
        ctx.fillRect(Math.floor(b.x + 24), Math.floor(b.y + 6), 4, 4);
        ctx.fillRect(Math.floor(b.x + 35), Math.floor(b.y + 6), 4, 4);
        // Hat
        ctx.fillStyle = '#884422';
        ctx.fillRect(Math.floor(b.x + 18), Math.floor(b.y - 4), 27, 6);
        ctx.fillRect(Math.floor(b.x + 22), Math.floor(b.y - 10), 19, 8);
      }
    } else if (b.type === BOSS_CROPDUSTER) {
      // Fuselage
      ctx.fillStyle = isFlash ? '#ffffff' : '#ddcc44';
      ctx.fillRect(Math.floor(b.x + 10), Math.floor(b.y + 4), b.w - 20, b.h - 8);
      // Wings
      ctx.fillStyle = isFlash ? '#ffffff' : '#ccbb33';
      ctx.fillRect(Math.floor(b.x), Math.floor(b.y + 6), b.w, 6);
      // Tail
      ctx.fillStyle = isFlash ? '#ffffff' : '#bbaa22';
      ctx.fillRect(Math.floor(b.x + b.w - 8), Math.floor(b.y), 8, b.h);
      // Propeller
      if (!isFlash) {
        ctx.fillStyle = '#666666';
        const propAngle = Math.floor(stateTimer * 20) % 2;
        if (propAngle === 0) {
          ctx.fillRect(Math.floor(b.x - 2), Math.floor(b.y + 7), 4, 1);
          ctx.fillRect(Math.floor(b.x - 2), Math.floor(b.y + 11), 4, 1);
        } else {
          ctx.fillRect(Math.floor(b.x), Math.floor(b.y + 5), 1, 4);
          ctx.fillRect(Math.floor(b.x), Math.floor(b.y + 10), 1, 4);
        }
        // Cockpit window
        ctx.fillStyle = '#88ccff';
        ctx.fillRect(Math.floor(b.x + 14), Math.floor(b.y + 6), 8, 4);
      }
    } else if (b.type === BOSS_COMBINE) {
      // Main body
      ctx.fillStyle = isFlash ? '#ffffff' : '#661111';
      ctx.fillRect(Math.floor(b.x), Math.floor(b.y + 15), b.w, b.h - 25);
      // Cab
      ctx.fillStyle = isFlash ? '#ffffff' : '#883322';
      ctx.fillRect(Math.floor(b.x + b.w - 35), Math.floor(b.y), 35, 30);
      // Header/teeth at top
      ctx.fillStyle = isFlash ? '#ffffff' : '#444444';
      ctx.fillRect(Math.floor(b.x), Math.floor(b.y + 10), b.w, 8);
      if (!isFlash) {
        ctx.fillStyle = '#888888';
        for (let i = 0; i < b.w; i += 8) {
          ctx.fillRect(Math.floor(b.x + i), Math.floor(b.y + 6), 3, 6);
        }
        // Wheels
        ctx.fillStyle = '#222222';
        ctx.fillRect(Math.floor(b.x + 10), Math.floor(b.y + b.h - 14), 20, 14);
        ctx.fillRect(Math.floor(b.x + b.w - 30), Math.floor(b.y + b.h - 14), 20, 14);
        // Window
        ctx.fillStyle = '#88ccff';
        ctx.fillRect(Math.floor(b.x + b.w - 30), Math.floor(b.y + 4), 12, 10);
      }
    }

    // HP bar above boss
    const hpBarW = 80;
    const hpBarH = 4;
    const hpBarX = Math.floor(b.x + b.w / 2 - hpBarW / 2);
    const hpBarY = Math.floor(b.y - 12);

    // Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(hpBarX - 1, hpBarY - 1, hpBarW + 2, hpBarH + 2);
    ctx.fillStyle = '#331111';
    ctx.fillRect(hpBarX, hpBarY, hpBarW, hpBarH);
    // HP fill
    const hpRatio = b.hp / b.maxHp;
    const hpColor = hpRatio > 0.5 ? '#ff4444' : hpRatio > 0.25 ? '#ff8844' : '#ffff44';
    ctx.fillStyle = hpColor;
    ctx.fillRect(hpBarX, hpBarY, Math.floor(hpBarW * hpRatio), hpBarH);
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(hpBarX, hpBarY, Math.floor(hpBarW * hpRatio), 1);
  }

  // Boss warning text
  if (bossWarningTimer > 0) {
    const flashOn = Math.floor(stateTimer * 6) % 2 === 0;
    if (flashOn) {
      ctx.globalAlpha = Math.min(1, bossWarningTimer / 0.3);
      // Background bar
      ctx.fillStyle = 'rgba(128, 0, 0, 0.5)';
      ctx.fillRect(0, H / 2 - 20, W, 40);
      drawTextCentered('WARNING', H / 2 - 10, '#ff2222', 3);
      ctx.globalAlpha = 1;
    }
  }
}

function renderBossHUD() {
  if (!boss || !boss.alive) return;
  // Large HP bar across top of screen
  const barW = 200;
  const barH = 6;
  const barX = Math.floor(W / 2 - barW / 2);
  const barY = 22;

  // Boss name
  const nameW = textWidth(boss.name, 1);
  drawText(boss.name, Math.floor(W / 2 - nameW / 2), 22, '#ff4444', 1);

  // HP bar
  const hpBarY = 30;
  ctx.fillStyle = '#000000';
  ctx.fillRect(barX - 1, hpBarY - 1, barW + 2, barH + 2);
  ctx.fillStyle = '#331111';
  ctx.fillRect(barX, hpBarY, barW, barH);

  const hpRatio = boss.hp / boss.maxHp;
  const hpColor = hpRatio > 0.5 ? '#ff2222' : hpRatio > 0.25 ? '#ff6622' : '#ffaa22';
  ctx.fillStyle = hpColor;
  ctx.fillRect(barX, hpBarY, Math.floor(barW * hpRatio), barH);
  // Segment lines
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  for (let sx = 0; sx < Math.floor(barW * hpRatio); sx += 4) {
    ctx.fillRect(barX + sx, hpBarY, 1, barH);
  }
  // Highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fillRect(barX, hpBarY, Math.floor(barW * hpRatio), 1);
}

// ============================================================
// Background Generation
// ============================================================
function initBootStars() {
  bootStars = [];
  for (let i = 0; i < 120; i++) {
    bootStars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      brightness: Math.random() * 0.6 + 0.4,
      twinkle: Math.random() * Math.PI * 2,
      size: Math.random() < 0.15 ? 2 : 1,
      speed: 0.2 + Math.random() * 0.5
    });
  }
}

function initMenuStarLayers() {
  menuStarLayers = [[], [], []];
  const counts = [40, 30, 20]; // back, mid, front
  const speeds = [0.05, 0.15, 0.3]; // parallax speeds
  const sizes = [1, 1, 2];
  for (let layer = 0; layer < 3; layer++) {
    for (let i = 0; i < counts[layer]; i++) {
      menuStarLayers[layer].push({
        x: Math.random() * W,
        y: Math.random() * (H * 0.65),
        brightness: 0.3 + Math.random() * 0.7,
        twinkle: Math.random() * Math.PI * 2,
        size: sizes[layer],
        speed: speeds[layer]
      });
    }
  }
}

function initGameOverEffects() {
  gameOverStars = [];
  for (let i = 0; i < 60; i++) {
    gameOverStars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      brightness: Math.random() * 0.5 + 0.3,
      twinkle: Math.random() * Math.PI * 2,
      size: Math.random() < 0.1 ? 2 : 1,
      speed: 0.1 + Math.random() * 0.3
    });
  }
  gameOverCowSilhouettes = [];
  for (let i = 0; i < 8; i++) {
    gameOverCowSilhouettes.push({
      x: Math.random() * W,
      y: 40 + Math.random() * (H - 80),
      vx: (Math.random() - 0.5) * 8,
      vy: -5 - Math.random() * 10,
      alpha: 0.06 + Math.random() * 0.08,
      scale: 1 + Math.random() * 0.5,
      flipX: Math.random() > 0.5
    });
  }
}

function generateTransitionPixels() {
  // Generate a shuffled array of pixel block coordinates for dissolve
  const blockSize = 6;
  const cols = Math.ceil(W / blockSize);
  const rows = Math.ceil(H / blockSize);
  transitionPixels = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      transitionPixels.push({ x: c * blockSize, y: r * blockSize, w: blockSize, h: blockSize });
    }
  }
  // Fisher-Yates shuffle
  for (let i = transitionPixels.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = transitionPixels[i];
    transitionPixels[i] = transitionPixels[j];
    transitionPixels[j] = tmp;
  }
}

initBootStars();
initMenuStarLayers();

function generateBackground() {
  bgStars = [];
  bgClouds = [];
  bgDecorations = [];

  // Stars
  for (let i = 0; i < 60; i++) {
    bgStars.push({
      x: Math.random() * W,
      y: Math.random() * (H * 0.6),
      brightness: Math.random() * 0.5 + 0.5,
      twinkle: Math.random() * Math.PI * 2
    });
  }

  // Clouds
  for (let i = 0; i < 5; i++) {
    bgClouds.push({
      x: Math.random() * W,
      y: Math.random() * 60 + 20,
      w: Math.random() * 30 + 15,
      h: Math.random() * 6 + 4,
      speed: Math.random() * 3 + 1
    });
  }

  // Ground decorations (fences, flowers, bushes)
  for (let i = 0; i < 12; i++) {
    bgDecorations.push({
      x: Math.random() * W,
      type: Math.floor(Math.random() * 3), // 0=grass, 1=flower, 2=fence
      color: ['#338833', '#ff6688', '#886644'][Math.floor(Math.random() * 3)]
    });
  }
}

// ============================================================
// Level Configuration
// ============================================================
function getLevelConfig(lv) {
  // ---- Bullet-hell difficulty curve (constants from BALANCE.difficulty) ----
  const D = BALANCE.difficulty;
  const E = D.early;
  const M = D.mid;
  const L = D.late;
  const I = D.infinite;

  let cowsNeeded, maxCows, maxFarmers, farmerTypes, projectileSpeed;
  let cowSpawnRate, farmerSpawnRate, farmerShootMult, powerupChance;

  if (lv <= E.maxLv) {
    // Early waves: gentle introduction
    cowsNeeded = E.cowsBase + lv;
    maxCows = Math.min(E.maxCowsBase + lv, E.maxCowsCap);
    maxFarmers = Math.min(lv, 2);
    farmerTypes = lv >= 3 ? [0, 1] : [0];
    projectileSpeed = E.projSpeedBase + lv * E.projSpeedPerLv;
    cowSpawnRate = E.cowSpawnBase - lv * E.cowSpawnPerLv;
    farmerSpawnRate = E.farmerSpawnBase - lv * E.farmerSpawnPerLv;
    farmerShootMult = E.farmerShootBase - lv * E.farmerShootPerLv;
    powerupChance = E.powerupChance;
  } else if (lv <= M.maxLv) {
    // Mid waves: ramp up
    cowsNeeded = M.cowsBase + lv;
    maxCows = Math.min(M.maxCowsBase + lv, M.maxCowsCap);
    maxFarmers = Math.min(1 + Math.floor(lv * 0.5), 4);
    farmerTypes = lv >= 6 ? [0, 1, 2] : [0, 1];
    projectileSpeed = M.projSpeedBase + lv * M.projSpeedPerLv;
    cowSpawnRate = Math.max(M.cowSpawnStart - (lv - 5) * M.cowSpawnPerLv, M.cowSpawnMin);
    farmerSpawnRate = Math.max(M.farmerSpawnStart - (lv - 5) * M.farmerSpawnPerLv, M.farmerSpawnMin);
    farmerShootMult = Math.max(M.farmerShootStart - (lv - 5) * M.farmerShootPerLv, M.farmerShootMin);
    powerupChance = M.powerupBase + (lv - 5) * M.powerupPerLv;
  } else if (lv <= L.maxLv) {
    // Late waves: intense bullet-hell
    cowsNeeded = L.cowsBase + Math.floor(lv * L.cowsPerLv);
    maxCows = Math.min(L.maxCowsBase + lv, L.maxCowsCap);
    maxFarmers = Math.min(2 + Math.floor(lv * 0.4), 5);
    farmerTypes = [0, 1, 2];
    projectileSpeed = L.projSpeedBase + lv * L.projSpeedPerLv;
    cowSpawnRate = Math.max(L.cowSpawnStart - (lv - 10) * L.cowSpawnPerLv, L.cowSpawnMin);
    farmerSpawnRate = Math.max(L.farmerSpawnStart - (lv - 10) * L.farmerSpawnPerLv, L.farmerSpawnMin);
    farmerShootMult = Math.max(L.farmerShootStart - (lv - 10) * L.farmerShootPerLv, L.farmerShootMin);
    powerupChance = Math.min(L.powerupBase + (lv - 10) * L.powerupPerLv, L.powerupMax);
  } else {
    // Infinite scaling (20+): relentless but fair
    const excess = lv - 20;
    cowsNeeded = I.cowsBase + Math.floor(excess * I.cowsPerExcess);
    maxCows = I.maxCows;
    maxFarmers = Math.min(I.maxFarmersBase + Math.floor(excess / 5) * I.maxFarmersPerFive, I.maxFarmersCap);
    farmerTypes = [0, 1, 2];
    projectileSpeed = Math.min(I.projSpeedBase + excess * I.projSpeedPerExcess, I.projSpeedMax);
    cowSpawnRate = Math.max(I.cowSpawnStart - excess * I.cowSpawnPerExcess, I.cowSpawnMin);
    farmerSpawnRate = Math.max(I.farmerSpawnStart - excess * I.farmerSpawnPerExcess, I.farmerSpawnMin);
    farmerShootMult = Math.max(I.farmerShootStart - excess * I.farmerShootPerExcess, I.farmerShootMin);
    powerupChance = I.powerupChance;
  }

  return {
    cowsNeeded: cowsNeeded,
    maxCows: maxCows,
    maxFarmers: maxFarmers,
    cowSpeed: D.cowSpeedBase + lv * D.cowSpeedPerLv,
    farmerTypes: farmerTypes,
    projectileSpeed: projectileSpeed,
    cowSpawnRate: cowSpawnRate,
    farmerSpawnRate: farmerSpawnRate,
    farmerShootMult: farmerShootMult,
    farmerAccuracy: Math.min(D.farmerAccuracyBase + lv * D.farmerAccuracyPerLv, D.farmerAccuracyMax),
    theme: THEMES[(lv - 1) % THEMES.length],
    powerupChance: powerupChance
  };
}

// ============================================================
// Collision Detection (AABB)
// ============================================================
function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

// ============================================================
// Leaderboard
// ============================================================
function loadLeaderboard() {
  try {
    const data = localStorage.getItem('udderlyAbduction_leaderboard');
    leaderboard = data ? JSON.parse(data) : [];
  } catch (e) {
    leaderboard = [];
  }
}

function saveLeaderboard() {
  try {
    localStorage.setItem('udderlyAbduction_leaderboard', JSON.stringify(leaderboard));
  } catch (e) {}
}

function addScore(name, sc, lv) {
  leaderboard.push({
    name: name,
    score: sc,
    level: lv,
    date: new Date().toLocaleDateString()
  });
  leaderboard.sort((a, b) => b.score - a.score);
  if (leaderboard.length > 10) leaderboard.length = 10;
  saveLeaderboard();

  // Submit to global leaderboard via parent window
  if (window.parent !== window) {
    try {
      window.parent.postMessage({
        type: 'UDDERLY_SCORE_SUBMIT',
        payload: {
          player_name: name,
          score: sc,
          level_reached: lv,
          cows_abducted: totalCowsThisGame || 0,
          max_combo: maxComboThisGame || 0
        }
      }, '*');
    } catch (e) {}
  }
}

function isHighScore(sc) {
  return leaderboard.length < 10 || sc > leaderboard[leaderboard.length - 1].score;
}

// ============================================================
// State Transitions
// ============================================================
// Retro transition between states
function fadeToState(newState, style) {
  if (transitionPhase !== 'none') return;
  transitionTarget = newState;
  transitionPhase = 'out';
  transitionAlpha = 0;
  transitionScanline = 0;
  // Cycle between retro transition styles
  const styles = ['scanline', 'pixelDissolve', 'fade'];
  transitionStyle = style || styles[Math.floor(Math.random() * styles.length)];
  if (transitionStyle === 'pixelDissolve') {
    generateTransitionPixels();
  }
}

function transitionTo(newState) {
  gameState = newState;
  stateTimer = 0;

  switch (newState) {
    case STATE.MENU:
      loadLeaderboard();
      generateBackground();
      menuBeamParticles = [];
      initMenuStarLayers();
      // Start ambient sounds for menu
      AudioManager.startAmbientHum();
      AudioManager.startIntroSound();
      AudioManager.stopGameMusic();
      break;
    case STATE.NAME_ENTRY:
      playerName = '';
      nameBlinkTimer = 0;
      break;
    case STATE.PLAYING:
      if (isNewGame) {
        // New game
        ufo = createUFO();
        score = 0;
        displayScore = 0;
        level = 1;
        cowsCollected = 0;
        comboCount = 0;
        comboTimer = 0;
        announcerTimer = 0;
        announcerText = '';
        levelTimer = 0;
        damageTaken = false;
        maxComboThisGame = 0;
        totalCowsThisGame = 0;
        levelsCompletedThisGame = 0;
        prevHp = MAX_HP;
        slowmoTimer = 0;
        slowmoFactor = 1;
        cows = [];
        farmers = [];
        killAllBullets();
        ufoLasers = [];
        powerups = [];
        killAllParticles();
        scorePopups = [];
        killAllPickups();
        grazeMultiplier = 1.0;
        grazeCount = 0;
        grazeFlashTimer = 0;
        grazeStreak = 0;
        grazeStreakTimer = 0;
        beamDeactivateTimer = 0;
        screenFlashTimer = 0;
        cowsSinceBomb = 0;
        boss = null;
        bossWarningTimer = 0;
        bossFreezeTimer = 0;
        bossFreezeName = '';
        mercyFactor = 0;
        crewCallout = null;
        crewCalloutCooldown = 0;
        loreFragment = null;
        tutorialActive = null;
        cowCollectFlashTimer = 0;
        lowHpWarningTimer = 0;
        hudScoreFlashTimer = 0;
        hitstopFrames = 0;
        shakeDur = 0;
        shakeX = 0;
        shakeY = 0;
        flashTimer = 0;
        energyBarFlash = 0;
        comboDisplayScale = 1;
        comboDisplayTimer = 0;
        isNewGame = false;
        levelBannerTimer = 2.5;
        if (BALANCE.narrative.enabled && typeof NARRATIVE !== 'undefined' && NARRATIVE.getWaveBanner) {
          const banner = NARRATIVE.getWaveBanner(1);
          levelBannerText = banner.title;
          levelBannerSubtitle = banner.subtitle;
        } else {
          levelBannerText = 'LEVEL 1';
          levelBannerSubtitle = '';
        }
      }
      // Start game music, stop menu audio
      AudioManager.stopIntroSound();
      AudioManager.stopAmbientHum();
      AudioManager.startGameMusic();
      startLevel();
      break;
    case STATE.PAUSED:
      break;
    case STATE.GAME_OVER:
      AudioManager.playGameOver();
      AudioManager.playSpaceshipDeath();
      AudioManager.stopGameMusic();
      addScore(playerName || 'ANON', score, level);
      gameOverCountScore = 0;
      gameOverVoxLine = null;
      gameOverCountDone = false;
      gameOverShowStats = false;
      gameOverStatTimer = 0;
      initGameOverEffects();
      break;
  }
}

function startLevel() {
  AudioManager.playLevelStart(level);
  const cfg = getLevelConfig(level);
  cowsNeeded = cfg.cowsNeeded;
  cowsCollected = 0;
  levelTimer = 0;
  damageTaken = false;
  cowSpawnTimer = 0.5;
  farmerSpawnTimer = 2.0;
  powerupSpawnTimer = 5.0;
  cows = [];
  farmers = [];
  killAllBullets();
  ufoLasers = [];
  powerups = [];
  killAllPickups();
  boss = null;
  bossWarningTimer = 0;
  generateBackground();

  // Boss wave setup
  if (isBossWave(level)) {
    bossWarningTimer = 3.0;
    AudioManager.playBossWarning();
    // Still spawn some cows during boss wave
    for (let i = 0; i < Math.min(3, cfg.maxCows); i++) {
      cows.push(createCow());
    }
    // No initial farmers on boss wave
    return;
  }

  // Initial cows
  const initialCows = Math.min(2 + Math.floor(level / 2), cfg.maxCows);
  for (let i = 0; i < initialCows; i++) {
    cows.push(createCow());
  }
  // Initial farmer (from level 2 onward)
  if (level >= 2) {
    const types = cfg.farmerTypes;
    farmers.push(createFarmer(types[0]));
  }
}

// ============================================================
// Name Entry Input
// ============================================================
function handleNameInput(e) {
  if (gameState !== STATE.NAME_ENTRY) return;
  const key = e.key;
  if (key === 'Enter' && playerName.length > 0) {
    AudioManager.playMenuSelect();
    fadeToState(STATE.PLAYING, 'pixelDissolve');
  } else if (key === 'Backspace') {
    playerName = playerName.slice(0, -1);
  } else if (key.length === 1 && playerName.length < 8) {
    const ch = key.toUpperCase();
    if ((ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9')) {
      playerName += ch;
      AudioManager.playMenuNav();
    }
  }
}

// ============================================================
// Spawn Logic
// ============================================================
function updateSpawning(dt) {
  const cfg = getLevelConfig(level);

  // Cow spawning
  cowSpawnTimer -= dt;
  if (cowSpawnTimer <= 0 && cows.length < cfg.maxCows) {
    const remaining = cowsNeeded - cowsCollected;
    let activeCows = 0;
    for (let ci = 0; ci < cows.length; ci++) { if (cows[ci].state !== 'collected') activeCows++; }
    if (activeCows < cfg.maxCows && remaining > 0) {
      // Spawn from edges or middle
      const r = Math.random();
      let cow;
      if (r < 0.4) {
        // Spawn from left
        cow = createCow(-16);
        cow.vx = (80 + Math.random() * 40) * cow.speedMult;
        cow.flipX = false;
      } else if (r < 0.8) {
        // Spawn from right
        cow = createCow(W + 16);
        cow.vx = -(80 + Math.random() * 40) * cow.speedMult;
        cow.flipX = true;
      } else {
        // Spawn in middle area
        cow = createCow(Math.random() * (W - 60) + 30);
        cow.vx = (Math.random() > 0.5 ? 1 : -1) * (80 + Math.random() * 40) * cow.speedMult;
        cow.flipX = cow.vx < 0;
      }
      cows.push(cow);
      // Narrative: Blinx golden cow spawn callout
      if (cow.cowType === 'golden' && typeof NARRATIVE !== 'undefined' && NARRATIVE.crew && NARRATIVE.crew.blinx) {
        showCrewCallout('BLINX', NARRATIVE.pick(NARRATIVE.crew.blinx.goldenCowSpawn), '#44ff44');
      }
      // Narrative: Blinx bull spawn callout (50% chance)
      if (cow.cowType === 'bull' && typeof NARRATIVE !== 'undefined' && NARRATIVE.crew && NARRATIVE.crew.blinx && Math.random() < 0.5) {
        showCrewCallout('BLINX', NARRATIVE.pick(NARRATIVE.crew.blinx.bullSpawn), '#44ff44');
      }
    }
    cowSpawnTimer = cfg.cowSpawnRate;
  }

  // Farmer spawning (suppressed during boss waves unless boss spawns adds)
  farmerSpawnTimer -= dt;
  if (farmerSpawnTimer <= 0 && farmers.length < cfg.maxFarmers && !boss && bossWarningTimer <= 0) {
    const types = cfg.farmerTypes;
    const type = types[Math.floor(Math.random() * types.length)];
    const r = Math.random();
    let f;
    if (r < 0.4) {
      f = createFarmer(type, -14);
      f.vx = Math.abs(f.vx) + 15;
    } else if (r < 0.8) {
      f = createFarmer(type, W + 14);
      f.vx = -(Math.abs(f.vx) + 15);
    } else {
      f = createFarmer(type, Math.random() * (W - 60) + 30);
      f.vx = (Math.random() - 0.5) * f.speed;
    }
    farmers.push(f);
    farmerSpawnTimer = cfg.farmerSpawnRate;
  }

  // Ambient power-up spawning: appear at random positions across the map
  powerupSpawnTimer -= dt;
  if (powerupSpawnTimer <= 0 && powerups.length < 3) {
    const px = Math.random() * (W - 40) + 20;
    // Vary height: some high (requires flying up), some mid, some low
    const py = 30 + Math.random() * (H - 100);
    const pu = createPowerup(px, py);
    pu.vy = 0; // don't rise, just float in place
    pu.life = 10.0;
    powerups.push(pu);
    powerupSpawnTimer = 8 + Math.random() * 7; // every 8-15 seconds
  }
}

// ============================================================
// Screen Effects
// ============================================================
function triggerShake(duration, intensity) {
  shakeDur = duration;
  shakeX = (Math.random() - 0.5) * intensity;
  shakeY = (Math.random() - 0.5) * intensity;
}

function triggerHitstop(frames) {
  hitstopFrames = frames;
}

function triggerFlash(duration) {
  flashTimer = duration;
}

// Helper to spawn a particle (pool-based)
function spawnParticle(x, y, vx, vy, color, life, size) {
  spawnParticleFromPool(x, y, vx, vy, color, life, size);
}

// Score Pickups (SYSTEM 5) - small floating score items that drift toward UFO
function spawnScorePickup(x, y, value) {
  spawnPickupFromPool(x, y, value);
}

function updateScorePickups(dt) {
  if (!ufo) return;
  const ux = ufo.x + ufo.w / 2;
  const uy = ufo.y + ufo.h / 2;
  for (let i = 0; i < PICKUP_POOL_SIZE; i++) {
    const sp = pickupPool[i];
    if (!sp.alive) continue;
    // Drift toward UFO
    const dx = ux - sp.x;
    const dy = uy - sp.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 1) {
      const pull = 120 + (3.0 - sp.life) * 80; // accelerates over time
      sp.vx += (dx / dist) * pull * dt;
      sp.vy += (dy / dist) * pull * dt;
    }
    // Friction
    sp.vx *= 0.96;
    sp.vy *= 0.96;
    sp.x += sp.vx * dt;
    sp.y += sp.vy * dt;
    sp.life -= dt;
    // Collect when close to UFO
    if (dist < 15) {
      score += Math.round(sp.scoreValue * grazeMultiplier);
      killPickup(sp);
      continue;
    }
    if (sp.life <= 0 || sp.x < -20 || sp.x > W + 20 || sp.y < -20 || sp.y > H + 20) {
      killPickup(sp);
    }
  }
}

// Bullet Cancel (SYSTEM 5)
const CANCEL_BASE_RADIUS = BALANCE.bulletCancel.baseRadius;

function bulletCancel(cx, cy, combo) {
  const radius = CANCEL_BASE_RADIUS + combo * BALANCE.bulletCancel.radiusPerCombo;
  let cancelled = 0;
  for (let i = 0; i < BULLET_POOL_SIZE; i++) {
    const b = bulletPool[i];
    if (!b.alive) continue;
    const dx = b.x - cx;
    const dy = b.y - cy;
    if (dx * dx + dy * dy < radius * radius) {
      spawnScorePickup(b.x, b.y, BALANCE.bulletCancel.scorePerBullet);
      killBullet(b);
      cancelled++;
    }
  }
  if (cancelled > 5) {
    triggerShake(0.1 + cancelled * 0.02, Math.min(8, cancelled * 0.3));
    // Ring shockwave particles
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      spawnParticle(cx, cy, Math.cos(angle) * 100, Math.sin(angle) * 100, '#88ffff', 0.4, 2);
    }
    AudioManager.playBulletCancel();
  }
  return cancelled;
}

// Bomb (SYSTEM 6)
function useBomb() {
  if (!ufo || ufo.bombs <= 0) return;
  ufo.bombs--;
  ufo.iframes = BALANCE.bombs.iframes;

  let cancelled = 0;
  for (let i = 0; i < BULLET_POOL_SIZE; i++) {
    if (bulletPool[i].alive) {
      spawnScorePickup(bulletPool[i].x, bulletPool[i].y, BALANCE.scoring.bombScorePickupValue);
      killBullet(bulletPool[i]);
      cancelled++;
    }
  }

  // Bomb damages boss
  if (boss && boss.alive) {
    boss.hp -= BALANCE.bombs.bossDamage;
    boss.hitFlash = 0.2;
    AudioManager.playBossHit();
  }

  mercyFactor = Math.min(BALANCE.mercy.maxMercy, mercyFactor + BALANCE.mercy.onBomb);
  // Narrative: K-RENCH bomb callout
  if (typeof NARRATIVE !== 'undefined' && NARRATIVE.crew && NARRATIVE.crew.krench) {
    showCrewCallout('K-RENCH', NARRATIVE.pick(NARRATIVE.crew.krench.bombUsed), '#44ddff');
  }
  // Narrative: Blinx last bomb warning (fires when down to 1 remaining after this use)
  if (ufo.bombs === 1 && typeof NARRATIVE !== 'undefined' && NARRATIVE.crew && NARRATIVE.crew.blinx && NARRATIVE.crew.blinx.bombWarning) {
    showCrewCallout('BLINX', NARRATIVE.pick(NARRATIVE.crew.blinx.bombWarning), '#ffff44');
  }
  triggerShake(0.4, 6);
  triggerHitstop(BALANCE.hitstop.bomb);
  screenFlashTimer = 0.3;
  AudioManager.playBomb();

  // Visual: expanding ring
  const cx = ufo.x + ufo.w / 2;
  const cy = ufo.y + ufo.h / 2;
  for (let i = 0; i < 32; i++) {
    const angle = (i / 32) * Math.PI * 2;
    spawnParticle(cx, cy, Math.cos(angle) * 200, Math.sin(angle) * 200, '#88ffff', 0.5, 2);
  }
}

// ============================================================
// Particle Effects
// ============================================================
function spawnBeamParticles() {
  if (!ufo || !ufo.beamActive) return;
  const bx = ufo.x + ufo.w / 2;
  const by = ufo.y + ufo.h;
  const inc = ufo.incineratorTimer > 0;
  for (let i = 0; i < 2; i++) {
    spawnParticle(
      bx + (Math.random() - 0.5) * ufo.beamW,
      by + Math.random() * ufo.beamH,
      (Math.random() - 0.5) * 5,
      -15 - Math.random() * 10,
      inc ? (Math.random() > 0.5 ? '#ff6600' : '#ffaa00') : (Math.random() > 0.5 ? '#55ff55' : '#88ffaa'),
      0.4 + Math.random() * 0.3,
      1
    );
  }
}

function spawnCollectParticles(x, y) {
  // Ring burst of particles
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 25 + Math.random() * 55;
    spawnParticle(
      x, y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      ['#ffff44', '#55ff55', '#ffffff', '#88ffaa', '#ffff88'][Math.floor(Math.random() * 5)],
      0.3 + Math.random() * 0.4,
      Math.random() > 0.6 ? 2 : 1
    );
  }
  // Central flash particles (larger, shorter lived)
  for (let i = 0; i < 4; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 5 + Math.random() * 15;
    spawnParticle(
      x, y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      '#ffffff',
      0.1 + Math.random() * 0.1,
      3
    );
  }
}

function spawnHitParticles(x, y) {
  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 30 + Math.random() * 30;
    spawnParticle(
      x, y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      ['#ff4444', '#ff8844', '#ffff44'][Math.floor(Math.random() * 3)],
      0.2 + Math.random() * 0.2,
      1
    );
  }
}

function spawnShieldHitParticles(x, y) {
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 30 + Math.random() * 40;
    spawnParticle(
      x, y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      ['#4488ff', '#44ddff', '#ffffff'][Math.floor(Math.random() * 3)],
      0.2 + Math.random() * 0.25,
      1
    );
  }
}

function spawnMuzzleFlash(x, y) {
  for (let i = 0; i < 4; i++) {
    spawnParticle(
      x, y,
      (Math.random() - 0.5) * 20,
      -10 - Math.random() * 10,
      '#ffff88',
      0.1 + Math.random() * 0.1,
      1
    );
  }
}

// Reusable rect for beam collision checks (avoids per-frame allocation)
const _beamRect = { x: 0, y: 0, w: 0, h: 0 };

// ============================================================
// UPDATE: Playing State
// ============================================================
function updatePlaying(dt) {
  bulletsSpawnedThisFrame = 0;

  // Boss entrance freeze (FEATURE 6) - freeze all gameplay, only advance stateTimer for animations
  if (bossFreezeTimer > 0) {
    bossFreezeTimer -= dt;
    stateTimer += dt;
    return;
  }

  if (hitstopFrames > 0) {
    hitstopFrames--;
    return;
  }

  // Slowmo effect for big combos
  if (slowmoTimer > 0) {
    slowmoTimer -= dt;
    slowmoFactor = 0.3 + 0.7 * (1 - Math.min(1, slowmoTimer / 0.3));
    if (slowmoTimer <= 0) slowmoFactor = 1;
    dt *= slowmoFactor;
  }

  levelTimer += dt;
  stateTimer += dt;

  // Update shake
  if (shakeDur > 0) {
    shakeDur -= dt;
    shakeX = (Math.random() - 0.5) * shakeDur * 8;
    shakeY = (Math.random() - 0.5) * shakeDur * 8;
  } else {
    shakeX = 0;
    shakeY = 0;
  }

  // Update flash timer
  if (flashTimer > 0) flashTimer -= dt;

  // Cow collect screen flash
  if (cowCollectFlashTimer > 0) cowCollectFlashTimer -= dt;

  // Smooth score roll-up
  if (displayScore < score) {
    const diff = score - displayScore;
    const step = Math.max(1, Math.ceil(diff * 8 * dt));
    displayScore = Math.min(score, displayScore + step);
  }

  // Heart pulse on HP change
  if (ufo && ufo.hp !== prevHp) {
    if (ufo.hp < prevHp) {
      // Lost HP - pulse remaining hearts
      for (let i = 0; i < ufo.hp; i++) heartPulseTimers[i] = 0.4;
    } else {
      // Gained HP - pulse new heart
      heartPulseTimers[ufo.hp - 1] = 0.4;
    }
    prevHp = ufo.hp;
  }
  for (let i = 0; i < heartPulseTimers.length; i++) {
    if (heartPulseTimers[i] > 0) heartPulseTimers[i] -= dt;
  }

  // Combo display animation
  if (comboDisplayTimer > 0) {
    comboDisplayTimer -= dt;
    comboDisplayScale = 1 + (comboDisplayScale - 1) * 0.92; // ease back to 1
  }

  // Low HP warning overlay timer
  if (ufo && ufo.hp <= 2) {
    lowHpWarningTimer += dt;
  } else {
    lowHpWarningTimer = 0;
  }

  // HUD score flash
  if (hudScoreFlashTimer > 0) hudScoreFlashTimer -= dt;

  // Energy bar flash
  if (ufo && ufo.energyCooldown > 0) {
    energyBarFlash += dt * 10;
  } else {
    energyBarFlash = 0;
  }

  // Level banner
  if (levelBannerTimer > 0) levelBannerTimer -= dt;

  // Combo timer
  if (comboTimer > 0) comboTimer -= dt;
  if (comboTimer <= 0 && comboCount > 0) {
    // Ring shatter particles (FEATURE 4)
    if (ufo) {
      const shatterCount = BALANCE.comboRing.shatterParticles;
      for (let i = 0; i < shatterCount; i++) {
        const angle = (i / shatterCount) * Math.PI * 2;
        spawnParticle(
          ufo.x + ufo.w / 2 + Math.cos(angle) * 20,
          ufo.y + ufo.h / 2 + Math.sin(angle) * 20,
          Math.cos(angle) * BALANCE.comboRing.shatterSpeed,
          Math.sin(angle) * BALANCE.comboRing.shatterSpeed,
          '#ff4444', 0.3, 1
        );
      }
    }
    comboCount = 0;
  } else if (comboTimer <= 0) {
    comboCount = 0;
  }

  // Announcer timer
  if (announcerTimer > 0) announcerTimer -= dt;

  // Graze multiplier decay (SYSTEM 3)
  grazeMultiplier = Math.max(1.0, grazeMultiplier - grazeDecayRate * dt);
  if (grazeFlashTimer > 0) grazeFlashTimer -= dt;

  // Graze streak decay (FEATURE 3)
  if (grazeStreakTimer > 0) {
    grazeStreakTimer -= dt;
    if (grazeStreakTimer <= 0) grazeStreak = 0;
  }

  // Beam vacuum forgiveness timer (FEATURE 2)
  if (beamDeactivateTimer > 0) beamDeactivateTimer -= dt;

  // Screen flash timer (SYSTEM 6)
  if (screenFlashTimer > 0) screenFlashTimer -= dt;

  // Tutorial timer (FEATURE 7)
  if (tutorialActive) {
    tutorialActive.timer -= dt;
    if (tutorialActive.timer <= 0) tutorialActive = null;
  }

  // Narrative crew callout timer
  if (crewCallout) {
    crewCallout.timer -= dt;
    if (crewCallout.timer <= 0) crewCallout = null;
  }
  if (crewCalloutCooldown > 0) crewCalloutCooldown -= dt;

  // Narrative lore fragment timer
  if (loreFragment) {
    loreFragment.timer -= dt;
    if (loreFragment.timer <= 0) loreFragment = null;
  }

  // Tutorial triggers (FEATURE 7)
  if (level <= 2 && countAliveBullets() > 0 && !tutorialSeen['focus']) {
    showTutorial('focus', 'HOLD SHIFT TO FOCUS', 3.0);
  }
  if (grazeCount === 1 && !tutorialSeen['graze']) {
    showTutorial('graze', 'NICE! FLY CLOSE FOR BONUS', 2.5);
  }
  if (farmers.length > 0 && ufoLasers.length === 0 && level <= 2 && stateTimer > 3 && !tutorialSeen['shoot']) {
    showTutorial('shoot', 'PRESS D TO SHOOT FARMERS', 3.0);
  }
  if (ufo && ufo.hp <= 2 && ufo.bombs > 0 && !tutorialSeen['bomb']) {
    showTutorial('bomb', 'PRESS B TO BOMB!', 3.0);
  }
  if (bossWarningTimer > 0 && !tutorialSeen['boss']) {
    showTutorial('boss', 'BOSS! SHOOT WITH D', 2.5);
  }

  // Mercy system passive updates (FEATURE 8)
  mercyFactor = Math.max(0, mercyFactor - BALANCE.mercy.passiveDecay * dt);
  if (ufo && ufo.hp <= BALANCE.mercy.lowHpThreshold) {
    mercyFactor = Math.min(BALANCE.mercy.maxMercy, mercyFactor + BALANCE.mercy.lowHpRate * dt);
  }

  updateUFO(dt);
  updateCows(dt);
  updateFarmers(dt);
  updateBoss(dt);
  updateProjectiles(dt);
  updateUfoLasers(dt);
  updatePowerups(dt);
  updateParticles(dt);
  updateScorePopups(dt);
  updateScorePickups(dt);
  updateSpawning(dt);

  // Check pause
  if (isJust('KeyP') || isJust('Escape')) {
    transitionTo(STATE.PAUSED);
  }

  // Check mute
  if (isJust('KeyM')) {
    AudioManager.toggleMute();
  }

  // Check level complete - seamless transition, no pause
  // Boss waves require boss to be dead (can't skip boss by collecting cows)
  const bossBlocksProgress = (boss && boss.alive) || bossWarningTimer > 0;
  if (cowsCollected >= cowsNeeded && !bossBlocksProgress) {
    // Calculate bonus
    const timeBonus = Math.max(0, Math.floor((120 - levelTimer) * 5));
    const noDamageBonus = damageTaken ? 0 : 300;
    const levelBonus = LEVEL_COMPLETE_BASE + timeBonus + noDamageBonus;
    score += levelBonus;
    scorePopups.push(createScorePopup(W / 2 - 20, H / 2 - 20, '+' + levelBonus, '#55ff55'));
    AudioManager.playLevelComplete();
    levelsCompletedThisGame++;
    // Narrative: Voxxa level complete callout
    if (typeof NARRATIVE !== 'undefined' && NARRATIVE.crew && NARRATIVE.crew.voxxa && NARRATIVE.crew.voxxa.levelComplete) {
      showCrewCallout('VOXXA', NARRATIVE.pick(NARRATIVE.crew.voxxa.levelComplete), '#ff44ff');
    }
    level++;
    AudioManager.playLevelStart(level);
    // Clear boss state
    boss = null;
    bossWarningTimer = 0;
    // Level banner
    levelBannerTimer = 2.5;
    if (BALANCE.narrative.enabled && typeof NARRATIVE !== 'undefined' && NARRATIVE.getWaveBanner) {
      const banner = NARRATIVE.getWaveBanner(level);
      levelBannerText = banner.title;
      levelBannerSubtitle = banner.subtitle;
    } else {
      levelBannerText = 'LEVEL ' + level;
      levelBannerSubtitle = '';
    }
    // Continue with existing entities but clear bullets for clean start
    killAllBullets();
    killAllPickups();
    const cfg = getLevelConfig(level);
    cowsNeeded = cfg.cowsNeeded;
    cowsCollected = 0;
    levelTimer = 0;
    damageTaken = false;
    cowSpawnTimer = 0.3;
    farmerSpawnTimer = 1.0;
    // Setup boss wave if the new level is a boss wave
    if (isBossWave(level)) {
      bossWarningTimer = 3.0;
      AudioManager.playBossWarning();
    }
  }

  // Check game over
  if (ufo && ufo.hp <= 0) {
    fadeToState(STATE.GAME_OVER);
  }
}

function updateUFO(dt) {
  if (!ufo) return;

  // Focus mode (SYSTEM 4)
  const focusing = isDown('ShiftLeft') || isDown('ShiftRight') || isDown('KeyF');
  ufo.focusing = focusing;

  // Bomb (SYSTEM 6)
  if (isJust('KeyB')) useBomb();

  // Focus drains energy slowly
  if (focusing && ufo.energy > 0) {
    ufo.energy -= BALANCE.focus.energyCost * dt;
  }

  // Movement
  let ax = 0, ay = 0;
  let baseSpd = ufo.speedTimer > 0 ? ufo.baseSpeed * 1.5 : ufo.baseSpeed;
  const spd = focusing ? baseSpd * BALANCE.focus.speedMult : baseSpd;

  if (moveLeft()) ax -= 1;
  if (moveRight()) ax += 1;
  if (moveUp()) ay -= 1;
  if (moveDown()) ay += 1;

  // Normalize diagonal
  if (ax !== 0 && ay !== 0) {
    ax *= 0.707;
    ay *= 0.707;
  }

  ufo.vx += ax * spd * 5 * dt;
  ufo.vy += ay * spd * 5 * dt;

  // Friction
  ufo.vx *= 0.88;
  ufo.vy *= 0.88;

  ufo.x += ufo.vx * dt;
  ufo.y += ufo.vy * dt;

  // Clamp to bounds (UFO stays in upper portion)
  ufo.x = Math.max(0, Math.min(W - ufo.w, ufo.x));
  ufo.y = Math.max(0, Math.min(H - ufo.h, ufo.y));

  // Tilt based on horizontal velocity
  ufo.tilt = ufo.vx * 0.015;

  // Bob animation
  ufo.bobPhase += dt * 3;

  // Shield animation
  ufo.shieldPhase += dt * 2.5;
  if (ufo.shieldHitFlash > 0) ufo.shieldHitFlash -= dt;

  // Energy cooldown
  if (ufo.energyCooldown > 0) {
    ufo.energyCooldown -= dt;
  }

  // I-frames
  if (ufo.iframes > 0) ufo.iframes -= dt;
  if (ufo.hitFlash > 0) ufo.hitFlash -= dt;

  // Power-up timers
  if (ufo.magnetTimer > 0) ufo.magnetTimer -= dt;
  if (ufo.speedTimer > 0) ufo.speedTimer -= dt;
  if (ufo.freeShieldTimer > 0) ufo.freeShieldTimer -= dt;
  if (ufo.incineratorTimer > 0) ufo.incineratorTimer -= dt;

  // Anti-turtling: penalize staying too high for too long
  if (ufo.y < BALANCE.turtle.thresholdY) {
    ufo.turtleTimer += dt;
  } else {
    // Recover 2x faster than it accumulates
    ufo.turtleTimer = Math.max(0, ufo.turtleTimer - dt * 2);
  }
  if (ufo.turtleTimer > BALANCE.turtle.graceSec) {
    // Drain energy, increasing over time spent turtling
    const turtleExcess = ufo.turtleTimer - BALANCE.turtle.graceSec;
    const drainRate = BALANCE.turtle.drainBase + turtleExcess * BALANCE.turtle.drainScale;
    ufo.energy -= drainRate * dt;
    ufo.energy = Math.max(0, ufo.energy);
  }

  // Beam
  let beamActive = beamDown() && ufo.energyCooldown <= 0;
  if (beamActive && ufo.freeShieldTimer <= 0 && ufo.energy <= 0) {
    beamActive = false;
  }

  if (beamActive && !ufo.beamActive) {
    AudioManager.startBeam();
  } else if (!beamActive && ufo.beamActive) {
    AudioManager.stopBeam();
    beamDeactivateTimer = BALANCE.vacuum.gracePeriod;
  }
  ufo.beamActive = beamActive;

  // Shield - toggle on/off with Shift
  if (shieldToggle()) {
    ufo.shieldActive = !ufo.shieldActive;
    if (ufo.shieldActive) {
      AudioManager.playShieldOn();
    }
  }
  // Can't use shield with no energy (unless free shield)
  if (ufo.shieldActive && ufo.freeShieldTimer <= 0 && ufo.energy <= 0) {
    ufo.shieldActive = false;
  }
  if (ufo.shieldActive && ufo.energyCooldown > 0) {
    ufo.shieldActive = false;
  }

  // Beam overrides shield
  if (ufo.beamActive && ufo.shieldActive) {
    ufo.shieldActive = false;
  }

  // Energy drain/regen
  if (ufo.beamActive && ufo.freeShieldTimer <= 0) {
    ufo.energy -= BEAM_COST * dt;
  } else if (ufo.shieldActive && ufo.freeShieldTimer <= 0) {
    ufo.energy -= SHIELD_COST * dt;
  } else {
    ufo.energy += ENERGY_REGEN * dt;
  }

  ufo.energy = Math.max(0, Math.min(ufo.maxEnergy, ufo.energy));

  // Energy depleted -> cooldown
  if (ufo.energy <= 0 && (ufo.beamActive || ufo.shieldActive)) {
    ufo.beamActive = false;
    ufo.shieldActive = false;
    ufo.energyCooldown = ENERGY_COOLDOWN_TIME;
    AudioManager.stopBeam();
    AudioManager.playEnergyDepleted();
    // Narrative: K-RENCH low energy warning
    if (typeof NARRATIVE !== 'undefined' && NARRATIVE.crew && NARRATIVE.crew.krench && NARRATIVE.crew.krench.lowEnergy) {
      showCrewCallout('K-RENCH', NARRATIVE.pick(NARRATIVE.crew.krench.lowEnergy), '#44ddff');
    }
  }

  // Update beam hitbox
  const beamW = ufo.magnetTimer > 0 ? 52 : 36;
  ufo.beamW = beamW;
  ufo.beamX = ufo.x + ufo.w / 2 - beamW / 2;
  ufo.beamY = ufo.y + ufo.h;
  ufo.beamH = H - ufo.y - ufo.h - 10;

  // Beam particles
  if (ufo.beamActive) {
    spawnBeamParticles();
  }

  // Incinerator beam: instantly kill farmers caught in the beam
  if (ufo.beamActive && ufo.incineratorTimer > 0) {
    _beamRect.x = ufo.beamX; _beamRect.y = ufo.beamY; _beamRect.w = ufo.beamW; _beamRect.h = ufo.beamH;
    for (let i = farmers.length - 1; i >= 0; i--) {
      if (aabb(farmers[i], _beamRect)) {
        const f = farmers[i];
        // Fire particle burst
        for (let p = 0; p < 14; p++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 30 + Math.random() * 50;
          spawnParticle(
            f.x + f.w / 2, f.y + f.h / 2,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            ['#ff4400', '#ff8800', '#ffcc00', '#ff2200'][Math.floor(Math.random() * 4)],
            0.3 + Math.random() * 0.4,
            2
          );
        }
        scorePopups.push(createScorePopup(f.x, f.y, '+' + BALANCE.scoring.farmerIncineratePoints, '#ff8844'));
        score += BALANCE.scoring.farmerIncineratePoints;
        AudioManager.playFarmerHit();
        farmers.splice(i, 1);
      }
    }
  }

  // UFO laser shooting - dumb-fire straight down with slight horizontal drift
  if (ufo.shootCooldown > 0) ufo.shootCooldown -= dt;
  if (shootDown() && ufo.shootCooldown <= 0 && (farmers.length > 0 || (boss && boss.alive))) {
    ufo.shootCooldown = BALANCE.ufo.shootCooldown;
    const lx = ufo.x + ufo.w / 2 - 1;
    const ly = ufo.y + ufo.h;
    ufoLasers.push({
      x: lx, y: ly, w: 3, h: 10,
      vx: ufo.vx * 0.3, vy: BALANCE.ufo.laserSpeed,
      life: 4.0
    });
    AudioManager.playUfoLaser();
    spawnMuzzleFlash(lx + 1, ly + 2);
  }
}

function updateUfoLasers(dt) {
  for (let i = ufoLasers.length - 1; i >= 0; i--) {
    const l = ufoLasers[i];

    // Dumb-fire: travels straight (no seeking)
    l.x += l.vx * dt;
    l.y += l.vy * dt;
    l.life -= dt;

    if (l.life <= 0 || l.x < -20 || l.x > W + 20 || l.y > H + 20 || l.y < -20) {
      ufoLasers.splice(i, 1);
      continue;
    }

    // Check collision with farmers
    let laserConsumed = false;
    for (let j = farmers.length - 1; j >= 0; j--) {
      if (aabb(l, farmers[j])) {
        const f = farmers[j];
        spawnHitParticles(f.x + f.w / 2, f.y + f.h / 2);
        scorePopups.push(createScorePopup(f.x, f.y, '+' + BALANCE.scoring.farmerKillPoints, '#ff8844'));
        score += BALANCE.scoring.farmerKillPoints;
        AudioManager.playFarmerHit();
        triggerHitstop(BALANCE.hitstop.farmerKill);
        farmers.splice(j, 1);
        ufoLasers.splice(i, 1);
        laserConsumed = true;
        break;
      }
    }

    // Check collision with boss
    if (!laserConsumed && boss && boss.alive && aabb(l, boss)) {
      boss.hp--;
      boss.hitFlash = 0.12;
      spawnHitParticles(l.x, l.y);
      AudioManager.playBossHit();
      triggerHitstop(BALANCE.hitstop.bossHit);
      ufoLasers.splice(i, 1);
      // Narrative: K-RENCH boss hit callout (33% chance to avoid spam)
      if (Math.random() < 0.33 && typeof NARRATIVE !== 'undefined' && NARRATIVE.crew && NARRATIVE.crew.krench && NARRATIVE.crew.krench.bossHit) {
        showCrewCallout('K-RENCH', NARRATIVE.pick(NARRATIVE.crew.krench.bossHit), '#44ddff');
      }
    }
  }
}

function updateCows(dt) {
  for (let i = cows.length - 1; i >= 0; i--) {
    const cow = cows[i];

    if (cow.state === 'collected') {
      cows.splice(i, 1);
      continue;
    }

    // Moo timer
    cow.mooTimer -= dt;
    if (cow.mooTimer <= 0) {
      AudioManager.playCowMoo();
      cow.mooTimer = Math.random() * 10 + 5;
    }

    // Magnet pull: strong attraction toward UFO beam center
    if (ufo && ufo.magnetTimer > 0 && cow.state !== 'abducting' && cow.state !== 'collected') {
      const beamCx = ufo.x + ufo.w / 2;
      const cowCx = cow.x + cow.w / 2;
      const dx = beamCx - cowCx;
      const dist = Math.abs(dx);
      // Pull cows within a wide radius (most of the screen)
      if (dist < 200) {
        const pullStrength = 250 * (1 - dist / 200); // stronger when closer
        cow.vx += (dx > 0 ? 1 : -1) * pullStrength * dt;
        cow.flipX = dx < 0;
        cow.scared = true;
        cow.scaredTimer = 0.5;
        cow.sweatDrop = true;
        cow.sweatTimer = 0.8;
      }
    }

    // Cow Flee AI: cows flee from tractor beam
    if (ufo && cow.state !== 'abducting' && cow.state !== 'collected') {
      const beamCx = ufo.x + ufo.w / 2;
      const cowCx = cow.x + cow.w / 2;
      const cowTd = COW_TYPES[cow.cowType];
      const fleeRadius = cowTd.fleeRadius || 80;
      const fleeSprint = cowTd.fleeSprint || 2.5;
      const distToBeam = Math.abs(beamCx - cowCx);

      if (ufo.beamActive && distToBeam < fleeRadius) {
        // Set scared and fleeing
        cow.scared = true;
        cow.scaredTimer = 1.5;
        cow.sweatDrop = true;
        cow.sweatTimer = 0.8;
        // Only set flee velocity once at the start of fleeing, not every frame
        if (!cow.fleeing) {
          cow.fleeing = true;
          cow.fleeTimer = 1.5;
          // Sprint away from beam center
          const fleeDir = cowCx < beamCx ? -1 : 1;
          const baseSpeed = 60 + Math.random() * 40;
          cow.vx = fleeDir * baseSpeed * cow.speedMult * fleeSprint;
          cow.flipX = cow.vx < 0;
        } else {
          // Refresh flee timer while still in beam's flee radius
          cow.fleeTimer = Math.max(cow.fleeTimer, 0.5);
        }
        // Lock direction while fleeing
        cow.dirChangeTimer = 2.0;
      } else if (cow.fleeing) {
        cow.fleeTimer -= dt;
        if (cow.fleeTimer <= 0) {
          cow.fleeing = false;
        }
      }
    }

    // Check if in beam
    if (ufo && ufo.beamActive && cow.state !== 'abducting') {
      _beamRect.x = ufo.beamX; _beamRect.y = ufo.beamY; _beamRect.w = ufo.beamW; _beamRect.h = ufo.beamH;
      if (aabb(cow, _beamRect)) {
        cow.state = 'abducting';
        cow.abductY = cow.y;
        cow.abductProgress = 0;
        cow.scared = true;
        cow.sweatDrop = true;
      }
    }

    if (cow.state === 'abducting') {
      // Float straight up - one chance to catch it
      cow.y -= 80 * dt;
      cow.x += Math.sin(stateTimer * 10) * 0.3; // slight wobble

      // Vacuum forgiveness: pull cow toward UFO faster if beam just deactivated
      if (beamDeactivateTimer > 0 && ufo) {
        const ufoCx = ufo.x + ufo.w / 2;
        const ufoCy = ufo.y + ufo.h / 2;
        const cowCx = cow.x + cow.w / 2;
        const cowCy = cow.y + cow.h / 2;
        const dy = ufoCy - cowCy;
        const dx = ufoCx - cowCx;
        if (Math.abs(dy) < BALANCE.vacuum.pullRadius) {
          cow.y -= BALANCE.vacuum.pullSpeed * dt;
          cow.x += dx * 2 * dt;
        }
        // Auto-collect if very close
        if (Math.abs(dy) < BALANCE.vacuum.autoCollectDist && Math.abs(dx) < 15) {
          cow.state = 'collected';
          cowsCollected++;
          comboCount++;
          let pts = cow.points || COW_POINTS;
          if (comboCount > 1) pts += COMBO_BONUS * (comboCount - 1);
          pts = Math.round(pts * grazeMultiplier);
          GameEvents.emit(EVT.COW_COLLECTED, {
            x: cow.x + cow.w / 2, y: cow.y + cow.h / 2,
            w: cow.w, h: cow.h, combo: comboCount,
            points: pts, type: cow.cowType, groundY: cow.groundY
          });
        }
      }

      // Gone off the top - lost forever
      if (cow.y < -cow.h) {
        cows.splice(i, 1);
        continue;
      }

      // Collected when cow touches the UFO
      if (ufo && aabb(cow, ufo)) {
        cow.state = 'collected';
        cowsCollected++;
        comboCount++;

        // Calculate points (same formula as before, computed here for the event payload)
        let pts = cow.points || COW_POINTS;
        if (comboCount > 1) {
          pts += COMBO_BONUS * (comboCount - 1);
        }
        pts = Math.round(pts * grazeMultiplier);

        // Emit event - all side effects handled by listeners
        GameEvents.emit(EVT.COW_COLLECTED, {
          x: cow.x + cow.w / 2,
          y: cow.y + cow.h / 2,
          w: cow.w,
          h: cow.h,
          combo: comboCount,
          points: pts,
          type: cow.cowType,
          groundY: cow.groundY
        });
      }
    } else {
      // Wander AI - always moving fast, no idling
      cow.dirChangeTimer -= dt;
      if (cow.dirChangeTimer <= 0) {
        cow.dirChangeTimer = Math.random() * 3 + 2;
        cow.vx = -cow.vx;
        cow.flipX = !cow.flipX;
      }

      // Scared timer
      if (cow.scared) {
        cow.scaredTimer -= dt;
        if (cow.scaredTimer <= 0) {
          cow.scared = false;
          cow.sweatDrop = false;
        }
      }

      cow.x += cow.vx * dt;
      cow.y = cow.groundY;

      // Walk animation
      cow.walkTimer += dt;
      cow.walkFrame = Math.floor(cow.walkTimer * 4) % 2;

      // Bounce at screen edges - zip back and forth across full width
      // When fleeing, preserve flee speed; otherwise use normal wander speed
      if (cow.x < 0) {
        cow.x = 0;
        cow.vx = cow.fleeing ? Math.abs(cow.vx) : (60 + Math.random() * 60) * (cow.speedMult || 1);
        cow.flipX = false;
      }
      if (cow.x > W - cow.w) {
        cow.x = W - cow.w;
        cow.vx = cow.fleeing ? -Math.abs(cow.vx) : -((60 + Math.random() * 60) * (cow.speedMult || 1));
        cow.flipX = true;
      }
    }

    // Sweat drop timer
    if (cow.sweatDrop) {
      cow.sweatTimer -= dt;
      if (cow.sweatTimer <= 0) {
        cow.sweatTimer = 0.8;
      }
    }
  }
}

function updateFarmers(dt) {
  const cfg = getLevelConfig(level);

  // Farmer alerting: when beam is active, nearby farmers react (max 2-3 alerted)
  let alertedCount = 0;
  if (ufo && ufo.beamActive) {
    const beamCx = ufo.x + ufo.w / 2;
    const beamCy = ufo.y + ufo.h + ufo.beamH / 2;
    for (const f of farmers) {
      const dx = beamCx - (f.x + f.w / 2);
      const dist = Math.abs(dx);
      if (dist < BALANCE.farmers.alertRadius && alertedCount < BALANCE.farmers.alertMax) {
        f.alerted = true;
        f.alertTimer = BALANCE.farmers.alertDecay;
        alertedCount++;
      }
    }
  }

  for (let i = farmers.length - 1; i >= 0; i--) {
    const f = farmers[i];

    // Update alert timer
    if (f.alerted) {
      if (!ufo || !ufo.beamActive) {
        f.alertTimer -= dt;
        if (f.alertTimer <= 0) {
          f.alerted = false;
        }
      }
    }

    // Movement - march back and forth (or rush toward beam if alerted)
    if (f.alerted && ufo) {
      const beamCx = ufo.x + ufo.w / 2;
      const fx = f.x + f.w / 2;
      const toBeam = beamCx - fx;

      if (f.type === FARMER_SNIPER) {
        // Snipers stop moving and aim faster (reduce shoot timer faster)
        f.vx *= 0.85; // decelerate to near stop
        f.shootTimer -= dt * 0.5; // aim faster (extra tick)
      } else {
        // Regular/shotgun farmers rush toward beam at 1.5x speed
        // Dead zone: stop rushing when close enough to avoid oscillation
        if (Math.abs(toBeam) < 20) {
          f.vx *= 0.85; // decelerate near beam to avoid jitter
        } else {
          const dir = toBeam > 0 ? 1 : -1;
          f.vx = dir * f.speed * 1.5;
        }
        f.dirChangeTimer = 0.5; // don't change direction while alerted
      }
    } else {
      f.dirChangeTimer -= dt;
      if (f.dirChangeTimer <= 0) {
        // Pick a new direction, biased toward moving
        f.vx = (Math.random() > 0.5 ? 1 : -1) * (f.speed * 0.6 + Math.random() * f.speed * 0.4);
        f.dirChangeTimer = Math.random() * 1.5 + 0.5;
      }
    }

    f.x += f.vx * dt;

    // Bounce at screen edges
    if (f.x < 5) { f.x = 5; f.vx = Math.abs(f.vx); }
    if (f.x > W - 18) { f.x = W - 18; f.vx = -Math.abs(f.vx); }

    // Face movement direction
    f.flipX = f.vx < 0;

    // Walk animation
    f.walkTimer += dt;
    f.walkFrame = Math.floor(f.walkTimer * 5) % 2;

    // Shooting AI - bullet hell patterns (SYSTEM 2)
    f.shootTimer -= dt;

    // Sniper laser sight warning
    if (f.type === FARMER_SNIPER && f.shootTimer < 0.8 && f.shootTimer > 0) {
      f.laserSight = true;
    } else {
      f.laserSight = false;
    }

    if (f.shootTimer <= 0 && ufo) {
      // Reduced cooldowns (~40% faster) for bullet hell density
      const mercyShootBonus = (boss && BALANCE.mercy.disableDuringBoss) ? 0 : mercyFactor * BALANCE.mercy.shootCooldownBonus;
      f.shootTimer = f.shootCooldown * (0.6 + Math.random() * 0.5) * (cfg.farmerShootMult + mercyShootBonus);

      const fx = f.x + f.w / 2;
      const fy = f.y;
      const ux = ufo.x + ufo.w / 2;
      const uy = ufo.y + ufo.h / 2;
      const mercySpeedReduction = (boss && BALANCE.mercy.disableDuringBoss) ? 0 : mercyFactor * BALANCE.mercy.bulletSpeedReduction;
      const speed = cfg.projectileSpeed * (1 - mercySpeedReduction);

      if (f.type === FARMER_PITCHFORK) {
        // Alternate between spiral and ring patterns; count scales with level
        const spiralCount = Math.min(BALANCE.patterns.spiral.base + Math.floor(level * BALANCE.patterns.spiral.perLevel), BALANCE.patterns.spiral.max);
        const ringCount = Math.min(BALANCE.patterns.ring.base + Math.floor(level * BALANCE.patterns.ring.perLevel), BALANCE.patterns.ring.max);
        const cycle = Math.floor(stateTimer * 2) % 2;
        if (cycle === 0) {
          PATTERNS.spiral(fx, fy, speed * 0.6, '#44cc44', spiralCount, 1);
        } else {
          PATTERNS.ring(fx, fy, speed * 0.5, '#44cc44', ringCount);
        }
        AudioManager.playPitchfork();
        spawnMuzzleFlash(fx, fy - 4);
      } else if (f.type === FARMER_SHOTGUN) {
        // Wide fan aimed at UFO; count scales with level
        const bulletCount = Math.min(BALANCE.patterns.fan.base + Math.floor(level * BALANCE.patterns.fan.perLevel), BALANCE.patterns.fan.max);
        PATTERNS.fan(fx, fy, ux, uy, speed * 0.7, '#ffff44', bulletCount, 1.2);
        AudioManager.playShotgun();
        spawnMuzzleFlash(fx, fy - 4);
      } else if (f.type === FARMER_SNIPER) {
        // Rapid stream aimed at UFO; fires a burst at higher levels
        const burstCount = Math.min(BALANCE.patterns.sniper.base + Math.floor(level * BALANCE.patterns.sniper.perLevel), BALANCE.patterns.sniper.max);
        for (let si = 0; si < burstCount; si++) {
          PATTERNS.stream(fx, fy, ux, uy, speed * 1.4, '#ff4444');
        }
        AudioManager.playSniper();
        spawnMuzzleFlash(fx, fy - 4);
      }
    }
  }
}

function updateProjectiles(dt) {
  if (!ufo) return;
  const ufoCx = ufo.x + ufo.w / 2;
  const ufoCy = ufo.y + ufo.h / 2;
  const hitRadius = ufo.focusing ? BALANCE.focus.hitRadius : BALANCE.focus.normalHitRadius;
  const grazeRadius = BALANCE.graze.grazeRadius;

  for (let i = 0; i < BULLET_POOL_SIZE; i++) {
    const b = bulletPool[i];
    if (!b.alive) continue;

    // Movement
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    // Wave-type special movement (SYSTEM 2)
    if (b.type === 'wave' && b.waveAmp > 0) {
      const elapsed = stateTimer - b.spawnTime;
      const perpX = -Math.sin(b.baseAngle);
      const perpY = Math.cos(b.baseAngle);
      const waveOffset = Math.sin(elapsed * b.waveFreq) * b.waveAmp * dt;
      b.x += perpX * waveOffset;
      b.y += perpY * waveOffset;
    }

    b.life -= dt;

    // Off screen or expired
    if (b.life <= 0 || b.x < -10 || b.x > W + 10 || b.y < -10 || b.y > H + 10) {
      killBullet(b);
      continue;
    }

    // Collision with UFO
    if (ufo.iframes <= 0) {
      const dx = b.x - ufoCx;
      const dy = b.y - ufoCy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (ufo.shieldActive || ufo.freeShieldTimer > 0) {
        // Shield blocks at wider radius
        const shieldRadius = 16;
        if (dist < shieldRadius) {
          killBullet(b);
          AudioManager.playShieldBlock();
          spawnShieldHitParticles(b.x, b.y);
          ufo.shieldHitFlash = 0.15;
          if (ufo.freeShieldTimer <= 0) {
            ufo.energy -= 10;
            if (ufo.energy <= 0) {
              ufo.energy = 0;
              ufo.shieldActive = false;
              ufo.energyCooldown = ENERGY_COOLDOWN_TIME;
              AudioManager.playEnergyDepleted();
              // Narrative: K-RENCH shield break callout
              if (typeof NARRATIVE !== 'undefined' && NARRATIVE.crew && NARRATIVE.crew.krench && NARRATIVE.crew.krench.shieldBreak) {
                showCrewCallout('K-RENCH', NARRATIVE.pick(NARRATIVE.crew.krench.shieldBreak), '#44ddff');
              }
            }
          }
          continue;
        }
      } else {
        // Direct hit check (circle-based hitbox)
        if (dist < hitRadius) {
          killBullet(b);
          ufo.hp--;
          ufo.iframes = BALANCE.ufo.iframesDuration;
          ufo.hitFlash = BALANCE.ufo.hitFlashDuration;
          damageTaken = true;
          mercyFactor = Math.min(BALANCE.mercy.maxMercy, mercyFactor + BALANCE.mercy.onDamage);
          AudioManager.playUfoHit();
          AudioManager.playOuch();
          triggerShake(0.3, 4);
          triggerHitstop(3);
          triggerFlash(0.15);
          spawnHitParticles(ufoCx, ufoCy);
          // Narrative: Blinx low HP warning
          if (ufo.hp <= 2 && typeof NARRATIVE !== 'undefined' && NARRATIVE.crew && NARRATIVE.crew.blinx) {
            showCrewCallout('BLINX', NARRATIVE.pick(NARRATIVE.crew.blinx.lowHp), '#ffff44');
          }
          continue;
        }

        // Graze check (SYSTEM 3)
        if (dist < grazeRadius && dist > hitRadius && !b.grazed) {
          b.grazed = true;
          grazeCount++;
          grazeMultiplier = Math.min(grazeMultiplier + BALANCE.graze.bonusPerGraze, BALANCE.graze.maxMultiplier);
          grazeFlashTimer = 0.1;
          mercyFactor = Math.max(0, mercyFactor + BALANCE.mercy.onGraze);
          // Graze streak escalation (FEATURE 3) - spark color by streak
          grazeStreakTimer = BALANCE.grazeEscalation.streakTimeout;
          grazeStreak++;
          // Narrative: Blinx graze streak callout at milestones
          if ((grazeStreak === 5 || grazeStreak === 10 || grazeStreak === 15) && typeof NARRATIVE !== 'undefined' && NARRATIVE.crew && NARRATIVE.crew.blinx && NARRATIVE.crew.blinx.grazeStreak) {
            showCrewCallout('BLINX', NARRATIVE.pick(NARRATIVE.crew.blinx.grazeStreak), '#44ffff');
          }
          let grazeSparkColor = '#ffffff';
          if (grazeStreak >= 15) grazeSparkColor = BALANCE.grazeEscalation.streakColor15;
          else if (grazeStreak >= 10) grazeSparkColor = BALANCE.grazeEscalation.streakColor10;
          else if (grazeStreak >= 5) grazeSparkColor = BALANCE.grazeEscalation.streakColor5;
          spawnParticle(b.x, b.y, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, grazeSparkColor, 0.3, 1);
          AudioManager.playGraze(grazeMultiplier, grazeStreak);
        }
      }
    }
  }
}

function updatePowerups(dt) {
  for (let i = powerups.length - 1; i >= 0; i--) {
    const pu = powerups[i];

    // Rise then float
    if (pu.vy < 0) {
      pu.y += pu.vy * dt;
      pu.vy += 50 * dt;
      if (pu.vy >= 0) pu.vy = 0;
    }

    pu.bobPhase += dt * 4;
    pu.life -= dt;
    pu.flash += dt * 8;

    // Flicker when about to expire
    if (pu.life <= 0) {
      powerups.splice(i, 1);
      continue;
    }

    // Collision with UFO
    if (ufo && aabb(pu, ufo)) {
      applyPowerup(pu.type);
      AudioManager.playPowerUp();
      spawnCollectParticles(pu.x + pu.w / 2, pu.y + pu.h / 2);
      const names = ['HEALTH', 'ENERGY', 'SHIELD', 'MAGNET', 'SPEED', 'INCINERATOR'];
      const puPoints = BALANCE.scoring.powerupPoints;
      score += puPoints;
      scorePopups.push(createScorePopup(pu.x, pu.y, '+' + puPoints + ' ' + names[pu.type], '#44ffff'));
      // Narrative: K-RENCH powerup callout
      if (typeof NARRATIVE !== 'undefined' && NARRATIVE.crew && NARRATIVE.crew.krench && NARRATIVE.crew.krench.powerup[pu.type]) {
        showCrewCallout('K-RENCH', NARRATIVE.crew.krench.powerup[pu.type], '#44ddff');
      }
      powerups.splice(i, 1);
    }
  }
}

function applyPowerup(type) {
  if (!ufo) return;
  switch (type) {
    case PU_HEALTH:
      ufo.hp = Math.min(ufo.hp + 1, ufo.maxHp);
      break;
    case PU_ENERGY:
      ufo.energy = ufo.maxEnergy;
      ufo.energyCooldown = 0;
      break;
    case PU_SHIELD:
      ufo.freeShieldTimer = BALANCE.powerupDurations.shield;
      break;
    case PU_MAGNET:
      ufo.magnetTimer = BALANCE.powerupDurations.magnet;
      break;
    case PU_SPEED:
      ufo.speedTimer = BALANCE.powerupDurations.speed;
      break;
    case PU_INCINERATOR:
      ufo.incineratorTimer = BALANCE.powerupDurations.incinerator;
      break;
  }
}

function updateParticles(dt) {
  for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
    const p = particlePool[i];
    if (!p.alive) continue;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) {
      killParticle(p);
    }
  }
}

function updateScorePopups(dt) {
  for (let i = scorePopups.length - 1; i >= 0; i--) {
    const sp = scorePopups[i];
    sp.y -= 20 * dt;
    sp.life -= dt;
    if (sp.life <= 0) {
      scorePopups.splice(i, 1);
    }
  }
}

// ============================================================
// RENDER
// ============================================================
function render() {
  ctx.clearRect(0, 0, W, H);

  switch (gameState) {
    case STATE.BOOT:
      renderBoot();
      break;
    case STATE.MENU:
      renderMenu();
      break;
    case STATE.NAME_ENTRY:
      renderNameEntry();
      break;
    case STATE.PLAYING:
    case STATE.PAUSED:
      renderPlaying();
      // Cow collect flash overlay
      if (cowCollectFlashTimer > 0) {
        ctx.globalAlpha = cowCollectFlashTimer / 0.1 * 0.2;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
      // Bomb screen flash (SYSTEM 6)
      if (screenFlashTimer > 0) {
        ctx.globalAlpha = Math.min(1, screenFlashTimer / 0.3) * 0.5;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
      // Graze flash
      if (grazeFlashTimer > 0) {
        ctx.globalAlpha = grazeFlashTimer / 0.1 * 0.05;
        ctx.fillStyle = '#88ffff';
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
      // Low HP warning - red vignette pulse
      if (ufo && ufo.hp <= 2 && lowHpWarningTimer > 0) {
        const warnPulse = Math.sin(lowHpWarningTimer * 6) * 0.5 + 0.5;
        const warnAlpha = (ufo.hp === 1 ? 0.12 : 0.06) * warnPulse;
        ctx.globalAlpha = warnAlpha;
        ctx.fillStyle = '#ff0000';
        // Top and bottom vignette bars
        ctx.fillRect(0, 0, W, 20);
        ctx.fillRect(0, H - 20, W, 20);
        // Left and right
        ctx.fillRect(0, 0, 15, H);
        ctx.fillRect(W - 15, 0, 15, H);
        ctx.globalAlpha = 1;
      }
      // Slowmo visual effect - subtle blue tint
      if (slowmoTimer > 0 && slowmoFactor < 0.8) {
        ctx.globalAlpha = 0.04;
        ctx.fillStyle = '#4444ff';
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
      if (gameState === STATE.PAUSED) renderPauseOverlay();
      break;
    case STATE.GAME_OVER:
      renderGameOver();
      break;
  }

  // Retro transition overlay
  renderTransition();

  // Performance overlay (rendered last, before blit)
  if (showPerf) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, 95, 52);
    drawText('FPS:' + perfData.fps, 2, 2, '#00ff00', 1);
    drawText('MS:' + perfData.frameMs, 2, 10, '#00ff00', 1);
    drawText('BUL:' + perfData.bullets, 2, 18, '#ffff00', 1);
    drawText('PAR:' + perfData.particles, 2, 26, '#ffff00', 1);
    drawText('ENT:' + perfData.entities, 2, 34, '#ffff00', 1);
    drawText('PKP:' + perfData.pickups, 2, 42, '#ffff00', 1);
  }

  // Blit to display canvas
  displayCtx.clearRect(0, 0, DISPLAY_W, DISPLAY_H);
  displayCtx.drawImage(offCanvas, 0, 0, DISPLAY_W, DISPLAY_H);
}

function renderTransition() {
  if (transitionPhase === 'none') return;

  if (transitionStyle === 'scanline') {
    // Scanline wipe: horizontal lines sweep down the screen
    const progress = transitionAlpha; // 0 to 1
    const numLines = Math.floor(progress * H);
    ctx.fillStyle = '#000000';
    // Draw from top, every other line first, then fill in
    for (let y = 0; y < numLines; y++) {
      // Stagger: even lines first half, odd lines second half
      const lineY = y;
      if (progress < 0.5) {
        if (lineY % 2 === 0 && lineY < progress * 2 * H) {
          ctx.fillRect(0, lineY, W, 1);
        }
      } else {
        ctx.fillRect(0, lineY, W, 1);
      }
    }
  } else if (transitionStyle === 'pixelDissolve') {
    // Pixel dissolve: random blocks appear/disappear
    if (transitionPixels) {
      const count = Math.floor(transitionAlpha * transitionPixels.length);
      ctx.fillStyle = '#000000';
      for (let i = 0; i < count; i++) {
        const p = transitionPixels[i];
        ctx.fillRect(p.x, p.y, p.w, p.h);
      }
    }
  } else {
    // Simple fade
    if (transitionAlpha > 0) {
      ctx.globalAlpha = transitionAlpha;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }
}

function renderBoot() {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);

  // Animated flickering stars
  for (const star of bootStars) {
    star.twinkle += DT * (1.5 + star.speed);
    const flicker = 0.3 + Math.sin(star.twinkle) * 0.35 + Math.sin(star.twinkle * 2.7) * 0.15;
    const b = Math.floor(Math.max(0, Math.min(255, flicker * 255 * star.brightness)));
    ctx.fillStyle = `rgb(${b},${b},${Math.min(255, b + 40)})`;
    ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);
  }

  // Phase 0 (0-1s): just stars fading in
  // Phase 1 (1-2.5s): UFO descends from top
  // Phase 2 (2.5-4s): title typewriter
  // Phase 3 (4+): pulsing prompt

  if (bootTimer > 1.0) {
    // UFO descending animation
    const ufoProgress = Math.min(1, (bootTimer - 1.0) / 1.5);
    const eased = 1 - Math.pow(1 - ufoProgress, 3); // ease out cubic
    bootUfoY = -20 + eased * (H / 2 - 30);
    drawSprite(SPRITES.ufo, PALETTES.ufo, W / 2 - 11, Math.floor(bootUfoY), false, false);

    // Beam particles dripping from UFO during descent (capped to prevent array growth)
    if (ufoProgress < 1 && Math.random() < 0.3 && bootStars.length < 200) {
      const px = W / 2 - 11 + Math.random() * 22;
      const py = bootUfoY + 16;
      bootStars.push({
        x: px, y: py,
        brightness: 1,
        twinkle: 0,
        size: 1,
        speed: 3 + Math.random() * 2,
        isParticle: true,
        life: 0.5,
        vy: 20 + Math.random() * 30,
        color: Math.random() > 0.5 ? '#55ff55' : '#88ffaa'
      });
    }
  }

  // Animate boot particles (green beam drips)
  for (let i = bootStars.length - 1; i >= 0; i--) {
    const s = bootStars[i];
    if (s.isParticle) {
      s.y += (s.vy || 0) * DT;
      s.life -= DT;
      if (s.life <= 0) { bootStars.splice(i, 1); continue; }
      ctx.globalAlpha = s.life * 2;
      ctx.fillStyle = s.color || '#55ff55';
      ctx.fillRect(Math.floor(s.x), Math.floor(s.y), 1, 1);
      ctx.globalAlpha = 1;
    }
  }

  if (bootTimer > 2.5) {
    // Title typewriter effect
    const titleFull = 'UDDERLY ABDUCTION';
    bootTitleTimer += DT;
    const charsToShow = Math.min(titleFull.length, Math.floor((bootTimer - 2.5) * 14));
    const titlePart = titleFull.substring(0, charsToShow);

    // Glow behind title
    if (charsToShow > 0) {
      const tw = textWidth(titlePart, 2);
      const tx = Math.floor((W - textWidth(titleFull, 2)) / 2);
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = '#55ff55';
      ctx.fillRect(tx - 4, H / 2 - 6, tw + 8, 18);
      ctx.globalAlpha = 1;
    }

    drawTextCentered(titlePart, H / 2 - 4, '#55ff55', 2);

    // Cursor blink at end of typewriter
    if (charsToShow < titleFull.length) {
      const cursorX = Math.floor((W - textWidth(titleFull, 2)) / 2) + textWidth(titlePart, 2) + 2;
      if (Math.floor(bootTimer * 6) % 2) {
        ctx.fillStyle = '#55ff55';
        ctx.fillRect(cursorX, H / 2 - 4, 2, 10);
      }
    }
  }

  if (bootTimer > 4.0) {
    // Subtitle fade in
    const subAlpha = Math.min(1, (bootTimer - 4.0) / 0.8);
    ctx.globalAlpha = subAlpha;
    drawTextCentered('A RETRO ABDUCTION GAME', H / 2 + 18, '#668866', 1);
    ctx.globalAlpha = 1;
  }

  if (bootTimer > 4.8) {
    // Pulsing prompt
    const pulse = 0.5 + Math.sin(bootTimer * 4) * 0.5;
    const bright = Math.floor(140 + pulse * 115);
    const promptColor = `rgb(${bright},${bright},${Math.min(255, bright + 30)})`;
    drawTextCentered('PRESS ENTER OR CLICK', H / 2 + 40, promptColor, 1);
  }
}

function renderMenu() {
  // Deep space background
  ctx.fillStyle = '#060612';
  ctx.fillRect(0, 0, W, H);

  // Parallax star layers (3 layers at different speeds)
  for (let layer = 0; layer < 3; layer++) {
    const stars = menuStarLayers[layer];
    const layerSpeeds = [0.05, 0.15, 0.3];
    for (const star of stars) {
      star.twinkle += DT * (1.0 + star.brightness);
      // Slow vertical scroll for parallax
      star.y += layerSpeeds[layer] * DT * 8;
      if (star.y > H * 0.65) { star.y = -2; star.x = Math.random() * W; }

      const flicker = 0.3 + Math.sin(star.twinkle) * 0.35 + Math.sin(star.twinkle * 2.7) * 0.15;
      const b = Math.floor(Math.max(0, Math.min(255, flicker * 255 * star.brightness)));
      // Slightly blue tint for deeper stars, white for close
      const rg = layer === 0 ? Math.floor(b * 0.7) : b;
      ctx.fillStyle = `rgb(${rg},${rg},${Math.min(255, b + 30)})`;
      ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);
    }
  }

  // Subtle nebula patches (very low alpha colored rectangles)
  ctx.globalAlpha = 0.02;
  ctx.fillStyle = '#4422aa';
  ctx.fillRect(60, 20, 80, 40);
  ctx.fillStyle = '#224466';
  ctx.fillRect(300, 60, 60, 30);
  ctx.fillStyle = '#442244';
  ctx.fillRect(180, 10, 50, 25);
  ctx.globalAlpha = 1;

  // Ground area (subtle, dark)
  const theme = THEMES[2];
  ctx.fillStyle = '#0a1a0a';
  ctx.fillRect(0, H - 32, W, 32);
  ctx.fillStyle = '#0d220d';
  ctx.fillRect(0, H - 32, W, 2);

  // Dark hills silhouette
  ctx.fillStyle = '#0a150a';
  for (let x = 0; x < W; x++) {
    const h = 15 + Math.sin(x * 0.02 + 1) * 8 + Math.sin(x * 0.05) * 4;
    ctx.fillRect(x, H - 32 - h, 1, h);
  }

  // Title with pulsing glow effect
  const titleY = 26;
  const titleGlowPhase = stateTimer * 2;
  const titleGlow = 0.06 + Math.sin(titleGlowPhase) * 0.04;

  // Glow rectangle behind title
  ctx.globalAlpha = titleGlow;
  ctx.fillStyle = '#55ff55';
  const tw1 = textWidth('UDDERLY', 3);
  const tw2 = textWidth('ABDUCTION', 3);
  const tw3 = textWidth('BARRAGE', 3);
  const maxTw = Math.max(tw1, tw2, tw3);
  ctx.fillRect(Math.floor((W - maxTw) / 2) - 8, titleY - 6, maxTw + 16, 76);
  ctx.globalAlpha = 1;

  // Title text with shadow
  drawTextCentered('UDDERLY', titleY + 1, '#115511', 3);
  drawTextCentered('UDDERLY', titleY, '#55ff55', 3);
  drawTextCentered('ABDUCTION', titleY + 23, '#115511', 3);
  drawTextCentered('ABDUCTION', titleY + 22, '#55ff55', 3);
  // BARRAGE in orange/red with pulsing
  const barragePulse = 0.7 + Math.sin(stateTimer * 4) * 0.3;
  const br = Math.floor(255 * barragePulse);
  const bg = Math.floor(120 * barragePulse);
  drawTextCentered('BARRAGE', titleY + 45, '#551100', 3);
  drawTextCentered('BARRAGE', titleY + 44, `rgb(${br},${bg},0)`, 3);

  // Subtitle
  drawTextCentered('A BULLET HELL ABDUCTION GAME', titleY + 72, '#557755', 1);

  // UFO sprite with gentle bob and slight tilt feel
  const bobY = Math.sin(stateTimer * 2) * 4;
  const bobX = Math.sin(stateTimer * 1.3) * 3;
  const ufoMenuX = W / 2 - 11 + bobX;
  const ufoMenuY = titleY + 84 + bobY;

  // UFO glow underneath
  ctx.globalAlpha = 0.08 + Math.sin(stateTimer * 3) * 0.03;
  ctx.fillStyle = '#44ff88';
  ctx.fillRect(Math.floor(ufoMenuX) - 2, Math.floor(ufoMenuY) + 10, 26, 8);
  ctx.globalAlpha = 1;

  drawSprite(SPRITES.ufo, PALETTES.ufo, Math.floor(ufoMenuX), Math.floor(ufoMenuY), false, false);

  // Beam particles dripping down from menu UFO (capped to avoid unbounded growth)
  if (Math.random() < 0.5 && menuBeamParticles.length < 60) {
    menuBeamParticles.push({
      x: ufoMenuX + 6 + Math.random() * 10,
      y: ufoMenuY + 16,
      vy: 15 + Math.random() * 25,
      vx: (Math.random() - 0.5) * 4,
      life: 0.6 + Math.random() * 0.5,
      maxLife: 1.1,
      color: Math.random() > 0.5 ? '#55ff55' : (Math.random() > 0.5 ? '#88ffaa' : '#44cc66'),
      size: Math.random() > 0.7 ? 2 : 1
    });
  }
  for (let i = menuBeamParticles.length - 1; i >= 0; i--) {
    const mp = menuBeamParticles[i];
    mp.y += mp.vy * DT;
    mp.x += (mp.vx || 0) * DT;
    mp.life -= DT;
    if (mp.life <= 0 || mp.y > ufoMenuY + 60) {
      menuBeamParticles.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = (mp.life / mp.maxLife) * 0.7;
    ctx.fillStyle = mp.color;
    ctx.fillRect(Math.floor(mp.x), Math.floor(mp.y), mp.size || 1, mp.size || 1);
  }
  ctx.globalAlpha = 1;

  // Instructions with subtle formatting
  const iy = 136;
  const instrColor = '#889988';
  const keyColor = '#bbddbb';
  drawTextCentered('ARROWS - MOVE   SPACE - BEAM', iy, instrColor, 1);
  drawTextCentered('D - SHOOT   S - SHIELD', iy + 10, instrColor, 1);
  drawTextCentered('SHIFT - FOCUS (TINY HITBOX)', iy + 20, '#ff8844', 1);
  drawTextCentered('B - BOMB (CLEARS BULLETS)', iy + 30, '#ff8844', 1);
  drawTextCentered('FLY CLOSE TO BULLETS FOR GRAZE BONUS', iy + 42, '#446644', 1);
  drawTextCentered('P - PAUSE  M - MUTE', iy + 52, instrColor, 1);

  // Pulsing start prompt with green glow
  const pulse = 0.3 + Math.sin(stateTimer * 3.5) * 0.7;
  const gBright = Math.floor(120 + pulse * 135);
  const promptCol = `rgb(${Math.floor(gBright * 0.6)},${gBright},${Math.floor(gBright * 0.6)})`;

  // Glow behind prompt
  ctx.globalAlpha = pulse * 0.06;
  ctx.fillStyle = '#55ff55';
  const promptW = textWidth('PRESS ENTER TO START', 1);
  ctx.fillRect(Math.floor((W - promptW) / 2) - 4, iy + 66, promptW + 8, 10);
  ctx.globalAlpha = 1;

  drawTextCentered('PRESS ENTER TO START', iy + 68, promptCol, 1);

  // Leaderboard
  if (leaderboard.length > 0) {
    const ly = iy + 86;
    // Subtle divider line
    ctx.fillStyle = '#334433';
    ctx.fillRect(W / 2 - 60, ly - 4, 120, 1);

    // Narrative: use narrative leaderboard title, or "THE AWAKENED" if prophecy complete
    let lbTitle = 'HIGH SCORES';
    if (BALANCE.narrative.enabled && typeof NARRATIVE !== 'undefined') {
      if (NARRATIVE.goldenProphecy && goldenLoreIndex >= NARRATIVE.goldenProphecy.length) {
        lbTitle = 'THE AWAKENED';
      } else if (NARRATIVE.leaderboardTitle) {
        lbTitle = NARRATIVE.leaderboardTitle;
      }
    }
    drawTextCentered(lbTitle, ly, '#ffaa44', 1);
    const count = Math.min(5, leaderboard.length);
    for (let i = 0; i < count; i++) {
      const entry = leaderboard[i];
      const txt = (i + 1) + '. ' + entry.name + ' ' + entry.score;
      const entryColor = i === 0 ? '#ffcc66' : '#aa8866';
      drawTextCentered(txt, ly + 10 + i * 8, entryColor, 1);
    }

    // Narrative: Prophecy progress indicator on menu
    if (BALANCE.narrative.enabled && goldenLoreIndex > 0 && typeof NARRATIVE !== 'undefined' && NARRATIVE.goldenProphecy) {
      const progText = 'PROPHECY: ' + goldenLoreIndex + '/' + NARRATIVE.goldenProphecy.length;
      drawTextCentered(progText, ly + 10 + count * 8 + 4, '#aa8822', 1);
    }
  }

  // Narrative: Golden tint on menu background when prophecy is complete
  if (BALANCE.narrative.enabled && typeof NARRATIVE !== 'undefined' && NARRATIVE.goldenProphecy && goldenLoreIndex >= NARRATIVE.goldenProphecy.length) {
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = '#ffdd44';
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }
}

function renderNameEntry() {
  // Same deep space background as menu
  ctx.fillStyle = '#060612';
  ctx.fillRect(0, 0, W, H);

  // Reuse menu parallax stars
  for (let layer = 0; layer < 3; layer++) {
    const stars = menuStarLayers[layer];
    for (const star of stars) {
      const flicker = 0.3 + Math.sin(star.twinkle + stateTimer) * 0.35;
      const b = Math.floor(Math.max(0, Math.min(255, flicker * 255 * star.brightness)));
      const rg = layer === 0 ? Math.floor(b * 0.7) : b;
      ctx.fillStyle = `rgb(${rg},${rg},${Math.min(255, b + 30)})`;
      ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);
    }
  }

  // Title glow
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = '#55ff55';
  const tw = textWidth('ENTER YOUR NAME', 2);
  ctx.fillRect(Math.floor((W - tw) / 2) - 6, 56, tw + 12, 20);
  ctx.globalAlpha = 1;

  drawTextCentered('ENTER YOUR NAME', 59, '#115511', 2);
  drawTextCentered('ENTER YOUR NAME', 58, '#55ff55', 2);
  drawTextCentered('(UP TO 8 CHARACTERS)', 80, '#557755', 1);

  // Name display box
  const nameBoxW = 120;
  const nameBoxH = 20;
  const nameBoxX = Math.floor((W - nameBoxW) / 2);
  const nameBoxY = 102;
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(nameBoxX, nameBoxY, nameBoxW, nameBoxH);
  ctx.fillStyle = '#334433';
  ctx.fillRect(nameBoxX, nameBoxY, nameBoxW, 1);
  ctx.fillRect(nameBoxX, nameBoxY + nameBoxH - 1, nameBoxW, 1);
  ctx.fillRect(nameBoxX, nameBoxY, 1, nameBoxH);
  ctx.fillRect(nameBoxX + nameBoxW - 1, nameBoxY, 1, nameBoxH);

  // Name display with blinking cursor
  const cursor = Math.floor(nameBlinkTimer * 3) % 2 ? '_' : ' ';
  const displayName = playerName + (playerName.length < 8 ? cursor : '');
  drawTextCentered(displayName, nameBoxY + 5, '#ffffff', 2);

  // Prompt
  const promptPulse = 0.4 + Math.sin(stateTimer * 3) * 0.3;
  const pb = Math.floor(140 + promptPulse * 80);
  const promptCol = playerName.length > 0 ? `rgb(${Math.floor(pb*0.6)},${pb},${Math.floor(pb*0.6)})` : '#555555';
  drawTextCentered('PRESS ENTER TO CONTINUE', 146, promptCol, 1);
}

// Combo timer ring visualization (FEATURE 4)
function renderComboRing() {
  if (!ufo || comboCount <= 0 || comboTimer <= 0) return;

  const cx = Math.floor(ufo.x + ufo.w / 2);
  const cy = Math.floor(ufo.y + ufo.h / 2 + Math.sin(ufo.bobPhase) * 1.5);
  const ratio = comboTimer / COMBO_WINDOW; // 1.0 -> 0.0
  const radius = BALANCE.comboRing.baseRadius + ratio * BALANCE.comboRing.radiusRange;

  // Color: green -> yellow -> orange -> red
  let color;
  if (ratio > 0.75) color = '#44ff44';
  else if (ratio > 0.4) color = '#ffff44';
  else if (ratio > 0.15) color = '#ff8844';
  else color = '#ff4444';

  // Pulse speed increases as timer runs out
  const pulseRate = 4 + (1 - ratio) * 12;
  const pulse = Math.sin(stateTimer * pulseRate) * 0.2;

  ctx.globalAlpha = 0.4 + pulse + (1 - ratio) * 0.3;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  // Draw arc proportional to remaining time
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + ratio * Math.PI * 2;
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.stroke();

  // Combo count text at the ring
  if (comboCount >= 2) {
    const textX = cx + radius + 3;
    const textY = cy - 4;
    drawText('X' + comboCount, textX, textY, color, 1);
  }

  ctx.globalAlpha = 1;
}

function renderTutorial() {
  if (!tutorialActive) return;
  const alpha = Math.min(1, tutorialActive.timer / 0.3);
  ctx.globalAlpha = alpha * 0.85;

  const tw = textWidth(tutorialActive.text, 1);
  const px = Math.floor(W / 2 - tw / 2) - 4;
  const py = H / 2 + 50;

  // Background bar
  ctx.fillStyle = '#000000';
  ctx.fillRect(px - 2, py - 2, tw + 12, 12);
  ctx.fillStyle = '#112211';
  ctx.fillRect(px - 1, py - 1, tw + 10, 10);

  ctx.globalAlpha = alpha;
  drawText(tutorialActive.text, px + 2, py + 1, '#44ff44', 1);
  ctx.globalAlpha = 1;
}

function renderCrewCallout() {
  if (!crewCallout) return;
  const alpha = Math.min(1, crewCallout.timer / 0.3); // fade out in last 0.3s
  ctx.globalAlpha = alpha * 0.9;

  // Speaker name + text at bottom-right of screen (out of HUD area)
  const fullText = crewCallout.speaker + ': ' + crewCallout.text;
  const tw = textWidth(fullText, 1);
  const px = W - tw - 6;
  const py = H - 44;

  // Dark background
  ctx.fillStyle = '#000000';
  ctx.fillRect(px - 3, py - 2, tw + 8, 11);

  // Speaker name in their color, text in white
  const nameW = textWidth(crewCallout.speaker + ': ', 1);
  ctx.globalAlpha = alpha;
  drawText(crewCallout.speaker + ': ', px, py, crewCallout.color, 1);
  drawText(crewCallout.text, px + nameW, py, '#ffffff', 1);
  ctx.globalAlpha = 1;
}

function renderLoreFragment() {
  if (!loreFragment) return;
  if (typeof NARRATIVE === 'undefined' || !NARRATIVE.goldenProphecy) return;

  const loreDur = BALANCE.narrative.loreDuration || 3.5;
  const alpha = Math.min(1, Math.min(loreFragment.timer / 0.5, (loreDur - loreFragment.timer + 0.01) / 0.5));
  ctx.globalAlpha = alpha;

  // Golden background bar
  ctx.fillStyle = 'rgba(40, 30, 0, 0.8)';
  const tw = textWidth(loreFragment.text, 1);
  const px = Math.floor(W / 2 - tw / 2) - 4;
  const py = 55;
  ctx.fillRect(px - 2, py - 3, tw + 12, 14);

  // Golden border
  ctx.fillStyle = '#665500';
  ctx.fillRect(px - 3, py - 4, tw + 14, 1);
  ctx.fillRect(px - 3, py + 11, tw + 14, 1);

  // Text in gold
  drawTextCentered(loreFragment.text, py, '#ffdd44', 1);

  // Prophecy progress
  const progText = 'PROPHECY ' + goldenLoreIndex + '/' + NARRATIVE.goldenProphecy.length;
  drawTextCentered(progText, py + 10, '#ffcc55', 1);

  ctx.globalAlpha = 1;
}

function renderPlaying() {
  if (!ufo) return;
  const theme = getLevelConfig(level).theme;

  // Apply screen shake offset
  ctx.save();
  ctx.translate(Math.round(shakeX), Math.round(shakeY));

  renderBackground(theme);
  renderGround(theme);
  renderBeam();
  renderCows();
  renderFarmers();
  renderBoss();
  renderProjectiles();
  renderScorePickups();
  renderUfoLasers();
  renderPowerups();
  renderUFO();
  renderComboRing();
  renderFocusMode();
  renderParticles();
  renderScorePopups();

  ctx.restore();

  // Tutorial prompt (FEATURE 7)
  renderTutorial();

  // Narrative crew callout (after tutorial, before HUD)
  renderCrewCallout();

  // Narrative lore fragment (on top of crew callout)
  renderLoreFragment();

  renderHUD();
  renderBossHUD();

  // Boss entrance freeze overlay (FEATURE 6) - rendered on top of everything
  if (bossFreezeTimer > 0) {
    const BE = BALANCE.bossEntrance;
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, ' + BE.darkenAlpha + ')';
    ctx.fillRect(0, 0, W, H);
    // Boss name fade in over 0.3s
    const nameAlpha = Math.min(1, (BE.freezeDuration - bossFreezeTimer) / 0.3);
    ctx.globalAlpha = nameAlpha;
    drawTextCentered(bossFreezeName, H / 2 - 15, '#ff2222', BE.nameScale);
    // "PHASE 1" subtitle after 0.4s
    if (bossFreezeTimer < BE.freezeDuration - 0.4) {
      drawTextCentered('PHASE 1', H / 2 + 10, '#ff8844', 1);
    }
    // "GET READY" flashing at bottom after 0.6s
    if (bossFreezeTimer < BE.freezeDuration - 0.6) {
      const flashOn = Math.floor(stateTimer * 6) % 2 === 0;
      if (flashOn) drawTextCentered('GET READY', H / 2 + 25, '#ffffff', 1);
    }
    // Narrative: Hayseed radio intercept during boss intro
    if (BALANCE.narrative.enabled && typeof NARRATIVE !== 'undefined' && NARRATIVE.getHayseed) {
      const hayseedLine = NARRATIVE.getHayseed(level);
      if (hayseedLine && bossFreezeTimer < 0.7) {
        drawTextCentered(hayseedLine, H / 2 + 38, '#44ff44', 1);
      }
    }
    ctx.globalAlpha = 1;
  }
}

function renderBackground(theme) {
  // Sky gradient (simplified - top and bottom halves)
  ctx.fillStyle = theme.sky;
  ctx.fillRect(0, 0, W, H / 2);
  ctx.fillStyle = theme.skyBottom;
  ctx.fillRect(0, H / 2, W, H / 2);

  // Stars (only visible at night)
  if (theme.name === 'NIGHT') {
    for (const star of bgStars) {
      star.twinkle += DT * 2;
      const alpha = 0.3 + Math.sin(star.twinkle) * 0.3;
      const bright = Math.floor(alpha * 255);
      ctx.fillStyle = `rgb(${bright},${bright},${bright})`;
      ctx.fillRect(Math.floor(star.x), Math.floor(star.y), 1, 1);
    }
  }

  // Clouds
  for (const cloud of bgClouds) {
    cloud.x += cloud.speed * DT;
    if (cloud.x > W + cloud.w) cloud.x = -cloud.w;
    ctx.fillStyle = theme.clouds;
    ctx.globalAlpha = 0.4;
    ctx.fillRect(Math.floor(cloud.x), Math.floor(cloud.y), Math.floor(cloud.w), Math.floor(cloud.h));
    ctx.globalAlpha = 1;
  }

  // Back hills
  ctx.fillStyle = theme.hillsBack;
  for (let x = 0; x < W; x++) {
    const h = 20 + Math.sin(x * 0.02 + 1) * 12 + Math.sin(x * 0.05) * 6;
    ctx.fillRect(x, H - 40 - h, 1, h);
  }

  // Front hills
  ctx.fillStyle = theme.hills;
  for (let x = 0; x < W; x++) {
    const h = 12 + Math.sin(x * 0.03 + 3) * 8 + Math.sin(x * 0.07 + 1) * 4;
    ctx.fillRect(x, H - 32 - h, 1, h);
  }
}

function renderGround(theme) {
  // Ground
  ctx.fillStyle = theme.ground;
  ctx.fillRect(0, H - 32, W, 32);

  // Ground detail stripe
  ctx.fillStyle = theme.groundAlt;
  ctx.fillRect(0, H - 32, W, 2);

  // Decorations
  for (const dec of bgDecorations) {
    const dx = Math.floor(dec.x);
    const dy = H - 33;
    if (dec.type === 0) {
      // Grass tuft
      ctx.fillStyle = dec.color;
      ctx.fillRect(dx, dy, 1, -2);
      ctx.fillRect(dx + 1, dy, 1, -3);
      ctx.fillRect(dx + 2, dy, 1, -2);
    } else if (dec.type === 1) {
      // Flower
      ctx.fillStyle = dec.color;
      ctx.fillRect(dx, dy - 3, 1, 3);
      ctx.fillRect(dx - 1, dy - 4, 3, 1);
      ctx.fillRect(dx, dy - 5, 1, 1);
    } else {
      // Fence post
      ctx.fillStyle = '#886644';
      ctx.fillRect(dx, dy - 6, 1, 6);
      ctx.fillRect(dx + 3, dy - 6, 1, 6);
      ctx.fillRect(dx, dy - 5, 4, 1);
      ctx.fillRect(dx, dy - 3, 4, 1);
    }
  }
}

function renderBeam() {
  if (!ufo || !ufo.beamActive) return;

  const cx = ufo.x + ufo.w / 2;
  const by = ufo.y + ufo.h;
  const bw = ufo.beamW;
  const bh = ufo.beamH;

  const incActive = ufo.incineratorTimer > 0;
  // Beam gradient (scanline style)
  for (let y = 0; y < bh; y++) {
    const t = y / bh;
    const w = bw * (0.3 + t * 0.7);
    const alpha = 0.15 + Math.sin(y * 0.5 + stateTimer * 10) * 0.05;
    if (incActive) {
      ctx.fillStyle = `rgba(255, 120, 30, ${alpha + 0.05})`;
    } else {
      ctx.fillStyle = `rgba(85, 255, 85, ${alpha})`;
    }
    ctx.fillRect(Math.floor(cx - w / 2), Math.floor(by + y), Math.ceil(w), 1);
  }

  // Beam edges (brighter)
  ctx.fillStyle = incActive ? 'rgba(255, 140, 40, 0.25)' : 'rgba(100, 255, 100, 0.2)';
  ctx.fillRect(Math.floor(cx - 1), Math.floor(by), 2, bh);
}

// Pre-build cow palettes per type to avoid per-frame allocation
const _cowPalettes = {};
for (const typeName of Object.keys(COW_TYPES)) {
  const td = COW_TYPES[typeName];
  const p = Object.assign({}, PALETTES.cow);
  if (td.palette) Object.assign(p, td.palette);
  _cowPalettes[typeName] = p;
}

function renderCows() {
  for (const cow of cows) {
    if (cow.state === 'collected') continue;

    let sprite;
    const palette = _cowPalettes[cow.cowType] || PALETTES.cow;
    const isFlash = false;

    if (cow.state === 'abducting') {
      const frame = Math.floor(Date.now() / 120) % 4;
      sprite = [SPRITES.cowAbduct1, SPRITES.cowAbduct2, SPRITES.cowAbduct3, SPRITES.cowAbduct4][frame];
    } else if (cow.scared) {
      sprite = SPRITES.cowScared;
    } else {
      sprite = cow.walkFrame === 0 ? SPRITES.cow : SPRITES.cowWalk;
    }

    const drawY = cow.state === 'abducting' ? cow.y : cow.groundY;
    const pixelScale = 1.5 * (cow.sizeMult || 1.0);
    drawSprite(sprite, palette, Math.floor(cow.x), Math.floor(drawY), cow.flipX, isFlash, pixelScale);

    // Sweat drop
    if (cow.sweatDrop && cow.sweatTimer > 0.4) {
      ctx.fillStyle = '#44aaff';
      ctx.fillRect(Math.floor(cow.x) + (cow.flipX ? -2 : cow.w + 1), Math.floor(drawY) - 2, 2, 3);
    }

    // Speech bubble for moo (brief)
    if (cow.mooTimer > 0 && cow.mooTimer < 0.3 && cow.state !== 'abducting') {
      const bx = Math.floor(cow.x) + cow.w / 2 - 5;
      const by2 = Math.floor(drawY) - 14;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx, by2, 14, 7);
      drawText('MOO', bx + 1, by2 + 1, '#222222', 1);
    }

    // Golden cow sparkle effect
    if (cow.cowType === 'golden' && cow.state !== 'abducting') {
      cow.sparkleTimer = (cow.sparkleTimer || 0) + DT;
      if (cow.sparkleTimer > 0.15) {
        cow.sparkleTimer = 0;
        const sx = Math.floor(cow.x) + Math.random() * cow.w;
        const sy = Math.floor(drawY) + Math.random() * cow.h * 0.6;
        spawnParticle(sx, sy, (Math.random() - 0.5) * 8, -6 - Math.random() * 6,
          Math.random() > 0.5 ? '#ffff88' : '#ffdd44', 0.3 + Math.random() * 0.2, 1);
      }
    }
  }
}

function renderFarmers() {
  for (const f of farmers) {
    const spriteKey = f.type === FARMER_PITCHFORK ? 'farmerPitchfork' :
                      f.type === FARMER_SHOTGUN ? 'farmerShotgun' : 'farmerSniper';
    // March bob: bounce up on odd frames
    const marchBob = f.walkFrame === 1 ? -1 : 0;
    drawSprite(SPRITES[spriteKey], PALETTES[f.palette], Math.floor(f.x), Math.floor(f.y) + marchBob, f.flipX, false, 1.5);

    // Sniper laser sight (solid semi-transparent red line)
    if (f.laserSight && ufo) {
      const fx = f.x + f.w / 2;
      const fy = f.y;
      const ux = ufo.x + ufo.w / 2;
      const uy = ufo.y + ufo.h / 2;
      const dx = ux - fx;
      const dy = uy - fy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.floor(dist);
      ctx.fillStyle = 'rgba(255, 0, 0, 0.35)';
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        ctx.fillRect(Math.floor(fx + dx * t), Math.floor(fy + dy * t), 1, 1);
      }
    }
  }
}

function getBulletDisplayColor(b) {
  const BC = BALANCE.bulletColors;
  const spd = b.speed;
  if (spd < BC.slow.maxSpeed) return BC.slow.color;
  if (spd < BC.medium.maxSpeed) return BC.medium.color;
  if (spd < BC.fast.maxSpeed) return BC.fast.color;
  return BC.veryFast.color;
}

function renderProjectiles() {
  // Batch render bullets using fillRect instead of arc for performance.
  // With up to 1500 bullets, avoiding beginPath/arc per bullet is critical.
  for (let i = 0; i < BULLET_POOL_SIZE; i++) {
    const b = bulletPool[i];
    if (!b.alive) continue;

    const bx = Math.floor(b.x);
    const by = Math.floor(b.y);
    const r = b.radius;
    const d = r * 2;
    const dg = d + 4; // glow size
    const displayColor = getBulletDisplayColor(b);

    // Glow (larger, semi-transparent square) - uses original b.color for variety
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = b.color;
    ctx.fillRect(bx - r - 2, by - r - 2, dg, dg);

    // Core - uses danger-tier display color
    ctx.globalAlpha = 1;
    ctx.fillStyle = displayColor;
    ctx.fillRect(bx - r, by - r, d, d);

    // Bright center pixel
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.6;
    const cr = Math.max(1, r - 1);
    ctx.fillRect(bx - cr, by - cr, cr * 2, cr * 2);

    // Pulsing outline for large bullets (FEATURE 5)
    if (b.radius >= 4) {
      ctx.strokeStyle = displayColor;
      ctx.globalAlpha = 0.3 + Math.sin(stateTimer * 8) * 0.15;
      ctx.strokeRect(bx - r - 1, by - r - 1, d + 2, d + 2);
    }

    ctx.globalAlpha = 1;
  }
}

function renderScorePickups() {
  for (let i = 0; i < PICKUP_POOL_SIZE; i++) {
    const sp = pickupPool[i];
    if (!sp.alive) continue;
    const alpha = sp.life / sp.maxLife;
    ctx.globalAlpha = alpha;
    // Golden sparkle
    ctx.fillStyle = '#ffdd44';
    ctx.fillRect(Math.floor(sp.x) - 1, Math.floor(sp.y) - 1, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.floor(sp.x), Math.floor(sp.y), 1, 1);
  }
  ctx.globalAlpha = 1;
}

function renderUfoLasers() {
  for (const l of ufoLasers) {
    // Glow
    ctx.fillStyle = 'rgba(85, 255, 85, 0.3)';
    ctx.fillRect(Math.floor(l.x) - 1, Math.floor(l.y) - 1, l.w + 2, l.h + 2);
    // Core
    ctx.fillStyle = '#55ff55';
    ctx.fillRect(Math.floor(l.x), Math.floor(l.y), l.w, l.h);
    // Bright center
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.6;
    ctx.fillRect(Math.floor(l.x) + 1, Math.floor(l.y), 1, l.h);
    ctx.globalAlpha = 1;
  }
}

function renderPowerups() {
  const glowColors = ['#ff4444', '#44ffff', '#4444ff', '#ff2222', '#ffff44', '#ff8800'];
  const glowColorsInner = ['#ff8888', '#88ffff', '#8888ff', '#ff6666', '#ffff88', '#ffcc44'];
  for (const pu of powerups) {
    // Flash/blink when about to expire
    if (pu.life < 2 && Math.floor(pu.flash) % 2 === 0) continue;

    const bobY = Math.sin(pu.bobPhase) * 2;
    const px = Math.floor(pu.x);
    const py = Math.floor(pu.y + bobY);
    const cx = px + pu.w / 2;
    const cy = py + pu.h / 2;
    const spriteKey = ['powerupHealth', 'powerupEnergy', 'powerupShield', 'powerupMagnet', 'powerupSpeed', 'powerupIncinerator'][pu.type];
    const colors = [
      { '1': '#ff4444', '3': '#ffffff' },
      { '1': '#44ffff', '3': '#ffffff' },
      { '1': '#4444ff', '3': '#ffffff' },
      { '1': '#ff2222', '3': '#cccccc' },
      { '1': '#ffff44', '3': '#ffffff' },
      { '1': '#ffcc00', '2': '#ff4400', '3': '#ff8800' }
    ];

    // Outer glow pulse (larger, softer)
    const glowPulse = 0.12 + Math.sin(pu.bobPhase * 1.5) * 0.06;
    ctx.globalAlpha = glowPulse;
    ctx.fillStyle = glowColors[pu.type];
    ctx.fillRect(px - 5, py - 5, pu.w + 10, pu.h + 10);
    ctx.globalAlpha = glowPulse * 1.5;
    ctx.fillStyle = glowColorsInner[pu.type];
    ctx.fillRect(px - 2, py - 2, pu.w + 4, pu.h + 4);
    ctx.globalAlpha = 1;

    // 4 orbiting sparkle pixels
    for (let s = 0; s < 4; s++) {
      const angle = pu.bobPhase * 2.5 + (s / 4) * Math.PI * 2;
      const orbitR = 10 + Math.sin(pu.bobPhase * 3 + s) * 2;
      const sx = Math.floor(cx + Math.cos(angle) * orbitR);
      const sy = Math.floor(cy + Math.sin(angle) * orbitR);
      const sparkleAlpha = 0.4 + Math.sin(pu.bobPhase * 4 + s * 2) * 0.3;
      ctx.globalAlpha = sparkleAlpha;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx, sy, 1, 1);
      ctx.fillStyle = glowColors[pu.type];
      ctx.fillRect(sx - 1, sy, 1, 1);
      ctx.fillRect(sx + 1, sy, 1, 1);
    }
    ctx.globalAlpha = 1;

    // Sprite
    drawSprite(SPRITES[spriteKey], colors[pu.type], px, py, false, false);

    // Bright highlight sweep (diagonal line that slides across the sprite)
    const sweepPhase = (pu.bobPhase * 1.2) % 3;
    if (sweepPhase < 1.0) {
      const sweepX = Math.floor(px + sweepPhase * (pu.w + 4) - 2);
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sweepX, py, 1, pu.h);
      ctx.fillRect(sweepX + 1, py, 1, pu.h);
      ctx.globalAlpha = 1;
    }
  }
}

function renderShield(cx, cy) {
  if (!ufo) return;
  const t = ufo.shieldPhase;
  const pulse = 0.9 + Math.sin(t * 3) * 0.1;
  const rx = 18 * pulse;
  const ry = 14 * pulse;

  // Outer pulsing blue glow
  ctx.globalAlpha = 0.12 + Math.sin(t * 4) * 0.04;
  ctx.fillStyle = '#2266ff';
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx + 4, ry + 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Inner brighter blue ellipse
  ctx.globalAlpha = 0.18 + Math.sin(t * 5) * 0.05;
  ctx.fillStyle = '#4488ff';
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // 5 rotating energy arcs (cyan, varied lengths)
  ctx.strokeStyle = '#44eeff';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const a = t * 2 + (i / 5) * Math.PI * 2;
    const arcLen = 0.5 + Math.sin(t * 3 + i * 1.7) * 0.3;
    ctx.globalAlpha = 0.25 + Math.sin(t * 6 + i) * 0.12;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx - 1, ry - 1, 0, a, a + arcLen);
    ctx.stroke();
  }

  // 6 counter-rotating inner arcs (white-blue, faster)
  ctx.strokeStyle = '#aaddff';
  for (let i = 0; i < 6; i++) {
    const a = -t * 3.5 + (i / 6) * Math.PI * 2;
    ctx.globalAlpha = 0.12 + Math.sin(t * 5 + i * 1.3) * 0.08;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * 0.55, ry * 0.55, 0, a, a + 0.4);
    ctx.stroke();
  }

  // Energy crackle points (small bright dots on shield surface)
  for (let i = 0; i < 6; i++) {
    const crackleAngle = t * 4 + (i / 6) * Math.PI * 2;
    const crackleR = rx * (0.85 + Math.sin(t * 7 + i * 2) * 0.15);
    const crackleRy = ry * (0.85 + Math.sin(t * 7 + i * 2) * 0.15);
    const cpx = Math.floor(cx + Math.cos(crackleAngle) * crackleR);
    const cpy = Math.floor(cy + Math.sin(crackleAngle) * crackleRy);
    const crackleAlpha = 0.3 + Math.sin(t * 10 + i * 3) * 0.25;
    if (crackleAlpha > 0.3) {
      ctx.globalAlpha = crackleAlpha;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cpx, cpy, 1, 1);
      ctx.fillStyle = '#44eeff';
      ctx.fillRect(cpx - 1, cpy, 1, 1);
      ctx.fillRect(cpx + 1, cpy, 1, 1);
      ctx.fillRect(cpx, cpy - 1, 1, 1);
      ctx.fillRect(cpx, cpy + 1, 1, 1);
    }
  }

  // White flash overlay on hit (enhanced: ripple outward)
  if (ufo.shieldHitFlash > 0) {
    const hitT = ufo.shieldHitFlash / 0.15;
    // Bright inner flash
    ctx.globalAlpha = hitT * 0.6;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx + 2, ry + 2, 0, 0, Math.PI * 2);
    ctx.fill();
    // Expanding ring
    ctx.globalAlpha = hitT * 0.3;
    ctx.strokeStyle = '#88eeff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx + 4 + (1 - hitT) * 6, ry + 4 + (1 - hitT) * 4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  ctx.globalAlpha = 1;
}

function renderUFO() {
  if (!ufo) return;

  // I-frame flash
  const visible = ufo.iframes <= 0 || Math.floor(ufo.iframes * 10) % 2 === 0;
  if (!visible) return;

  const hitFlash = ufo.hitFlash > 0;
  const flash = flashTimer > 0 || hitFlash;
  const flashColor = hitFlash ? '#ff2222' : '#ffffff';
  const bobY = Math.sin(ufo.bobPhase) * 1.5;
  const ux = Math.floor(ufo.x);
  const uy = Math.floor(ufo.y + bobY);
  const cx = ux + ufo.w / 2;
  const cy = uy + ufo.h / 2;

  // Hit shake offset
  let hitShakeX = 0, hitShakeY = 0;
  if (ufo.hitFlash > 0) {
    hitShakeX = Math.round((Math.random() - 0.5) * 4);
    hitShakeY = Math.round((Math.random() - 0.5) * 4);
  }

  // === AMBIENT GLOW (renders under the UFO) ===
  // Soft green underglow that pulses
  const glowIntensity = 0.06 + Math.sin(ufo.bobPhase * 2) * 0.02;
  ctx.globalAlpha = glowIntensity;
  ctx.fillStyle = '#44ff88';
  ctx.fillRect(ux - 4, uy + 10, ufo.w + 8, 8);
  ctx.globalAlpha = glowIntensity * 0.5;
  ctx.fillStyle = '#22cc66';
  ctx.fillRect(ux - 8, uy + 12, ufo.w + 16, 6);
  ctx.globalAlpha = 1;

  // === ENGINE EXHAUST PARTICLES (small dots trailing from sides) ===
  if (Math.abs(ufo.vx) > 40 || Math.abs(ufo.vy) > 40) {
    const engineAlpha = Math.min(0.5, (Math.abs(ufo.vx) + Math.abs(ufo.vy)) / 400);
    ctx.globalAlpha = engineAlpha;
    // Left engine
    ctx.fillStyle = '#44aaff';
    const eng1x = ux + 3 + hitShakeX;
    const eng1y = uy + ufo.h - 1 + hitShakeY;
    ctx.fillRect(eng1x, eng1y, 2, 2 + Math.floor(Math.random() * 2));
    ctx.fillStyle = '#88ddff';
    ctx.fillRect(eng1x, eng1y, 1, 1);
    // Right engine
    ctx.fillStyle = '#44aaff';
    const eng2x = ux + ufo.w - 5 + hitShakeX;
    ctx.fillRect(eng2x, eng1y, 2, 2 + Math.floor(Math.random() * 2));
    ctx.fillStyle = '#88ddff';
    ctx.fillRect(eng2x, eng1y, 1, 1);
    ctx.globalAlpha = 1;
  }

  // === DOME HIGHLIGHT (animated light reflection on cockpit) ===
  const domePhase = (ufo.bobPhase * 0.8) % 4;
  if (domePhase < 1.5) {
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#aaddff';
    const hlx = ux + 8 + Math.floor(domePhase * 4) + hitShakeX;
    ctx.fillRect(hlx, uy + 2 + hitShakeY, 2, 1);
    ctx.fillRect(hlx + 1, uy + 3 + hitShakeY, 1, 1);
    ctx.globalAlpha = 1;
  }

  // Select animation frame
  let spriteKey = 'ufo';
  if (ufo.hitFlash > 0) {
    spriteKey = 'ufoDamaged';
  } else if (ufo.beamActive) {
    spriteKey = 'ufoBeam';
  } else if (ufo.shootCooldown > 0.1) {
    spriteKey = 'ufoLaser';
  } else if (Math.abs(ufo.vx) > 80 || Math.abs(ufo.vy) > 80) {
    spriteKey = 'ufoThrust';
  }

  drawSprite(SPRITES[spriteKey], PALETTES.ufo, ux + hitShakeX, uy + hitShakeY, false, flash, undefined, flashColor);

  // === RIM LIGHT (subtle bright edge on top of UFO disc) ===
  if (!hitFlash) {
    ctx.globalAlpha = 0.15 + Math.sin(ufo.bobPhase * 3) * 0.05;
    ctx.fillStyle = '#aaccff';
    ctx.fillRect(ux + 5 + hitShakeX, uy + 5 + hitShakeY, ufo.w - 10, 1);
    ctx.globalAlpha = 1;
  }

  // Animated force field shield (enhanced)
  if (ufo.shieldActive || ufo.freeShieldTimer > 0) {
    renderShield(cx + hitShakeX, cy + hitShakeY);
  }
}

// Focus mode visual (SYSTEM 4)
function renderFocusMode() {
  if (!ufo || !ufo.focusing) return;
  const cx = ufo.x + ufo.w / 2;
  const cy = ufo.y + ufo.h / 2 + Math.sin(ufo.bobPhase) * 1.5;

  // Graze ring
  ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(Math.floor(cx), Math.floor(cy), 12, 0, Math.PI * 2);
  ctx.stroke();

  // Hitbox dot
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.7 + Math.sin(stateTimer * 8) * 0.3;
  ctx.beginPath();
  ctx.arc(Math.floor(cx), Math.floor(cy), 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function renderParticles() {
  for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
    const p = particlePool[i];
    if (!p.alive) continue;
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

function renderScorePopups() {
  for (const sp of scorePopups) {
    const alpha = sp.life / sp.maxLife;
    if (alpha > 0) {
      ctx.globalAlpha = alpha;

      // Scale-bounce: starts big, shrinks to 1
      const age = sp.maxLife - sp.life;
      let popScale = 1;
      if (age < 0.15) {
        popScale = 1 + (1 - age / 0.15) * 0.8; // bounce from 1.8 to 1
      }
      const sz = Math.max(1, Math.round(popScale));

      // Drop shadow for readability
      drawText(sp.text, Math.floor(sp.x) + 1, Math.floor(sp.y) + 1, '#000000', sz);
      drawText(sp.text, Math.floor(sp.x), Math.floor(sp.y), sp.color, sz);
      ctx.globalAlpha = 1;
    }
  }
}

function renderHUD() {
  if (!ufo) return;

  // Semi-transparent HUD bar with subtle gradient
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(0, 0, W, 18);
  // Bottom edge highlight
  ctx.fillStyle = 'rgba(85, 255, 85, 0.06)';
  ctx.fillRect(0, 17, W, 1);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 18, W, 1);

  // HP (hearts) with pulse animation
  for (let i = 0; i < ufo.maxHp; i++) {
    const alive = i < ufo.hp;
    const pulseT = heartPulseTimers[i];
    const baseColor = alive ? '#ff4444' : '#331111';
    let heartX = 2 + i * 10;
    let heartY = 2;

    if (pulseT > 0 && alive) {
      // Bounce the heart up slightly during pulse
      const bounce = Math.sin(pulseT * Math.PI / 0.4) * 3;
      heartY -= bounce;
      // Brief white flash at start of pulse
      if (pulseT > 0.3) {
        drawSprite(SPRITES.heart, { '1': '#ffffff' }, heartX, Math.floor(heartY), false, false);
        continue;
      }
    }

    drawSprite(SPRITES.heart, { '1': baseColor }, heartX, Math.floor(heartY), false, false);

    // Low HP warning: hearts pulse/flash when 1-2 HP
    if (ufo.hp <= 2 && alive) {
      const warnSpeed = ufo.hp === 1 ? 10 : 6;
      const warn = Math.sin(stateTimer * warnSpeed) * 0.5 + 0.5;
      ctx.globalAlpha = warn * (ufo.hp === 1 ? 0.5 : 0.25);
      drawSprite(SPRITES.heart, { '1': '#ffffff' }, heartX, Math.floor(heartY), false, false);
      ctx.globalAlpha = 1;
    }
  }

  // Bomb indicators - right of hearts with gap
  const bombStartX = 2 + ufo.maxHp * 10 + 6;
  for (let i = 0; i < ufo.bombs; i++) {
    const bx = bombStartX + i * 9;
    ctx.fillStyle = '#44ddff';
    ctx.fillRect(bx, 4, 6, 6);
    ctx.fillStyle = '#88ffff';
    ctx.fillRect(bx + 1, 5, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx + 2, 6, 2, 2);
  }

  // Energy bar - centered in the HUD
  const ebw = 50, ebh = 4;
  const ebx = Math.floor(W / 2 - ebw / 2), eby = 5;
  // Background
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(ebx - 1, eby - 1, ebw + 2, ebh + 2);
  ctx.fillStyle = '#1a1a2a';
  ctx.fillRect(ebx, eby, ebw, ebh);

  const energyRatio = ufo.energy / ufo.maxEnergy;
  const filledW = Math.floor(ebw * energyRatio);

  // Energy color: segmented gradient green -> yellow -> red
  if (ufo.energyCooldown > 0) {
    // Cooldown flash
    const flashOn = Math.floor(energyBarFlash) % 2 === 0;
    ctx.fillStyle = flashOn ? '#ff2222' : '#661111';
    ctx.fillRect(ebx, eby, filledW, ebh);
  } else {
    // Draw segmented energy bar (pixel-art look)
    for (let px = 0; px < filledW; px++) {
      const segRatio = px / ebw;
      let r, g, b;
      if (segRatio > 0.6) {
        // Green
        r = 68; g = 255; b = 68;
      } else if (segRatio > 0.35) {
        // Yellow
        r = 255; g = 230; b = 44;
      } else if (segRatio > 0.15) {
        // Orange
        r = 255; g = 160; b = 40;
      } else {
        // Red
        r = 255; g = 50; b = 34;
      }
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(ebx + px, eby, 1, ebh);
    }
    // Segment lines every 4px for retro look
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    for (let sx = 4; sx < filledW; sx += 4) {
      ctx.fillRect(ebx + sx, eby, 1, ebh);
    }
  }

  // Specular highlight on energy bar
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fillRect(ebx, eby, filledW, 1);
  // Border
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(ebx - 1, eby - 1, ebw + 2, 1);
  ctx.fillRect(ebx - 1, eby + ebh, ebw + 2, 1);
  ctx.fillRect(ebx - 1, eby - 1, 1, ebh + 2);
  ctx.fillRect(ebx + ebw, eby - 1, 1, ebh + 2);
  drawText('E', ebx - 7, eby - 1, '#44aaff', 1);

  // SCORE - centered above energy bar
  const rawScore = Math.floor(displayScore);
  const displayScoreStr = rawScore >= 100000 ? Math.floor(rawScore / 1000) + 'K' : rawScore.toString();
  const scoreW = textWidth(displayScoreStr, 1);
  const scoreX = Math.floor(W / 2 - scoreW / 2);
  if (hudScoreFlashTimer > 0) {
    const flashI = hudScoreFlashTimer / 0.3;
    ctx.globalAlpha = flashI * 0.15;
    ctx.fillStyle = '#ffff44';
    ctx.fillRect(scoreX - 2, 0, scoreW + 4, 7);
    ctx.globalAlpha = 1;
  }
  drawText(displayScoreStr, scoreX, 1, '#ffffff', 1);
  if (displayScore < score) {
    ctx.globalAlpha = 0.4;
    drawText(displayScoreStr, scoreX, 1, '#ffff44', 1);
    ctx.globalAlpha = 1;
  }

  // LEVEL - right side
  const lvText = 'LV' + level;
  const lvX = W - textWidth(lvText, 1) - 50;
  drawText(lvText, lvX, 4, '#ffaa44', 1);

  // COW COUNT - far right
  const cowProgress = cowsNeeded > 0 ? cowsCollected / cowsNeeded : 0;
  const cowColor = cowProgress >= 0.8 ? '#88ff88' : '#55ff55';
  const cowText = cowsCollected + '/' + cowsNeeded;
  const cowX = W - textWidth(cowText, 1) - 4;
  drawText(cowText, cowX, 4, cowColor, 1);
  // Progress bar under cow count
  const cpbW = textWidth(cowText, 1), cpbH = 2;
  ctx.fillStyle = '#1a1a2a';
  ctx.fillRect(cowX, 12, cpbW, cpbH);
  ctx.fillStyle = cowColor;
  ctx.fillRect(cowX, 12, Math.floor(cpbW * cowProgress), cpbH);

  // Graze multiplier - below HUD bar, right side (only when active)
  if (grazeMultiplier > 1.0) {
    const gmColor = grazeMultiplier >= 3.0 ? '#ff44ff' : grazeMultiplier >= 2.0 ? '#ffaa44' : '#44ffff';
    const gmText = 'GRAZE x' + grazeMultiplier.toFixed(1);
    const gmX = W - textWidth(gmText, 1) - 4;
    const gmAlpha = grazeFlashTimer > 0 ? 1 : 0.7;
    ctx.globalAlpha = gmAlpha;
    drawText(gmText, gmX, 20, grazeFlashTimer > 0 ? '#ffffff' : gmColor, 1);
    ctx.globalAlpha = 1;
  }

  // Combo - below graze, right side
  if (comboCount > 1 && comboTimer > 0) {
    const comboAlpha = Math.min(1, comboTimer / 0.3);
    ctx.globalAlpha = comboAlpha;

    let comboColor;
    if (comboCount >= 10) comboColor = '#ff22ff';
    else if (comboCount >= 8) comboColor = '#ff44ff';
    else if (comboCount >= 5) comboColor = '#ff8844';
    else comboColor = '#ffff44';

    const comboText = 'X' + comboCount;
    let comboBounce = 0;
    if (comboDisplayTimer > 0.3) {
      comboBounce = Math.sin((comboDisplayTimer - 0.3) / 0.3 * Math.PI) * 2;
    }

    const comboX = W - textWidth(comboText, 1) - 6;
    const comboY = 28;

    drawText(comboText, comboX + 1, comboY + 1 - Math.floor(comboBounce), '#000000', 1);
    drawText(comboText, comboX, comboY - Math.floor(comboBounce), comboColor, 1);
    ctx.globalAlpha = 1;
  }

  // Announcer phrase: big centered text with visual escalation
  if (announcerTimer > 0) {
    const alpha = Math.min(1, announcerTimer / 0.3);
    const sz = Math.min(3, Math.ceil(announcerScale * 2));
    const enterT = 2.0 - announcerTimer;
    const bounce = enterT < 0.3 ? Math.sin(enterT / 0.3 * Math.PI * 3) * 4 : 0;
    const colors = ['#ff4444', '#ff8800', '#ffff00', '#44ff44', '#44ffff', '#ff44ff'];
    const colorIdx = Math.floor(Date.now() / 80) % colors.length;

    // Shadow/glow behind announcer text
    ctx.globalAlpha = alpha * 0.3;
    ctx.fillStyle = colors[colorIdx];
    const aw = textWidth(announcerText, sz);
    ctx.fillRect(Math.floor((W - aw) / 2) - 6, 36 + bounce, aw + 12, sz * 5 + 10);
    ctx.globalAlpha = alpha;

    // Drop shadow
    drawTextCentered(announcerText, 41 + bounce, '#000000', sz);
    drawTextCentered(announcerText, 39 + bounce, '#000000', sz);
    drawTextCentered(announcerText, 40 + bounce, colors[colorIdx], sz);
    ctx.globalAlpha = 1;
  }

  // Level banner (shows on new level) with scanline wipe entrance
  if (levelBannerTimer > 0) {
    const bannerAlpha = levelBannerTimer > 2.0 ? (2.5 - levelBannerTimer) * 2 :
                        levelBannerTimer < 0.5 ? levelBannerTimer * 2 : 1;
    ctx.globalAlpha = bannerAlpha;
    // Background bar with gradient
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, H / 2 - 16, W, 32);
    // Green accent lines
    ctx.fillStyle = 'rgba(85, 255, 85, 0.15)';
    ctx.fillRect(0, H / 2 - 16, W, 1);
    ctx.fillRect(0, H / 2 + 15, W, 1);
    // Inner glow
    ctx.fillStyle = 'rgba(85, 255, 85, 0.05)';
    ctx.fillRect(0, H / 2 - 15, W, 30);

    // Narrative: Earth timeline year above title
    if (BALANCE.narrative.enabled && typeof NARRATIVE !== 'undefined' && NARRATIVE.getTimeline) {
      const tl = NARRATIVE.getTimeline(level);
      if (tl) {
        drawTextCentered(tl.year, H / 2 - 20, '#448844', 1);
      }
    }

    drawTextCentered(levelBannerText, H / 2 - 7, '#115511', 2);
    drawTextCentered(levelBannerText, H / 2 - 8, '#55ff55', 2);

    // Narrative subtitle below title
    if (levelBannerSubtitle) {
      drawTextCentered(levelBannerSubtitle, H / 2 + 6, '#aaaaaa', 1);
    } else {
      const themeName = getLevelConfig(level).theme.name;
      drawTextCentered(themeName, H / 2 + 6, '#557755', 1);
    }

    // Narrative: Earth timeline radio intercept below subtitle
    if (BALANCE.narrative.enabled && typeof NARRATIVE !== 'undefined' && NARRATIVE.getTimeline) {
      const tl = NARRATIVE.getTimeline(level);
      if (tl) {
        drawTextCentered(tl.radio, H / 2 + 16, '#44ff44', 1);
      }
    }
    ctx.globalAlpha = 1;
  }

  // Power-up indicators with pulsing glow
  let puX = W - 50;
  const puTimers = [
    { timer: ufo.magnetTimer, text: 'MAG', color: '#ff44ff', max: 8 },
    { timer: ufo.speedTimer, text: 'SPD', color: '#ffff44', max: 6 },
    { timer: ufo.freeShieldTimer, text: 'SHD', color: '#4488ff', max: 5 },
    { timer: ufo.incineratorTimer, text: 'INC', color: '#ff6600', max: 6 }
  ];
  for (const pu of puTimers) {
    if (pu.timer > 0) {
      // Pulse glow
      const puPulse = 0.6 + Math.sin(stateTimer * 5) * 0.4;
      ctx.globalAlpha = puPulse * 0.2;
      ctx.fillStyle = pu.color;
      ctx.fillRect(puX - 1, 2, textWidth(pu.text, 1) + 2, 8);
      ctx.globalAlpha = 1;

      // Flash when about to expire
      if (pu.timer < 2 && Math.floor(stateTimer * 6) % 2) {
        drawText(pu.text, puX, 4, '#ffffff', 1);
      } else {
        drawText(pu.text, puX, 4, pu.color, 1);
      }

      // Timer bar under text
      const ratio = Math.min(1, pu.timer / pu.max);
      const barW = textWidth(pu.text, 1);
      ctx.fillStyle = pu.color;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(puX, 11, Math.floor(barW * ratio), 1);
      ctx.globalAlpha = 1;

      puX -= 28;
    }
  }

  // Anti-turtling warning (push down when boss HUD visible)
  const turtleWarnY = (boss && boss.alive) ? 40 : 22;
  if (ufo.turtleTimer > BALANCE.turtle.graceSec) {
    const flashOn = Math.floor(stateTimer * 6) % 2 === 0;
    if (flashOn) {
      drawTextCentered('LOSING SIGNAL', turtleWarnY, '#ff2222', 1);
    }
  } else if (ufo.turtleTimer > 2.0) {
    // Pre-warning: subtle hint
    ctx.globalAlpha = 0.5;
    drawTextCentered('LOSING SIGNAL', turtleWarnY, '#ff6644', 1);
    ctx.globalAlpha = 1;
  }

  // Mute indicator (positioned below graze to avoid overlap)
  if (AudioManager.isMuted()) {
    drawText('MUTED', W - 32, 16, '#ff4444', 1);
  }
}

function renderPauseOverlay() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, W, H);
  drawTextCentered('PAUSED', H / 2 - 10, '#ffffff', 2);
  drawTextCentered('PRESS P TO RESUME', H / 2 + 10, '#aaaaaa', 1);
}

function renderGameOver() {
  // Full dark background with animated stars
  ctx.fillStyle = '#040410';
  ctx.fillRect(0, 0, W, H);

  // Animated background stars
  for (const star of gameOverStars) {
    star.twinkle += DT * (1.0 + star.speed);
    const flicker = 0.2 + Math.sin(star.twinkle) * 0.3;
    const b = Math.floor(Math.max(0, Math.min(255, flicker * 255 * star.brightness)));
    ctx.fillStyle = `rgb(${b},${b},${Math.min(255, b + 20)})`;
    ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);
  }

  // Floating cow silhouettes in background
  for (const sil of gameOverCowSilhouettes) {
    sil.y += sil.vy * DT;
    sil.x += sil.vx * DT;
    // Wrap around
    if (sil.y < -20) { sil.y = H + 10; sil.x = Math.random() * W; }
    if (sil.x < -30) sil.x = W + 10;
    if (sil.x > W + 30) sil.x = -10;
    ctx.globalAlpha = sil.alpha;
    drawSprite(SPRITES.cow, { '1': '#222244', '2': '#111133', '3': '#221133', '4': '#1a1a33', '5': '#221133', '6': '#111122', '7': '#0a0a22' },
      Math.floor(sil.x), Math.floor(sil.y), sil.flipX, false);
    ctx.globalAlpha = 1;
  }

  // Phase timing
  const phase1End = 0.6; // GAME OVER title appears
  const phase2Start = 1.0; // Score count-up begins
  const phase3Start = 2.5; // Stats appear
  const phase4Start = 3.5; // Continue prompt

  // GAME OVER title with dramatic entrance
  if (stateTimer > phase1End) {
    const titleProgress = Math.min(1, (stateTimer - phase1End) / 0.4);

    // Red glow behind title - pulses gently
    const glowPulse = 0.12 + Math.sin(stateTimer * 2) * 0.04;
    ctx.globalAlpha = glowPulse * titleProgress;
    ctx.fillStyle = '#ff2222';
    const goW = textWidth('GAME OVER', 3);
    ctx.fillRect(Math.floor((W - goW) / 2) - 10, 34, goW + 20, 24);
    ctx.globalAlpha = titleProgress;

    // Shadow layers for depth
    drawTextCentered('GAME OVER', 42, '#110000', 3);
    drawTextCentered('GAME OVER', 41, '#330000', 3);
    drawTextCentered('GAME OVER', 40, '#ff4444', 3);
    ctx.globalAlpha = 1;
  }

  // Score count-up animation
  if (stateTimer > phase2Start) {
    if (!gameOverCountDone) {
      const countSpeed = Math.max(80, score * 1.2);
      gameOverCountScore += countSpeed * DT;
      if (gameOverCountScore >= score) {
        gameOverCountScore = score;
        gameOverCountDone = true;
      }
    }

    const displayFinalScore = Math.floor(gameOverCountScore);
    drawTextCentered('FINAL SCORE', 72, '#667788', 1);

    // Score in big text with glow
    const scoreStr = displayFinalScore.toString();
    const sw = textWidth(scoreStr, 2);

    // Glow behind score
    if (gameOverCountDone) {
      ctx.globalAlpha = 0.08 + Math.sin(stateTimer * 3) * 0.03;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.floor((W - sw) / 2) - 4, 82, sw + 8, 16);
      ctx.globalAlpha = 1;
    }

    drawTextCentered(scoreStr, 85, '#111122', 2);
    drawTextCentered(scoreStr, 84, gameOverCountDone ? '#ffffff' : '#ccccdd', 2);

    // Sparkle effect when counting
    if (!gameOverCountDone && Math.random() < 0.5) {
      const sx = Math.floor((W - sw) / 2) + Math.random() * sw;
      const sy = 84 + Math.random() * 12;
      ctx.fillStyle = Math.random() > 0.5 ? '#ffff88' : '#ffffff';
      ctx.fillRect(Math.floor(sx), Math.floor(sy), 1, 1);
    }

    // Flash burst when count finishes
    if (gameOverCountDone && !gameOverShowStats) {
      gameOverShowStats = true;
      gameOverStatTimer = stateTimer;
    }
    if (gameOverShowStats && stateTimer - gameOverStatTimer < 0.15) {
      ctx.globalAlpha = (0.15 - (stateTimer - gameOverStatTimer)) / 0.15 * 0.2;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }

  // Stats panel with staggered reveal
  if (stateTimer > phase3Start) {
    const sy = 108;

    // Stats background with border
    const statsAlpha = Math.min(1, (stateTimer - phase3Start) / 0.4);
    ctx.globalAlpha = statsAlpha;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fillRect(W / 2 - 90, sy - 4, 180, 50);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.fillRect(W / 2 - 90, sy - 4, 180, 1);
    ctx.fillRect(W / 2 - 90, sy + 45, 180, 1);

    // Staggered stat lines
    const stats = [
      { text: 'LEVEL REACHED: ' + level, color: '#8899aa', delay: 0 },
      { text: 'LEVELS CLEARED: ' + levelsCompletedThisGame, color: '#7799bb', delay: 0.2 },
      { text: 'COWS COLLECTED: ' + totalCowsThisGame, color: '#55ff55', delay: 0.4 },
      { text: 'MAX COMBO: ' + maxComboThisGame + 'X', color: '#ffff44', delay: 0.6 }
    ];

    for (let si = 0; si < stats.length; si++) {
      const s = stats[si];
      const lineAlpha = Math.min(1, Math.max(0, (stateTimer - phase3Start - s.delay) / 0.3));
      if (lineAlpha > 0) {
        ctx.globalAlpha = lineAlpha;
        drawTextCentered(s.text, sy + si * 10, s.color, 1);
      }
    }
    ctx.globalAlpha = 1;

    // High score notification
    if (isHighScore(score) && stateTimer > phase3Start + 1.0) {
      const hsAge = stateTimer - phase3Start - 1.0;
      const hsFlash = Math.sin(hsAge * 5) * 0.5 + 0.5;
      const hsBright = Math.floor(200 + hsFlash * 55);
      // Glow behind text
      ctx.globalAlpha = 0.06 + hsFlash * 0.04;
      ctx.fillStyle = '#ffff44';
      const hsW = textWidth('*  NEW HIGH SCORE  *', 1);
      ctx.fillRect(Math.floor((W - hsW) / 2) - 4, sy + 44, hsW + 8, 10);
      ctx.globalAlpha = 1;
      drawTextCentered('*  NEW HIGH SCORE  *', sy + 46, `rgb(${hsBright},${hsBright},${Math.floor(hsBright * 0.4)})`, 1);
    }
  }

  // Narrative: Voxxa game over commentary (pick line ONCE, cache it)
  if (stateTimer > phase3Start + 1.2 && BALANCE.narrative.enabled && typeof NARRATIVE !== 'undefined' && NARRATIVE.getGameOverLine) {
    if (!gameOverVoxLine) {
      const isRecord = isHighScore(score);
      const line = NARRATIVE.getGameOverLine(score, isRecord);
      if (line) gameOverVoxLine = 'VOXXA: ' + line;
    }
    if (gameOverVoxLine) {
      const voxAlpha = Math.min(1, (stateTimer - phase3Start - 1.2) / 0.4);
      ctx.globalAlpha = voxAlpha;
      drawTextCentered(gameOverVoxLine, 168, '#ff44ff', 1);
      ctx.globalAlpha = 1;
    }
  }

  // Narrative: Golden Cow Prophecy progress on game over
  if (stateTimer > phase3Start + 1.6 && BALANCE.narrative.enabled && goldenLoreIndex > 0 && typeof NARRATIVE !== 'undefined' && NARRATIVE.goldenProphecy) {
    const progText = 'PROPHECY: ' + goldenLoreIndex + '/' + NARRATIVE.goldenProphecy.length;
    const progAlpha = Math.min(1, (stateTimer - phase3Start - 1.6) / 0.4);
    ctx.globalAlpha = progAlpha;
    drawTextCentered(progText, 180, '#ffdd44', 1);
    ctx.globalAlpha = 1;
  }

  // Continue prompt
  if (stateTimer > phase4Start) {
    const pulse = 0.3 + Math.sin(stateTimer * 3) * 0.7;
    const bright = Math.floor(100 + pulse * 155);
    drawTextCentered('PRESS ENTER TO CONTINUE', H - 24, `rgb(${bright},${bright},${bright})`, 1);
  }
}

// ============================================================
// Main Game Loop (Fixed Timestep)
// ============================================================
let lastTime = 0;
let accumulator = 0;

function updateTransition(dt) {
  if (transitionPhase === 'none') return;

  const speed = 2.5; // transition speed
  if (transitionPhase === 'out') {
    transitionAlpha += dt * speed;
    if (transitionAlpha >= 1) {
      transitionAlpha = 1;
      transitionPhase = 'hold';
      // Perform the actual state switch at the midpoint
      if (transitionTarget) {
        transitionTo(transitionTarget);
        transitionTarget = null;
      }
    }
  } else if (transitionPhase === 'hold') {
    // Brief hold at full black
    transitionPhase = 'in';
  } else if (transitionPhase === 'in') {
    transitionAlpha -= dt * speed;
    if (transitionAlpha <= 0) {
      transitionAlpha = 0;
      transitionPhase = 'none';
      transitionPixels = null;
    }
  }
}

function gameLoop(timestamp) {
  if (lastTime === 0) lastTime = timestamp;
  let frameTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  // Clamp frame time to prevent spiral of death
  if (frameTime > 0.1) frameTime = 0.1;

  // Performance overlay measurement
  perfAccum += frameTime;
  perfFrameCount++;
  if (perfAccum >= 0.5) {
    perfData.fps = Math.round(perfFrameCount / perfAccum);
    perfData.frameMs = (perfAccum / perfFrameCount * 1000).toFixed(1);
    perfFrameCount = 0;
    perfAccum = 0;
  }
  perfData.bullets = countAliveBullets();
  perfData.particles = countAliveParticles();
  perfData.pickups = countAlivePickups();
  perfData.entities = cows.length + farmers.length + ufoLasers.length + powerups.length;

  accumulator += frameTime;

  while (accumulator >= DT) {
    updateInput();

    // Toggle performance overlay (works in any game state)
    if (isJust('Backquote')) showPerf = !showPerf;

    // Update transition overlay
    updateTransition(DT);

    switch (gameState) {
      case STATE.BOOT:
        bootTimer += DT;
        // Start intro ship sound when UFO descends
        if (bootTimer > 1.0 && bootTimer < 1.0 + DT * 2) {
          AudioManager.init();
          AudioManager.resume();
          AudioManager.startIntroSound();
        }
        // Also allow Enter/Space to start from boot
        if (isJust('Enter') || isJust('Space')) {
          AudioManager.init();
          AudioManager.resume();
          fadeToState(STATE.MENU, 'fade');
        }
        break;
      case STATE.MENU:
        stateTimer += DT;
        if (isJust('Enter') || isJust('Space')) {
          AudioManager.init();
          AudioManager.resume();
          AudioManager.playMenuSelect();
          fadeToState(STATE.NAME_ENTRY, 'scanline');
        }
        break;
      case STATE.NAME_ENTRY:
        stateTimer += DT;
        nameBlinkTimer += DT;
        break;
      case STATE.PLAYING:
        updatePlaying(DT);
        break;
      case STATE.PAUSED:
        stateTimer += DT;
        if (isJust('KeyP') || isJust('Escape')) {
          gameState = STATE.PLAYING;
        }
        if (isJust('KeyM')) {
          AudioManager.toggleMute();
        }
        break;
      case STATE.GAME_OVER:
        stateTimer += DT;
        if (stateTimer > 2 && (isJust('Enter') || isJust('Space'))) {
          AudioManager.playMenuSelect();
          level = 1;
          cowsCollected = 0;
          isNewGame = true;
          fadeToState(STATE.MENU, 'pixelDissolve');
        }
        break;
    }

    accumulator -= DT;
  }

  render();
  requestAnimationFrame(gameLoop);
}

// ============================================================
// Initialize
// ============================================================
loadLeaderboard();
loadTutorials();
loadLoreProgress();
generateBackground();
displayCanvas.focus();
requestAnimationFrame(gameLoop);

})();
