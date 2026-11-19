// Sunset Atlas boot: load the trophy data, wire the save store to the views,
// and route between Checklist, Roadmap, Missables and Next Up by URL hash.

import { loadState, saveState, maybeSeedDemo, toggleEarned, setNote, setSpoilerSafe, exportProgress, importProgress } from './store.js';
import { trophyRow, renderGuidePane, renderRoadmap, renderMissables, renderNextUp } from './views.js';

const DATA_URL = 'data/trophies.json';

// Seed the demo progress first (only when ?demo=1 and no save exists),
// then load whatever the browser holds: the demo seed or the reader's own save.
maybeSeedDemo();
const fresh = loadState();

let trophies = [];
let selectedId = null;

const listEl = document.getElementById('trophy-list');
const paneEl = document.getElementById('guide-pane');
const metaEl = document.getElementById('list-meta');
const earnedEl = document.getElementById('earned-count');
const meterEl = document.getElementById('meter-fill');
const gradeEl = document.getElementById('grade-line');
const missableEl = document.getElementById('missable-line');

const searchEl = document.getElementById('search');
const gradeFilterEl = document.getElementById('grade-filter');
const kindEl = document.getElementById('kind-filter');
const statusEl = document.getElementById('status-filter');
const missableOnlyEl = document.getElementById('missable-only');
const hideEarnedEl = document.getElementById('hide-earned');
const spoilerEl = document.getElementById('spoiler-safe');

spoilerEl.checked = fresh.spoilerSafe;

function visibleTrophies() {
  const query = searchEl.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (gradeFilterEl.value !== 'all' && t.grade !== gradeFilterEl.value) return false;
    if (kindEl.value !== 'all' && t.kind !== kindEl.value) return false;
    if (statusEl.value === 'earned' && !fresh.earned.includes(t.id)) return false;
    if (statusEl.value === 'unearned' && fresh.earned.includes(t.id)) return false;
    if (missableOnlyEl.checked && !t.missable) return false;
    if (hideEarnedEl.checked && fresh.earned.includes(t.id)) return false;
    if (query) {
      const hay = `${t.name} ${t.description} ${t.mission || ''} ${t.chapter || ''}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });
}

function renderProgress() {
  const earned = fresh.earned.length;
  earnedEl.textContent = `${earned} / ${trophies.length}`;
  meterEl.style.width = `${Math.round((earned / trophies.length) * 100)}%`;
  const byGrade = (grade) => trophies.filter((t) => t.grade === grade && fresh.earned.includes(t.id)).length;
  const total = trophies.length;
  gradeEl.textContent = `Platinum ${Math.round((earned / total) * 100)}% · Gold ${byGrade('gold')}/2 · Silver ${byGrade('silver')}/6 · Bronze ${byGrade('bronze')}/46`;
  const missable = trophies.find((t) => t.missable);
  missableEl.textContent = missable && !fresh.earned.includes(missable.id)
    ? '1 trophy may be missable — do the Chapter 1 meditation before Chapter 1 ends.'
    : `${earned} earned, ${total - earned} to go — the missable trophy is done.`;
}

function renderList() {
  const shown = visibleTrophies();
  listEl.replaceChildren();
  for (const trophy of shown) {
    const row = trophyRow(trophy, fresh, {
      onToggle: (id) => {
        toggleEarned(fresh, id);
        renderAll();
      },
      onOpen: (id) => {
        selectedId = id;
        renderGuide();
        location.hash = `#/trophy/${id}`;
      },
    });
    if (trophy.id === selectedId) row.classList.add('selected');
    listEl.append(row);
  }
  const hidden = trophies.filter((t) => t.hidden).length;
  metaEl.textContent = `Showing ${shown.length} of ${trophies.length} · ${fresh.earned.length} earned · ${hidden} hidden on PSN · 1 possibly missable · Spoiler-safe ${fresh.spoilerSafe ? 'ON' : 'OFF'}`;
}

function renderGuide() {
  const trophy = trophies.find((t) => t.id === selectedId) || null;
  renderGuidePane(paneEl, trophy, fresh, {
    onNote: (id, text) => setNote(fresh, id, text),
  });
}

function renderAll() {
  renderProgress();
  renderList();
  renderGuide();
  renderRoadmap(document.getElementById('roadmap-stages'), trophies, fresh);
  renderMissables(document.getElementById('missables-list'), trophies, fresh);
  renderNextUp(document.getElementById('next-list'), trophies, fresh);
}

const VIEWS = ['checklist', 'roadmap', 'missables', 'next'];

function showView(name) {
  for (const view of VIEWS) {
    document.getElementById(`view-${view}`).hidden = view !== name;
  }
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.view === name);
  }
}

function route() {
  const hash = location.hash || '#/';
  const parts = hash.replace(/^#\//, '').split('/');
  if (parts[0] === 'trophy' && parts[1]) {
    selectedId = Number(parts[1]);
    showView('checklist');
    renderGuide();
    renderList();
    return;
  }
  if (VIEWS.includes(parts[0])) showView(parts[0]);
  else showView('checklist');
}

async function boot() {
  const response = await fetch(DATA_URL);
  const data = await response.json();
  trophies = data.trophies;

  // ?spoiler=1 turns Spoiler-safe on for this visit (and saves the choice),
  // so a shared link can open the guide with story trophies hidden.
  const params = new URLSearchParams(window.location.search);
  if (params.get('spoiler') === '1' && !fresh.spoilerSafe) {
    setSpoilerSafe(fresh, true);
    spoilerEl.checked = true;
  }

  for (const input of [searchEl, gradeFilterEl, kindEl, statusEl, missableOnlyEl, hideEarnedEl]) {
    input.addEventListener('input', renderList);
    input.addEventListener('change', renderList);
  }
  spoilerEl.addEventListener('change', () => {
    setSpoilerSafe(fresh, spoilerEl.checked);
    renderAll();
  });
  document.getElementById('export-btn').addEventListener('click', () => exportProgress(fresh));
  document.getElementById('import-file').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const imported = await importProgress(file, new Set(trophies.map((t) => t.id)));
      fresh.earned = imported.earned;
      fresh.notes = imported.notes;
      fresh.spoilerSafe = imported.spoilerSafe;
      spoilerEl.checked = fresh.spoilerSafe;
      saveState(fresh);
      renderAll();
    } catch (error) {
      alert(`Could not import that file: ${error.message}`);
    }
    event.target.value = '';
  });
  window.addEventListener('hashchange', route);

  renderAll();
  route();
}

boot();
