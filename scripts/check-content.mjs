// Content gate: every story panel, principle and quote must cite a known source, and the guardrails hold.
// Runs before every build. Exit 1 lists every problem (what failed + how to fix it).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content');

export function checkBuilder(b) {
  const errs = [];
  const known = b.sources || {};
  for (const [k, s] of Object.entries(known)) {
    if (!/^https:\/\//.test(s.url || '')) errs.push(`HOB_SOURCE_URL: source "${k}" needs an https url`);
    if (!s.label) errs.push(`HOB_SOURCE_LABEL: source "${k}" needs a label`);
  }
  const cite = (where, ids, required) => {
    if (!ids || !ids.length) { if (required) errs.push(`HOB_UNSOURCED: ${where} has no sources. Add a source id from "sources".`); return; }
    for (const id of ids) if (!known[id]) errs.push(`HOB_UNKNOWN_SOURCE: ${where} cites "${id}", which is not in "sources".`);
  };
  (b.story || []).forEach((p, i) => cite(`story[${i}] "${p.title}"`, p.sources, true));
  (b.principles || []).forEach((p, i) => {
    cite(`principles[${i}] "${p.title}"`, p.sources, true);
    if (p.quote && !p.quote.credit) errs.push(`HOB_QUOTE_CREDIT: principles[${i}] quote needs a credit (work + translator).`);
  });
  (b.challenge || []).forEach((c, i) => cite(`challenge[${i}]`, c.sources, false));
  // Guardrail: no live-location language in any text field.
  const text = JSON.stringify(b).toLowerCase();
  for (const bad of ['current location', 'live location', 'where is he now', 'jet tracker', 'home address']) {
    if (text.includes(bad)) errs.push(`HOB_GUARDRAIL_LOCATION: content mentions "${bad}". Location tracking is not allowed.`);
  }
  if ((b.principles || []).length !== 5) errs.push(`HOB_SHAPE: a wing has exactly 5 principles (found ${(b.principles || []).length}).`);
  if ((b.challenge || []).length !== 7) errs.push(`HOB_SHAPE: a challenge has exactly 7 days (found ${(b.challenge || []).length}).`);
  return errs;
}

// Check a draft Section in src/content/pending/ before it joins the Hall:  node scripts/check-content.mjs --pending <id>
export function checkPending(id) {
  const P = path.join(ROOT, 'pending'); const rd = (f) => JSON.parse(fs.readFileSync(path.join(P, f), 'utf8'));
  const errs = [];
  for (const f of [`${id}.json`, `${id}.museum.json`, `${id}.art.json`, `${id}.hall.json`]) if (!fs.existsSync(path.join(P, f))) errs.push(`HOB_MISSING: pending/${f}`);
  if (errs.length) return errs;
  const b = rd(`${id}.json`), m = rd(`${id}.museum.json`), art = rd(`${id}.art.json`), h = rd(`${id}.hall.json`);
  errs.push(...checkBuilder(b));
  for (const k of ['id', 'name', 'title', 'years', 'hook']) if (!h[k]) errs.push(`HOB_HALL: ${id}.hall.json needs "${k}"`);
  for (const k of ['tagline', 'reflect', 'keepsake']) if (!b[k]) errs.push(`HOB_FIELD: ${id}.json needs "${k}"`);
  const known = { ...b.sources, ...m.sources };
  for (const [k, s] of Object.entries(m.sources || {})) if (!/^https:\/\//.test(s.url || '')) errs.push(`HOB_SOURCE_URL: museum source "${k}" needs an https url`);
  m.timeline.forEach((e, i) => {
    if (!/^-?\d{4}/.test(e.date || '')) errs.push(`HOB_DATE: timeline[${i}] "${e.date}"`);
    if (!e.sources?.length) errs.push(`HOB_UNSOURCED: timeline[${i}] "${e.title}"`);
    for (const s of e.sources || []) if (!known[s]) errs.push(`HOB_UNKNOWN_SOURCE: timeline[${i}] cites "${s}"`);
    for (const k of ['place', 'title', 'text', 'kind']) if (!e[k]) errs.push(`HOB_FIELD: timeline[${i}] needs "${k}"`);
  });
  if (m.feature) {
    const f = m.feature;
    if (!f.nav || f.nav.length > 14) errs.push('HOB_FEATURE: feature.nav must be 1-14 characters (it is a menu label)');
    if (!['route', 'cards'].includes(f.style)) errs.push('HOB_FEATURE: feature.style is "route" or "cards"');
    if (!f.title || !f.lead) errs.push('HOB_FEATURE: feature needs title and lead');
    if (!(f.items?.length >= 5 && f.items.length <= 30)) errs.push('HOB_FEATURE: feature needs 5-30 items');
    (f.items || []).forEach((it, i) => { if (!it.label || !it.text) errs.push(`HOB_FEATURE: items[${i}] needs label and text`); if (!it.sources?.length) errs.push(`HOB_UNSOURCED: feature.items[${i}]`); for (const s of it.sources || []) if (!known[s]) errs.push(`HOB_UNKNOWN_SOURCE: feature.items[${i}] cites "${s}"`); });
  }
  m.works.forEach((e, i) => { if (!e.sources?.length) errs.push(`HOB_UNSOURCED: works[${i}]`); for (const s of e.sources || []) if (!known[s]) errs.push(`HOB_UNKNOWN_SOURCE: works[${i}] cites "${s}"`); });
  if (m.timeline.length < 18) errs.push(`HOB_SHAPE: timeline needs at least 18 entries (found ${m.timeline.length})`);
  if (m.works.length < 8) errs.push(`HOB_SHAPE: works needs at least 8 entries (found ${m.works.length})`);
  if (!m.books?.length || !m.resources?.length) errs.push('HOB_SHAPE: books and resources are required');
  const yrs = new Set(m.timeline.map((e) => { const x = /^(-?)(\d{4})/.exec(e.date); return (x[1] ? -1 : 1) * Number(x[2]); }));
  for (const p of art.panels) if (!p.near && !yrs.has(Number(p.year))) errs.push(`HOB_ART_YEAR: panel ${p.key} year ${p.year} matches no timeline entry (add "near": true or fix the year)`);
  if (!art.panels.some((p) => p.key === art.splash)) errs.push(`HOB_ART_SPLASH: splash "${art.splash}" is not one of the panels`);
  const setf = path.join(ROOT, '..', '..', 'scripts', 'art', 'sets', `${id}.json`);
  if (!fs.existsSync(setf)) errs.push(`HOB_MISSING: scripts/art/sets/${id}.json`);
  else { const set = JSON.parse(fs.readFileSync(setf, 'utf8')); for (const p of art.panels) if (!set.panels?.[p.key]) errs.push(`HOB_ART_PROMPT: no prompt for panel ${p.key} in sets/${id}.json`); }
  return errs;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const pi = process.argv.indexOf('--pending');
  if (pi > 0) { const errs = checkPending(process.argv[pi + 1]); if (errs.length) { console.error(errs.join('\n')); process.exit(1); } console.log(`pending ${process.argv[pi + 1]} ok`); process.exit(0); }
  const hall = JSON.parse(fs.readFileSync(path.join(ROOT, 'hall.json'), 'utf8'));
  let all = [];
  for (const w of hall.wings.filter((x) => x.status === 'open')) {
    const f = path.join(ROOT, `${w.id}.json`);
    if (!fs.existsSync(f)) { all.push(`HOB_MISSING_WING: ${w.id} is open but ${w.id}.json is missing`); continue; }
    all = all.concat(checkBuilder(JSON.parse(fs.readFileSync(f, 'utf8'))).map((e) => `${w.id}: ${e}`));
    // A museum ships only with all its art: every panel and the splash must exist as public/art/<id>/<key>.webp
    const mf = path.join(ROOT, `${w.id}.museum.json`), af = path.join(ROOT, `${w.id}.art.json`);
    if (fs.existsSync(mf) && fs.existsSync(af)) {
      const art = JSON.parse(fs.readFileSync(af, 'utf8'));
      const m = JSON.parse(fs.readFileSync(mf, 'utf8'));
      for (const k of new Set([art.splash, ...art.panels.map((p) => p.key)])) {
        if (!fs.existsSync(path.join(ROOT, '..', '..', 'public', 'art', w.id, `${k}.webp`))) all.push(`${w.id}: HOB_ART_MISSING: public/art/${w.id}/${k}.webp. Hint: run scripts/art/panels.py ${w.id} then scripts/art/publish-art.mjs ${w.id}`);
      }
      const known = { ...JSON.parse(fs.readFileSync(f, 'utf8')).sources, ...m.sources };
      m.timeline.forEach((e, i) => { if (!e.sources?.length) all.push(`${w.id}: HOB_UNSOURCED: timeline[${i}] "${e.title}"`); for (const s of e.sources || []) if (!known[s]) all.push(`${w.id}: HOB_UNKNOWN_SOURCE: timeline[${i}] cites "${s}"`); });
      m.works.forEach((e, i) => { for (const s of e.sources || []) if (!known[s]) all.push(`${w.id}: HOB_UNKNOWN_SOURCE: works[${i}] cites "${s}"`); });
      if (!m.timeline.every((e) => /^-?\d{4}/.test(e.date || ''))) all.push(`${w.id}: HOB_DATE: every timeline date must start with a 4-digit year ('-0069' for 69 BC)`);
    }
  }
  if (all.length) { console.error(all.join('\n')); process.exit(1); }
  console.log(`content ok: ${hall.wings.filter((x) => x.status === 'open').length} open wing(s), every claim sourced`);
}
