// PDF check: node tests/pdf.mjs  (needs `playwright` and poppler's `pdfinfo`; SHOTS=<dir> keeps the PDFs)
// For every template and three CV lengths, plus the letter: the printed PDF has only A4 pages,
// the page count matches the paginated sheet, and no block crosses a page edge.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const { chromium } = createRequire(import.meta.url)('playwright');

const url = pathToFileURL(new URL('../index.html', import.meta.url).pathname).href;
const dir = process.env.SHOTS || mkdtempSync(join(tmpdir(), 'ttu-pdf-'));
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(url);
const templates = await page.evaluate(() => Object.keys(window.TTU_CONTENT.TEMPLATES));

const cases = [];
for (const t of templates) for (const size of ['court', 'normal', 'long']) cases.push({ t, size, doc: 'cv' });
cases.push({ t: 'corporate', size: 'normal', doc: 'lettre' }, { t: 'modern-asymmetric', size: 'normal', doc: 'lettre' });

const report = [];
for (const c of cases) {
  const result = await page.evaluate(({ t, size, doc }) => {
    const T = window.TTU, C = window.TTU_CONTENT;
    const d = T.normalize(C.EXAMPLE);
    if (size === 'court') { d.experiences = d.experiences.slice(0, 1); d.projets = []; d.benevolat = []; d.certifications = []; }
    if (size === 'long') {
      d.experiences = [...d.experiences, ...d.experiences, ...d.experiences].map((x, i) => ({ ...x, poste: `${x.poste} ${i + 1}` }));
      d.formations = [...d.formations, ...d.formations];
      d.letter.corps = T.buildDraft(d);
    }
    if (doc === 'lettre') d.letter.corps = T.buildDraft(d);
    const s = { ...T.defaultSettings(), template: t };
    const html = doc === 'lettre' ? T.renderLetter(d, s) : T.renderCv(d, s);
    T.setPrintSource(() => html);
    const pages = T.measure(html);
    // Every block must sit inside one page, clear of the page edges.
    const art = document.querySelector('#printHost > .cv'), H = T.A4_H, top0 = art.getBoundingClientRect().top;
    const sel = '.cv__head, .cv-sec__title, .entry, .levels, .chips, .infos, .refs, .cv-text, .letter__body > p, .letter__to, .letter__sign';
    const cut = [...art.querySelectorAll(sel)].filter(el => {
      const r = el.getBoundingClientRect(), a = r.top - top0, b = r.bottom - top0;
      return Math.floor(a / H) !== Math.floor((b - 0.5) / H) && b - a < H * 0.8;
    }).map(el => el.className + ': ' + el.textContent.trim().slice(0, 40));
    return { pages, cut, height: art.offsetHeight / H };
  }, c);
  const file = join(dir, `${c.doc}-${c.t}-${c.size}.pdf`);
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: file, preferCSSPageSize: true, printBackground: true });
  await page.emulateMedia({ media: 'screen' });
  const info = execFileSync('pdfinfo', ['-l', '999', file], { encoding: 'utf8' });
  const pdfPages = +info.match(/^Pages:\s+(\d+)/m)[1];
  const sizes = [...info.matchAll(/Page\s+\d+ size:\s+([\d.]+) x ([\d.]+)/g)].map(m => [+m[1], +m[2]]);
  const allA4 = sizes.every(([w, h]) => Math.abs(w - 595.3) < 2 && Math.abs(h - 841.9) < 2);
  report.push(`${c.doc} ${c.t} ${c.size}: ${pdfPages} page(s)`);
  assert.equal(pdfPages, result.pages, `${file}: PDF has ${pdfPages} pages, sheet has ${result.pages}`);
  assert.ok(allA4, `${file}: a page is not A4 (${JSON.stringify(sizes)})`);
  assert.ok(Math.abs(result.height - result.pages) < 0.01, `${file}: sheet is ${result.height} pages tall`);
  assert.deepEqual(result.cut, [], `${file}: blocks cut by a page edge`);
}
await browser.close();
console.log(report.join('\n'));
console.log(`pdf: ${cases.length} documents, all A4, nothing cut (${dir})`);
