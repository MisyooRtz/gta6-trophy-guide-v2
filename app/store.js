// Sunset Atlas save store: earned ticks, per-trophy notes and the spoiler switch,
// kept in localStorage under one key so the whole tracker survives reloads.

export const SAVE_KEY = 'gta6-trophy-guide-v1';

// The demo seed used for screenshots (?demo=1): thirteen trophies a player
// could plausibly hold early in the story, so the guide shows real progress.
export const DEMO_EARNED = [2, 3, 8, 16, 20, 21, 33, 35, 36, 44, 46, 51, 53];

function readSaved() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function blankState() {
  return { earned: [], notes: {}, spoilerSafe: false };
}

export function loadState() {
  const saved = readSaved();
  if (!saved) return blankState();
  return {
    earned: Array.isArray(saved.earned) ? saved.earned.filter((n) => Number.isInteger(n)) : [],
    notes: saved.notes && typeof saved.notes === 'object' ? saved.notes : {},
    spoilerSafe: saved.spoilerSafe === true,
  };
}

export function saveState(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // A full or blocked store must never break the guide itself.
  }
}

// Seed the demo progress once, only when the reader has no save yet and the
// page was opened with ?demo=1. Real readers keep their own save untouched.
export function maybeSeedDemo() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('demo') !== '1') return false;
  if (readSaved()) return false;
  const state = blankState();
  state.earned = [...DEMO_EARNED];
  saveState(state);
  return true;
}

export function isEarned(state, id) {
  return state.earned.includes(id);
}

export function toggleEarned(state, id) {
  const at = state.earned.indexOf(id);
  if (at === -1) state.earned.push(id);
  else state.earned.splice(at, 1);
  saveState(state);
  return state;
}

export function setNote(state, id, text) {
  if (text.trim()) state.notes[id] = text;
  else delete state.notes[id];
  saveState(state);
  return state;
}

export function setSpoilerSafe(state, on) {
  state.spoilerSafe = on;
  saveState(state);
  return state;
}

// Export the save as a file the reader can keep or move to another browser.
export function exportProgress(state) {
  const blob = new Blob([JSON.stringify({ app: 'sunset-atlas-gta6', earned: state.earned, notes: state.notes }, null, 2)], {
    type: 'application/json',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gta6-trophy-progress.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 5000);
}

// Import a save file, keeping only trophy ids this guide knows about.
export async function importProgress(file, knownIds) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const earned = Array.isArray(parsed.earned) ? parsed.earned.filter((n) => knownIds.has(n)) : null;
  if (earned === null) throw new Error('That file has no earned list I recognise.');
  const notes = {};
  if (parsed.notes && typeof parsed.notes === 'object') {
    for (const [key, value] of Object.entries(parsed.notes)) {
      if (knownIds.has(Number(key)) && typeof value === 'string') notes[key] = value;
    }
  }
  return { earned, notes, spoilerSafe: parsed.spoilerSafe === true };
}
