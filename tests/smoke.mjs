// Smoke test: node tests/smoke.mjs  (needs `playwright`; SHOTS=<dir> also saves screenshots and PDFs)
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const { chromium } = createRequire(import.meta.url)('playwright');

const url = pathToFileURL(new URL('../atelier.html', import.meta.url).pathname).href;
const shots = process.env.SHOTS;
const TEMPLATES = ['minimal-pro', 'corporate', 'timeline', 'modern-asymmetric', 'compact', 'elegant-classic', 'pastel', 'bold-creative', 'tech-futurist', 'dark-mode', 'ats'];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)/.test(m.text()) && !/ERR_FAILED/.test(m.text())) errors.push(m.text()); });
page.on('dialog', d => d.accept());
await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); // offline-safe
const settle = () => page.waitForTimeout(450);
await page.goto(url);

// 1. Migration: v2 data and template key are picked up.
await page.evaluate(() => {
  localStorage.setItem('cvData', JSON.stringify({ fullName: 'Ancien CV', formations: [{ titre: 'BTS', ecole: 'Lycée', annee: '2020' }] }));
  localStorage.setItem('currentTemplate', 'tech-futurist');
});
await page.reload();
assert.equal(await page.inputValue('#f-fullName'), 'Ancien CV');
assert.equal(await page.locator('.cv--tech-futurist').count(), 1);

// 2. Hostile input is shown as text, never parsed as HTML; quotes survive a reload.
const evil = `<img src=x onerror="window.pwned=1">"Ali" & co`;
await page.fill('#f-fullName', evil);
await page.click('[data-action="add"][data-list="experiences"]');
await page.fill('#experiences-0-poste', 'BTS "SIO"');
await page.fill('#experiences-0-description', '- Responsable de la caisse\n- Accueil des clients');
await settle();
assert.equal(await page.textContent('#docPreview .cv__name'), evil);
assert.equal(await page.locator('#docPreview img').count(), 0);
assert.equal(await page.evaluate(() => window.pwned), undefined);
assert.equal(await page.locator('#docPreview .entry__bullets li').count(), 2);
await page.reload();
assert.equal(await page.inputValue('#experiences-0-poste'), 'BTS "SIO"');

// 3. Live advice: no figure and a vague phrase are both flagged.
const tips = await page.textContent('[data-tips="experiences"]');
assert.match(tips, /résultat chiffré/);
assert.match(tips, /responsable de/);
assert.ok(await page.isVisible('#tipsBtn'));

// 4. Writing help: a mission suggestion lands as a new line; a verb at the cursor.
await page.click('#card-experiences .assist summary');
await page.click('#card-experiences .suggest button >> nth=0');
assert.match(await page.inputValue('#experiences-0-description'), /\nDéveloppé \[fonctionnalité\]/);
await page.selectOption('#domain', 'vente');
await page.click('#card-experiences .assist summary');
assert.match(await page.textContent('#card-experiences .suggest'), /chiffre d’affaires/);

// 5. Corrupt storage does not break the page.
await settle();
await page.evaluate(() => { localStorage.setItem('cvData', '{"formations":"nope"'); localStorage.setItem('cvSettings', '{"template":"bogus","order":["x"],"accent":"red"}'); });
await page.reload();
assert.equal(await page.locator('#docPreview .cv--minimal-pro').count(), 1);
assert.equal(await page.locator('#secList .sec-row').count(), 13);

// 6. Example + every template renders, with the new sections.
await page.click('[data-cmd="example"]');
await settle();
await page.click('#tab-design');
for (const id of TEMPLATES) {
  await page.click(`[data-template="${id}"]`);
  await settle();
  assert.equal(await page.locator(`#docPreview .cv--${id} .cv-sec--experiences .entry`).count(), 2, id);
  assert.equal(await page.locator(`#docPreview .cv--${id} .cv-sec--certifications`).count(), 1, id);
  if (shots) await page.locator('#docPreview').screenshot({ path: `${shots}/tpl-${id}.png` });
}
assert.equal(await page.locator('[data-thumb] .cv').count(), TEMPLATES.length);

// 7. Personalisation: accent, font, density, levels, hide + reorder sections.
await page.click('[data-template="minimal-pro"]');
await page.click('[data-set="accent"][data-value="#b91c1c"]');
await page.click('[data-set="font"][data-value="serif"]');
await page.click('[data-set="density"][data-value="compact"]');
await page.click('[data-set="levels"][data-value="dots"]');
await page.uncheck('[data-sec-toggle="interets"]');
await page.click('[data-sec-move="up"][data-key="formations"]');
await settle();
const style = await page.locator('#docPreview .cv').getAttribute('style');
assert.match(style, /--a:\s*#b91c1c/); assert.match(style, /Source Serif 4/); assert.match(style, /--d:\s*0.9/);
assert.ok(await page.locator('#docPreview .cv.lv-dots .dots').first().isVisible());
assert.equal(await page.locator('#docPreview .cv-sec--interets').count(), 0);
const order = await page.locator('#docPreview .cv-sec').evaluateAll(els => els.map(e => e.className.match(/cv-sec--(\w+)/)[1]));
assert.ok(order.indexOf('formations') < order.indexOf('experiences'), order.join());
if (shots) await page.screenshot({ path: `${shots}/app-design.png` });
await page.reload();
assert.equal(await page.locator('#tab-design').getAttribute('aria-selected'), 'true');
assert.match(await page.locator('#docPreview .cv').getAttribute('style'), /--a:\s*#b91c1c/);
await page.click('[data-set="accent"][data-value=""]');
await page.click('[data-set="font"][data-value="auto"]');
await page.click('[data-set="density"][data-value="normal"]');

// 8. Letter: draft from the CV, rendered with the CV header, own PDF title.
await page.click('#tab-lettre');
await page.click('[data-cmd="draft"]');
await settle();
assert.match(await page.inputValue('#l-corps'), /Développeuse Full-Stack/);
assert.ok(await page.locator('#docPreview .letter').isVisible());
assert.match(await page.textContent('#docPreview .letter__obj'), /Candidature au poste de Développeuse Full-Stack/);
assert.match(await page.textContent('#docPreview .letter__to'), /Studio Lumen/);
assert.equal(await page.textContent('#pdfLabel'), 'la lettre');
if (shots) await page.locator('#docPreview').screenshot({ path: `${shots}/letter.png` });

// 9. Print shows only the paginated sheet, whole A4 pages.
await page.click('#tab-contenu');
await page.evaluate(() => dispatchEvent(new Event('beforeprint')));
await page.emulateMedia({ media: 'print' });
assert.equal(await page.locator('.topbar').isVisible(), false);
assert.ok(await page.locator('#printHost .cv').isVisible());
assert.match(await page.locator('#printHost .cv').evaluate(e => e.style.minHeight), /^\d+mm$/);
if (shots) await page.pdf({ path: `${shots}/cv.pdf`, preferCSSPageSize: true, printBackground: true });
await page.emulateMedia({ media: 'screen' });

// 10. Dark theme is remembered; footer ownership line.
await page.click('[data-cmd="theme"]');
const theme = await page.evaluate(() => document.documentElement.dataset.theme);
await page.reload();
assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), theme);
assert.match(await page.textContent('.site-footer'), /Appartient à Edunos Studio/);
if (shots) await page.screenshot({ path: `${shots}/app-${theme}.png` });
await page.click('[data-cmd="theme"]');
if (shots) await page.screenshot({ path: `${shots}/app-content.png` });

// 11. Mobile: no horizontal scroll, preview tab works.
await page.setViewportSize({ width: 375, height: 800 });
assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'horizontal scroll on mobile');
if (shots) await page.screenshot({ path: `${shots}/mobile-edit.png` });
await page.click('#view-preview');
assert.ok(await page.locator('#docPreview .cv').isVisible());
if (shots) await page.screenshot({ path: `${shots}/mobile.png` });

assert.deepEqual(errors, []);
await browser.close();
console.log('smoke: all checks passed');
