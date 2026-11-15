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

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const hall = JSON.parse(fs.readFileSync(path.join(ROOT, 'hall.json'), 'utf8'));
  let all = [];
  for (const w of hall.wings.filter((x) => x.status === 'open')) {
    const f = path.join(ROOT, `${w.id}.json`);
    if (!fs.existsSync(f)) { all.push(`HOB_MISSING_WING: ${w.id} is open but ${w.id}.json is missing`); continue; }
    all = all.concat(checkBuilder(JSON.parse(fs.readFileSync(f, 'utf8'))).map((e) => `${w.id}: ${e}`));
  }
  if (all.length) { console.error(all.join('\n')); process.exit(1); }
  console.log(`content ok: ${hall.wings.filter((x) => x.status === 'open').length} open wing(s), every claim sourced`);
}
