// Smoke test: node tests/smoke.mjs  (needs `playwright` installed)
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const { chromium } = createRequire(import.meta.url)('playwright');

const url = pathToFileURL(new URL('../index.html', import.meta.url).pathname).href;
const shots = process.env.SHOTS; // optional dir for screenshots
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('dialog', d => d.accept());
await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); // offline-safe
await page.goto(url);

// 1. Hostile input is shown as text, never parsed as HTML; quotes survive.
const evil = `<img src=x onerror="window.pwned=1">"Ali" & co`;
await page.fill('#f-fullName', evil);
await page.click('[data-action="add"][data-list="experiences"]');
await page.fill('#experiences-0-poste', 'BTS "SIO"');
await page.fill('#experiences-0-description', '- Ligne 1\n- Ligne 2');
await page.waitForTimeout(500);
assert.equal(await page.textContent('.cv__name'), evil);
assert.equal(await page.locator('#cvPreview img').count(), 0);
assert.equal(await page.evaluate(() => window.pwned), undefined);
assert.equal(await page.locator('.entry__bullets li').count(), 2);

// 2. Persists across reload, including the quoted value in a list field.
await page.reload();
assert.equal(await page.inputValue('#experiences-0-poste'), 'BTS "SIO"');
assert.equal(await page.inputValue('#f-fullName'), evil);

// 3. Corrupt storage does not break the page.
await page.evaluate(() => { localStorage.setItem('cvData', '{"formations":"nope"'); localStorage.setItem('currentTemplate', 'bogus'); });
await page.reload();
assert.equal(await page.locator('.cv--minimal-pro').count(), 1);

// 4. Every template renders the example.
await page.click('[data-cmd="example"]');
for (const id of ['minimal-pro', 'bold-creative', 'tech-futurist', 'elegant-classic', 'modern-asymmetric', 'dark-mode']) {
  await page.click(`[data-template="${id}"]`);
  assert.equal(await page.locator(`.cv--${id} .cv-sec--experiences .entry`).count(), 2, id);
  if (shots) await page.locator('#cvPreview').screenshot({ path: `${shots}/tpl-${id}.png` });
}
assert.match(await page.textContent('#progressText'), /\d+ %|complet/);

// 5. Dark theme toggles the whole app and is remembered.
await page.click('[data-cmd="theme"]');
const theme = await page.evaluate(() => document.documentElement.dataset.theme);
await page.reload();
assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), theme);
if (shots) await page.screenshot({ path: `${shots}/app-${theme}.png` });

// 6. Print shows only the CV, unscaled.
await page.emulateMedia({ media: 'print' });
assert.equal(await page.locator('.topbar').isVisible(), false);
assert.equal(await page.locator('#cvPreview').evaluate(e => getComputedStyle(e).transform), 'none');
await page.evaluate(() => dispatchEvent(new Event('beforeprint')));
assert.match(await page.locator('.cv').evaluate(e => e.style.minHeight), /^\d+mm$/);
if (shots) await page.pdf({ path: `${shots}/cv.pdf`, format: 'A4', printBackground: true });
await page.emulateMedia({ media: 'screen' });

// 7. Ownership footer.
assert.match(await page.textContent('.site-footer'), /Appartient à Edunos Studio/);

// 8. Mobile: no horizontal scroll, preview tab works.
await page.setViewportSize({ width: 375, height: 800 });
assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'horizontal scroll on mobile');
await page.click('#tab-preview');
assert.ok(await page.locator('.cv').isVisible());
if (shots) await page.screenshot({ path: `${shots}/mobile.png`, fullPage: false });

assert.deepEqual(errors, []);
await browser.close();
console.log('smoke: all checks passed');
