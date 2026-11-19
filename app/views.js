// Sunset Atlas views: every screen the guide shows, rendered from the same
// trophy data. The checklist is the home view; the guide pane sits beside it.

export const STAGES = [
  {
    name: 'Early story',
    blurb: 'Chapters 1–2. Learn the map, try every activity once, and do the one possibly missable trophy before Chapter 1 ends.',
    trophies: 'early',
  },
  {
    name: 'Mid story',
    blurb: 'Chapters 2–4. Side-character strands, robberies and the airport open up. Keep a manual save at the start of each chapter.',
    trophies: 'mid',
  },
  {
    name: 'Late story',
    blurb: 'Chapters 3–5 and the finale. Finish the story, save before the final mission, and the Gold for the finale pops.',
    trophies: 'late',
  },
  {
    name: 'Post-story cleanup',
    blurb: 'Free roam after the credits. Work the 100% checklist, the races, the vaults and the money trophies in any order.',
    trophies: 'cleanup',
  },
  {
    name: 'Grind',
    blurb: 'The long counts: 250 stunts, 42 shooting-range golds, 100 WAiNK It spots and 50 challenges. Chip at these last.',
    trophies: 'grind',
  },
];

const STAGE_MAP = {
  'Early story': 'early',
  'Mid story': 'mid',
  'Late story': 'late',
  'Post-story cleanup': 'cleanup',
  Grind: 'grind',
  Platinum: 'platinum',
};

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function gradeTag(trophy) {
  return el('span', `tag grade-${trophy.grade}`, trophy.grade);
}

function kindTag(trophy) {
  const label = trophy.kind === 'missable' ? 'Missable' : trophy.kind[0].toUpperCase() + trophy.kind.slice(1);
  return el('span', 'tag', label);
}

function spoilerHidden(trophy, state) {
  return state.spoilerSafe && trophy.hidden && !state.earned.includes(trophy.id);
}

// One checklist row: tick box, name + official description, grade and tags.
export function trophyRow(trophy, state, callbacks) {
  const li = el('li', 'trophy-row' + (state.earned.includes(trophy.id) ? ' earned' : ''));
  li.dataset.id = String(trophy.id);

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = state.earned.includes(trophy.id);
  box.setAttribute('aria-label', spoilerHidden(trophy, state) ? 'Mark this hidden trophy as earned' : `Mark ${trophy.name} as earned`);
  box.addEventListener('change', (event) => {
    event.stopPropagation();
    callbacks.onToggle(trophy.id);
  });
  li.append(box);

  const body = el('div');
  if (spoilerHidden(trophy, state)) {
    body.append(el('div', 'trophy-name spoiler-name', 'Hidden story trophy — earn it to reveal'));
    body.append(el('div', 'trophy-desc', 'Spoiler-safe is on. Its name and description stay hidden until you earn it.'));
  } else {
    body.append(el('div', 'trophy-name', trophy.name));
    body.append(el('div', 'trophy-desc', trophy.description));
  }
  const tags = el('div', 'trophy-tags');
  tags.append(gradeTag(trophy));
  tags.append(kindTag(trophy));
  if (trophy.hidden) tags.append(el('span', 'tag hidden-tag', 'Hidden'));
  if (trophy.missable) tags.append(el('span', 'tag missable-tag', 'Possibly missable'));
  if (trophy.chapter) tags.append(el('span', 'tag', trophy.chapter));
  if (trophy.count !== null && trophy.count !== undefined) {
    tags.append(el('span', 'tag', `${trophy.count} ${trophy.count_label || ''}`.trim()));
  }
  body.append(tags);
  li.append(body);

  li.append(el('div', 'grade-word', trophy.grade));
  li.addEventListener('click', (event) => {
    if (event.target === box) return;
    callbacks.onOpen(trophy.id);
  });
  return li;
}

// The guide pane: official description, the guide in our own words, steps,
// the missable warning where it applies, sources and a personal note field.
// Spoiler-safe hides a hidden trophy's guide too, not just its list row.
export function renderGuidePane(pane, trophy, state, callbacks) {
  pane.replaceChildren();
  if (!trophy) {
    pane.append(el('p', 'pane-empty', 'Pick a trophy on the left to see its guide, sources and your note.'));
    return;
  }
  if (state.spoilerSafe && trophy.hidden && !state.earned.includes(trophy.id)) {
    pane.append(el('h3', null, 'Hidden story trophy'));
    pane.append(el('p', null, 'Spoiler-safe is on, so this trophy stays hidden until you earn it. Its guide will open here once it is yours — turn Spoiler-safe off above if you would rather read it now.'));
    return;
  }

  pane.append(el('h3', null, trophy.name));
  const meta = el('div', 'trophy-tags');
  meta.append(gradeTag(trophy));
  meta.append(kindTag(trophy));
  if (trophy.hidden) meta.append(el('span', 'tag hidden-tag', 'Hidden on PSN'));
  if (trophy.missable) meta.append(el('span', 'tag missable-tag', 'Possibly missable'));
  pane.append(meta);

  const official = el('div', 'official-box');
  official.append(el('div', 'label', 'Official description — PlayStation'));
  official.append(el('div', null, trophy.description));
  pane.append(official);

  if (trophy.missable && trophy.missable_note) {
    pane.append(el('div', 'missable-callout', `⚠ ${trophy.missable_note}`));
  }
  if (trophy.count !== null && trophy.count !== undefined) {
    pane.append(el('p', 'count-line', `PSN tracks this one: ${trophy.count} ${trophy.count_label || ''}`.trim() + '.'));
  }

  pane.append(el('h4', null, 'How to get it'));
  pane.append(el('p', null, trophy.guide));
  if (trophy.steps && trophy.steps.length) {
    const steps = el('ol');
    for (const step of trophy.steps) steps.append(el('li', null, step));
    pane.append(steps);
  }

  pane.append(el('h4', null, 'Sources'));
  const sources = el('p', 'sources', 'Sources: ');
  trophy.sources.forEach((source, i) => {
    if (i > 0) sources.append(document.createTextNode(' · '));
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = source.name;
    sources.append(link);
  });
  pane.append(sources);

  pane.append(el('h4', null, 'Your note'));
  const note = document.createElement('textarea');
  note.className = 'note-field';
  note.placeholder = 'Where you found it, what worked, what to retry…';
  note.value = state.notes[trophy.id] || '';
  note.setAttribute('aria-label', `Your note for ${trophy.name}`);
  note.addEventListener('change', () => callbacks.onNote(trophy.id, note.value));
  pane.append(note);
}

// Roadmap: one card per stage with its trophies and how many are earned.
export function renderRoadmap(container, trophies, state) {
  container.replaceChildren();
  for (const stage of STAGES) {
    const inStage = trophies.filter((t) => STAGE_MAP[t.roadmap_stage] === stage.trophies);
    if (!inStage.length) continue;
    const earned = inStage.filter((t) => state.earned.includes(t.id)).length;
    const card = el('div', 'stage-card');
    card.append(el('h3', null, `${stage.name} — ${earned}/${inStage.length} earned`));
    card.append(el('p', null, stage.blurb));
    const list = el('ul');
    for (const trophy of inStage) {
      const item = el('li', null, `${trophy.name} (${trophy.grade})`);
      if (trophy.missable) item.textContent += ' — possibly missable, do it first';
      if (state.earned.includes(trophy.id)) item.textContent += ' ✓';
      list.append(item);
    }
    card.append(list);
    container.append(card);
  }
  const platinum = trophies.find((t) => t.grade === 'platinum');
  const done = trophies.filter((t) => state.earned.includes(t.id)).length;
  const card = el('div', 'stage-card');
  card.append(el('h3', null, `Platinum — ${platinum.name}`));
  card.append(el('p', null, `${done} of 55 trophies earned. When the other 54 are yours, the Platinum unlocks on its own.`));
  container.append(card);
}

// Missables: the one trophy that may be missed, with its warning up front.
export function renderMissables(container, trophies, state) {
  container.replaceChildren();
  const risky = trophies.filter((t) => t.missable);
  for (const trophy of risky) {
    const card = el('div', 'stage-card');
    card.append(el('h3', null, `${trophy.name} (${trophy.grade})`));
    card.append(el('div', 'missable-callout', `⚠ ${trophy.missable_note}`));
    card.append(el('p', null, trophy.guide));
    container.append(card);
  }
  const safe = el('p', null, 'Everything else can be earned after the story in free roam — story trophies, side strands, collectibles and counts included. Nothing on the 100% checklist is missable.');
  container.append(safe);
}

// Next Up: the next few un-earned trophies in roadmap order, missables first.
export function renderNextUp(list, trophies, state) {
  list.replaceChildren();
  const order = ['Early story', 'Mid story', 'Late story', 'Post-story cleanup', 'Grind', 'Platinum'];
  const pending = trophies
    .filter((t) => !state.earned.includes(t.id) && t.grade !== 'platinum')
    .sort((a, b) => {
      if (a.missable !== b.missable) return a.missable ? -1 : 1;
      return order.indexOf(a.roadmap_stage) - order.indexOf(b.roadmap_stage) || a.id - b.id;
    })
    .slice(0, 5);
  for (const trophy of pending) {
    const item = el('li');
    const hiddenName = state.spoilerSafe && trophy.hidden;
    item.append(el('strong', null, hiddenName ? 'Hidden story trophy' : trophy.name));
    item.append(document.createTextNode(` (${trophy.grade})`));
    const why = el('span', 'why', trophy.missable
      ? 'Possibly missable — do this one before Chapter 1 ends.'
      : hiddenName
        ? `${trophy.roadmap_stage}: hidden until earned (spoiler-safe is on).`
        : `${trophy.roadmap_stage}: ${trophy.description}`);
    item.append(why);
    list.append(item);
  }
  if (!pending.length) {
    list.append(el('li', null, 'Nothing left — the Platinum should be yours.'));
  }
}
