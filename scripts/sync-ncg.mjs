// Copy the built app into the NCG site so `node build.mjs` there ships it at /NAIC/hallofbuilders/hall/.
// NCG_SITE_DIR overrides the default location of the ncg-site checkout.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = process.env.NCG_SITE_DIR || path.resolve(HERE, '..', '_monorepos', 'NAIC', 'sites', 'ncg-site');
const SRC = path.join(HERE, 'dist');
const DST = path.join(SITE, 'static', 'NAIC', 'hallofbuilders', 'hall');

if (!fs.existsSync(path.join(SRC, 'index.html'))) { console.error('HOB_NO_BUILD: run `npm run build` first (dist/index.html missing).'); process.exit(1); }
if (!fs.existsSync(path.join(SITE, 'build.mjs'))) { console.error(`HOB_NO_NCG_SITE: ncg-site not found at ${SITE}. Set NCG_SITE_DIR.`); process.exit(1); }
fs.rmSync(DST, { recursive: true, force: true });
fs.mkdirSync(DST, { recursive: true });
fs.cpSync(SRC, DST, { recursive: true });
console.log(`synced dist -> ${path.relative(path.dirname(HERE), DST)}`);
