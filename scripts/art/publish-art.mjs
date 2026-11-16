// Convert generated panels (art-src/<id>/*.png) to web-ready WebP (public/art/<id>/*.webp, 1600px wide, ~q78) with ffmpeg.
//   node scripts/art/publish-art.mjs tesla
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
for (const id of process.argv.slice(2)) {
  const src = path.join(ROOT, 'art-src', id), dst = path.join(ROOT, 'public', 'art', id);
  if (!fs.existsSync(src)) { console.error(`HOB_NO_ART: ${src} missing; generate panels first`); process.exitCode = 1; continue; }
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src).filter((x) => x.endsWith('.png'))) {
    const out = path.join(dst, f.replace(/\.png$/, '.webp'));
    if (fs.statSync(path.join(src, f)).size === 0) { console.error(`HOB_EMPTY_PANEL: ${id}/${f} is empty (a failed render); re-run panels.py`); fs.unlinkSync(path.join(src, f)); process.exitCode = 1; continue; }
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(src, f), '-vf', 'scale=1600:-2', '-c:v', 'libwebp', '-quality', '78', out]);
    console.log(`${id}/${path.basename(out)} ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
  }
}
