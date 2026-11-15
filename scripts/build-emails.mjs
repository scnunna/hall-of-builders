// Build the 7-day challenge emails for every open wing -> dist-email/hob_emails.json
// The VPS sender (ncg-site tools/hob_challenge_drip.mjs) reads this file; nothing is sent from here.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const C = path.join(ROOT, 'src', 'content');
const SITE = process.env.HOB_SITE || 'https://nunnaconsulting.com/NAIC/hallofbuilders/hall/';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function emailsFor(b) {
  const wing = `${SITE}#/wing/${b.id}`;
  return b.challenge.map((d) => {
    // Pair a day with the principle that shares its words, if any; the last day always looks back.
    const p = d.day < 7 ? b.principles.find((x) => x.title.toLowerCase().split(' ').some((w) => w.length > 4 && d.title.toLowerCase().includes(w))) : null;
    const why = p ? `Why it matters: ${p.idea}` : d.day === 7 ? `Look back: ${b.reflect}` : `Remember: ${b.tagline}`;
    const subject = `Day ${d.day} of 7: ${d.title} (${b.name})`;
    const text = [
      `Day ${d.day} of your ${b.name} challenge`, '',
      `Today: ${d.title}.`, d.action, '',
      why,
      '', `Read the wing again: ${wing}`, '',
      'Hall of Builders, an NAIC project. Educational content.',
    ].join('\n');
    const html = `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#1c1a17;line-height:1.6">
<p style="letter-spacing:.12em;text-transform:uppercase;font-size:12px;color:#8a6d3b">Hall of Builders &middot; ${esc(b.name)} &middot; Day ${d.day} of 7</p>
<h1 style="font-size:26px;margin:0 0 12px">${esc(d.title)}</h1>
<p style="font-size:18px;background:#f6efe1;padding:12px 14px;border-radius:8px"><b>Today:</b> ${esc(d.action)}</p>
<p>${esc(why)}</p>
<p><a href="${esc(wing)}" style="color:#8a6d3b">Read the ${esc(b.name)} wing again</a></p>
<p style="font-size:12px;color:#777">Hall of Builders, an NAIC project. Educational content; every claim on the site links to its source.</p></div>`;
    return { day: d.day, subject, text, html };
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const hall = JSON.parse(fs.readFileSync(path.join(C, 'hall.json'), 'utf8'));
  const out = {};
  for (const w of hall.wings.filter((x) => x.status === 'open')) {
    const b = JSON.parse(fs.readFileSync(path.join(C, `${w.id}.json`), 'utf8'));
    out[w.id] = { name: b.name, list: `Hall of Builders: ${w.id} 7-day challenge`, days: emailsFor(b) };
  }
  fs.mkdirSync(path.join(ROOT, 'dist-email'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'dist-email', 'hob_emails.json'), JSON.stringify(out, null, 1));
  console.log(`built ${Object.values(out).reduce((n, x) => n + x.days.length, 0)} emails for ${Object.keys(out).join(', ')} -> dist-email/hob_emails.json`);
}
