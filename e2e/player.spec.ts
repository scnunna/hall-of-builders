// Story player: Play starts the timeline, moves to the next moment on its own, and a tap on a picture pauses it.
// Runs in silent slideshow mode (voice off) so it does not depend on the test machine's speech engine.
import { test, expect } from '@playwright/test';

test('story player auto-scrolls the timeline and pauses on a picture tap', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('hob.voice', 'off'); localStorage.setItem('hob.speed', '2'); } catch { /* ignore */ } });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./#/section/tesla');
  await page.locator('.mp-start').click();
  await expect(page.locator('.mp-play')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#life .ev').nth(0)).toHaveClass(/reading/);
  await expect(page.locator('#life .ev').nth(1)).toHaveClass(/reading/, { timeout: 15000 });   // moved on by itself
  await expect(page.locator('#life .ev').nth(1)).toBeInViewport();
  await expect(page.locator('#mp-speed')).toHaveValue('2');
  // Tap a picture to pause
  const img = page.locator('#life .ev img').first();
  await img.scrollIntoViewIfNeeded();
  await img.click({ force: true });
  await expect(page.locator('.mp-play')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#life .ev.reading')).toHaveCount(0);
});
