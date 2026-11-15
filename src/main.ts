import './styles.css';
import hall from './content/hall.json';
import musashi from './content/musashi.json';
import { scene } from './art';
import { leadForm, wireLeadForms } from './lead';
import { questions, results, score, card, type BuilderId } from './quiz';

type Source = { label: string; url: string };
type Builder = typeof musashi;
// Every open wing's content file, loaded at build time.
const files = import.meta.glob<Builder>('./content/*.json', { eager: true, import: 'default' });
const builders: Record<string, Builder> = Object.fromEntries(
  hall.wings.filter((w) => w.status === 'open' && files[`./content/${w.id}.json`]).map((w) => [w.id, files[`./content/${w.id}.json`]]),
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
      <div class="door-arch" aria-hidden="true">${w.status === 'open' ? scene(`hero-${w.id}`) : '<span class="soon-mark">Opening soon</span>'}</div>
      <p class="eyebrow">${esc(w.years)}</p>
      <h3>${esc(w.name)}</h3>
      <p class="door-title">${esc(w.title)}</p>
      <p>${esc(w.hook)}</p>
      ${w.status === 'open' ? `<a class="btn btn-gold" href="#/wing/${w.id}">Enter the wing</a>` : `<a class="btn btn-ghost" href="#/vote">Get notified</a>`}
    </article>`).join('');
  return `
  <section class="hero">
    <p class="eyebrow">A museum of how great builders thought</p>
    <h1>Learn from the greats.<br><em>Then practise it.</em></h1>
    <p class="lead">Each wing tells one builder's story, distils five principles with sources, and gives you a free 7-day challenge to try them in your own life.</p>
    <div class="row"><a class="btn btn-gold" href="#/wing/musashi">Start with Musashi</a><a class="btn btn-ghost" href="#/quiz">Which Builder are you?</a></div>
  </section>
  <section class="wrap"><h2 class="sec">The wings</h2><div class="doors">${doors}</div></section>
  <section class="wrap band">
    <h2 class="sec">You decide who comes next</h2>
    <p>Vote for the next builders to join the Hall. The most-wanted ones get a wing, a mini book and a collectible.</p>
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
  return `
  <section class="hero wing-hero">
    <div class="hero-art">${scene(`hero-${b.id}`)}</div>
    <div>
      <p class="eyebrow">Wing ${String(hall.wings.findIndex((w) => w.id === b.id) + 1).padStart(2, '0')} · ${esc(b.years)}</p>
      <h1>${esc(b.name)}<br><em>${esc(b.title)}</em></h1>
      <p class="lead">${esc(b.tagline)}</p>
      <nav class="row" aria-label="In this wing"><a class="btn btn-gold" href="#story" data-jump>Story</a><a class="btn btn-ghost" href="#principles" data-jump>5 principles</a><a class="btn btn-ghost" href="#challenge" data-jump>7-day challenge</a></nav>
    </div>
  </section>
  <section class="wrap" id="story"><h2 class="sec">The story</h2><p class="muted">Six moments, about 90 seconds to read. Placeholder ink art; illustrated panels are coming.</p><div class="panels">${story}</div></section>
  <section class="wrap band" id="principles"><h2 class="sec">Five principles</h2><div class="principles">${principles}</div></section>
  <section class="wrap" id="challenge">
    <h2 class="sec">The free 7-day challenge</h2>
    <p>One small action a day. Every step is below, so you can start today. Sign up and we will also email you each day's step as soon as challenge emails launch; you can stop any time.</p>
    <ol class="days">${days}</ol>
    ${leadForm({ id: 'ch', kind: 'newsletter', topic: `hall-of-builders:${b.id}:7-day-challenge`, tags: ['hall-of-builders', b.id, 'challenge'], button: 'Start the challenge', note: 'Email me the 7-day challenge and Hall of Builders updates.' })}
  </section>
  <section class="wrap band" id="reflect">
    <h2 class="sec">Reflect</h2>
    <p>${esc(b.reflect)}</p>
    <label class="sr" for="reflect">Your reflection</label>
    <textarea id="reflect" rows="4" placeholder="Write a few lines. This stays on your device.">${esc(reflection)}</textarea>
    <p class="muted small">Saved only in this browser. We never see it.</p>
  </section>
  <section class="wrap keepsake" id="keepsake">
    <h2 class="sec">Keep it close</h2>
    <p>A small ${esc(b.keepsake)} for your desk, to remind you of what you practised. Pre-orders are planned for Black Friday. Join the list to hear first.</p>
    ${leadForm({ id: 'ks', kind: 'waitlist', topic: `hall-of-builders:${b.id}:collectible`, tags: ['hall-of-builders', b.id, 'collectible'], button: 'Notify me', note: 'Email me when pre-orders open.' })}
  </section>
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
  <section class="hero"><p class="eyebrow">Vote the Hall</p><h1>Who should we <em>build next?</em></h1><p class="lead">Pick up to three. The most-wanted builders get a wing, a mini book and a collectible. We email you when your pick opens.</p></section>
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
      <div class="row"><button class="btn btn-gold" id="share">Share my card</button>${open ? `<a class="btn btn-ghost" href="#/wing/${id}">Enter the ${esc(r.name.split(' ').pop()!)} wing</a>` : ''}</div>
      ${open ? '' : `<p>The ${esc(r.name)} wing opens soon. Get an email when it does:</p>${leadForm({ id: 'qr', kind: 'magnet', topic: `hall-of-builders:${id}:wing-open`, tags: ['hall-of-builders', id, 'quiz'], button: 'Notify me', note: 'Email me when this wing opens.' })}`}
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

function route() {
  const h = location.hash.replace(/^#/, '') || '/';
  const m = h.match(/^\/wing\/([a-z]+)/);
  if (h.startsWith('/wing/') && m && builders[m[1]]) { main.innerHTML = wing(builders[m[1]]); document.title = `${builders[m[1]].name} | Hall of Builders`; }
  else if (h === '/quiz') { main.innerHTML = quiz(); document.title = 'Which Builder are you? | Hall of Builders'; }
  else if (h === '/vote') { main.innerHTML = vote(); document.title = 'Vote the Hall | Hall of Builders'; }
  else if (h.startsWith('/')) { main.innerHTML = lobby(); document.title = 'Hall of Builders'; }
  else return; // in-page anchor like #story: let the browser scroll
  document.querySelectorAll('.top nav a').forEach((a) => a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + h));
  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
  reveal(); wireLeadForms(main); wireQuiz(); wireVote();
  main.querySelectorAll<HTMLAnchorElement>('[data-jump]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault(); document.querySelector(a.getAttribute('href')!)?.scrollIntoView({ behavior: 'smooth' });
  }));
  const ta = document.getElementById('reflect') as HTMLTextAreaElement | null;
  if (ta) ta.addEventListener('input', () => store.set(`hob.reflect.${h.split('/').pop()}`, ta.value));
}

addEventListener('hashchange', route);
route();
