# Resume here (state on 2026-11-15)

Plans (private Claude Docs): Plan v2 https://claude.ai/artifact/DeR2GN3GkdNwpsixfdDbpJ ·
Sections Roadmap (next 50+) https://claude.ai/artifact/ERUX4GRqc6ViMNa3Bs5eV1

## Live now
nunnaconsulting.com/NAIC/hallofbuilders/ (landing) and /hall/ (3 Sections: Musashi, Marcus Aurelius, Nikola Tesla),
deployed from the NAIC monorepo branch `claude/hall-of-builders` (ncg-site, `npm run sync:ncg` here first).

## Update (overnight)
- LIVE: the full Nikola Tesla interactive museum (12 panels, 35 milestones, all 112 US patents, works, books), light/dark
  theme, legal pages. e2e: 128 checks across 8 browser/device profiles, both themes, all passing.
- Musashi (6/10 panels) and Marcus Aurelius (0/10) art run was stopped by Claude Code for low memory (ComfyUI uses ~9.5 GB).
  Their research is done (src/content/*.museum.json); their art maps are parked in src/content/pending/.
  To finish: start ComfyUI, `python scripts/art/panels.py musashi` then `aurelius` (existing panels are skipped),
  `node scripts/art/publish-art.mjs musashi aurelius`, move the two art JSON files back to src/content/,
  `npm run build && npx playwright test`, `npm run sync:ncg`, deploy NAIC.

## Earlier notes
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

## Update 2026-11-16: 50 Sections live
- All 50 Sections are live (sitemap lists 50 + lobby). Each has a timeline with 8-12 graphic-novel panels, works,
  5 sourced principles, a 7-day challenge, books, resources and (for the newer 25) a signature "feature" section.
- New: story player (narration + auto-scroll), mobile scaling + mobile e2e, SEO pages per Section (/hall/<id>/),
  sitemap.xml, llms.txt, BC dates.
- Pipeline: research -> src/content/pending/<id>.* + scripts/art/sets/<id>.json -> `node scripts/check-content.mjs --pending <id>`
  -> `python scripts/art/panels.py <id>` -> `node scripts/art/publish-art.mjs <id>` -> `node scripts/promote.mjs <id>`
  -> `npm run build` -> e2e -> `npm run sync:ncg` -> NAIC deploy. (`promote.mjs --undo <id>` moves a Section back.)
- Art review: the image model drifts to anachronisms (electric lamps, typewriters, galleons, Capitol domes, duplicate people,
  fake text). The global negative list in scripts/art/panels.py covers these; still review every contact sheet by eye.
- Waiting on the owner: rebrand choice + domain, Search Console/Bing sitemap submission, root robots.txt, FTP secrets for
  the nightly action, affiliate IDs, legal review.
