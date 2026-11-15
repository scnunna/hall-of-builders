// Email capture through the existing NAIC lead pipeline (POST /NAIC/api/lead.php -> listmonk-naic).
// The queue keeps one row per email + brand + kind + day, so each Hall of Builders action uses its own kind.
const ENDPOINT = '/NAIC/api/lead.php';
const opened = Date.now();

export type LeadKind = 'newsletter' | 'waitlist' | 'magnet';

export function leadForm(opts: { id: string; kind: LeadKind; topic: string; tags: string[]; button: string; note: string }) {
  return `
  <form class="lead" data-lead="${opts.id}" data-kind="${opts.kind}" data-topic="${opts.topic}" data-tags="${opts.tags.join(',')}" novalidate>
    <label class="sr" for="${opts.id}-email">Email</label>
    <div class="lead-row">
      <input id="${opts.id}-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required />
      <button class="btn btn-gold" type="submit">${opts.button}</button>
    </div>
    <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />
    <label class="consent"><input type="checkbox" name="consent" required /> ${opts.note} You can unsubscribe at any time.</label>
    <p class="lead-msg" role="status" aria-live="polite"></p>
  </form>`;
}

export function wireLeadForms(root: HTMLElement) {
  root.querySelectorAll<HTMLFormElement>('form[data-lead]').forEach((f) => {
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = f.querySelector<HTMLElement>('.lead-msg')!;
      const email = (f.elements.namedItem('email') as HTMLInputElement).value.trim();
      const consent = (f.elements.namedItem('consent') as HTMLInputElement).checked;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = 'Please enter a valid email address.'; return; }
      if (!consent) { msg.textContent = 'Please tick the box so we can email you.'; return; }
      const btn = f.querySelector('button')!; btn.disabled = true; msg.textContent = 'Sending...';
      const params = new URLSearchParams(location.search);
      const utm: Record<string, string> = {};
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'ref'].forEach((k) => { const v = params.get(k); if (v) utm[k] = v; });
      try {
        const r = await fetch(ENDPOINT, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email, consent: true, brand: 'naic', kind: f.dataset.kind, topic: f.dataset.topic,
            tags: (f.dataset.tags || '').split(',').filter(Boolean), page: location.pathname + location.hash,
            website: (f.elements.namedItem('website') as HTMLInputElement).value, t: Date.now() - opened, utm,
            test: params.has('leadtest') || undefined,
          }),
        });
        const j = await r.json().catch(() => ({ ok: false }));
        if (j.ok) { f.classList.add('done'); msg.textContent = "You're in. Check your inbox soon."; }
        else { msg.textContent = j.error || 'Something went wrong. Please try again in a minute.'; btn.disabled = false; }
      } catch {
        msg.textContent = 'We could not reach the server. Check your connection and try again.'; btn.disabled = false;
      }
    });
  });
}
