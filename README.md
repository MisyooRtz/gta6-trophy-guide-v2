# Sunset Atlas — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/MisyooRtz/gta6-trophy-guide-v2/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/MisyooRtz/gta6-trophy-guide-v2/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline web app that guides and tracks all 55 PlayStation 5 trophies of Grand Theft Auto VI: the official list with saved progress, filters and a spoiler setting, a roadmap to the Platinum, and a guide to each trophy that cites its sources.

Built for the [Build the best GTA 6 trophy guide](https://make.fun/bounty/gta6-trophy-guide-01) bounty on [make.fun](https://make.fun).

## What it does

- **Tracker** — tick trophies off as you earn them; progress saves in the browser, with export to a file and import back. Progress bar plus per-grade counts (Platinum %, Gold 0/2, Silver 0/6, Bronze 0/46).
- **Filters** — search by trophy, mission or chapter; filter by grade, kind (story, missable, collectibles, activities, challenges, exploration, combat, money) and status; Missable-only and Hide-earned toggles.
- **Spoiler-safe** — one switch hides the names and descriptions of un-earned hidden story trophies until you earn them.
- **Guide pane** — click any trophy for its full guide in our own words: what to do, where, how, and when it can be missed, with the official description, the PSN count where one exists, and its sources as links. A personal note field saves per trophy.
- **Roadmap to the Platinum** — five stages (Early story, Mid story, Late story, Post-story cleanup, Grind) with per-stage counts, built from the official descriptions. About 200 hours at difficulty 4/10 (PowerPyx).
- **Missables** — the one trophy that may be missable (Positive Mental Attitude: meditate at the first spot in Chapter 1 before the chapter ends), flagged with its warning. Everything else can be earned after the story in free roam.
- **Next Up** — the next five un-earned trophies in roadmap order, missables first.

## Sources, honestly cited

The official names, descriptions and grades come from Exophase and PSNProfiles; PSN's progress counts (250 stunts, 42 range golds, 18 meditation spots, 52 areas…) are PSNProfiles'. Unlock steps are drawn from GTA Zone's trophy guide (PowerPyx / GTABase). Every guide is written in our own words — a source is cited, never copied. Five trophies (In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There, Ten Pin) say so in their guides where no source has pinned the trigger down yet, rather than inventing a location.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no network: the app runs entirely from its own files.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

builds the hand-in (app, screenshots and dossier.json) into `out/`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=j2k22wgn&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
