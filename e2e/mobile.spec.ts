// Phones and tablets: nothing sticks out of the screen, no clipped headings, readable text, tappable controls,
// iOS does not zoom into fields, and the sticky museum nav is never hidden under the header.
import { test, expect } from '@playwright/test';
import { PAGES } from './pages';

for (const [name, hash] of PAGES) {
  test(`${name}: scales on this screen`, async ({ page }) => {
    const vw = page.viewportSize()!.width;
    test.skip(vw > 1024, 'mobile and tablet profiles only');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(hash ? `./${hash}` : './');
    await page.waitForLoadState('networkidle');
    const r = await page.evaluate(() => {
      const W = window.innerWidth, out: string[] = [], clipped: string[] = [], tiny: string[] = [], small: string[] = [], zoom: string[] = [];
      const label = (e: Element) => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : ''}`;
      // inside a sideways-scrolling strip (museum nav, patent list) is fine
      const inScroller = (e: Element) => { for (let p = e.parentElement; p; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll') return true; } return false; };
      for (const e of Array.from(document.querySelectorAll('body *'))) {
        const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const b = e.getBoundingClientRect(); if (!b.width || !b.height) continue;
        if (e.closest('.sr, .hp, .skip, .m-splash-img, .ev-img, .sp-img, .m-bar') || (e.closest('svg') && e.tagName.toLowerCase() !== 'svg')) continue;   // shapes inside a drawing are clipped by it
        if ((b.right > W + 1 || b.left < -1) && !inScroller(e)) out.push(label(e));
        if (/^H[1-3]$/.test(e.tagName) && e.scrollWidth > e.clientWidth + 1) clipped.push(label(e) + ': ' + e.textContent!.slice(0, 30));
        if (e.childNodes.length && Array.from(e.childNodes).some((n) => n.nodeType === 3 && n.textContent!.trim()) && parseFloat(cs.fontSize) < 11.5) tiny.push(label(e) + ' ' + cs.fontSize);
        if (e.matches('a.btn, button, .chip, header a, .m-nav a, #theme') && b.height < 24) small.push(label(e) + ' ' + Math.round(b.height) + 'px');
        if (e.matches('input:not([type=checkbox]):not([type=radio]), textarea, select') && parseFloat(cs.fontSize) < 16) zoom.push(label(e));
      }
      return { out: [...new Set(out)].slice(0, 10), clipped, tiny: [...new Set(tiny)].slice(0, 10), small, zoom, overflow: document.documentElement.scrollWidth - W };
    });
    expect(r.overflow, 'page scrolls sideways').toBeLessThanOrEqual(1);
    expect(r.out, 'elements outside the screen').toEqual([]);
    expect(r.clipped, 'headings cut off').toEqual([]);
    expect(r.tiny, 'text smaller than 11.5px').toEqual([]);
    expect(r.small, 'tap targets under 24px (WCAG 2.5.8)').toEqual([]);
    expect(r.zoom, 'form fields under 16px make iOS zoom').toEqual([]);
    await expect(page.locator('#theme')).toBeInViewport();
    if (await page.locator('.m-nav').count()) {
      await page.locator('#life').scrollIntoViewIfNeeded();
      const hdr = await page.locator('header.top').boundingBox(); const nav = await page.locator('.m-nav').boundingBox();
      expect(nav!.y, 'museum nav hidden under the header').toBeGreaterThanOrEqual(hdr!.y + hdr!.height - 1);
    }
  });
}
