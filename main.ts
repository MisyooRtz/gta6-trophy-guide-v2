// Sunset Atlas hand-in program (Node 22, standard library only).
//
// The guide itself is plain static files in app/ beside this file:
// app/index.html opens in a desktop browser, its ES modules and styles
// load from app/ alone, and app/data/trophies.json holds the 55 trophies
// with their guides. Nothing is fetched over the network, ever.
//
// This program hands the guide in to the grader: it copies app/ and
// screenshots/ into the output directory and writes output/dossier.json
// with the vendored make.fun library, so the judge can read the guide's
// screenshots and source outline. The vendor library stays untouched.
//
// Run it locally with MAKEFUN_OUTPUT_DIR set:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function handIn() {
  mkdirSync(outputDir, { recursive: true });

  // The guide, exactly as it ships.
  cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

  // The screenshots, real renders of the guide's own code.
  const shotsDir = join(outputDir, 'screenshots');
  mkdirSync(shotsDir, { recursive: true });
  const repoShots = join(repoRoot, 'screenshots');
  if (existsSync(repoShots)) {
    for (const file of readdirSync(repoShots)) {
      copyFileSync(join(repoShots, file), join(shotsDir, file));
    }
  }

  // The dossier the judge reads: screenshots, first-load files and bytes,
  // and the source outline. Caps match the competition's own limits.
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
  console.log(`Sunset Atlas handed in to ${outputDir}`);
}

handIn();
