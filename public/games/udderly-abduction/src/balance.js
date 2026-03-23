// ============================================================
// Udderly Abduction: Barrage - Balance Constants
// All tunable numeric values in one place.
// Loaded before game.js; sets window.BALANCE.
// ============================================================

window.BALANCE = {

  // ----------------------------------------------------------
  // UFO Stats
  // ----------------------------------------------------------
  ufo: {
    maxHp: 7,
    maxEnergy: 100,
    baseSpeed: 403,
    beamCost: 25,           // energy per second while beaming
    shieldCost: 30,         // energy per second while shielding
    energyRegen: 14,        // energy per second passive regen
    energyCooldownTime: 1.0,// seconds of forced cooldown after depletion
    shootCooldown: 0.25,    // seconds between laser shots
    laserSpeed: 250,        // pixels/sec for UFO laser bolts
    iframesDuration: 1.5,   // seconds of invincibility after hit
    hitFlashDuration: 0.25  // visual flash on hit
  },

  // ----------------------------------------------------------
  // Focus Mode (SYSTEM 4)
  // ----------------------------------------------------------
  focus: {
    speedMult: 0.4,         // movement speed multiplier while focusing
    hitRadius: 3,           // pixel radius of hitbox while focused
    normalHitRadius: 8,     // pixel radius of hitbox normally
    energyCost: 5           // energy drained per second while focusing
  },

  // ----------------------------------------------------------
  // Graze (SYSTEM 3)
  // ----------------------------------------------------------
  graze: {
    bonusPerGraze: 0.1,     // multiplier added per graze
    maxMultiplier: 5.0,     // graze multiplier cap
    decayRate: 0.03,        // multiplier decay per second
    grazeRadius: 12         // pixels from UFO center to trigger graze
  },

  // ----------------------------------------------------------
  // Bombs (SYSTEM 6)
  // ----------------------------------------------------------
  bombs: {
    startBombs: 3,
    maxBombs: 5,
    restockEvery: 10,       // cows abducted between bomb restocks
    iframes: 2.0,           // seconds of invincibility from bomb
    bossDamage: 3           // HP dealt to boss on bomb use
  },

  // ----------------------------------------------------------
  // Bullet Cancel (SYSTEM 5)
  // ----------------------------------------------------------
  bulletCancel: {
    baseRadius: 40,
    radiusPerCombo: 8,
    scorePerBullet: 10
  },

  // ----------------------------------------------------------
  // Anti-Turtle
  // ----------------------------------------------------------
  turtle: {
    thresholdY: 30,         // y-coord below which turtling is detected
    graceSec: 3.0,          // seconds before penalty kicks in
    drainBase: 15,          // base energy drain/sec
    drainScale: 5           // extra drain per second of excess turtle time
  },

  // ----------------------------------------------------------
  // Combo
  // ----------------------------------------------------------
  combo: {
    window: 2.0,            // seconds to maintain combo
    bonus: 50,              // bonus points per combo multiplier
    slowmoThreshold: 5      // combo count that triggers slow-motion
  },

  // ----------------------------------------------------------
  // Cow Types
  // ----------------------------------------------------------
  cowTypes: {
    normal: { weight: 60, points: 100, speedMult: 1.0, sizeMult: 1.0, palette: null, name: 'NORMAL' },
    calf:   { weight: 20, points: 75,  speedMult: 1.8, sizeMult: 0.7, palette: { '1': '#eeddcc', '2': '#664433' }, name: 'CALF' },
    bull:   { weight: 15, points: 250, speedMult: 0.6, sizeMult: 1.3, palette: { '1': '#999999', '2': '#333333' }, name: 'BULL' },
    golden: { weight: 5,  points: 500, speedMult: 1.5, sizeMult: 1.0, palette: { '1': '#ffdd44', '2': '#cc8800' }, name: 'GOLDEN', fleeRadius: 120, fleeSprint: 3.5 }
  },

  // ----------------------------------------------------------
  // Farmer Stats
  // ----------------------------------------------------------
  farmers: {
    types: [
      { shootCooldown: 0.8, speed: 45, color: 'farmerPitchfork' },
      { shootCooldown: 0.7, speed: 60, color: 'farmerShotgun' },
      { shootCooldown: 1.2, speed: 30, color: 'farmerSniper' }
    ],
    alertRadius: 200,
    alertMax: 3,
    alertDecay: 0.5         // seconds alert persists after beam stops
  },

  // ----------------------------------------------------------
  // Boss Definitions
  // ----------------------------------------------------------
  bosses: {
    hpScale: { baseDivisor: 10, perCycle: 0.5 }, // 1 + floor((level-1)/10)*0.5
    mech: {
      baseHp: 20, w: 63, h: 72, speed: 30, name: 'FARMER MECH', scoreBonus: 1000,
      phase2Threshold: 15,
      phase3Threshold: 8
    },
    cropduster: {
      baseHp: 15, w: 60, h: 20, speed: 60, name: 'CROP DUSTER', scoreBonus: 2000,
      phase2Threshold: 10,
      phase3Threshold: 5
    },
    combine: {
      baseHp: 30, w: 120, h: 80, speed: 15, name: 'THE COMBINE', scoreBonus: 3000,
      phase2Threshold: 20,
      phase3Threshold: 10
    }
  },

  // ----------------------------------------------------------
  // Pattern Counts (bullet-hell density scaling)
  // ----------------------------------------------------------
  patterns: {
    spiral: { base: 4, perLevel: 0.5, max: 20 },   // min(4 + floor(level/2), 20)
    ring:   { base: 6, perLevel: 0.5, max: 24 },    // min(6 + floor(level/2), 24)
    fan:    { base: 4, perLevel: 0.5, max: 16 },     // min(4 + floor(level/2), 16)
    sniper: { base: 1, perLevel: 0.2, max: 4 }       // min(1 + floor(level/5), 4)
  },

  // ----------------------------------------------------------
  // Difficulty Curve (getLevelConfig constants)
  // ----------------------------------------------------------
  difficulty: {
    // Early (lv 1-4)
    early: {
      maxLv: 4,
      cowsBase: 2,          // cowsNeeded = 2 + lv
      maxCowsBase: 3,       // maxCows = min(3+lv, 8)
      maxCowsCap: 8,
      projSpeedBase: 50,
      projSpeedPerLv: 8,
      cowSpawnBase: 4.0,
      cowSpawnPerLv: 0.3,
      farmerSpawnBase: 5.0,
      farmerSpawnPerLv: 0.3,
      farmerShootBase: 1.2,
      farmerShootPerLv: 0.05,
      powerupChance: 0.35
    },
    // Mid (lv 5-9)
    mid: {
      maxLv: 9,
      cowsBase: 4,
      maxCowsBase: 4,
      maxCowsCap: 14,
      projSpeedBase: 60,
      projSpeedPerLv: 10,
      cowSpawnStart: 3.0,
      cowSpawnPerLv: 0.3,
      cowSpawnMin: 1.5,
      farmerSpawnStart: 3.5,
      farmerSpawnPerLv: 0.4,
      farmerSpawnMin: 1.5,
      farmerShootStart: 0.9,
      farmerShootPerLv: 0.08,
      farmerShootMin: 0.55,
      powerupBase: 0.35,
      powerupPerLv: 0.02
    },
    // Late (lv 10-20)
    late: {
      maxLv: 20,
      cowsBase: 8,
      cowsPerLv: 0.8,
      maxCowsBase: 8,
      maxCowsCap: 18,
      projSpeedBase: 80,
      projSpeedPerLv: 10,
      cowSpawnStart: 2.0,
      cowSpawnPerLv: 0.1,
      cowSpawnMin: 0.8,
      farmerSpawnStart: 2.0,
      farmerSpawnPerLv: 0.12,
      farmerSpawnMin: 0.8,
      farmerShootStart: 0.5,
      farmerShootPerLv: 0.02,
      farmerShootMin: 0.3,
      powerupBase: 0.4,
      powerupPerLv: 0.01,
      powerupMax: 0.5
    },
    // Infinite (21+)
    infinite: {
      cowsBase: 24,
      cowsPerExcess: 0.5,
      maxCows: 18,
      maxFarmersBase: 5,
      maxFarmersPerFive: 1,
      maxFarmersCap: 8,
      projSpeedBase: 280,
      projSpeedPerExcess: 5,
      projSpeedMax: 450,
      cowSpawnStart: 0.8,
      cowSpawnPerExcess: 0.01,
      cowSpawnMin: 0.4,
      farmerSpawnStart: 0.8,
      farmerSpawnPerExcess: 0.02,
      farmerSpawnMin: 0.4,
      farmerShootStart: 0.3,
      farmerShootPerExcess: 0.005,
      farmerShootMin: 0.15,
      powerupChance: 0.5
    },
    // Shared
    cowSpeedBase: 50,
    cowSpeedPerLv: 12,
    farmerAccuracyBase: 0.2,
    farmerAccuracyPerLv: 0.05,
    farmerAccuracyMax: 0.85
  },

  // ----------------------------------------------------------
  // Pool Sizes & Caps
  // ----------------------------------------------------------
  pools: {
    bulletPoolSize: 1500,
    particleCap: 300,
    scorePickupCap: 200,
    maxBulletsPerFrame: 60
  },

  // ----------------------------------------------------------
  // Scoring
  // ----------------------------------------------------------
  scoring: {
    cowPoints: 100,
    comboBonus: 50,
    levelCompleteBase: 500,
    farmerKillPoints: 50,
    farmerIncineratePoints: 75,
    powerupPoints: 200,
    bombScorePickupValue: 5
  },

  // ----------------------------------------------------------
  // Powerup Weights
  // ----------------------------------------------------------
  powerupWeights: [25, 25, 15, 20, 15, 8],

  // ----------------------------------------------------------
  // Powerup Durations
  // ----------------------------------------------------------
  powerupDurations: {
    shield: 5.0,
    magnet: 8.0,
    speed: 6.0,
    incinerator: 6.0
  },

  // ----------------------------------------------------------
  // Hitstop (SYSTEM polish)
  // ----------------------------------------------------------
  hitstop: {
    farmerKill: 2,
    bossHit: 1,
    bossDeath: 10,
    bomb: 4,
    comboCow5: 2,
  },

  // ----------------------------------------------------------
  // Vacuum Forgiveness (beam deactivate grace period)
  // ----------------------------------------------------------
  vacuum: {
    gracePeriod: 0.3,
    pullRadius: 35,
    pullSpeed: 130,
    autoCollectDist: 12,
  },

  // ----------------------------------------------------------
  // Graze Audio Escalation
  // ----------------------------------------------------------
  grazeEscalation: {
    streakTimeout: 0.5,
    streakColor5: '#ffff88',
    streakColor10: '#ffaa44',
    streakColor15: '#ff44ff',
  },

  // ----------------------------------------------------------
  // Combo Timer Ring
  // ----------------------------------------------------------
  comboRing: {
    baseRadius: 18,
    radiusRange: 6,
    shatterParticles: 12,
    shatterSpeed: 40,
  },

  // ----------------------------------------------------------
  // Bullet Color-Coding by Danger Tier (FEATURE 5)
  // ----------------------------------------------------------
  bulletColors: {
    slow:     { maxSpeed: 80,  color: '#4488ff' },
    medium:   { maxSpeed: 150, color: '#ffcc44' },
    fast:     { maxSpeed: 250, color: '#ff8844' },
    veryFast: { maxSpeed: 9999, color: '#ff4444' },
  },

  // ----------------------------------------------------------
  // Boss Entrance Freeze (FEATURE 6)
  // ----------------------------------------------------------
  bossEntrance: {
    freezeDuration: 1.2,
    darkenAlpha: 0.6,
    nameScale: 3,
  },

  // ----------------------------------------------------------
  // Adaptive Difficulty / Mercy System (FEATURE 8)
  // ----------------------------------------------------------
  mercy: {
    onDamage: 0.15,
    lowHpRate: 0.05,
    lowHpThreshold: 2,
    onBomb: 0.1,
    onGraze: -0.01,
    onCowCollect: -0.02,
    passiveDecay: 0.03,
    maxMercy: 0.6,
    shootCooldownBonus: 0.5,
    bulletSpeedReduction: 0.2,
    powerupSpawnBonus: 1.0,
    disableDuringBoss: true,
  },

  // ----------------------------------------------------------
  // Narrative System (BARRAGE LIVE!)
  // ----------------------------------------------------------
  narrative: {
    enabled: true,
    crewCalloutsEnabled: true,
    goldenLoreEnabled: true,
    calloutDuration: 2.0,       // seconds a crew callout stays on screen
    loreDuration: 3.5,          // seconds a lore fragment stays on screen
    calloutCooldown: 8.0,       // min seconds between crew callouts
  }
};
