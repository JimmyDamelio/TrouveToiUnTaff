// Book smoke test: node tests/book.mjs  (needs `playwright`)
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const { chromium, devices } = createRequire(import.meta.url)('playwright');

const url = pathToFileURL(new URL('../index.html', import.meta.url).pathname).href;
const browser = await chromium.launch();
const errors = [];
const watch = p => { p.on('pageerror', e => errors.push(e.message)); p.on('dialog', d => d.accept()); };

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
watch(page);
await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
await page.goto(url);
await page.evaluate(() => localStorage.clear());
await page.reload();

// 1. Intro plays, can be skipped; "Pas encore" keeps the visitor on the welcome screen.
assert.ok(await page.isVisible('#skipIntro'));
await page.click('#skipIntro');
assert.equal(await page.getAttribute('#welcomeTitle', 'aria-label'), 'Bienvenue.');
await page.click('[data-go="no"]');
assert.match(await page.textContent('#welcomeWait'), /on t’attend ici/);
assert.ok(await page.isVisible('#welcome'));
assert.ok(await page.isHidden('#choice'));

// 2. "Oui" leads to the CV / letter choice, then to the first chapter.
await page.click('[data-go="yes"]');
assert.ok(await page.isVisible('#choice'));
await page.click('[data-doc="cv"]');
assert.ok(await page.isVisible('#book'));
assert.match(await page.textContent('.chapter__title'), /Ta photo/);
assert.equal(await page.locator('.toc__item').count(), 11);

// 3. Photo can be skipped; identity fields write to the CV on the right page.
await page.click('text=Je préfère sans photo');
await page.waitForTimeout(600);
assert.match(await page.textContent('.chapter__title'), /Qui es-tu/);
await page.fill('#f-fullName', 'Inès Diallo');
await page.fill('#f-jobTitle', 'Vendeuse conseil');
await page.selectOption('#domain', 'vente');
await page.waitForTimeout(200);
assert.equal(await page.textContent('#docPreview .cv__name'), 'Inès Diallo');
assert.ok(await page.locator('.chapter__guide .guide').count() === 1, 'identity guide');

// 4. Skills: guide with level meanings, one-click ideas for the chosen domain.
await page.click('[data-goto="5"]');
await page.waitForTimeout(600);
assert.match(await page.textContent('.chapter__guide'), /C’est quoi, une compétence/);
assert.match(await page.textContent('.chapter__guide'), /Tu pourrais le former/);
await page.click('[data-add="competences"][data-text="Encaissement"]');
assert.equal(await page.inputValue('#competences-0-nom'), 'Encaissement');
assert.equal(await page.locator('[data-add="competences"][data-text="Encaissement"]').count(), 0);
await page.waitForTimeout(200);
assert.match(await page.textContent('#docPreview .cv-sec--competences'), /Encaissement/);

// 5. Matchbox picker changes the template of the live CV.
await page.click('[data-goto="8"]');
await page.waitForTimeout(600);
assert.equal(await page.locator('.mbx__box').count(), 11);
await page.click('[data-mbx="1"]');
await page.waitForTimeout(900);
assert.equal(await page.locator('#docPreview .cv--corporate').count(), 1);
await page.keyboard.press('ArrowRight'); // focus is on the next button, inside the picker
await page.waitForTimeout(900);
assert.equal(await page.locator('#docPreview .cv--timeline').count(), 1);

// 6. A long CV fits on one page on request; the final page offers the PDF and the missing photo.
await page.evaluate(() => {
  const d = window.TTU.normalize(window.TTU_CONTENT.EXAMPLE);
  d.projets = []; d.benevolat = [];
  localStorage.setItem('cvData', JSON.stringify(d));
  localStorage.setItem('bookState', JSON.stringify({ doc: 'cv', cv: 9 }));
  localStorage.setItem('cvSettings', JSON.stringify({ template: 'minimal-pro' }));
});
await page.goto(url + '#livre');
await page.reload();
await page.waitForTimeout(500);
assert.match(await page.textContent('#pageCount'), /2 pages/);
await page.click('#fitLine [data-cmd="fit"]');
await page.waitForTimeout(600);
assert.match(await page.textContent('#pageCount'), /1 page/);
await page.click('[data-nav="next"]');
await page.waitForTimeout(600);
assert.match(await page.textContent('.chapter__title'), /C’est prêt/);
assert.ok(await page.isVisible('text=Tu n’as pas mis de photo'));
assert.ok(await page.isVisible('[data-cmd="pdf"]'));
await page.evaluate(() => dispatchEvent(new Event('beforeprint')));
await page.emulateMedia({ media: 'print' });
assert.ok(await page.locator('#printHost .cv').isVisible());
assert.equal(await page.locator('.book-bar').isVisible(), false);
await page.emulateMedia({ media: 'screen' });

// 7. Letter: draft written from the CV, shown with the CV header.
await page.click('.chapter [data-doc="lettre"]');
await page.click('[data-goto="2"]');
await page.waitForTimeout(600);
await page.click('[data-cmd="draft"]');
await page.waitForTimeout(200);
assert.match(await page.inputValue('#l-corps'), /Développeuse Full-Stack/);
assert.ok(await page.locator('#docPreview .letter').isVisible());

// 8. Phone: one page at a time, no sideways scroll, the CV opens full screen.
const phone = await browser.newPage({ ...devices['iPhone 13'] });
watch(phone);
await phone.goto(url + '#livre');
await phone.waitForTimeout(500);
assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'sideways scroll on phone');
await phone.click('.peek-btn');
assert.ok(await phone.locator('#docPreview .cv').isVisible());

// 9. Reduced motion: no intro animation, everything usable at once.
const calm = await browser.newPage({ reducedMotion: 'reduce' });
watch(calm);
await calm.goto(url);
assert.ok(await calm.isHidden('#skipIntro'));
assert.ok(await calm.isVisible('[data-go="yes"]'));

assert.deepEqual(errors, []);
await browser.close();
console.log('book: all checks passed');
