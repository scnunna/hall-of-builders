# Hall of Builders

A free digital museum of how great builders thought. Each wing tells one builder's story, distils five
principles with sources, and offers a 7-day challenge to practise them. A standalone NAIC brand.

Live path (until the brand gets its own domain): `nunnaconsulting.com/NAIC/hallofbuilders/` (project page)
and `/NAIC/hallofbuilders/hall/` (this app).

## Commands
```
npm install
npm run dev        # local dev server
npm test           # content-gate tests
npm run build      # content gate + type check + build -> dist/
npm run sync:ncg   # copy dist/ into the NCG site (static/NAIC/hallofbuilders/hall/); then build/deploy ncg-site
```

## Content rules (enforced by `scripts/check-content.mjs` before every build)
- One JSON file per builder in `src/content/`. Every story panel and principle cites a source id; every quote has a credit.
- A wing has exactly 5 principles and a 7-day challenge.
- No location tracking language. Professional public life only. No merchandise of living people's likeness.
- Art is original and AI assistance is labelled; never copy a manga, anime or brand design.

## Structure
- `src/content/hall.json`: wings (open / soon) and the Vote the Hall candidates
- `src/content/<id>.json`: one builder (story, principles, challenge, sources)
- `src/main.ts`: hash router (lobby, wing, quiz, vote); `src/art.ts`: ink-style SVG scenes; `src/quiz.ts`; `src/lead.ts` (email capture via the NAIC lead endpoint)
