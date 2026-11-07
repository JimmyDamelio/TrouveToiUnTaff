// usage: node render.mjs stills 1 3.2 8.6 ...   -> stills/t_<t>.jpg
//        node render.mjs frames [fps] [workers] -> frames/f_00000.jpg ...
import { createRequire } from 'node:module';
import fs from 'node:fs';
const { chromium } = createRequire('/home/user/TrouveToiUnTaff/')('playwright');
const url = new URL('film.html', import.meta.url).href;
const [mode, ...rest] = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
async function openPage() {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.log('[error]', e.message));
  await page.goto(url);
  await page.evaluate(() => window.ready);
  return page;
}
async function grab(page, t, file) {
  const b64 = await page.evaluate(t => { renderAt(t); return document.getElementById('c').toDataURL('image/jpeg', 0.95).split(',')[1]; }, t);
  fs.writeFileSync(file, Buffer.from(b64, 'base64'));
}
if (mode === 'stills') {
  fs.mkdirSync('stills', { recursive: true });
  const page = await openPage();
  for (const t of rest.map(Number)) await grab(page, t, `stills/t_${t.toFixed(2)}.jpg`);
} else {
  const fps = +(rest[0] || 30), workers = +(rest[1] || 4);
  const page0 = await openPage(), total = Math.round(await page0.evaluate(() => window.DUR) * fps);
  fs.rmSync('frames', { recursive: true, force: true }); fs.mkdirSync('frames');
  let next = 0; const t0 = Date.now();
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const page = w ? await openPage() : page0;
    while (next < total) {
      const i = next++;
      await grab(page, i / fps, `frames/f_${String(i).padStart(5, '0')}.jpg`);
      if (i % 100 === 0) console.log(`frame ${i}/${total} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
  }));
}
await browser.close();
