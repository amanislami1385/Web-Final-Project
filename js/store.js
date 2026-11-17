/* One versioned JSON document. No network requests, credentials or backend.
   Validate data on every load and import; never trust localStorage blindly. */
'use strict';
(() => {
  const KEY = 'afh-final-v1';
  const ids = new Set(AFH.opportunities.map(item => item.id));
  const categories = ['Scholarships', 'Digital skills', 'Languages', 'Learning'];
  const levels = ['Secondary school', 'Undergraduate', 'Graduate', 'Independent learner'];
  const blank = () => ({version: 1, saved: [], compare: [], plan: null, milestones: [], readiness: [], sessions: []});
  const unique = (value, allowed, max) => Array.isArray(value)
    ? [...new Set(value)].filter(id => allowed.has(id)).slice(0, max) : [];
  const text = (value, min, max) => typeof value === 'string' && value.trim().length >= min && value.length <= max;
  const dateValid = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const d = new Date(value + 'T12:00:00Z');
    return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value;
  };
  const planValid = p => p && text(p.name, 2, 60) && categories.includes(p.interest) && levels.includes(p.level)
    && dateValid(p.start) && Number.isInteger(p.hours) && p.hours >= 1 && p.hours <= 40 && text(p.goal, 20, 500);
  const sessionValid = s => s && typeof s.id === 'string' && /^[\w-]{1,80}$/.test(s.id) && dateValid(s.date)
    && Number.isInteger(s.minutes) && s.minutes >= 5 && s.minutes <= 480 && s.minutes % 5 === 0 && text(s.note, 5, 160);
  function normalize(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) || raw.version !== 1) return blank();
    const state = blank();
    state.saved = unique(raw.saved, ids, ids.size);
    state.compare = unique(raw.compare, ids, 3);
    state.milestones = unique(raw.milestones, new Set([0,1,2,3]), 4);
    state.readiness = unique(raw.readiness, new Set([0,1,2,3,4]), 5);
    if (planValid(raw.plan)) state.plan = {name:raw.plan.name.trim(),interest:raw.plan.interest,level:raw.plan.level,start:raw.plan.start,hours:raw.plan.hours,goal:raw.plan.goal.trim()};
    if (Array.isArray(raw.sessions)) {
      const seen = new Set();
      state.sessions = raw.sessions.filter(sessionValid).filter(s => !seen.has(s.id) && seen.add(s.id)).slice(0, 500)
        .map(s => ({id:s.id,date:s.date,minutes:s.minutes,note:s.note.trim()}));
    }
    return state;
  }
  let state = blank();
  let storageProblem = '';
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 1 || typeof parsed !== 'object' || Array.isArray(parsed)) throw Error('Invalid saved data');
      state = normalize(parsed);
    } else {
      // Preserve Endterm favorites when this release is deployed to the same origin.
      state.saved = unique(JSON.parse(localStorage.getItem('afh-saved') || '[]'), ids, ids.size);
    }
  } catch { storageProblem = 'Saved data could not be read. Your existing browser data has not been deleted. You can restore a backup from Dashboard.'; }
  function notifyProblem(message) {
    storageProblem = message;
    const banner = document.getElementById('storage-warning');
    if (banner) { banner.textContent = message; banner.hidden = false; }
  }
  AFH.store = {
    get: () => structuredClone(state),
    update(change) {
      const next = structuredClone(state);
      change(next);
      const clean = normalize(next);
      try { localStorage.setItem(KEY, JSON.stringify(clean)); }
      catch { notifyProblem('Your browser could not save this change. Storage may be blocked or full. Enable storage or download a backup before clearing anything.'); return false; }
      state = clean;
      window.dispatchEvent(new Event('afh:change'));
      return true;
    },
    replace(raw) { return this.update(next => Object.assign(next, normalize(raw))); },
    reset() {
      try {
        localStorage.removeItem(KEY); localStorage.removeItem('afh-saved');
        localStorage.removeItem('afh-readiness'); localStorage.removeItem('afh-motion-paused');
        localStorage.removeItem('afh-checklist'); localStorage.removeItem('afh-theme');
      } catch { notifyProblem('Your browser blocked deletion. Remove this site’s storage in browser settings.'); return false; }
      state = blank(); window.dispatchEvent(new Event('afh:change')); return true;
    },
    showProblem() { if (storageProblem) notifyProblem(storageProblem); },
    validateBackup(raw) {
      if (!raw || raw.app !== 'Afghan Future Hope' || raw.version !== 1 || !raw.data || raw.data.version !== 1) throw Error('Choose an Afghan Future Hope version 1 backup.');
      const d = raw.data;
      if (!Array.isArray(d.saved) || d.saved.length > ids.size || d.saved.some(id => !ids.has(id))
        || !Array.isArray(d.compare) || d.compare.length > 3 || d.compare.some(id => !ids.has(id))
        || !Array.isArray(d.milestones) || d.milestones.some(id => ![0,1,2,3].includes(id))
        || !Array.isArray(d.readiness) || d.readiness.some(id => ![0,1,2,3,4].includes(id))
        || (d.plan !== null && !planValid(d.plan)) || !Array.isArray(d.sessions) || d.sessions.length > 500 || d.sessions.some(s => !sessionValid(s))) throw Error('This backup contains invalid data. Your current progress is unchanged.');
      return normalize(d);
    },
    blank, normalize, planValid, sessionValid, dateValid
  };
  // Keep two open tabs consistent; only this app's storage key is handled.
  window.addEventListener('storage', event => {
    if (event.key !== KEY && event.key !== null) return;
    try { state = event.newValue ? normalize(JSON.parse(event.newValue)) : blank(); window.dispatchEvent(new Event('afh:change')); }
    catch { notifyProblem('Another tab wrote unreadable data. Reload or restore a valid backup.'); }
  });
})();
