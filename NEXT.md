# Resume here (state on 2026-11-15)

Plans (private Claude Docs): Plan v2 https://claude.ai/artifact/DeR2GN3GkdNwpsixfdDbpJ ·
Sections Roadmap (next 50+) https://claude.ai/artifact/ERUX4GRqc6ViMNa3Bs5eV1

## Live now
nunnaconsulting.com/NAIC/hallofbuilders/ (landing) and /hall/ (3 Sections: Musashi, Marcus Aurelius, Nikola Tesla),
deployed from the NAIC monorepo branch `claude/hall-of-builders` (ncg-site, `npm run sync:ncg` here first).

## In progress (committed, NOT deployed)
1. Tesla museum template (`src/museum.ts`, `src/content/tesla.museum.json`, `tesla.art.json`).
2. Graphic-novel panels: `python scripts/art/tesla_panels.py` (ComfyUI on :8188, start with
   ContentStudioAI/contentcreate/engine/tools/comfyui, `main.py --lowvram --cpu-vae --disable-pinned-memory --port 8188`).
   Re-running skips panels that exist. Then `node scripts/art/publish-art.mjs tesla` -> public/art/tesla/*.webp.
3. Light/dark theme, legal pages, Playwright + axe e2e (`npm run e2e`; all 8 device projects, both themes).
4. Then: screenshots to the owner for approval -> upgrade Musashi + Aurelius -> weekly batches of the next 60.

## Waiting on the owner
- Approve the Tesla museum before deploy.
- GitHub repo secrets FTP_HOST / FTP_USER / FTP_PASSWORD to switch on the nightly midnight publish.
- Domain + mailbox (until then: lead collection only). Affiliate IDs (Bookshop.org, Amazon US/CA). Legal review.
- Medusa install on the VPS (capacity confirmed: ~7 GB free RAM, 41 GB disk) after the Tesla approval.
