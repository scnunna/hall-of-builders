// The interactive museum of a person's life's work: splash, scroll-told life timeline with graphic-novel panels,
// works, a searchable patents archive, books and resources. Motion uses GSAP ScrollTrigger (transform/opacity only).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

type Src = { label: string; url: string };
export type Museum = {
  sources: Record<string, Src>;
  timeline: { date: string; age: number | null; place: string; title: string; text: string; turning: boolean; kind: string; sources: string[] }[];
  patents?: { number: string; title: string; filed: string | null; granted: string; country: string; area: string; url: string }[];
  patentsNote?: string;
  works: { year: string; type: string; title: string; text: string; sources: string[]; url?: string }[];
  resources: { label: string; url: string; what: string }[];
  books: { title: string; author: string; year: string | number; kind: string; free: string | null; note: string }[];
};
export type Art = { style: string; splash: string; panels: { key: string; year: string; near?: boolean }[] };

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const yearOf = (d: string) => Number(d.slice(0, 4));

export function placePanels(m: Museum, art: Art) {
  const used = new Set<number>(); const at: Record<number, string> = {};
  for (const p of art.panels) {
    const y = Number(p.year);
    let i = m.timeline.findIndex((e, k) => !used.has(k) && yearOf(e.date) === y);
    if (i < 0 && p.near) i = m.timeline.findIndex((e, k) => !used.has(k) && yearOf(e.date) >= y);
    if (i >= 0) { used.add(i); at[i] = p.key; }
  }
  return at;
}

export function museumHTML(id: string, name: string, years: string, m: Museum, art: Art, allSources: Record<string, Src>) {
  const img = (k: string) => `${import.meta.env.BASE_URL}art/${id}/${k}.webp`;
  const cite = (ids: string[] = []) => ids.map((s) => allSources[s] ? `<a class="cite" href="${esc(allSources[s].url)}" target="_blank" rel="noopener" title="${esc(allSources[s].label)}">source</a>` : '').join(' ');
  const panelAt = placePanels(m, art);
  const first = yearOf(m.timeline[0].date), last = yearOf(m.timeline[m.timeline.length - 1].date);
  const life = years.replace(/\s*-\s*/, ' to ');   // the person's own lifespan (the timeline may continue with legacy entries)

  const events = m.timeline.map((e, i) => {
    const pic = panelAt[i];
    const cls = `ev ${e.turning ? 'turn' : ''} k-${esc(e.kind)}`;
    const head = `<p class="ev-meta"><b>${yearOf(e.date)}</b>${e.age != null ? ` · age ${e.age}` : ''} · ${esc(e.place)}</p><h3>${esc(e.title)}</h3><p>${esc(e.text)} ${cite(e.sources)}</p>`;
    if (pic && e.turning) return `<article class="${cls} splash-panel" data-year="${yearOf(e.date)}"><div class="sp-img"><img src="${img(pic)}" alt="" loading="lazy" decoding="async"></div><div class="sp-text"><span class="badge">Turning point</span>${head}</div></article>`;
    return `<article class="${cls}" data-year="${yearOf(e.date)}">${pic ? `<figure class="ev-img"><img src="${img(pic)}" alt="" loading="lazy" decoding="async"></figure>` : ''}<div class="ev-body">${e.turning ? '<span class="badge">Turning point</span>' : ''}${head}</div></article>`;
  }).join('');

  const works = m.works.map((w) => `<article class="work rv"><p class="ev-meta"><b>${esc(w.year)}</b> · ${esc(w.type)}</p><h3>${w.url ? `<a href="${esc(w.url)}" target="_blank" rel="noopener">${esc(w.title)}</a>` : esc(w.title)}</h3><p>${esc(w.text)} ${cite(w.sources)}</p></article>`).join('');

  let patents = '';
  if (m.patents?.length) {
    const byYear: Record<number, number> = {};
    m.patents.forEach((p) => { const y = yearOf(p.granted); byYear[y] = (byYear[y] || 0) + 1; });
    const ys = Object.keys(byYear).map(Number).sort(); const y0 = ys[0], y1 = ys[ys.length - 1]; const max = Math.max(...Object.values(byYear));
    const W = 720, H = 140, bw = W / (y1 - y0 + 1);
    const bars = ys.map((y) => `<rect x="${(y - y0) * bw + 1}" y="${H - 20 - (byYear[y] / max) * (H - 36)}" width="${Math.max(2, bw - 2)}" height="${(byYear[y] / max) * (H - 36)}" rx="2"><title>${y}: ${byYear[y]} patents</title></rect>`).join('');
    const ticks = ys.filter((y) => y % 10 === 0 || y === y0 || y === y1).map((y) => `<text x="${(y - y0) * bw + bw / 2}" y="${H - 4}" text-anchor="middle">${y}</text>`).join('');
    const areas = [...new Set(m.patents.map((p) => p.area))].sort();
    const rows = m.patents.map((p) => `<li data-area="${esc(p.area)}" data-q="${esc((p.number + ' ' + p.title + ' ' + p.granted).toLowerCase())}"><a href="${esc(p.url)}" target="_blank" rel="noopener"><span class="pn-no">${esc(p.number)}</span><span class="pn-t">${esc(p.title)}</span><span class="pn-d">${esc(p.granted)}</span></a></li>`).join('');
    patents = `
    <section class="wrap" id="patents"><h2 class="sec">Every patent</h2>
      <p class="lead">${esc(m.patentsNote || `${m.patents.length} patents`)}</p>
      <svg class="pchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Patents granted per year, ${y0} to ${y1}">${bars}${ticks}</svg>
      <div class="pfilter"><label class="sr" for="pq">Search patents</label><input id="pq" type="search" placeholder="Search by title, number or year">
        <div class="chips" role="group" aria-label="Filter by area"><button class="chip on" data-area="">All</button>${areas.map((a) => `<button class="chip" data-area="${esc(a)}">${esc(a)}</button>`).join('')}</div></div>
      <p class="muted small" id="pcount">${m.patents.length} shown</p>
      <ol class="plist">${rows}</ol>
    </section>`;
  }

  const books = m.books.map((b) => `<li class="book rv"><p class="ev-meta">${b.kind === 'by-him' || b.kind === 'by-her' || b.kind === 'by-them' ? 'Their own words' : 'Biography'} · ${esc(b.year)}</p><h3>${esc(b.title)}</h3><p class="muted">${esc(b.author)}</p><p>${esc(b.note)}</p><p class="row">${b.free ? `<a class="btn btn-gold sm" href="${esc(b.free)}" target="_blank" rel="noopener">Read free</a>` : ''}<a class="btn btn-ghost sm" href="https://bookshop.org/search?keywords=${encodeURIComponent(b.title + ' ' + b.author)}" target="_blank" rel="noopener sponsored">Find a copy</a></p></li>`).join('');
  const res = m.resources.map((r) => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.label)}</a><span class="muted"> · ${esc(r.what)}</span></li>`).join('');

  return {
    splash: `
    <section class="m-splash" aria-label="${esc(name)}">
      <div class="m-splash-img"><img src="${img(art.splash)}" alt="" fetchpriority="high"></div>
      <div class="m-splash-text">
        <p class="eyebrow">The museum of a life's work · ${esc(life)}</p>
        <h1>${esc(name)}</h1>
        <p class="m-scroll">Scroll to walk through the life <span aria-hidden="true">&darr;</span></p>
      </div>
    </section>
    <div class="m-bar" aria-hidden="true"><span class="m-year">${first}</span><span class="m-track"><span class="m-fill"></span></span><span class="m-end">${last}</span></div>`,
    timeline: `<section class="wrap m-life" id="life"><h2 class="sec">A life, ${esc(life)}</h2><p class="muted small">Graphic-novel panels are AI-generated artistic interpretations, not historical records. ${esc(art.style)}</p><div class="spine">${events}</div></section>`,
    works: `<section class="wrap band" id="works"><h2 class="sec">The life's work</h2><div class="works">${works}</div></section>`,
    patents,
    books: `<section class="wrap" id="books"><h2 class="sec">Read more</h2><p class="muted small">Their own books come first, with free public-domain copies where they exist. Some links may become affiliate links; it never changes what we recommend. <a href="#/legal/disclosures">Disclosures</a></p><ul class="books">${books}</ul></section>`,
    resources: `<section class="wrap band" id="resources"><h2 class="sec">Go to the source</h2><ul class="res">${res}</ul></section>`,
  };
}

export function initMuseum(root: HTMLElement) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Patent search + filter
  const q = root.querySelector<HTMLInputElement>('#pq');
  if (q) {
    let area = '';
    const apply = () => {
      const t = q.value.trim().toLowerCase(); let n = 0;
      root.querySelectorAll<HTMLElement>('.plist li').forEach((li) => { const ok = (!area || li.dataset.area === area) && (!t || li.dataset.q!.includes(t)); li.hidden = !ok; if (ok) n++; });
      root.querySelector('#pcount')!.textContent = `${n} shown`;
    };
    q.addEventListener('input', apply);
    root.querySelectorAll<HTMLButtonElement>('.chip').forEach((c) => c.addEventListener('click', () => {
      area = c.dataset.area || ''; root.querySelectorAll('.chip').forEach((x) => x.classList.toggle('on', x === c)); apply();
    }));
  }
  ScrollTrigger.getAll().forEach((t) => t.kill());
  if (reduce) { root.querySelectorAll('.ev, .rv').forEach((e) => e.classList.add('in')); return; }
  const life = root.querySelector('#life');
  const fill = root.querySelector<HTMLElement>('.m-fill'); const yearEl = root.querySelector<HTMLElement>('.m-year');
  if (life && fill) {
    gsap.to(fill, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: life, start: 'top 60%', end: 'bottom 60%', scrub: true } });
    ScrollTrigger.create({ trigger: life, start: 'top 80%', end: 'bottom 20%', toggleClass: { targets: '.m-bar', className: 'show' } });
  }
  root.querySelectorAll<HTMLElement>('.ev').forEach((ev) => {
    gsap.fromTo(ev, { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: ev, start: 'top 85%', once: true } });
    ScrollTrigger.create({ trigger: ev, start: 'top 55%', onEnter: () => { if (yearEl) yearEl.textContent = ev.dataset.year!; }, onEnterBack: () => { if (yearEl) yearEl.textContent = ev.dataset.year!; } });
    const im = ev.querySelector('img');
    if (im) gsap.fromTo(im, { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: { trigger: ev, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  root.querySelectorAll<HTMLElement>('.rv').forEach((el) => gsap.fromTo(el, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
  const sp = root.querySelector('.m-splash-img img');
  if (sp) gsap.to(sp, { yPercent: 15, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.m-splash', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.from('.m-splash-text > *', { autoAlpha: 0, y: 30, duration: 1, stagger: 0.15, ease: 'power3.out' });
}
