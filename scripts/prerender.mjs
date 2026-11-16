// SEO + AI search: after `vite build`, write a real, crawlable page for every live Section at <base>/<id>/,
// with its own title, description, canonical URL, Open Graph image, JSON-LD (Article about a Person + breadcrumbs)
// and the full story as plain HTML. The app then takes over in the browser. Also writes sitemap.xml and llms.txt.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const C = path.join(ROOT, 'src', 'content'), DIST = path.join(ROOT, 'dist');
const SITE = (process.env.HOB_SITE || 'https://nunnaconsulting.com/NAIC/hallofbuilders/hall/').replace(/\/?$/, '/');
const BRAND = 'Hall of Builders';
const rd = (f) => JSON.parse(fs.readFileSync(path.join(C, f), 'utf8'));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const yearOf = (d) => { const m = /^(-?)(\d{4})/.exec(String(d)); return m ? (m[1] ? -1 : 1) * Number(m[2]) : NaN; };
const fmtY = (y) => (y < 0 ? `${-y} BC` : String(y));
const showYear = (s) => (/^-?\d{4}$/.test(String(s)) ? fmtY(yearOf(s)) : String(s ?? ''));
const cut = (s, n) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)) + '…');
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const today = new Date().toISOString().slice(0, 10);

// Header/footer links are '#/…'; make them point at the Hall root so they work from /<id>/ pages too.
const BASE_PATH = new URL(SITE).pathname;
const shell = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8').replace(/href="#\//g, `href="${BASE_PATH}#/`);
const hall = rd('hall.json');
const live = hall.wings.filter((w) => w.status === 'open' && (!w.publishAt || w.publishAt <= today) && fs.existsSync(path.join(C, `${w.id}.json`)));

function page({ title, desc, url, image, head = '', body }) {
  let h = shell
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}" />`)
    .replace(/<meta property="og:title"[^>]*>/, '').replace(/<meta property="og:description"[^>]*>/, '');
  const tags = `
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="article" /><meta property="og:site_name" content="${BRAND}" />
  <meta property="og:title" content="${esc(title)}" /><meta property="og:description" content="${esc(desc)}" />
  <meta property="og:url" content="${url}" />${image ? `<meta property="og:image" content="${image}" /><meta name="twitter:image" content="${image}" />` : ''}
  <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${esc(title)}" /><meta name="twitter:description" content="${esc(desc)}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />${head}
</head>`;
  h = h.replace('</head>', tags);
  return h.replace(/<main id="main" tabindex="-1"><\/main>/, `<main id="main" tabindex="-1">${body}</main>`);
}

const urls = [{ loc: SITE, pri: '1.0' }];
const llms = [`# ${BRAND}`, '', '> A free, ad-free interactive museum of the lives and work of history\'s great builders. Each Section has a sourced, illustrated life timeline, the person\'s works, five principles with credited quotes, a 7-day challenge, books and primary sources. Every factual claim links to a source.', '', '## Sections', ''];

for (const w of live) {
  const b = rd(`${w.id}.json`);
  const m = fs.existsSync(path.join(C, `${w.id}.museum.json`)) ? rd(`${w.id}.museum.json`) : null;
  const art = fs.existsSync(path.join(C, `${w.id}.art.json`)) ? rd(`${w.id}.art.json`) : null;
  const url = `${SITE}${w.id}/`;
  const image = art ? `${SITE}art/${w.id}/${art.splash}.webp` : '';
  const sources = { ...b.sources, ...(m?.sources || {}) };
  const title = `${w.name}: life, work and lessons | ${BRAND}`;
  const desc = cut(`${b.tagline} An illustrated timeline (${w.years}), ${m ? `${m.works.length} key works, ` : ''}five principles with sourced quotes and a free 7-day challenge.`, 158);
  const tl = (m?.timeline || []).map((e) => `<li><p class="ev-meta"><b>${fmtY(yearOf(e.date))}</b> · ${esc(e.place)}</p><h3>${esc(e.title)}</h3><p>${esc(e.text)}</p></li>`).join('');
  const feat = m?.feature ? `<section class="wrap"><h2>${esc(m.feature.title)}</h2><p>${esc(m.feature.lead)}</p><ol>${m.feature.items.map((it) => `<li><h3>${esc(it.label)}</h3><p>${esc(it.text)}</p></li>`).join('')}</ol></section>` : '';
  const pr = b.principles.map((p) => `<li><h3>${esc(p.title)}</h3><p>${esc(p.idea)}</p>${p.quote ? `<blockquote>"${esc(p.quote.text)}" <cite>${esc(p.quote.credit)}</cite></blockquote>` : ''}<p><b>Try it:</b> ${esc(p.practice)}</p></li>`).join('');
  const works = (m?.works || []).map((x) => `<li><b>${esc(showYear(x.year))}</b> ${esc(x.title)}: ${esc(x.text)}</li>`).join('');
  const days = b.challenge.map((d) => `<li><b>Day ${d.day}: ${esc(d.title)}.</b> ${esc(d.action)}</li>`).join('');
  const src = Object.values(sources).map((s) => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.label)}</a></li>`).join('');
  const body = `<article class="wrap prerender">
    <p class="eyebrow">${esc(w.years)} · ${esc(w.title)}</p><h1>${esc(w.name)}</h1><p class="lead">${esc(b.tagline)}</p>
    ${tl ? `<h2>Life timeline</h2><ol>${tl}</ol>` : ''}${feat}
    <h2>Five principles</h2><ol>${pr}</ol>
    ${works ? `<h2>The life's work</h2><ul>${works}</ul>` : ''}
    <h2>Free 7-day challenge</h2><ol>${days}</ol>
    <h2>Sources</h2><ul>${src}</ul>
    <p><a href="${SITE}">All Sections in the ${BRAND}</a></p></article>`;
  const birth = m?.timeline?.[0];
  const head = ld({
    '@context': 'https://schema.org', '@graph': [
      { '@type': 'Article', '@id': `${url}#article`, headline: `${w.name}: ${w.title}`, description: desc, url, image: image || undefined, inLanguage: 'en',
        isAccessibleForFree: true, dateModified: today, publisher: { '@type': 'Organization', name: BRAND, url: SITE },
        about: { '@type': 'Person', name: w.name, description: w.hook, ...(birth && birth.age === 0 && yearOf(birth.date) > 0 ? { birthDate: birth.date } : {}), image: image || undefined },
        citation: Object.values(sources).slice(0, 25).map((s) => s.url) },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: BRAND, item: SITE }, { '@type': 'ListItem', position: 2, name: w.name, item: url }] },
    ],
  });
  fs.mkdirSync(path.join(DIST, w.id), { recursive: true });
  fs.writeFileSync(path.join(DIST, w.id, 'index.html'), page({ title, desc, url, image, head, body }));
  urls.push({ loc: url, pri: '0.8' });
  llms.push(`- [${w.name} (${w.years})](${url}): ${b.tagline}`);
}

// Lobby: list every Section as plain links, so crawlers find them all.
const lobbyBody = `<section class="wrap prerender"><h1>${BRAND}</h1><p class="lead">An interactive museum of how history's great builders lived, worked and thought.</p><h2>The Sections</h2><ul>${live.map((w) => `<li><a href="${SITE}${w.id}/">${esc(w.name)}</a> (${esc(w.years)}): ${esc(w.hook)}</li>`).join('')}</ul></section>`;
const lobbyHead = ld({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: BRAND, url: SITE, hasPart: live.map((w) => ({ '@type': 'Article', headline: w.name, url: `${SITE}${w.id}/` })) });
fs.writeFileSync(path.join(DIST, 'index.html'), page({ title: `${BRAND}: illustrated lives of history's great builders`, desc: `Free illustrated museum of ${live.length} great lives: sourced timelines, life's work, five principles with quotes and a 7-day challenge for each.`, url: SITE, image: '', head: lobbyHead, body: lobbyBody }));

fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.pri}</priority></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(DIST, 'llms.txt'), llms.join('\n') + `\n\n## Policies\n\n- [Editorial and corrections](${SITE}#/legal/editorial)\n- [Copyright and takedown](${SITE}#/legal/copyright)\n`);
console.log(`prerendered ${live.length} Section pages + lobby, sitemap.xml (${urls.length} urls), llms.txt`);
