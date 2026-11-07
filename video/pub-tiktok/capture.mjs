// Real footage of the site, frame by frame: the page clock is frozen and stepped 1/30 s at a time,
// so GSAP, Three.js and timers advance exactly one frame between screenshots.
// usage: node capture.mjs [welcome|write|fin|cvs]...   -> clips/<name>/f_000.jpg, clips/cvs/<template>.png
import { createRequire } from 'node:module';
import fs from 'node:fs';
const { chromium } = createRequire('/home/user/TrouveToiUnTaff/')('playwright');
const SITE = 'file:///home/user/TrouveToiUnTaff/index.html';
const STEP = 1000 / 30;
const PHONE = { viewport: { width: 390, height: 845 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const want = process.argv.slice(2);
const browser = await chromium.launch();

async function phone() {
  const ctx = await browser.newContext(PHONE);
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('[error]', e.message));
  await p.clock.install({ time: new Date('2026-11-07T10:00:00') });
  await p.clock.pauseAt(new Date('2026-11-07T10:00:01'));
  return p;
}
async function film(p, name, frames, each) {
  const dir = `clips/${name}`;
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  for (let i = 0; i < frames; i++) {
    if (each) await each(i);
    await p.screenshot({ path: `${dir}/f_${String(i).padStart(3, '0')}.jpg`, type: 'jpeg', quality: 90 });
    await p.clock.runFor(STEP);
  }
  console.log(name, frames, 'frames');
}
const seed = (p, data, book, settings) => p.evaluate(([d, b, s]) => {
  localStorage.clear();
  localStorage.setItem('introSeen', '1');
  if (d) localStorage.setItem('cvData', JSON.stringify(d));
  localStorage.setItem('bookState', JSON.stringify(b));
  if (s) localStorage.setItem('cvSettings', JSON.stringify(s));
}, [data, book, settings]);

// 1. Welcome: the 3D sheets fly in while the title writes itself (first-visit timing).
if (want.includes('welcome')) {
  const p = await phone();
  await p.goto(SITE);
  await p.evaluate(() => localStorage.clear());
  await p.reload();
  await p.waitForFunction(() => window.TTU_SCENE?.active, null, { timeout: 30000 });
  await p.evaluate(() => document.fonts.ready);
  await p.addStyleTag({ content: '#skipIntro{display:none!important}' });
  await p.clock.runFor(STEP * 2); // let the timeline take its first tick
  await film(p, 'welcome', 120);
  await p.context().close();
}

// 2. Writing: name typed letter by letter (checks pop, CV updates), then the page curls to the next chapter.
if (want.includes('write')) {
  const p = await phone();
  await p.goto(SITE);
  await seed(p, null, { doc: 'cv', cv: 1 });
  await p.goto(SITE + '#livre'); await p.reload();
  await p.evaluate(() => document.fonts.ready);
  await p.clock.runFor(1500); // entrance done
  const name = 'Inès Diallo', job = 'Vendeuse';
  const script = {};
  [...name].forEach((c, k) => { script[6 + k * 2] = () => p.type('#f-fullName', c); });
  [...job].forEach((c, k) => { script[36 + k * 2] = () => p.type('#f-jobTitle', c); });
  script[66] = () => p.evaluate(() => document.querySelector('[data-nav="next"].btn--ch').click());
  await film(p, 'write', 120, i => script[i]?.());
  await p.context().close();
}

// 3. The end: last step turns to « C'est prêt », confetti.
if (want.includes('fin')) {
  const p = await phone();
  await p.goto(SITE);
  const d = await p.evaluate(() => window.TTU.normalize(window.TTU_CONTENT.EXAMPLE));
  await seed(p, d, { doc: 'cv', cv: 9 }, { template: 'studio-bleu' });
  await p.goto(SITE + '#livre'); await p.reload();
  await p.evaluate(() => document.fonts.ready);
  await p.clock.runFor(1500);
  await film(p, 'fin', 75, i => i === 4 && p.evaluate(() => document.querySelector('[data-nav="next"].btn--ch').click()));
  await p.context().close();
}

// 4. The same CV in several templates, as crisp A4 sheets.
if (want.includes('cvs')) {
  const p = await browser.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 1.4 });
  await p.goto(SITE);
  await p.evaluate(() => document.fonts.ready);
  const ids = ['studio-bleu', 'bordeaux', 'timeline', 'bold-creative', 'lavande', 'marine-or', 'pastel', 'tech-futurist', 'polaroid', 'corporate'];
  fs.mkdirSync('clips/cvs', { recursive: true });
  for (const id of ids) {
    await p.evaluate(id => {
      const T = window.TTU, d = T.normalize(window.TTU_CONTENT.EXAMPLE);
      document.body.innerHTML = '<div id="host" style="width:210mm;background:#fff"></div>';
      const host = document.getElementById('host');
      host.innerHTML = T.renderCv(d, { ...T.defaultSettings(), template: id });
      T.paginate(host.firstElementChild);
    }, id);
    await p.evaluate(() => document.fonts.ready);
    await p.locator('#host > .cv').screenshot({ path: `clips/cvs/${id}.png`, clip: undefined });
  }
  console.log('cvs', ids.length);
}
await browser.close();
