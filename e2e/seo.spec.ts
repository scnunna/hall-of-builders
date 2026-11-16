// Each Section has a real URL (<base>/<id>/) that search engines and AI crawlers can read without running JavaScript,
// and the interactive museum still loads there for people.
import { test, expect } from '@playwright/test';

test('section page: crawlable HTML, structured data, then the live museum', async ({ page, request }) => {
  const raw = await (await request.get('./tesla/')).text();   // what a crawler sees before any JavaScript
  expect(raw).toContain('<title>Nikola Tesla: life, work and lessons');
  expect(raw).toContain('rel="canonical" href="https://nunnaconsulting.com/NAIC/hallofbuilders/hall/tesla/"');
  expect(raw).toContain('"@type":"Article"');
  expect(raw).toContain('og:image');
  expect(raw).toMatch(/<h2>Life timeline<\/h2>/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./tesla/');
  await expect(page.locator('.m-splash h1')).toHaveText('Nikola Tesla');   // the app took over
  await page.locator('header.top a[href$="#/quiz"]').first().click();
  await expect(page.locator('#quiz')).toBeVisible();
});

test('sitemap and llms.txt list every live Section', async ({ request }) => {
  const sm = await (await request.get('./sitemap.xml')).text();
  for (const id of ['tesla', 'musashi', 'aurelius']) expect(sm).toContain(`/hall/${id}/`);
  const llms = await (await request.get('./llms.txt')).text();
  expect(llms).toContain('# Hall of Builders');
});
