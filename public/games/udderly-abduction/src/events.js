// ============================================================
// Udderly Abduction: Barrage - Event Bus
// Lightweight pub/sub for decoupled game systems.
// Loaded before game.js; sets window.GameEvents and window.EVT.
// ============================================================

window.GameEvents = (() => {
  const _listeners = {};

  return {
    on(event, fn) {
      (_listeners[event] ||= []).push(fn);
    },
    off(event, fn) {
      const arr = _listeners[event];
      if (arr) {
        const idx = arr.indexOf(fn);
        if (idx >= 0) arr.splice(idx, 1);
      }
    },
    emit(event, detail) {
      const arr = _listeners[event];
      if (!arr) return;
      for (let i = 0; i < arr.length; i++) arr[i](detail);
    },
    clear() {
      for (const key in _listeners) delete _listeners[key];
    }
  };
})();

// Event name constants
window.EVT = {
  COW_COLLECTED:     'cow-collected',
  FARMER_KILLED:     'farmer-killed',
  UFO_HIT:           'ufo-hit',
  BOSS_HIT:          'boss-hit',
  BOSS_KILLED:       'boss-killed',
  BULLET_GRAZED:     'bullet-grazed',
  BULLET_CANCELLED:  'bullet-cancelled',
  BOMB_USED:         'bomb-used',
  POWERUP_COLLECTED: 'powerup-collected',
  LEVEL_COMPLETE:    'level-complete',
  COMBO_MILESTONE:   'combo-milestone',
};
