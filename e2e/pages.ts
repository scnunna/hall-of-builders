// Every live Section in hall.json plus the fixed pages, so each new person is tested automatically.
import fs from 'node:fs';
import path from 'node:path';

const hall = JSON.parse(fs.readFileSync(path.resolve('src', 'content', 'hall.json'), 'utf8'));
const today = new Date(Date.now() - 5 * 3600e3).toISOString().slice(0, 10);
const sections: [string, string][] = hall.wings
  .filter((w: { status: string; publishAt?: string }) => w.status === 'open' && (!w.publishAt || w.publishAt <= today))
  .map((w: { id: string }) => [w.id, `#/section/${w.id}`]);
export const PAGES: [string, string][] = [['lobby', ''], ...sections, ['quiz', '#/quiz'], ['vote', '#/vote'], ['terms', '#/legal/terms']];
