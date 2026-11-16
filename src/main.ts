import './styles.css';
import hall from './content/hall.json';
import musashi from './content/musashi.json';
import { scene } from './art';
import { leadForm, wireLeadForms } from './lead';
import { questions, results, score, card, type BuilderId } from './quiz';
import { museumHTML, initMuseum, type Museum, type Art } from './museum';
import { legalPages, legalNav } from './legal';

type Source = { label: string; url: string };
type Builder = typeof musashi;
// Every open Section's content file, loaded at build time. Optional museum (<id>.museum.json) and art (<id>.art.json) upgrade a Section.
const files = import.meta.glob<Builder>('./content/*.json', { eager: true, import: 'default' });
const museums = import.meta.glob<Museum>('./content/*.museum.json', { eager: true, import: 'default' });
const arts = import.meta.glob<Art>('./content/*.art.json', { eager: true, import: 'default' });
// A Section goes live on its publishAt date (YYYY-MM-DD, Eastern time). The nightly build at midnight ET picks it up.
const today = new Date(Date.now() - 5 * 3600e3).toISOString().slice(0, 10);
const live = (w: { status: string; publishAt?: string }) => w.status === 'open' && (!w.publishAt || w.publishAt <= today);
hall.wings = hall.wings.filter((w) => w.status !== 'open' || live(w));
const builders: Record<string, Builder> = Object.fromEntries(
  hall.wings.filter((w) => live(w) && files[`./content/${w.id}.json`]).map((w) => [w.id, files[`./content/${w.id}.json`]]),
);
const main = document.getElementById('main')!;

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode: fine */ } },
};
const cites = (b: Builder, ids: string[] = []) => ids.length
  ? `<span class="cites">${ids.map((id) => { const s = (b.sources as Record<string, Source>)[id]; return s ? `<a href="${esc(s.url)}" target="_blank" rel="noopener" title="${esc(s.label)}">source</a>` : ''; }).join(' ')}</span>` : '';

// ---------- views ----------
function lobby() {
  const doors = hall.wings.map((w) => `
    <article class="door ${w.status}">
      <div class="door-arch" aria-hidden="true">${w.status !== 'open' ? '<span class="soon-mark">Opening soon</span>'
        : arts[`./content/${w.id}.art.json`] && museums[`./content/${w.id}.museum.json`] ? `<img src="${import.meta.env.BASE_URL}art/${w.id}/${arts[`./content/${w.id}.art.json`].splash}.webp" alt="" loading="lazy">` : scene(`hero-${w.id}`)}</div>
      <p class="eyebrow">${esc(w.years)}</p>
      <h3>${esc(w.name)}</h3>
      <p class="door-title">${esc(w.title)}</p>
      <p>${esc(w.hook)}</p>
      ${w.status === 'open' ? `<a class="btn btn-gold" href="${import.meta.env.BASE_URL}${w.id}/">Enter the Section</a>` : `<a class="btn btn-ghost" href="#/vote">Get notified</a>`}
    </article>`).join('');
  return `
  <section class="hero">
    <p class="eyebrow">A museum of how great builders thought</p>
    <h1>Learn from the greats.<br><em>Then practise it.</em></h1>
    <p class="lead">Each Section tells one builder's story, distils five principles with sources, and gives you a free 7-day challenge to try them in your own life.</p>
    <div class="row"><a class="btn btn-gold" href="#/section/musashi">Start with Musashi</a><a class="btn btn-ghost" href="#/quiz">Which Builder are you?</a></div>
  </section>
  <section class="wrap"><h2 class="sec">The Sections</h2><div class="doors">${doors}</div></section>
  <section class="wrap band">
    <h2 class="sec">You decide who comes next</h2>
    <p>Vote for the next builders to join the Hall. The most-wanted ones get a Section, a mini book and a collectible.</p>
    <a class="btn btn-gold" href="#/vote">Vote the Hall</a>
  </section>`;
}

function wing(b: Builder) {
  const story = b.story.map((p, i) => `
    <figure class="panel reveal" style="--i:${i}">
      <div class="panel-art">${scene(p.scene)}</div>
      <figcaption><span class="panel-n">${String(i + 1).padStart(2, '0')}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)} ${cites(b, p.sources)}</p></figcaption>
    </figure>`).join('');
  const principles = b.principles.map((p, i) => `
    <article class="principle reveal" style="--i:${i}">
      <p class="pn">Principle ${i + 1}</p>
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.idea)} ${cites(b, p.sources)}</p>
      ${'quote' in p && p.quote ? `<blockquote>"${esc(p.quote.text)}"<cite>${esc(p.quote.credit)}</cite></blockquote>` : ''}
      <p class="practice"><b>Try it:</b> ${esc(p.practice)}</p>
    </article>`).join('');
  const days = b.challenge.map((d) => `<li class="reveal"><span class="day">Day ${d.day}</span><b>${esc(d.title)}.</b> ${esc(d.action)}</li>`).join('');
  const sources = Object.values(b.sources as Record<string, Source>).map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join('');
  const reflection = store.get(`hob.reflect.${b.id}`) || '';
  const tail = `
  <section class="wrap band" id="principles"><h2 class="sec">How ${esc(b.name.split(' ').pop()!)} thought: five principles</h2><div class="principles">${principles}</div></section>
  <section class="wrap" id="challenge">
    <h2 class="sec">The free 7-day challenge</h2>
    <p>One small action a day. Every step is below, so you can start today. Join the list and we will email you each step as soon as challenge emails launch; you can stop any time.</p>
    <ol class="days">${days}</ol>
    ${leadForm({ id: 'ch', kind: 'newsletter', topic: `hall-of-builders:${b.id}:7-day-challenge`, tags: ['hall-of-builders', b.id, 'challenge'], button: 'Join the challenge', note: 'Email me the 7-day challenge and Hall of Builders updates.' })}
  </section>
  <section class="wrap band" id="reflect">
    <h2 class="sec">Reflect</h2>
    <p>${esc(b.reflect)}</p>
    <label class="sr" for="reflect">Your reflection</label>
    <textarea id="reflect" rows="4" placeholder="Write a few lines. This stays on your device.">${esc(reflection)}</textarea>
    <p class="muted small">Saved only in this browser. We never see it.</p>
  </section>`;
  const keepsake = `
  <section class="wrap keepsake" id="keepsake">
    <h2 class="sec">Keep it close</h2>
    <p>A small ${esc(b.keepsake)} for your desk, to remind you of what you practised. Join the list to hear first when it is available.</p>
    ${leadForm({ id: 'ks', kind: 'waitlist', topic: `hall-of-builders:${b.id}:collectible`, tags: ['hall-of-builders', b.id, 'collectible'], button: 'Notify me', note: 'Email me when it is available.' })}
  </section>`;
  const m = museums[`./content/${b.id}.museum.json`]; const art = arts[`./content/${b.id}.art.json`];
  if (m && art) {
    const all = { ...(b.sources as Record<string, Source>), ...m.sources };
    const x = museumHTML(b.id, b.name, b.years, m, art, all);
    const srcList = Object.values(all).map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join('');
    return `${x.splash}
    <nav class="m-nav" aria-label="In this museum"><a href="#life" data-jump>Life</a>${x.featureNav}<a href="#works" data-jump>Work</a>${m.patents?.length ? '<a href="#patents" data-jump>Patents</a>' : ''}<a href="#principles" data-jump>Principles</a><a href="#challenge" data-jump>Challenge</a><a href="#books" data-jump>Books</a></nav>
    <section class="wrap intro"><p class="lead">${esc(b.tagline)}</p></section>
    ${x.timeline}${x.feature}${x.works}${x.patents}${tail}${x.books}${x.resources}${keepsake}
    <section class="wrap sources"><h2 class="sec">All sources</h2><ul>${srcList}</ul><p class="muted small">Where historical accounts disagree, we say so in the text. Found an error? <a href="#/legal/editorial">Corrections policy</a>.</p></section>`;
  }
  return `
  <section class="hero wing-hero">
    <div class="hero-art">${scene(`hero-${b.id}`)}</div>
    <div>
      <p class="eyebrow">Section ${String(hall.wings.findIndex((w) => w.id === b.id) + 1).padStart(2, '0')} · ${esc(b.years)}</p>
      <h1>${esc(b.name)}<br><em>${esc(b.title)}</em></h1>
      <p class="lead">${esc(b.tagline)}</p>
      <nav class="row" aria-label="In this Section"><a class="btn btn-gold" href="#story" data-jump>Story</a><a class="btn btn-ghost" href="#principles" data-jump>5 principles</a><a class="btn btn-ghost" href="#challenge" data-jump>7-day challenge</a></nav>
    </div>
  </section>
  <section class="wrap" id="story"><h2 class="sec">The story</h2><p class="muted">Six moments, about 90 seconds to read. Placeholder ink art; illustrated panels are coming.</p><div class="panels">${story}</div></section>
  ${tail}${keepsake}
  <section class="wrap sources"><h2 class="sec">Sources</h2><ul>${sources}</ul><p class="muted small">Where historical accounts disagree, we say so in the text.</p></section>`;
}

function quiz() {
  const qs = questions.map((x, i) => `
    <fieldset class="q reveal" style="--i:${i}"><legend>${i + 1}. ${esc(x.q)}</legend>
      ${x.a.map(([t, v], j) => `<label class="opt"><input type="radio" name="q${i}" value="${v}" ${j === 0 ? 'required' : ''}/> <span>${esc(t)}</span></label>`).join('')}
    </fieldset>`).join('');
  return `
  <section class="hero"><p class="eyebrow">Six questions, one minute</p><h1>Which Builder <em>are you?</em></h1><p class="lead">Find the builder whose way of thinking matches yours, then get a card to share.</p></section>
  <section class="wrap"><form id="quiz" novalidate>${qs}<button class="btn btn-gold" type="submit">See my Builder</button><p class="lead-msg" role="status" aria-live="polite"></p></form><div id="result"></div></section>`;
}

function vote() {
  const opts = hall.candidates.map((n, i) => `<label class="vote-opt"><input type="checkbox" name="v" value="${esc(n)}" /> <span>${esc(n)}</span></label>`).join('');
  return `
  <section class="hero"><p class="eyebrow">Vote the Hall</p><h1>Who should we <em>build next?</em></h1><p class="lead">Pick up to three. The most-wanted builders get a Section, a mini book and a collectible. We email you when your pick opens.</p></section>
  <section class="wrap">
    <form id="vote-pick" class="vote-grid">${opts}</form>
    <p class="muted small" id="vote-count">0 of 3 picked</p>
    <div id="vote-send"></div>
  </section>`;
}

// ---------- behaviour ----------
function reveal() {
  const els = main.querySelectorAll('.reveal, .scene');
  if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  els.forEach((e) => io.observe(e));
}

function wireQuiz() {
  const f = document.getElementById('quiz') as HTMLFormElement | null; if (!f) return;
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const picks: BuilderId[] = [];
    for (let i = 0; i < questions.length; i++) {
      const v = (f.querySelector(`input[name=q${i}]:checked`) as HTMLInputElement | null)?.value as BuilderId | undefined;
      if (!v) { f.querySelector<HTMLElement>('.lead-msg')!.textContent = `Please answer question ${i + 1}.`; return; }
      picks.push(v);
    }
    const id = score(picks); const r = results[id]; store.set('hob.quiz', id);
    const open = hall.wings.find((w) => w.id === id)?.status === 'open';
    const out = document.getElementById('result')!;
    out.innerHTML = `
      <article class="result reveal in"><p class="eyebrow">Your Builder</p><h2>${esc(r.title)}</h2><p class="door-title">${esc(r.name)}</p><p>${esc(r.line)}</p>
      <div class="row"><button class="btn btn-gold" id="share">Share my card</button>${open ? `<a class="btn btn-ghost" href="#/section/${id}">Enter the ${esc(r.name.split(' ').pop()!)} Section</a>` : ''}</div>
      ${open ? '' : `<p>The ${esc(r.name)} Section opens soon. Get an email when it does:</p>${leadForm({ id: 'qr', kind: 'magnet', topic: `hall-of-builders:${id}:wing-open`, tags: ['hall-of-builders', id, 'quiz'], button: 'Notify me', note: 'Email me when this Section opens.' })}`}
      </article>`;
    wireLeadForms(out);
    out.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    document.getElementById('share')!.addEventListener('click', async () => {
      const blob = await card(id); if (!blob) return;
      const file = new File([blob], `hall-of-builders-${id}.png`, { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) { try { await nav.share({ files: [file], title: 'My Builder', text: `I'm ${r.title}. Which Builder are you?` }); return; } catch { /* cancelled */ } }
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    });
  });
}

function wireVote() {
  const f = document.getElementById('vote-pick') as HTMLFormElement | null; if (!f) return;
  const send = document.getElementById('vote-send')!; const count = document.getElementById('vote-count')!;
  const update = () => {
    const picked = [...f.querySelectorAll<HTMLInputElement>('input:checked')].map((x) => x.value);
    f.querySelectorAll<HTMLInputElement>('input').forEach((x) => { x.disabled = !x.checked && picked.length >= 3; });
    count.textContent = `${picked.length} of 3 picked`;
    send.innerHTML = picked.length ? leadForm({ id: 'vt', kind: 'waitlist', topic: `hall-of-builders:vote:${picked.join('|')}`, tags: ['hall-of-builders', 'vote'], button: 'Cast my vote', note: 'Count my vote and email me when my picks open.' }) : '';
    wireLeadForms(send);
  };
  f.addEventListener('change', update);
}

// Each Section also has a real, crawlable URL: <base>/<id>/ (written by scripts/prerender.mjs). Hash routes keep working.
const BASE = import.meta.env.BASE_URL;
let rendered = false;
function route() {
  const hashRoute = location.hash.startsWith('#/') ? location.hash.slice(1) : '';
  if (!hashRoute && location.hash && rendered) return;   // in-page anchor like #life: let the browser scroll
  const pathId = location.pathname.startsWith(BASE) ? location.pathname.slice(BASE.length).replace(/\/(index\.html)?$/, '') : '';
  const h = hashRoute || (/^[a-z]+$/.test(pathId) && builders[pathId] ? `/section/${pathId}` : '/');
  const anchor = !hashRoute && location.hash ? location.hash : '';
  rendered = true;
  const m = h.match(/^\/(?:wing|section)\/([a-z]+)/);   // old /wing/ links keep working
  if (m && builders[m[1]]) { main.innerHTML = wing(builders[m[1]]); document.title = `${builders[m[1]].name} | Hall of Builders`; }
  else if (h === '/quiz') { main.innerHTML = quiz(); document.title = 'Which Builder are you? | Hall of Builders'; }
  else if (h === '/vote') { main.innerHTML = vote(); document.title = 'Vote the Hall | Hall of Builders'; }
  else if (h.startsWith('/legal/') && legalPages[h.slice(7)]) {
    const p = legalPages[h.slice(7)];
    main.innerHTML = `<section class="wrap legal"><p class="eyebrow">Legal</p><h1>${esc(p.title)}</h1>${p.body}${legalNav()}</section>`;
    document.title = `${p.title} | Hall of Builders`;
  }
  else if (h.startsWith('/')) { main.innerHTML = lobby(); document.title = 'Hall of Builders'; }
  else return; // in-page anchor like #story: let the browser scroll
  document.querySelectorAll('.top nav a').forEach((a) => a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + h));
  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
  reveal(); wireLeadForms(main); wireQuiz(); wireVote();
  if (main.querySelector('.m-splash')) initMuseum(main);
  main.querySelectorAll<HTMLAnchorElement>('[data-jump]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault(); document.querySelector(a.getAttribute('href')!)?.scrollIntoView({ behavior: 'smooth' });
  }));
  const ta = document.getElementById('reflect') as HTMLTextAreaElement | null;
  if (ta) ta.addEventListener('input', () => store.set(`hob.reflect.${h.split('/').pop()}`, ta.value));
  if (anchor) document.querySelector(anchor)?.scrollIntoView();
}

// Light / dark switch (top right). The choice is saved on this device only.
// The sticky museum nav sits right under the header, whatever height the header has on this screen.
const topBar = document.querySelector<HTMLElement>('header.top');
if (topBar) new ResizeObserver(() => document.documentElement.style.setProperty('--top-h', `${topBar.offsetHeight}px`)).observe(topBar);
const themeBtn = document.getElementById('theme');
const syncTheme = () => {
  const t = document.documentElement.getAttribute('data-theme') || 'dark';
  themeBtn?.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', t === 'dark' ? '#14110d' : '#f7f2e8');
};
themeBtn?.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next); store.set('hob.theme', next); syncTheme();
});
syncTheme();

addEventListener('hashchange', route);
route();
