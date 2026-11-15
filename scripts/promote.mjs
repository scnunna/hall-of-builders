// Move finished Sections from src/content/pending/ into the Hall (only when their art is published).
//   node scripts/promote.mjs <id> [id...]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkPending } from './check-content.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const C = path.join(ROOT, 'src', 'content'), P = path.join(C, 'pending');
const hallFile = path.join(C, 'hall.json');
const hall = JSON.parse(fs.readFileSync(hallFile, 'utf8'));
let bad = 0;
for (const id of process.argv.slice(2)) {
  const art = fs.existsSync(path.join(P, `${id}.art.json`)) ? JSON.parse(fs.readFileSync(path.join(P, `${id}.art.json`), 'utf8')) : null;
  // musashi/aurelius only have a parked art map; everyone else must pass the full pending check
  const legacy = !fs.existsSync(path.join(P, `${id}.hall.json`));
  const errs = legacy ? [] : checkPending(id);
  if (!art) errs.push(`HOB_MISSING: pending/${id}.art.json`);
  else for (const k of new Set([art.splash, ...art.panels.map((p) => p.key)]))
    if (!fs.existsSync(path.join(ROOT, 'public', 'art', id, `${k}.webp`))) errs.push(`HOB_ART_MISSING: public/art/${id}/${k}.webp`);
  if (errs.length) { console.error(`${id}: not promoted\n  ${errs.join('\n  ')}`); bad++; continue; }
  for (const f of [`${id}.json`, `${id}.museum.json`, `${id}.art.json`]) if (fs.existsSync(path.join(P, f))) fs.renameSync(path.join(P, f), path.join(C, f));
  if (!legacy) {
    const h = JSON.parse(fs.readFileSync(path.join(P, `${id}.hall.json`), 'utf8'));
    if (!hall.wings.some((w) => w.id === id)) hall.wings.push({ id: h.id, name: h.name, title: h.title, years: h.years, status: 'open', hook: h.hook });
    hall.candidates = hall.candidates.filter((n) => !h.name.toLowerCase().includes(n.toLowerCase()) && !n.toLowerCase().includes(h.name.toLowerCase()));
    fs.unlinkSync(path.join(P, `${id}.hall.json`));
  }
  console.log(`${id}: promoted`);
}
fs.writeFileSync(hallFile, JSON.stringify(hall, null, 2) + '\n');
process.exit(bad ? 1 : 0);
