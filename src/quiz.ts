// "Which Builder are you?" A light personality quiz across the three launch wings, with a shareable result card.
export type BuilderId = 'musashi' | 'aurelius' | 'tesla';

export const questions: { q: string; a: [string, BuilderId][] }[] = [
  { q: 'A free Saturday. What do you do?', a: [['Practise a skill until it clicks', 'musashi'], ['Walk, think and write things down', 'aurelius'], ['Take something apart to see how it works', 'tesla']] },
  { q: 'A plan falls apart. Your first move?', a: [['Adapt fast and keep going', 'musashi'], ['Stay calm; focus on what I control', 'aurelius'], ['Invent a better plan', 'tesla']] },
  { q: 'Which compliment means the most?', a: [['"You are a master at this"', 'musashi'], ['"You never lose your cool"', 'aurelius'], ['"I never thought of it that way"', 'tesla']] },
  { q: 'Pick a workspace.', a: [['A quiet dojo', 'musashi'], ['A garden at dawn', 'aurelius'], ['A lab full of half-built ideas', 'tesla']] },
  { q: 'Your biggest strength?', a: [['Discipline', 'musashi'], ['Self-control', 'aurelius'], ['Imagination', 'tesla']] },
  { q: 'What do you want to leave behind?', a: [['A craft others can learn', 'musashi'], ['A calm example to follow', 'aurelius'], ['An idea that changes things', 'tesla']] },
];

export const results: Record<BuilderId, { name: string; title: string; line: string }> = {
  musashi: { name: 'Miyamoto Musashi', title: 'The Master', line: 'You grow through daily practice and turn hard skills into second nature.' },
  aurelius: { name: 'Marcus Aurelius', title: 'The Steady Mind', line: 'You keep calm under pressure and lead yourself first.' },
  tesla: { name: 'Nikola Tesla', title: 'The Inventor', line: 'You see what is not there yet and cannot stop building it.' },
};

export function score(picks: BuilderId[]): BuilderId {
  const n: Record<BuilderId, number> = { musashi: 0, aurelius: 0, tesla: 0 };
  picks.forEach((p) => n[p]++);
  // Ties go to the last answer given, so every result is reachable.
  const max = Math.max(...Object.values(n));
  return [...picks].reverse().find((p) => n[p] === max) || 'musashi';
}

// Draw a 1080x1350 share card (Instagram portrait) on a canvas.
export async function card(id: BuilderId): Promise<Blob | null> {
  const r = results[id];
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1350;
  const g = c.getContext('2d'); if (!g) return null;
  g.fillStyle = '#14110d'; g.fillRect(0, 0, 1080, 1350);
  g.strokeStyle = '#d4a84b'; g.lineWidth = 18; g.lineCap = 'round';
  g.beginPath(); g.arc(540, 520, 300, -0.4, Math.PI * 1.75); g.stroke();
  g.fillStyle = '#b08d57'; g.font = '600 40px Georgia, serif'; g.textAlign = 'center';
  g.fillText('HALL OF BUILDERS', 540, 140);
  g.fillStyle = '#f4f1ea'; g.font = '44px Georgia, serif'; g.fillText('I am', 540, 470);
  g.font = 'bold 84px Georgia, serif'; g.fillText(r.title, 540, 570);
  g.fillStyle = '#d4a84b'; g.font = '46px Georgia, serif'; g.fillText(r.name, 540, 640);
  g.fillStyle = '#e8e2d6'; g.font = '38px Georgia, serif';
  wrapText(g, r.line, 540, 960, 860, 54);
  g.fillStyle = '#b08d57'; g.font = '34px Georgia, serif'; g.fillText('Which Builder are you?', 540, 1240);
  return new Promise((res) => c.toBlob((b) => res(b), 'image/png'));
}

function wrapText(g: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number) {
  let line = ''; const words = text.split(' ');
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (g.measureText(test).width > max && line) { g.fillText(line, x, y); line = w; y += lh; } else line = test;
  }
  if (line) g.fillText(line, x, y);
}
