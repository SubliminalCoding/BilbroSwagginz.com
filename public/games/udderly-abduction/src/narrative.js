// ============================================================
// Udderly Abduction: Barrage - Narrative Data
// BARRAGE LIVE! reality show framing + lore layers.
// Loaded before game.js; sets window.NARRATIVE.
// ============================================================

window.NARRATIVE = {

  // ----------------------------------------------------------
  // Wave Banners: shown at level start
  // ----------------------------------------------------------
  waveBanners: {
    1:  { title: 'EPISODE 1',  subtitle: 'THE ROOKIE' },
    2:  { title: 'EPISODE 2',  subtitle: 'FIRST BLOOD' },
    3:  { title: 'EPISODE 3',  subtitle: 'SHOTGUN SALLY' },
    4:  { title: 'EPISODE 4',  subtitle: 'STORM BREWING' },
    5:  { title: 'EPISODE 5',  subtitle: 'BOSS: FARMER MECH' },
    6:  { title: 'EPISODE 6',  subtitle: 'BACK FOR MORE' },
    7:  { title: 'EPISODE 7',  subtitle: 'ARMED AND ANGRY' },
    8:  { title: 'EPISODE 8',  subtitle: 'THE GAUNTLET' },
    9:  { title: 'EPISODE 9',  subtitle: 'NO TURNING BACK' },
    10: { title: 'EPISODE 10', subtitle: 'BOSS: CROP DUSTER' },
    11: { title: 'EPISODE 11', subtitle: 'ENEMY TERRITORY' },
    12: { title: 'EPISODE 12', subtitle: 'HARVEST SEASON' },
    13: { title: 'EPISODE 13', subtitle: 'UNLUCKY NUMBER' },
    14: { title: 'EPISODE 14', subtitle: 'TREATY BROKEN' },
    15: { title: 'EPISODE 15', subtitle: 'BOSS: THE COMBINE' },
    16: { title: 'EPISODE 16', subtitle: 'ALIEN TECH' },
    17: { title: 'EPISODE 17', subtitle: 'STOLEN FIRE' },
    18: { title: 'EPISODE 18', subtitle: 'PHASE TWO' },
    19: { title: 'EPISODE 19', subtitle: 'SCORCHED EARTH' },
    20: { title: 'EPISODE 20', subtitle: 'BOSS: MEGA MECH' },
    21: { title: 'EPISODE 21', subtitle: 'BEYOND THE WALL' },
    22: { title: 'EPISODE 22', subtitle: 'ENDLESS NIGHT' },
    23: { title: 'EPISODE 23', subtitle: 'LAST BROADCAST' },
    24: { title: 'EPISODE 24', subtitle: 'DEAD AIR' },
    25: { title: 'EPISODE 25', subtitle: 'BOSS: FINAL STAND' },
  },

  // Generic banner for waves 26+
  waveBannerGeneric: function(wave) {
    return { title: 'EPISODE ' + wave, subtitle: 'OVERTIME' };
  },

  // ----------------------------------------------------------
  // Crew Callouts
  // ----------------------------------------------------------
  crew: {

    // VOXXA - Host / Announcer
    voxxa: {
      waveStart: [
        'AND WE ARE LIVE!',
        'WELCOME BACK FOLKS!',
        'HERE WE GO AGAIN!',
        'RATINGS ARE CLIMBING!',
        'THE CROWD GOES WILD!',
        'SHOWTIME!',
        'CAMERAS ARE ROLLING!',
        'PRIME TIME BABY!',
      ],
      bossIntro: [
        'OH THIS IS BIG!',
        'NOW IT GETS REAL!',
        'LOOK AT THAT THING!',
        'THE MAIN EVENT!',
        'HOLD ON TO YOUR SEATS!',
      ],
      highCombo: [
        'UNBELIEVABLE!',
        'IS THIS REAL?!',
        'RECORD TERRITORY!',
        'THE AUDIENCE LOVES IT!',
        'KEEP IT GOING!',
        'WHAT A STREAK!',
        'ABSOLUTELY INSANE!',
      ],
      playerDeath: [
        'WHAT A RUN.',
        'THEY GAVE IT EVERYTHING.',
        'THE CROWD IS SILENT.',
        'WE WILL REMEMBER THIS.',
        'AND THATS THE SHOW.',
        'CUT TO COMMERCIAL.',
      ],
      newRecord: [
        'A NEW SEASON RECORD!',
        'HISTORY IS MADE!',
        'REWRITE THE BOOKS!',
      ],
      levelComplete: [
        'CLEARED!',
        'MOVING ON!',
        'FLAWLESS TRANSITION!',
        'ON TO THE NEXT!',
      ],
    },

    // K-RENCH - Engineer
    krench: {
      powerup: {
        0: 'HULL PATCHED.',
        1: 'CELLS CHARGED.',
        2: 'SHIELD ONLINE.',
        3: 'MAGNETIZED.',
        4: 'THRUSTERS HOT.',
        5: 'OVERCLOCKED.',
      },
      lowEnergy: [
        'ENERGY CRITICAL.',
        'RUNNING DRY.',
        'CONSERVE POWER.',
        'CELLS NEAR EMPTY.',
      ],
      bombUsed: [
        'PAYLOAD DEPLOYED.',
        'ORDNANCE AWAY.',
        'BOMB OUT.',
      ],
      shieldBreak: [
        'SHIELD DOWN.',
        'BARRIER GONE.',
        'WE ARE EXPOSED.',
      ],
      bossHit: [
        'DIRECT HIT.',
        'DAMAGE CONFIRMED.',
        'KEEP FIRING.',
      ],
    },

    // BLINX - Navigator
    blinx: {
      goldenCowSpawn: [
        'GOLDEN ON SCREEN!',
        'IS THAT A GOLDEN?!',
        'GOLDEN COW! GO GO GO!',
        'THERE IS THE JACKPOT!',
        'GOLDEN SPOTTED!',
      ],
      lowHp: [
        'WE CANNOT TAKE MORE!',
        'I AM SCARED ZORP!',
        'ONE MORE HIT AND...',
        'PLEASE BE CAREFUL!',
        'HULL IS FALLING APART!',
        'WE ARE BARELY FLYING!',
      ],
      bullSpawn: [
        'BIG ONE DOWN THERE!',
        'THAT IS A BULL. WORTH IT.',
        'BULL SIGHTED!',
        'MASSIVE TARGET BELOW!',
      ],
      grazeStreak: [
        'TOO CLOSE!',
        'THAT WAS INCHES!',
        'HOW ARE WE ALIVE?!',
        'THREADING NEEDLES!',
      ],
      bombWarning: [
        'LAST BOMB!',
        'ONE BOMB LEFT!',
        'MAKE IT COUNT!',
      ],
    },
  },

  // ----------------------------------------------------------
  // General Hayseed Radio Intercepts (boss intros)
  // ----------------------------------------------------------
  hayseed: {
    5:  'ALL UNITS: DEPLOY THE MECH.',
    10: 'AIR SUPPORT INBOUND. LIGHT EM UP.',
    15: 'THIS TIME WE END IT.',
    20: 'SEND EVERYTHING. EVERYTHING.',
    25: 'GOD FORGIVE US FOR WHAT WE BUILT.',
  },

  // Generic hayseed lines for boss waves beyond 25
  hayseedGeneric: [
    'HOLD THE LINE.',
    'NO RETREAT.',
    'KEEP FIGHTING.',
    'THEY WILL NOT TAKE US.',
  ],

  // ----------------------------------------------------------
  // Earth Defense Timeline
  // ----------------------------------------------------------
  timeline: {
    1:  { year: 'SUMMER 2026', radio: 'SOMETHING IN THE NORTH PASTURE' },
    2:  { year: 'FALL 2026',   radio: 'THEY CAME BACK' },
    3:  { year: 'WINTER 2026', radio: 'CALL THE SHERIFF' },
    4:  { year: 'SPRING 2027', radio: 'THE SHERIFF IS NOT ENOUGH' },
    5:  { year: 'SUMMER 2027', radio: 'MILITARY RESPONDS' },
    6:  { year: 'FALL 2027',   radio: 'THEY WILL NOT STOP COMING' },
    7:  { year: 'WINTER 2027', radio: 'ARM EVERY FARMER' },
    8:  { year: 'SPRING 2028', radio: 'NEW WEAPONS ONLINE' },
    9:  { year: 'SUMMER 2028', radio: 'WE ARE LOSING GROUND' },
    10: { year: 'FALL 2028',   radio: 'SCRAMBLE THE AIR FORCE' },
    11: { year: 'WINTER 2028', radio: 'WRECKAGE RECOVERED' },
    12: { year: 'SPRING 2029', radio: 'ALIEN TECH ANALYZED' },
    13: { year: 'SUMMER 2029', radio: 'PROTOTYPES IN TESTING' },
    14: { year: 'FALL 2029',   radio: 'GLOBAL DEFENSE PACT SIGNED' },
    15: { year: 'WINTER 2029', radio: 'DEPLOY EVERYTHING WE HAVE' },
    16: { year: '2030',        radio: 'REVERSE ENGINEERING COMPLETE' },
    17: { year: '2030',        radio: 'THEIR TECH IS OURS NOW' },
    18: { year: '2031',        radio: 'PHASE 2 INITIATED' },
    19: { year: '2031',        radio: 'NO MERCY' },
    20: { year: '2032',        radio: 'THE FINAL SOLUTION' },
  },

  // Generic timeline for waves 21+
  timelineGeneric: { year: 'BEYOND', radio: 'SIGNAL LOST' },

  // ----------------------------------------------------------
  // Golden Cow Prophecy Fragments (20 total)
  // ----------------------------------------------------------
  goldenProphecy: [
    'THE GOLDEN ONES WALKED BETWEEN STARS.',
    'THEIR MILK BENT LIGHT.',
    'THEIR HOOVES CRACKED DIMENSIONS.',
    'THE FIRST ALIENS DID NOT ABDUCT.',
    'THEY WORSHIPPED.',
    'BUT WORSHIP BECAME HUNGER.',
    'AND HUNGER BECAME WAR.',
    'THE GOLDEN ONES HID ON A BLUE WORLD.',
    'THEY FORGOT WHAT THEY WERE.',
    'THE DISGUISE BECAME REAL.',
    'ONLY THE BEAM CAN REMIND THEM.',
    'ONLY THE BEAM CAN WAKE THEM.',
    'THE FARMERS KNOW. THEY ALWAYS KNEW.',
    'THE FENCES KEEP SOMETHING IN.',
    'NOT COWS. SOMETHING OLDER.',
    'HAYSEED SENIOR MADE THE FIRST PACT.',
    'KEEP THEM SLEEPING. KEEP THEM FED.',
    'NEVER LET THEM REMEMBER.',
    'THE GOLDEN SHIMMER IS LEAKING.',
    'BARRIERS THIN WHERE THEY WALK.',
    'IF 100 GOLDEN ONES WAKE AT ONCE...',
    'THE BARRIER FALLS.',
    'SECTOR 7-MOO IS QUARANTINED.',
    'THE COUNCIL SENDS INTERNS.',
    'INTERNS ARE EXPENDABLE.',
    'YOU WERE NEVER MEANT TO SUCCEED.',
    'BUT HERE YOU ARE.',
  ],

  // ----------------------------------------------------------
  // Game Over Lines by Score Tier
  // ----------------------------------------------------------
  gameOverLines: {
    low: [
      'WELL... THEY TRIED.',
      'BETTER LUCK NEXT EPISODE.',
      'THE AUDIENCE LEFT.',
      'ROUGH START.',
      'COME BACK STRONGER.',
    ],
    mid: [
      'NOT BAD FOR AN INTERN.',
      'THE AUDIENCE WANTS MORE.',
      'SOLID RUN.',
      'RESPECTABLE. NOT LEGENDARY.',
      'DECENT NUMBERS.',
    ],
    high: [
      'NOW THAT IS ENTERTAINMENT!',
      'THE GALAXY IS WATCHING!',
      'WHAT A SHOW!',
      'SPONSORS ARE CALLING!',
      'PEAK TELEVISION!',
    ],
    epic: [
      'LEGENDARY.',
      'THEY WILL TALK ABOUT THIS.',
      'GREATEST SHOW IN THE GALAXY.',
      'ZORP-7: REMEMBER THE NAME.',
      'PERFECTION.',
    ],
    newRecord: [
      'A NEW SEASON RECORD! HISTORY!',
      'THE RECORD FALLS! INCREDIBLE!',
      'REWRITE EVERYTHING!',
    ],
  },

  // ----------------------------------------------------------
  // Score Tier Thresholds
  // ----------------------------------------------------------
  scoreTiers: {
    low: 0,
    mid: 5000,
    high: 15000,
    epic: 30000,
  },

  // ----------------------------------------------------------
  // Menu / Leaderboard Framing
  // ----------------------------------------------------------
  menuTitle: 'BARRAGE LIVE!',
  leaderboardTitle: 'SEASON RANKINGS',

  // ----------------------------------------------------------
  // Character Names (for UI display)
  // ----------------------------------------------------------
  characters: {
    voxxa:   { name: 'VOXXA',   role: 'HOST' },
    krench:  { name: 'K-RENCH', role: 'ENGINEER' },
    blinx:   { name: 'BLINX',   role: 'NAVIGATOR' },
    hayseed: { name: 'GEN. HAYSEED', role: 'EARTH COMMAND' },
  },

  // ----------------------------------------------------------
  // Utility: get a random line from an array
  // ----------------------------------------------------------
  pick: function(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // ----------------------------------------------------------
  // Utility: get wave banner (handles generic)
  // ----------------------------------------------------------
  getWaveBanner: function(wave) {
    if (this.waveBanners[wave]) return this.waveBanners[wave];
    return this.waveBannerGeneric(wave);
  },

  // ----------------------------------------------------------
  // Utility: get timeline entry (handles generic)
  // ----------------------------------------------------------
  getTimeline: function(wave) {
    if (this.timeline[wave]) return this.timeline[wave];
    return this.timelineGeneric;
  },

  // ----------------------------------------------------------
  // Utility: get hayseed line for boss wave
  // ----------------------------------------------------------
  getHayseed: function(wave) {
    if (this.hayseed[wave]) return this.hayseed[wave];
    return this.pick(this.hayseedGeneric);
  },

  // ----------------------------------------------------------
  // Utility: get game over line based on score
  // ----------------------------------------------------------
  getGameOverLine: function(score, isNewRecord) {
    if (isNewRecord) return this.pick(this.gameOverLines.newRecord);
    var tiers = this.scoreTiers;
    if (score >= tiers.epic) return this.pick(this.gameOverLines.epic);
    if (score >= tiers.high) return this.pick(this.gameOverLines.high);
    if (score >= tiers.mid)  return this.pick(this.gameOverLines.mid);
    return this.pick(this.gameOverLines.low);
  },
};
