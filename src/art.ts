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

export const scene = (key: string) => scenes[key] || scenes.hero;
