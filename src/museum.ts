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
// Dates are 'YYYY[-MM-DD]'; BC years are negative: '-0069' is 69 BC.
const yearOf = (d: string) => { const m = /^(-?)(\d{4})/.exec(String(d)); return m ? (m[1] ? -1 : 1) * Number(m[2]) : NaN; };
const fmtY = (y: number) => (y < 0 ? `${-y} BC` : String(y));
const showYear = (s: unknown) => (/^-?\d{4}$/.test(String(s)) ? fmtY(yearOf(String(s))) : String(s ?? ''));

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
    const head = `<p class="ev-meta"><b>${fmtY(yearOf(e.date))}</b>${e.age != null ? ` · age ${e.age}` : ''} · ${esc(e.place)}</p><h3>${esc(e.title)}</h3><p>${esc(e.text)} ${cite(e.sources)}</p>`;
    if (pic && e.turning) return `<article class="${cls} splash-panel" data-year="${fmtY(yearOf(e.date))}"><div class="sp-img"><img src="${img(pic)}" alt="" loading="lazy" decoding="async"></div><div class="sp-text"><span class="badge">Turning point</span>${head}</div></article>`;
    return `<article class="${cls}${pic ? ' has-img' : ''}" data-year="${fmtY(yearOf(e.date))}">${pic ? `<figure class="ev-img"><img src="${img(pic)}" alt="" loading="lazy" decoding="async"></figure>` : ''}<div class="ev-body">${e.turning ? '<span class="badge">Turning point</span>' : ''}${head}</div></article>`;
  }).join('');

  const works = m.works.map((w) => `<article class="work rv"><p class="ev-meta"><b>${esc(showYear(w.year))}</b> · ${esc(w.type)}</p><h3>${w.url ? `<a href="${esc(w.url)}" target="_blank" rel="noopener">${esc(w.title)}</a>` : esc(w.title)}</h3><p>${esc(w.text)} ${cite(w.sources)}</p></article>`).join('');

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

  const books = m.books.map((b) => `<li class="book rv"><p class="ev-meta">${b.kind === 'by-him' || b.kind === 'by-her' || b.kind === 'by-them' ? 'Their own words' : 'Biography'} · ${esc(showYear(b.year))}</p><h3>${esc(b.title)}</h3><p class="muted">${esc(b.author)}</p><p>${esc(b.note)}</p><p class="row">${b.free ? `<a class="btn btn-gold sm" href="${esc(b.free)}" target="_blank" rel="noopener">Read free</a>` : ''}<a class="btn btn-ghost sm" href="https://bookshop.org/search?keywords=${encodeURIComponent(b.title + ' ' + b.author)}" target="_blank" rel="noopener sponsored">Find a copy</a></p></li>`).join('');
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
    <div class="m-bar" role="region" aria-label="Story player">
      <button class="mp-btn mp-play" type="button" aria-pressed="false" aria-label="Play the life story"><svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg><svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z"/></svg></button>
      <span class="m-year" aria-hidden="true">${fmtY(first)}</span><span class="m-track" aria-hidden="true"><span class="m-fill"></span></span><span class="m-end" aria-hidden="true">${fmtY(last)}</span>
      <label class="sr" for="mp-speed">Reading speed</label><select id="mp-speed" class="mp-speed">${[0.75, 1, 1.25, 1.5, 2].map((v) => `<option value="${v}"${v === 1 ? ' selected' : ''}>${v}x</option>`).join('')}</select>
      <button class="mp-btn mp-voice" type="button" aria-pressed="true" aria-label="Narration voice on"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h4l5-4.5v14l-5-4.5H4z"/><path class="wave" d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
    </div>`,
    timeline: `<section class="wrap m-life" id="life"><h2 class="sec">A life, ${esc(life)}</h2>
      <div class="mp-intro"><button class="btn btn-gold mp-start" type="button">&#9654; Play the story</button><p class="muted small">Narration reads each moment aloud and scrolls the timeline for you. Tap any picture to pause. Change the speed or turn the voice off in the player at the bottom.</p></div>
      <p class="muted small">${esc(art.style)}</p><div class="spine">${events}</div></section>`,
    works: `<section class="wrap band" id="works"><h2 class="sec">The life's work</h2><div class="works">${works}</div></section>`,
    patents,
    books: `<section class="wrap" id="books"><h2 class="sec">Read more</h2><p class="muted small">Their own books come first, with free public-domain copies where they exist. Some links may become affiliate links; it never changes what we recommend. <a href="#/legal/disclosures">Disclosures</a></p><ul class="books">${books}</ul></section>`,
    resources: `<section class="wrap band" id="resources"><h2 class="sec">Go to the source</h2><ul class="res">${res}</ul></section>`,
  };
}

// ---------- Story player: optional narration + auto-scroll through the timeline ----------
// Uses the browser's own speech engine (free, nothing is sent anywhere). Without a voice it runs as a timed slideshow.
let stopPlayer = () => {};
let hashHooked = false;
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

function initPlayer(root: HTMLElement, reduce: boolean) {
  stopPlayer();
  const bar = root.querySelector<HTMLElement>('.m-bar'); const tiles = Array.from(root.querySelectorAll<HTMLElement>('#life .ev'));
  if (!bar || !tiles.length) return;
  const playBtn = bar.querySelector<HTMLButtonElement>('.mp-play')!, voiceBtn = bar.querySelector<HTMLButtonElement>('.mp-voice')!, speedSel = bar.querySelector<HTMLSelectElement>('#mp-speed')!;
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  let voice = !!synth && store.get('hob.voice') !== 'off';
  const saved = store.get('hob.speed'); if (saved && [...speedSel.options].some((o) => o.value === saved)) speedSel.value = saved;
  let playing = false, idx = 0, run = 0, timer = 0;
  const speed = () => Number(speedSel.value) || 1;
  const textOf = (t: HTMLElement) => {
    const y = t.querySelector('.ev-meta b')?.textContent || ''; const h = t.querySelector('h3')?.textContent || '';
    const ps = t.querySelectorAll('.ev-body > p, .sp-text > p'); const p = ps[ps.length - 1]?.cloneNode(true) as HTMLElement | undefined;
    p?.querySelectorAll('.cite').forEach((c) => c.remove());
    return `${y}. ${h}. ${(p?.textContent || '').replace(/\s+/g, ' ').trim()}`;
  };
  const sync = () => {
    playBtn.setAttribute('aria-pressed', String(playing)); playBtn.setAttribute('aria-label', playing ? 'Pause the life story' : 'Play the life story');
    bar.classList.toggle('playing', playing);
    voiceBtn.hidden = !synth; voiceBtn.setAttribute('aria-pressed', String(voice)); voiceBtn.setAttribute('aria-label', voice ? 'Narration voice on' : 'Narration voice off');
    root.querySelectorAll('.mp-start').forEach((b) => { b.innerHTML = playing ? '&#10074;&#10074; Pause the story' : '&#9654; Play the story'; });
  };
  const clear = () => { run++; clearTimeout(timer); synth?.cancel(); tiles.forEach((t) => t.classList.remove('reading')); };
  const next = (id: number) => { if (id !== run || !playing) return; idx++; step(); };
  const step = () => {
    if (idx >= tiles.length) { pause(); idx = 0; return; }
    clear(); const id = run; const t = tiles[idx];
    t.classList.add('reading'); t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    const text = textOf(t);
    if (voice && synth) {
      // Sentence by sentence: short utterances stop browsers from cutting long speech off.
      const parts = text.match(/[^.!?]+[.!?]*/g) || [text]; let k = 0;
      const say = () => {
        if (id !== run || !playing) return;
        if (k >= parts.length) { timer = window.setTimeout(() => next(id), 500); return; }
        const u = new SpeechSynthesisUtterance(parts[k++].trim()); u.rate = speed(); u.lang = 'en-US';
        u.onend = say; u.onerror = () => { if (id === run && playing) timer = window.setTimeout(() => next(id), 1500); };
        synth.speak(u);
      };
      timer = window.setTimeout(say, reduce ? 0 : 650);
    } else {
      const words = text.split(/\s+/).length;   // silent slideshow: about 200 words a minute at 1x
      timer = window.setTimeout(() => next(id), 1200 + (words / (3.3 * speed())) * 1000);
    }
  };
  const play = () => {
    if (synth) synth.speak(new SpeechSynthesisUtterance(''));   // unlocks speech inside the tap on iOS
    const at = tiles.findIndex((t) => t.getBoundingClientRect().bottom > innerHeight * 0.3);
    if (idx === 0 && at > 0) idx = at;   // start from where the reader is
    playing = true; sync(); step();
  };
  function pause() { playing = false; clear(); sync(); }
  const toggle = () => (playing ? pause() : play());
  playBtn.addEventListener('click', toggle);
  root.querySelectorAll('.mp-start').forEach((b) => b.addEventListener('click', toggle));
  voiceBtn.addEventListener('click', () => { voice = !voice; store.set('hob.voice', voice ? 'on' : 'off'); sync(); if (playing) step(); });
  speedSel.addEventListener('change', () => { store.set('hob.speed', speedSel.value); if (playing && !voice) step(); });
  // Tap any picture, or scroll by hand, to pause.
  root.addEventListener('click', (e) => { if (playing && (e.target as Element).closest('img, .ev-img, .sp-img, .m-splash-img')) pause(); });
  const manual = (e: Event) => { if (playing && !(e.target as Element)?.closest?.('.m-bar, .mp-intro')) pause(); };
  const keys = (e: KeyboardEvent) => { if (playing && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(e.key)) pause(); };
  addEventListener('wheel', manual, { passive: true }); addEventListener('touchstart', manual, { passive: true }); addEventListener('keydown', keys);
  stopPlayer = () => { pause(); removeEventListener('wheel', manual); removeEventListener('touchstart', manual); removeEventListener('keydown', keys); };
  if (!hashHooked) { hashHooked = true; addEventListener('hashchange', () => stopPlayer()); }
  sync();
}

export function initMuseum(root: HTMLElement) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  initPlayer(root, reduce);
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
