import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { checkBuilder } from '../scripts/check-content.mjs';

const musashi = JSON.parse(fs.readFileSync(new URL('../src/content/musashi.json', import.meta.url), 'utf8'));

for (const id of ['musashi', 'aurelius', 'tesla']) {
  test(`the ${id} wing passes the content gate`, () => {
    const b = JSON.parse(fs.readFileSync(new URL(`../src/content/${id}.json`, import.meta.url), 'utf8'));
    assert.deepEqual(checkBuilder(b), []);
  });
}

test('no wing mentions the car company', () => {
  const t = fs.readFileSync(new URL('../src/content/tesla.json', import.meta.url), 'utf8');
  assert.doesNotMatch(t, /Tesla,? Inc|Tesla Motors|electric car/i);
});

test('an unsourced story panel is refused', () => {
  const bad = structuredClone(musashi);
  bad.story[0].sources = [];
  assert.match(checkBuilder(bad).join('\n'), /HOB_UNSOURCED/);
});

test('an unknown source id is refused', () => {
  const bad = structuredClone(musashi);
  bad.principles[0].sources = ['made-up'];
  assert.match(checkBuilder(bad).join('\n'), /HOB_UNKNOWN_SOURCE/);
});

test('location-tracking language is refused', () => {
  const bad = structuredClone(musashi);
  bad.story[1].text += ' His current location is shown here.';
  assert.match(checkBuilder(bad).join('\n'), /HOB_GUARDRAIL_LOCATION/);
});
