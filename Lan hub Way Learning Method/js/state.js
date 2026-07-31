
const LanHubState = (() => {
  const STORAGE_KEY = 'lanhub_state_v1';
  const HINT_COST = 100;
  const STAGE_REWARD = 50;

  const DEFAULT_STATE = {
    profile: {
      name: 'Gayantha Hashan',
      avatarUrl: null // swap in a real <img> src once available
    },
    points: 0,
    stayedSeconds: {}, // per-language seconds, e.g. { italian: 420 }
    progress: {
      // completedStages: array of stage ids finished for that language
      italian: { completedStages: [] },
      korean: { completedStages: [] },
      japanese: { completedStages: [] },
      ielts: { completedStages: [] }
    },
   
    justCompleted: null // { language, stageId }
  };

  function deepClone(obj) {
    // Avoids relying on structuredClone, which isn't available in every browser/webview — a plain JSON round-trip is enough for this plain-data state object.
    
    return JSON.parse(JSON.stringify(obj));
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return deepClone(DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      // merge shallowly so older saves gain new fields safely
      return {
        ...deepClone(DEFAULT_STATE),
        ...parsed,
        profile: { ...DEFAULT_STATE.profile, ...(parsed.profile || {}) },
        progress: { ...deepClone(DEFAULT_STATE.progress), ...(parsed.progress || {}) },
        stayedSeconds: { ...(parsed.stayedSeconds || {}) }
      };
    } catch (e) {
      console.warn('LanHubState: failed to load, resetting.', e);
      return deepClone(DEFAULT_STATE);
    }
  }

  function save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Some browsers/webviews block localStorage entirely for file:// pages or in private-browsing modes. Don't let that take down the rest of the page

      console.warn('LanHubState: could not save (storage unavailable).', e);
    }
  }

  function getState() {
    return load();
  }

  function addPoints(amount) {
    const state = load();
    state.points = Math.max(0, state.points + amount);
    save(state);
    return state.points;
  }

  function spendPoints(amount) {
    const state = load();
    if (state.points < amount) return false;
    state.points -= amount;
    save(state);
    return true;
  }

  function canAffordHint() {
    return load().points >= HINT_COST;
  }

  function completeStage(language, stageId) {
    const state = load();
    if (!state.progress[language]) {
      state.progress[language] = { completedStages: [] };
    }
    const list = state.progress[language].completedStages;
    if (!list.includes(stageId)) {
      list.push(stageId);
      state.points += STAGE_REWARD;
    }
    state.justCompleted = { language, stageId };
    save(state);
    return state;
  }

  function consumeJustCompleted() {
    const state = load();
    const val = state.justCompleted;
    state.justCompleted = null;
    save(state);
    return val;
  }

  function getProgress(language, totalStages) {
    const state = load();
    const completed = (state.progress[language] && state.progress[language].completedStages) || [];
    const percent = totalStages ? Math.round((completed.length / totalStages) * 100) : 0;
    return { completed, percent };
  }

  function addStayedSeconds(language, seconds) {
    const state = load();
    state.stayedSeconds[language] = (state.stayedSeconds[language] || 0) + seconds;
    save(state);
    return state.stayedSeconds[language];
  }

  function getStayedSeconds(language) {
    return load().stayedSeconds[language] || 0;
  }

  function formatStayedTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  return {
    HINT_COST,
    STAGE_REWARD,
    getState,
    addPoints,
    spendPoints,
    canAffordHint,
    completeStage,
    consumeJustCompleted,
    getProgress,
    addStayedSeconds,
    getStayedSeconds,
    formatStayedTime
  };
})();
