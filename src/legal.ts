// Legal pages. Plain-English protections for an education site about historical figures.
// Drafted for review by the owner's lawyer before the brand gets its own domain; not legal advice.
const UPDATED = '15 November 2026';
const OP = 'Nunna AI Consulting ("NAIC", "we", "us")';

export const legalPages: Record<string, { title: string; body: string }> = {
  terms: {
    title: 'Terms of Use',
    body: `
<p>Last updated ${UPDATED}. Hall of Builders is an educational website operated by ${OP}. By using it you agree to these terms.</p>
<h3>Educational purpose</h3>
<p>Hall of Builders shares history and ideas for learning and inspiration. It is not professional, legal, medical, financial or psychological advice. Challenges are general suggestions; use your own judgment and stop any activity that is not right for you.</p>
<h3>Accuracy</h3>
<p>We link every factual claim to its source and say where accounts disagree. History is contested and sources can be wrong, so we make no warranty that the content is complete, current or error-free. If you find a mistake, tell us through the <a href="/NAIC/contact/">contact page</a> and we will review it.</p>
<h3>No affiliation or endorsement</h3>
<p>The people featured here, their estates, foundations and any companies or brands that use their names have not sponsored, endorsed or approved this site. Names are used only to identify the historical person we are writing about. For example, our Nikola Tesla Section is about the inventor and is not connected to any company that uses his name.</p>
<h3>Your use of the site</h3>
<p>You may read, share links to and print pages for personal, non-commercial learning. Do not copy the site's original text, art or design for commercial use, scrape it in bulk, or use it to mislead anyone. Shared result cards may be posted on social media with credit to Hall of Builders.</p>
<h3>Purchases and pre-orders</h3>
<p>Any product, pre-order or membership is governed by the terms shown at checkout, including price, delivery estimate and refund policy. Pre-orders that cannot be fulfilled are refunded in full.</p>
<h3>Links to other sites</h3>
<p>We link to sources, archives, museums and booksellers we do not control. We are not responsible for their content, availability or practices.</p>
<h3>Limitation of liability</h3>
<p>To the fullest extent allowed by law, the site is provided "as is" and NAIC is not liable for any indirect, incidental or consequential loss arising from your use of it. Nothing here limits rights you have under consumer protection law that cannot be waived.</p>
<h3>Changes and contact</h3>
<p>We may update these terms; the date above shows the latest version. These terms are governed by the laws of the Province of Ontario and the federal laws of Canada that apply there. Questions: <a href="/NAIC/contact/">contact us</a>.</p>`,
  },
  editorial: {
    title: 'Editorial Policy and Corrections',
    body: `
<p>Our goal is to inspire and educate, honestly.</p>
<ul>
<li><b>Sources:</b> every factual claim links to a source we actually opened. We prefer the person's own writing, archives, museums and well-cited reference works.</li>
<li><b>Disagreement:</b> where historians or accounts disagree, we say so instead of picking the most exciting version.</li>
<li><b>Quotes:</b> we quote only from verified texts, credit the translation, and never use viral quotes we cannot trace.</li>
<li><b>Public life only:</b> we cover a person's work, ideas and public record. We do not publish private details, rumours or anyone's location.</li>
<li><b>Living people:</b> may appear only in editorial content about their public work. We sell no merchandise using a living person's likeness, and none for people whose estates control their image without permission.</li>
<li><b>Corrections:</b> report an error or request a review through the <a href="/NAIC/contact/">contact page</a>. We aim to respond within 48 hours and mark significant corrections on the page.</li>
</ul>`,
  },
  copyright: {
    title: 'Copyright, Trademarks and Takedown',
    body: `
<p>Original text, design and art on Hall of Builders are &copy; ${new Date().getFullYear()} NAIC unless marked otherwise.</p>
<ul>
<li><b>Public domain:</b> many original texts we quote (for example older translations and autobiographies) are in the public domain; we link to the free copy.</li>
<li><b>Short quotations</b> from other works are used for commentary, criticism and education, with credit.</li>
<li><b>Images:</b> our illustrations are original and AI-assisted. Historical photos come from public-domain or openly licensed collections and are credited.</li>
<li><b>Trademarks:</b> names, titles and marks belong to their owners and are used only to identify and describe. No sponsorship or endorsement is implied.</li>
</ul>
<h3>Takedown requests</h3>
<p>If you believe something here infringes your rights, send us through the <a href="/NAIC/contact/">contact page</a>: the work concerned, the page address, your contact details and a statement that you own or represent the rights. We review every request promptly and remove material where appropriate.</p>`,
  },
  disclosures: {
    title: 'Affiliate and AI Disclosures',
    body: `
<h3>Affiliate links</h3>
<p>Some book links are affiliate links. If you buy through them, we may earn a small commission at no extra cost to you. It never changes what we recommend: the person's own books come first, and free public-domain copies are linked wherever they exist.</p>
<h3>AI-assisted content</h3>
<p>Illustrations are generated with AI tools and then selected and edited by people. Text is drafted with AI assistance from cited sources and checked against them before publishing. Illustrations are artistic interpretations, not historical records or photographs.</p>
<h3>Your data</h3>
<p>If you join a list, we keep your email to send what you asked for, and you can unsubscribe at any time. Reflections and quiz answers you type stay in your own browser. See the <a href="/NAIC/privacy/">privacy policy</a>.</p>`,
  },
};

export const legalNav = () =>
  `<nav class="legal-nav" aria-label="Legal">${Object.entries(legalPages).map(([k, p]) => `<a href="#/legal/${k}">${p.title}</a>`).join(' · ')}</nav>`;
