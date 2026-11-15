// Light + dark: contrast (axe, WCAG 2 AA), visibility of key elements, no sideways scroll, no console errors,
// on every page and every device project in playwright.config.ts.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  ['lobby', ''],
  ['tesla-museum', '#/section/tesla'],
  ['musashi', '#/section/musashi'],
  ['aurelius', '#/section/aurelius'],
  ['quiz', '#/quiz'],
  ['vote', '#/vote'],
  ['terms', '#/legal/terms'],
] as const;

async function open(page: Page, theme: 'light' | 'dark', hash: string) {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.addInitScript((t) => { try { localStorage.setItem('hob.theme', t); } catch { /* ignore */ } }, theme);
  // Reduced motion shows every element at full opacity, so contrast is measured on the final design.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(hash ? `./${hash}` : './');
  await page.waitForLoadState('networkidle');
  return errors;
}

for (const theme of ['dark', 'light'] as const) {
  for (const [name, hash] of PAGES) {
    test(`${name} in ${theme}: contrast, visibility, layout`, async ({ page }) => {
      const errors = await open(page, theme, hash);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      // Key elements are visible
      await expect(page.locator('header.top')).toBeVisible();
      await expect(page.locator('#theme')).toBeVisible();
      await expect(page.locator('main h1').first()).toBeVisible();
      await expect(page.locator('footer.foot')).toBeVisible();
      // No sideways scrolling at any screen size
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, 'page is wider than the screen').toBeLessThanOrEqual(1);
      // Text contrast (WCAG 2 AA). Text drawn over photos is reported as "incomplete" by axe and is checked visually instead.
      const axe = await new AxeBuilder({ page }).withRules(['color-contrast', 'link-in-text-block']).analyze();
      const bad = axe.violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(' ')} :: ${n.failureSummary?.split('\n')[1] || ''}`));
      expect(bad, `contrast problems in ${theme}`).toEqual([]);
      expect(errors, 'console errors').toEqual([]);
    });
  }
}

test('theme switch flips the whole site and remembers the choice', async ({ page }) => {
  await open(page, 'dark', '#/section/tesla');
  const bgDark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.locator('#theme').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('#theme')).toHaveAttribute('aria-label', 'Switch to dark theme');
  const bgLight = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bgLight).not.toBe(bgDark);
  expect(await page.evaluate(() => localStorage.getItem('hob.theme'))).toBe('light');   // remembered for the next visit
});

test('museum: patent search filters the archive', async ({ page }) => {
  await open(page, 'dark', '#/section/tesla');
  const all = await page.locator('.plist li:visible').count();
  expect(all).toBeGreaterThan(100);
  await page.locator('#pq').fill('motor');
  const some = await page.locator('.plist li:visible').count();
  expect(some).toBeGreaterThan(0);
  expect(some).toBeLessThan(all);
});
