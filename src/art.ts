// Original ink-wash (sumi-e inspired) scenes, drawn as SVG so they stay sharp, tiny and animatable.
// Placeholder art until the illustrated panels are generated; never copies any manga or anime design.
const ink = 'var(--ink-line)';
const gold = 'var(--gold)';

const wrap = (label: string, inner: string) =>
  `<svg class="scene" viewBox="0 0 400 260" role="img" aria-label="${label}">${inner}</svg>`;

// A simple figure: head, robe, two swords at the hip.
const figure = (x: number, y: number, s = 1) => `
  <g transform="translate(${x} ${y}) scale(${s})" class="draw">
    <circle cx="0" cy="-62" r="11" fill="none" stroke="${ink}" stroke-width="3"/>
    <path d="M0 -50 C -16 -30 -22 0 -20 30 L 20 30 C 22 0 16 -30 0 -50" fill="none" stroke="${ink}" stroke-width="3"/>
    <path d="M-30 -8 L 34 -30" stroke="${gold}" stroke-width="3" stroke-linecap="round"/>
    <path d="M-22 2 L 22 -10" stroke="${gold}" stroke-width="3" stroke-linecap="round"/>
  </g>`;

const enso = (cx: number, cy: number, r: number) =>
  `<path class="draw slow" d="M${cx + r * 0.9} ${cy - r * 0.45} A ${r} ${r} 0 1 0 ${cx + r * 0.75} ${cy + r * 0.62}" fill="none" stroke="${gold}" stroke-width="7" stroke-linecap="round" opacity=".85"/>`;

const scenes: Record<string, string> = {
  hero: wrap('An ink circle with a lone swordsman', `${enso(200, 120, 92)}${figure(200, 170, 1.15)}`),
  boy: wrap('A young swordsman facing an older opponent', `
    <path class="draw" d="M20 220 H380" stroke="${ink}" stroke-width="2"/>
    ${figure(130, 190, 0.8)}${figure(280, 182, 1.05)}
    <path class="draw" d="M175 150 L 230 120" stroke="${gold}" stroke-width="2" stroke-dasharray="4 6"/>`),
  road: wrap('A winding road through mountains', `
    <path class="draw slow" d="M0 170 L70 90 L120 140 L190 60 L260 150 L320 100 L400 170" fill="none" stroke="${ink}" stroke-width="3"/>
    <path class="draw slow" d="M200 250 C 150 220 260 200 210 175 C 170 155 240 140 205 120" fill="none" stroke="${gold}" stroke-width="4" stroke-linecap="round"/>
    ${figure(205, 112, 0.35)}`),
  island: wrap('A small boat crossing to an island at dawn', `
    <circle class="pop" cx="300" cy="80" r="34" fill="${gold}" opacity=".25"/>
    <path class="draw slow" d="M230 170 C 260 130 330 130 370 170" fill="none" stroke="${ink}" stroke-width="3"/>
    <path class="draw" d="M0 200 C 40 190 60 210 100 200 C 140 190 160 210 200 200 C 240 190 260 210 300 200 C 340 190 360 210 400 200" fill="none" stroke="${ink}" stroke-width="2"/>
    <path class="draw" d="M60 188 L 150 188 L 140 200 L 70 200 Z" fill="none" stroke="${ink}" stroke-width="3"/>
    <path class="draw" d="M150 150 L 95 205" stroke="${gold}" stroke-width="4" stroke-linecap="round"/>
    ${figure(105, 180, 0.5)}`),
  swords: wrap('A long and a short sword crossed', `
    ${enso(200, 130, 100)}
    <path class="draw" d="M95 210 L 300 55" stroke="${ink}" stroke-width="6" stroke-linecap="round"/>
    <path class="draw" d="M150 60 L 270 200" stroke="${gold}" stroke-width="6" stroke-linecap="round"/>
    <path d="M118 182 l 14 18 M 252 175 l 18 -14" stroke="${ink}" stroke-width="8" stroke-linecap="round"/>`),
  brush: wrap('A shrike on a bare branch, painted with a brush', `
    <path class="draw slow" d="M60 240 C 120 180 170 150 260 40" fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>
    <path class="draw" d="M150 160 C 170 150 190 170 205 150" fill="none" stroke="${ink}" stroke-width="3"/>
    <path class="pop" d="M222 72 c -14 -8 -30 4 -26 18 c 3 12 22 14 30 4 l 14 -6 l -12 -4 z" fill="${ink}"/>
    <circle class="pop" cx="226" cy="78" r="2.4" fill="${gold}"/>`),
  cave: wrap('A cave mouth with a lamp and a scroll', `
    <path class="draw slow" d="M40 240 C 60 70 340 70 360 240" fill="none" stroke="${ink}" stroke-width="5"/>
    <circle class="pop glow" cx="200" cy="170" r="16" fill="${gold}" opacity=".6"/>
    <path class="draw" d="M150 225 H 250 M 160 215 H 240" stroke="${ink}" stroke-width="3"/>
    ${figure(150, 215, 0.45)}`),
};

// ---------- Marcus Aurelius: columns, laurel, lamp, river camp ----------
const column = (x: number, y: number, h: number) => `
  <g class="draw"><path d="M${x - 16} ${y} H ${x + 16} M ${x - 12} ${y - 6} V ${y - h} M ${x + 12} ${y - 6} V ${y - h} M ${x - 18} ${y - h} H ${x + 18}" stroke="${ink}" stroke-width="3" fill="none"/></g>`;
const laurel = (cx: number, cy: number, r: number) => `
  <g class="draw slow" fill="none" stroke="${gold}" stroke-width="3" stroke-linecap="round">
    <path d="M${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx - 6} ${cy + r}"/><path d="M${cx + r} ${cy} A ${r} ${r} 0 0 1 ${cx + 6} ${cy + r}"/>
    ${[0.2, 0.45, 0.7].map((t) => `<path d="M${cx - r * Math.cos(t)} ${cy + r * Math.sin(t)} l -12 -6"/><path d="M${cx + r * Math.cos(t)} ${cy + r * Math.sin(t)} l 12 -6"/>`).join('')}
  </g>`;
const robe = (x: number, y: number, s = 1) => `
  <g transform="translate(${x} ${y}) scale(${s})" class="draw">
    <circle cx="0" cy="-62" r="11" fill="none" stroke="${ink}" stroke-width="3"/>
    <path d="M0 -50 C -18 -30 -24 0 -22 30 L 22 30 C 24 0 18 -30 0 -50 M -14 -40 L 18 10" fill="none" stroke="${ink}" stroke-width="3"/>
  </g>`;
Object.assign(scenes, {
  'hero-musashi': scenes.hero,
  'hero-aurelius': wrap('A laurel wreath above a calm figure in a robe', `${laurel(200, 70, 60)}${robe(200, 200, 1.1)}`),
  a1: wrap('A boy reading scrolls beside a column', `${column(110, 230, 150)}${robe(220, 210, 0.8)}<path class="draw" d="M250 160 h 50 v 30 h -50 z M 258 168 h 34 M 258 176 h 28" stroke="${gold}" stroke-width="2.5" fill="none"/>`),
  a2: wrap('A laurel wreath passed from one hand to another', `${laurel(200, 110, 56)}<path class="draw" d="M40 200 C 100 190 130 175 160 170 M 360 200 C 300 190 270 175 240 170" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`),
  a3: wrap('Two seats between columns, for two rulers', `${column(70, 230, 160)}${column(330, 230, 160)}<path class="draw" d="M140 230 v -60 h 50 v 60 M 210 230 v -60 h 50 v 60" stroke="${ink}" stroke-width="3" fill="none"/><path class="pop" d="M150 160 h 30 M 220 160 h 30" stroke="${gold}" stroke-width="5"/>`),
  a4: wrap('A campaign tent beside a cold river', `<path class="draw slow" d="M0 210 C 60 200 100 220 160 210 S 280 200 400 215" stroke="${ink}" stroke-width="2.5" fill="none"/><path class="draw" d="M180 180 L 240 90 L 300 180 Z M 240 90 V 180" stroke="${ink}" stroke-width="3" fill="none"/><path class="pop" d="M232 180 l 8 -22 l 8 22" fill="${gold}"/>`),
  a5: wrap('A lamp and writing tablets at night', `<circle class="pop glow" cx="250" cy="110" r="20" fill="${gold}" opacity=".55"/><path class="draw" d="M230 150 h 40 l -8 14 h -24 z" stroke="${ink}" stroke-width="3" fill="none"/><path class="draw" d="M90 200 h 110 v -70 h -110 z M 105 150 h 80 M 105 165 h 70 M 105 180 h 76" stroke="${ink}" stroke-width="2.5" fill="none"/>`),
  a6: wrap('Open book of notes glowing on a plinth', `${column(200, 240, 30)}<path class="draw slow" d="M120 190 C 160 170 190 175 200 190 C 210 175 240 170 280 190 V 120 C 240 100 210 105 200 120 C 190 105 160 100 120 120 Z M 200 120 V 190" stroke="${ink}" stroke-width="3" fill="none"/>${laurel(200, 60, 40)}`),
  // ---------- Nikola Tesla: coils, current, waterfall, tower ----------
  'hero-tesla': wrap('A coil throwing an arc of light', `${enso(200, 110, 88)}<path class="draw" d="M175 230 h 50 M 185 230 v -80 h 30 v 80 M 185 160 h 30 M 185 175 h 30 M 185 190 h 30 M 185 205 h 30" stroke="${ink}" stroke-width="3" fill="none"/><circle class="draw" cx="200" cy="138" r="14" fill="none" stroke="${ink}" stroke-width="3"/><path class="draw" d="M212 128 l 30 -20 l -10 0 l 26 -22" stroke="${gold}" stroke-width="3" fill="none"/>`),
  t1: wrap('A village church and hills under a stormy sky', `<path class="draw slow" d="M0 210 C 80 170 150 190 220 175 S 340 170 400 190" stroke="${ink}" stroke-width="2.5" fill="none"/><path class="draw" d="M150 190 v -60 l 20 -24 l 20 24 v 60 M 170 106 v -20" stroke="${ink}" stroke-width="3" fill="none"/><path class="draw" d="M280 40 l -20 40 h 18 l -18 40" stroke="${gold}" stroke-width="3" fill="none"/>`),
  tpark: wrap('A tree in a park and a circle of arrows drawn in the sand', `<path class="draw slow" d="M90 230 V 140 M 90 160 C 40 150 40 90 90 80 C 140 90 140 150 90 160" stroke="${ink}" stroke-width="3" fill="none"/><path class="draw" d="M0 232 H 400" stroke="${ink}" stroke-width="2"/><ellipse class="draw slow" cx="270" cy="200" rx="80" ry="22" stroke="${gold}" stroke-width="3" fill="none"/>${[0, 90, 180, 270].map((a) => `<path class="pop" d="M${270 + 80 * Math.cos((a * Math.PI) / 180)} ${200 + 22 * Math.sin((a * Math.PI) / 180)} l 8 -4 l -2 9 z" fill="${gold}"/>`).join('')}<path class="draw" d="M190 140 L 225 196" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`),
  t2: wrap('A steamship crossing the ocean', `<path class="draw" d="M0 200 C 40 190 60 210 100 200 C 140 190 160 210 200 200 C 240 190 260 210 300 200 C 340 190 360 210 400 200" stroke="${ink}" stroke-width="2" fill="none"/><path class="draw" d="M110 180 h 180 l -20 20 h -140 z M 160 180 v -40 h 24 v 40 M 210 180 v -40 h 24 v 40" stroke="${ink}" stroke-width="3" fill="none"/><path class="pop" d="M172 136 c 0 -16 20 -16 20 -32 M 222 136 c 0 -16 20 -16 20 -32" stroke="${gold}" stroke-width="3" fill="none"/>`),
  t3: wrap('A spinning magnetic field inside a motor', `<circle class="draw slow" cx="200" cy="130" r="90" fill="none" stroke="${ink}" stroke-width="4"/>${[0, 60, 120, 180, 240, 300].map((a) => `<g transform="rotate(${a} 200 130)"><rect class="pop" x="194" y="44" width="12" height="22" rx="3" fill="${gold}"/></g>`).join('')}<path class="draw spin" d="M200 130 m -45 0 a 45 45 0 1 0 90 0 a 45 45 0 1 0 -90 0" stroke="${gold}" stroke-width="3" fill="none" stroke-dasharray="20 14"/>`),
  t4: wrap('A waterfall powering lines of light to a city', `<path class="draw slow" d="M40 60 h 80 v 160 M 60 70 v 150 M 80 70 v 150 M 100 70 v 150" stroke="${ink}" stroke-width="3" fill="none"/><path class="draw" d="M130 120 C 200 100 260 120 330 100" stroke="${gold}" stroke-width="3" fill="none"/><path class="draw" d="M290 220 v -50 h 20 v 50 M 320 220 v -80 h 24 v 80 M 352 220 v -36 h 18 v 36" stroke="${ink}" stroke-width="3" fill="none"/>${[300, 332, 360].map((x) => `<circle class="pop" cx="${x}" cy="160" r="4" fill="${gold}"/>`).join('')}`),
  t5: wrap('A tall unfinished tower on Long Island', `<path class="draw slow" d="M170 230 L 190 90 M 230 230 L 210 90 M 175 190 H 225 M 180 150 H 220 M 186 110 H 214" stroke="${ink}" stroke-width="3" fill="none"/><path class="draw" d="M160 90 C 160 55 240 55 240 90 Z" stroke="${ink}" stroke-width="3" fill="none"/><path class="draw" d="M150 60 C 120 40 120 20 140 10 M 250 60 C 280 40 280 20 260 10" stroke="${gold}" stroke-width="2.5" fill="none" stroke-dasharray="5 6"/>`),
  t6: wrap('Magnetic field lines around a bar magnet', `<rect class="draw" x="150" y="115" width="100" height="30" rx="4" stroke="${ink}" stroke-width="3" fill="none"/>${[30, 55, 80].map((r) => `<path class="draw slow" d="M150 130 C 150 ${130 - r * 1.6} 250 ${130 - r * 1.6} 250 130 M 150 130 C 150 ${130 + r * 1.6} 250 ${130 + r * 1.6} 250 130" stroke="${gold}" stroke-width="2" fill="none" opacity=".8"/>`).join('')}`),
});

export const scene = (key: string) => scenes[key] || scenes.hero;
