(() => {
  'use strict';
  const { TEMPLATES, FONTS, ACCENTS, DENSITIES, LEVEL_STYLES, DOMAINS, CLOSINGS, EXAMPLE, GUIDES } = window.TTU_CONTENT;
  const T = window.TTU;
  const { KEYS, TEXT_FIELDS, TABS, MAX_IMPORT_BYTES, MAX_ITEMS, A4_W, A4_H, LISTS, SECTIONS, blankData, normalize, normalizeSettings,
    esc, store, icon, isFilled, hasContent, plural, today, renderCv, renderLetter, analyze, resizeImage, loadState, saveState } = T;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* =========================================================
     State & persistence
     ========================================================= */
  let { data, settings } = loadState();

  let saveTimer, lastSaveOk = true;
  const statusEl = $('#saveStatus');
  function setStatus(state) {
    statusEl.dataset.state = state;
    statusEl.textContent = { saving: 'Enregistrement…', saved: 'Enregistré', error: 'Non enregistré' }[state];
    statusEl.title = state === 'saved' ? 'Enregistré sur cet appareil, dans ce navigateur' : '';
  }
  function queueSave() { setStatus('saving'); clearTimeout(saveTimer); saveTimer = setTimeout(save, 350); }
  function save() {
    saveTimer = null;
    const ok = saveState(data, settings);
    setStatus(ok ? 'saved' : 'error');
    if (!ok && lastSaveOk) toast('Sauvegarde impossible : le stockage du navigateur est plein ou bloqué. Utilise « Sauvegarder » pour garder un fichier.', 'error');
    lastSaveOk = ok;
  }
  window.addEventListener('beforeunload', () => { if (saveTimer) { clearTimeout(saveTimer); save(); } });

  let toastTimer;
  function toast(msg, kind = 'info') {
    const t = $('#toast');
    t.textContent = msg; t.dataset.kind = kind; t.classList.add('is-visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('is-visible'), kind === 'error' ? 6000 : 3200);
  }


  /* =========================================================
     Preview: true-size A4 scaled to the panel, page breaks marked
     ========================================================= */
  const preview = $('#docPreview'), stage = $('#stage'), sizer = $('#sizer');
  const isLetter = () => settings.tab === 'lettre';
  let raf, pages = 1;

  function queueRender() { cancelAnimationFrame(raf); raf = requestAnimationFrame(renderDoc); }
  function renderDoc() {
    preview.innerHTML = isLetter() ? renderLetter(data, settings) : renderCv(data, settings);
    $('#docTitle').innerHTML = `${isLetter() ? 'Lettre de motivation' : 'CV'}<span>${esc(TEMPLATES[settings.template].name)}</span>`;
    $('#pdfLabel').textContent = isLetter() ? 'la lettre' : 'PDF';
    fitPreview();
    updateProgress();
    renderTips();
  }

  function fitPreview() {
    const page = preview.firstElementChild;
    const avail = stage.clientWidth - 8;
    if (!page || avail <= 0) return;
    const scale = Math.min(1, avail / page.offsetWidth);
    preview.style.transform = `scale(${scale})`;
    pages = T.paginate(page);
    sizer.style.width = `${page.offsetWidth * scale}px`;
    sizer.style.height = `${page.offsetHeight * scale}px`;
    $$('.page-break', sizer).forEach(el => el.remove());
    for (let k = 1; k < pages; k++) {
      sizer.insertAdjacentHTML('beforeend', `<div class="page-break no-print" style="top:${k * A4_H * scale}px"><span>Page ${k + 1}</span></div>`);
    }
    $('#pageCount').textContent = plural(pages, 'page', 'pages');
  }
  new ResizeObserver(() => { fitPreview(); scaleThumbs(); }).observe(stage);
  document.fonts?.ready.then(() => { fitPreview(); renderTips(); });

  T.setPrintSource(() => (isLetter() ? renderLetter(data, settings) : renderCv(data, settings)));

  const CHECKS = [
    d => d.fullName.trim(), d => d.jobTitle.trim(), d => d.email.trim() || d.phone.trim(), d => d.profil.trim(),
    d => d.experiences.some(isFilled) || d.projets.some(isFilled), d => d.formations.some(isFilled),
    d => d.competences.some(isFilled), d => d.langues.some(isFilled)
  ];
  function updateProgress() {
    const pct = Math.round(CHECKS.filter(c => c(data)).length / CHECKS.length * 100);
    $('#progressFill').style.transform = `scaleX(${pct / 100})`;
    $('#progressText').textContent = pct === 100 ? 'Complet' : `${pct} %`;
    $('#progressText').title = `CV complété à ${pct} %`;
  }


  function renderTips() {
    const t = analyze(data);
    $$('[data-tips]').forEach(el => {
      const list = t[el.dataset.tips] || [];
      el.innerHTML = list.map(m => `<p class="tip">${icon('alert')}<span>${m}</span></p>`).join('');
    });
    $$('[data-badge]').forEach(el => {
      const n = (t[el.dataset.badge] || []).length;
      el.hidden = !n;
      el.textContent = plural(n, 'conseil', 'conseils');
    });
    const pageTip = !isLetter() && pages > 2;
    const total = Object.entries(t).filter(([k]) => (k === 'lettre') === isLetter()).reduce((n, [, v]) => n + v.length, 0) + (pageTip ? 1 : 0);
    const btn = $('#tipsBtn');
    btn.hidden = !total;
    btn.textContent = plural(total, 'conseil', 'conseils');
    btn.dataset.pageTip = pageTip ? '1' : '';
  }

  function jumpToTips() {
    const target = isLetter() ? $('#panel-lettre [data-tips="lettre"]:not(:empty)') : $('#panel-contenu [data-tips]:not(:empty)');
    if (!target) {
      if ($('#tipsBtn').dataset.pageTip) toast(`Ton CV fait ${pages} pages : vise 1 page, 2 au maximum. Essaie la densité « Serré » ou le modèle Compact.`);
      return;
    }
    showView('edit');
    if (!isLetter() && settings.tab !== 'contenu') setTab('contenu');
    const card = target.closest('details');
    if (card) card.open = true;
    target.scrollIntoView({ block: 'center' });
    (card ? card.querySelector('summary') : target).focus({ preventScroll: true });
  }

  /* =========================================================
     Editor: Contenu
     ========================================================= */
  const field = (key, label, { type = 'text', ph = '', help = '', rows = 3, wide = false, auto = 'off' } = {}) => {
    const id = `f-${key}`, describe = help ? ` aria-describedby="${id}-help"` : '';
    const control = type === 'textarea'
      ? `<textarea id="${id}" data-field="${key}" rows="${rows}" placeholder="${esc(ph)}"${describe}></textarea>`
      : `<input type="${type}" id="${id}" data-field="${key}" placeholder="${esc(ph)}" autocomplete="${auto}"${describe}>`;
    return `<div class="field${wide ? ' field--wide' : ''}"><label for="${id}">${label}</label>${control}${help ? `<span class="help" id="${id}-help">${help}</span>` : ''}</div>`;
  };

  const phNote = '<p class="ph-note">Remplace les passages entre crochets, comme <code>[X]</code>, par tes vraies informations.</p>';
  function profilAssist() {
    const dom = DOMAINS[settings.domain];
    return `<details class="assist" id="assist-profil"><summary>${icon('pen')}Idées de profil · ${esc(dom.name)}</summary>
      <div class="assist__body"><div class="suggest">${dom.profils.map(p =>
        `<button type="button" data-insert="f-profil" data-mode="replace" data-text="${esc(p)}">${esc(p)}</button>`).join('')}</div>${phNote}</div></details>`;
  }
  const CARDS = [
    { id: 'identite', title: 'Identité', hint: 'Photo, nom, contact', body: () => `
      <div class="photo-row">
        <div class="photo-thumb" id="photoThumb"></div>
        <div class="photo-actions">
          <label class="btn btn--sm" for="photoInput">Choisir une photo</label>
          <input type="file" id="photoInput" class="sr-only" accept="image/*">
          <button type="button" class="btn btn--sm btn--ghost btn--danger" id="photoRemove" hidden>Retirer</button>
          <p class="help">Facultative. Elle est redimensionnée et ne quitte jamais ton appareil.</p>
        </div>
      </div>
      <div class="grid-2">
        ${field('fullName', 'Prénom et nom', { ph: 'Sophie Martin', auto: 'name' })}
        ${field('jobTitle', 'Titre professionnel', { ph: 'Vendeuse conseil', auto: 'organization-title' })}
        ${field('email', 'Email', { type: 'email', ph: 'prenom.nom@email.fr', auto: 'email' })}
        ${field('phone', 'Téléphone', { type: 'tel', ph: '06 12 34 56 78', auto: 'tel' })}
        ${field('address', 'Ville', { ph: 'Lyon', auto: 'address-level2' })}
        ${field('website', 'Site ou LinkedIn', { ph: 'linkedin.com/in/…', auto: 'url' })}
      </div>` },
    { id: 'profil', title: 'Profil & objectif', hint: 'Ton accroche', body: () =>
      field('profil', 'Profil', { type: 'textarea', rows: 4, ph: 'Qui tu es, ce que tu apportes, ce que tu cherches.' }) + profilAssist()
      + field('objectif', 'Objectif', { type: 'textarea', rows: 2, ph: 'Le poste ou le contrat que tu vises, et à partir de quand.' }) },
    { id: 'experiences', list: 'experiences', title: 'Expérience professionnelle', hint: 'Stages, jobs, missions' },
    { id: 'formations', list: 'formations', title: 'Formation', hint: 'Du plus récent au plus ancien' },
    { id: 'competences', list: 'competences', title: 'Compétences', hint: '6 à 10 suffisent' },
    { id: 'langues', list: 'langues', title: 'Langues' },
    { id: 'projets', list: 'projets', title: 'Projets', hint: 'Perso, école, freelance', optional: true },
    { id: 'certifications', list: 'certifications', title: 'Certifications', hint: 'TOEIC, CACES, SST…', optional: true },
    { id: 'benevolat', list: 'benevolat', title: 'Engagement bénévole', hint: 'Associations, sport', optional: true },
    { id: 'interets', title: 'Centres d’intérêt', optional: true, body: () =>
      field('interets', 'Centres d’intérêt', { type: 'textarea', rows: 2, ph: 'Football en club, photographie, cuisine', help: 'Sépare-les par des virgules. Les plus précis marquent le plus.' }) },
    { id: 'infos', title: 'Permis & disponibilité', optional: true, body: () => `<div class="grid-2">
      ${field('permis', 'Permis', { ph: 'Permis B, véhiculé' })}${field('disponibilite', 'Disponibilité', { ph: 'Immédiate' })}</div>` },
    { id: 'references', list: 'references', title: 'Références', hint: 'Avec leur accord', optional: true },
    { id: 'custom', list: 'custom', title: 'Sections libres', hint: 'Le titre de ton choix', optional: true }
  ];

  const cardHasContent = c => c.list ? data[c.list].length > 0 : c.id === 'interets' ? data.interets.trim() : (data.permis.trim() || data.disponibilite.trim());

  function renderContentPanel() {
    const domains = Object.entries(DOMAINS).map(([k, v]) => `<option value="${k}"${k === settings.domain ? ' selected' : ''}>${esc(v.name)}</option>`).join('');
    $('#panel-contenu').innerHTML = `
      <div class="domain-row">
        <label for="domain">Ton domaine</label>
        <select id="domain">${domains}</select>
        <span class="help">Il sert aux idées de phrases et de missions proposées dans le profil et les expériences.</span>
      </div>
      ${CARDS.map((c, i) => `
        <details class="card" id="card-${c.id}"${!c.optional || cardHasContent(c) ? ' open' : ''}>
          <summary><span class="card__num">${i + 1}</span><span class="card__title">${c.title}</span>
            <span class="card__meta"><span class="card__badge" data-badge="${c.id}" hidden></span>${c.hint ? `<span class="card__hint">${c.hint}</span>` : ''}<svg class="i card__chev" aria-hidden="true"><use href="#i-down"/></svg></span>
          </summary>
          <div class="card__body">
            ${guideFor(c.id)}
            ${c.list ? `${suggestFor(c.list)}<div class="list" id="list-${c.list}"></div>
              <button type="button" class="btn btn--sm add-btn" data-action="add" data-list="${c.list}">${icon('plus')}${LISTS[c.list].add}</button>` : c.body()}
            <div class="tips" data-tips="${c.id}"></div>
          </div>
        </details>`).join('')}`;
    Object.keys(LISTS).forEach(renderList);
    renderPhoto();
  }

  const GUIDE_KEY = { profil: 'accroche' };
  const MAIN_CARDS = ['identite', 'profil', 'experiences', 'formations', 'competences', 'langues'];
  const guideFor = id => (MAIN_CARDS.includes(id) ? T.guideHtml(GUIDE_KEY[id] || id) : '');
  const suggestFor = list => (list === 'competences' || list === 'langues' ? T.suggestHtml(list, settings.domain, data) : '');

  function renderList(list) {
    const el = document.getElementById(`list-${list}`);
    if (el) el.innerHTML = T.listHtml(list, data[list], settings.domain);
    const chips = document.getElementById(`suggest-${list}`);
    if (chips) chips.outerHTML = suggestFor(list);
  }

  function renderPhoto() {
    const thumb = $('#photoThumb');
    if (!thumb) return;
    thumb.innerHTML = data.photo ? `<img src="${esc(data.photo)}" alt="Ta photo">` : icon('user');
    $('#photoRemove').hidden = !data.photo;
  }

  function fillFields() {
    $$('[data-field]').forEach(el => { el.value = data[el.dataset.field]; });
    $$('[data-letter]').forEach(el => { el.value = data.letter[el.dataset.letter]; });
  }

  /* =========================================================
     Editor: Design
     ========================================================= */
  function renderDesignPanel() {
    $('#panel-design').innerHTML = `
      <p class="panel__intro">Ces réglages s’appliquent à ton CV et à ta lettre de motivation.</p>
      <h2 class="section-title">Modèle</h2>
      <div class="tpl-grid" id="tplGrid">${Object.entries(TEMPLATES).map(([id, t]) => `
        <button type="button" class="tpl-card" data-template="${id}" aria-pressed="${id === settings.template}">
          <span class="tpl-card__thumb" aria-hidden="true"><span class="tpl-card__page" data-thumb="${id}"></span></span>
          <span><span class="tpl-card__name">${esc(t.name)}</span><br><span class="tpl-card__desc">${esc(t.desc)}</span></span>
        </button>`).join('')}</div>

      <h2 class="section-title">Couleur d’accent</h2>
      <div class="design-block">
        <div class="swatches" role="group" aria-label="Couleur d’accent">
          <button type="button" class="swatch swatch--default" data-set="accent" data-value="" id="swatchDefault" title="Couleur du modèle" aria-label="Couleur du modèle"></button>
          ${ACCENTS.map(c => `<button type="button" class="swatch" style="background:${c}" data-set="accent" data-value="${c}" aria-label="Couleur ${c}" title="${c}"></button>`).join('')}
          <label class="swatch-custom" id="swatchCustom" title="Couleur personnalisée">${icon('plus')}<input type="color" data-set="accent-custom" aria-label="Couleur personnalisée"></label>
        </div>
        <p class="help">Sur les modèles à fond sombre, préfère une couleur claire et vive.</p>
      </div>

      <h2 class="section-title">Police</h2>
      <div class="font-grid" role="group" aria-label="Police">${Object.entries(FONTS).map(([k, f]) => `
        <button type="button" class="choice" data-set="font" data-value="${k}">
          <span class="choice__sample" style="font-family:${esc(f.head || 'var(--f-ui)')}">${f.sample}</span><span class="choice__name">${esc(f.name)}</span>
        </button>`).join('')}</div>

      <h2 class="section-title">Mise en page</h2>
      <div class="design-block">
        <div class="row"><span class="label" id="lbl-density">Densité</span>
          <div class="segmented" role="group" aria-labelledby="lbl-density">${Object.entries(DENSITIES).map(([k, v]) => `<button type="button" data-set="density" data-value="${k}">${v.name}</button>`).join('')}<button type="button" data-set="density" data-value="fit">1 page</button></div></div>
        <div class="row"><span class="label" id="lbl-levels">Niveaux des compétences et langues</span>
          <div class="segmented" role="group" aria-labelledby="lbl-levels">${Object.entries(LEVEL_STYLES).map(([k, v]) => `<button type="button" data-set="levels" data-value="${k}">${v}</button>`).join('')}</div></div>
        <p class="help" id="levelsHelp"></p>
      </div>

      <h2 class="section-title">Sections</h2>
      <p class="panel__intro">Coche pour afficher une section, utilise les flèches pour changer l’ordre. Une section vide n’apparaît jamais.</p>
      <div class="sec-list" id="secList"></div>`;
    renderSecList();
    updateDesignState();
  }

  function renderSecList() {
    const side = TEMPLATES[settings.template].side;
    $('#secList').innerHTML = settings.order.map((k, i) => {
      const on = !settings.hidden.includes(k), title = SECTIONS[k].title;
      return `<div class="sec-row${on ? '' : ' is-off'}">
        <label><input type="checkbox" data-sec-toggle="${k}"${on ? ' checked' : ''}>${title}</label>
        ${side && SECTIONS[k].side ? '<span class="sec-row__where">colonne latérale</span>' : ''}
        <button type="button" class="icon-btn" data-sec-move="up" data-key="${k}" aria-label="Monter : ${title}"${i === 0 ? ' disabled' : ''}>${icon('up')}</button>
        <button type="button" class="icon-btn" data-sec-move="down" data-key="${k}" aria-label="Descendre : ${title}"${i === settings.order.length - 1 ? ' disabled' : ''}>${icon('down')}</button>
      </div>`;
    }).join('');
  }

  function updateDesignState() {
    const t = TEMPLATES[settings.template];
    $$('[data-template]').forEach(b => b.setAttribute('aria-pressed', b.dataset.template === settings.template));
    $$('[data-set][data-value]').forEach(b => b.setAttribute('aria-pressed', settings[b.dataset.set] === b.dataset.value));
    $('#swatchDefault').style.setProperty('--sw-a', t.accent);
    const custom = settings.accent && !ACCENTS.includes(settings.accent);
    $('#swatchCustom').classList.toggle('is-active', !!custom);
    $('#swatchCustom').style.background = custom ? settings.accent : '';
    $('[data-set="accent-custom"]').value = settings.accent || t.accent;
    $('#levelsHelp').textContent = t.forceLevels
      ? 'Le modèle ATS affiche toujours les niveaux en texte : c’est ce que lisent les logiciels de recrutement.'
      : 'Le texte est le plus clair pour un recruteur. Points et barres restent des auto-évaluations.';
  }

  let thumbTimer;
  function queueThumbs() { clearTimeout(thumbTimer); thumbTimer = setTimeout(renderThumbs, 250); }
  function renderThumbs() {
    if (settings.tab !== 'design') return;
    const sample = hasContent(data) ? data : normalize(EXAMPLE);
    $$('[data-thumb]').forEach(el => { el.innerHTML = renderCv(sample, { ...settings, template: el.dataset.thumb }); });
    scaleThumbs();
  }
  function scaleThumbs() {
    $$('[data-thumb]').forEach(el => {
      const w = el.parentElement.clientWidth;
      if (w) el.style.transform = `scale(${w / A4_W})`;
    });
  }

  /* =========================================================
     Editor: Lettre
     ========================================================= */
  function renderLetterPanel() {
    const lf = (key, label, opts = {}) => {
      const id = `l-${key}`, ph = esc(opts.ph || '');
      const control = opts.type === 'textarea'
        ? `<textarea id="${id}" data-letter="${key}" rows="${opts.rows || 3}" placeholder="${ph}"></textarea>`
        : opts.type === 'select'
          ? `<select id="${id}" data-letter="${key}">${opts.options.map(o => `<option>${esc(o)}</option>`).join('')}</select>`
          : `<input type="text" id="${id}" data-letter="${key}" placeholder="${ph}" autocomplete="off">`;
      return `<div class="field${opts.wide ? ' field--wide' : ''}"><label for="${id}">${label}</label>${control}${opts.help ? `<span class="help">${opts.help}</span>` : ''}</div>`;
    };
    $('#panel-lettre').innerHTML = `
      <p class="panel__intro">Ta lettre reprend le modèle, les couleurs et l’en-tête de ton CV. Une page, trois paragraphes : ce qui t’attire chez eux, ce que tu apportes, la suite.</p>
      <h2 class="section-title">Destinataire</h2>
      <div class="design-block"><div class="grid-2">
        ${lf('poste', 'Poste visé', { ph: 'Vendeur conseil' })}
        ${lf('entreprise', 'Entreprise', { ph: 'Décathlon' })}
        ${lf('contact', 'Destinataire', { ph: 'Mme Dupont, Responsable RH' })}
        ${lf('lieu', 'Ta ville', { ph: 'Lille' })}
        ${lf('adresse', 'Adresse de l’entreprise', { type: 'textarea', rows: 2, ph: '4 boulevard de Mons\n59650 Villeneuve-d’Ascq', wide: true })}
        ${lf('date', 'Date', { ph: today(), help: 'Laisse vide pour la date du jour.' })}
        ${lf('objet', 'Objet', { ph: 'Candidature au poste de …', help: 'Laisse vide pour « Candidature au poste de » + le poste visé.' })}
      </div></div>
      <h2 class="section-title">Texte de la lettre</h2>
      <div class="design-block">
        <div class="row"><span class="help">Le brouillon reprend ton CV : poste, dernière expérience, compétences clés.</span>
          <button type="button" class="btn btn--sm" data-cmd="draft">${icon('pen')}Générer un brouillon</button></div>
        ${lf('appel', 'Formule d’appel', { ph: 'Madame, Monsieur,' })}
        ${lf('corps', 'Corps de la lettre', { type: 'textarea', rows: 14, ph: 'Sépare les paragraphes par une ligne vide.', wide: true })}
        ${lf('formule', 'Formule de politesse', { type: 'select', options: CLOSINGS })}
        <div class="tips" data-tips="lettre"></div>
      </div>`;
  }

  function draftLetter() {
    const L = data.letter;
    if (L.corps.trim() && !confirm('Remplacer le texte actuel de ta lettre par un brouillon ?')) return;
    L.corps = T.buildDraft(data);
    if (!L.poste.trim() && data.jobTitle.trim()) L.poste = data.jobTitle.trim();
    fillFields();
    changed();
    toast('Brouillon prêt : complète les passages entre crochets');
    $('#l-corps').focus();
  }

  /* =========================================================
     Events
     ========================================================= */
  function changed() { queueSave(); queueRender(); if (settings.tab === 'design') queueThumbs(); }

  const editor = $('#editor');
  editor.addEventListener('input', e => {
    const t = e.target, ds = t.dataset;
    if (T.applyInput(t, data)) { /* data field */ }
    else if (ds.set === 'accent-custom') { settings.accent = t.value.toLowerCase(); updateDesignState(); }
    else if (ds.secToggle) {
      settings.hidden = t.checked ? settings.hidden.filter(k => k !== ds.secToggle) : [...settings.hidden, ds.secToggle];
      t.closest('.sec-row').classList.toggle('is-off', !t.checked);
    } else if (t.id === 'domain') {
      settings.domain = t.value;
      $('#assist-profil').outerHTML = profilAssist();
      renderList('experiences');
      renderList('competences');
    } else return;
    changed();
  });

  editor.addEventListener('change', async e => {
    if (e.target.id !== 'photoInput') return;
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast('Choisis une image (JPG, PNG, WebP…).', 'error');
    try { data.photo = await resizeImage(file, 600); renderPhoto(); changed(); toast('Photo ajoutée'); }
    catch { toast('Impossible de lire cette image. Essaie un JPG ou un PNG.', 'error'); }
  });

  function listAction(b) {
    const focus = T.listAction(b, data, renderList);
    if (!focus) return toast('Ce n’est pas possible ici.');
    focus()?.focus();
    changed();
  }

  function addSuggestion(b) {
    if (!T.addSuggestion(b.dataset.add, b.dataset.text, data)) return;
    renderList(b.dataset.add);
    changed();
    toast(`« ${b.dataset.text} » ajouté`);
  }

  async function fitPage() {
    const r = await T.fitOnePage(data, settings);
    settings.density = 'fit';
    settings.fitD = r.fitD;
    updateDesignState(); changed();
    toast(r.pages === 1 ? 'Ton CV tient sur une page' : `Même resserré, ton CV fait ${r.pages} pages : raccourcis quelques descriptions.`);
  }

  function moveSection(b) {
    const k = b.dataset.key, i = settings.order.indexOf(k), j = b.dataset.secMove === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= settings.order.length) return;
    [settings.order[i], settings.order[j]] = [settings.order[j], settings.order[i]];
    renderSecList();
    const same = $(`[data-sec-move="${b.dataset.secMove}"][data-key="${k}"]`);
    (same && !same.disabled ? same : $(`[data-sec-toggle="${k}"]`)).focus();
    changed();
  }

  function setTab(tab, focus = false, persist = true) {
    settings.tab = tab;
    TABS.forEach(t => {
      const btn = $(`#tab-${t}`), on = t === tab;
      btn.setAttribute('aria-selected', on);
      btn.tabIndex = on ? 0 : -1;
      $(`#panel-${t}`).hidden = !on;
    });
    if (focus) $(`#tab-${tab}`).focus();
    renderDoc();
    if (tab === 'design') renderThumbs();
    if (persist) queueSave();
  }
  $('.editor__tabs').addEventListener('keydown', e => {
    const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!dir) return;
    e.preventDefault();
    setTab(TABS[(TABS.indexOf(settings.tab) + dir + TABS.length) % TABS.length], true);
  });

  function showView(view) {
    document.body.dataset.view = view;
    $$('.view-tabs [data-view]').forEach(t => t.setAttribute('aria-selected', t.dataset.view === view));
    if (view === 'preview') fitPreview();
  }

  document.addEventListener('click', e => {
    const el = e.target.closest('button, [data-template]');
    if (!el || el.disabled) return;
    const ds = el.dataset;
    if (ds.cmd) COMMANDS[ds.cmd]();
    else if (ds.tab) setTab(ds.tab);
    else if (ds.view) showView(ds.view);
    else if (ds.template) {
      settings.template = ds.template;
      updateDesignState(); renderSecList(); changed();
    } else if (ds.set === 'density' && ds.value === 'fit') fitPage();
    else if (ds.set && 'value' in ds) {
      settings[ds.set] = ds.value;
      updateDesignState(); changed();
    } else if (ds.secMove) moveSection(el);
    else if (ds.action) listAction(el);
    else if (ds.add) addSuggestion(el);
    else if (ds.insert) { const target = document.getElementById(ds.insert); if (target) T.insertText(target, ds.text, ds.mode); }
    else if (el.id === 'tipsBtn') jumpToTips();
    else if (el.id === 'photoRemove') { data.photo = ''; renderPhoto(); changed(); $('#photoInput').focus(); }
  });


  /* =========================================================
     Commands
     ========================================================= */
  function replaceData(next) {
    data = normalize(next);
    renderContentPanel(); renderLetterPanel(); fillFields();
    clearTimeout(saveTimer); save();
    renderDoc(); renderThumbs();
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ app: 'TrouveToiUnTaf', version: 3, settings, data }, null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `CV-${T.fileSlug(data)}.json`
    });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Sauvegarde téléchargée');
  }

  $('#importInput').addEventListener('change', async e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) return toast('Fichier trop volumineux.', 'error');
    try {
      const parsed = JSON.parse(await file.text());
      const payload = parsed && parsed.data ? parsed.data : parsed;
      if (!payload || typeof payload !== 'object' || !TEXT_FIELDS.some(k => k in payload)) throw new Error('shape');
      if (hasContent(data) && !confirm('Remplacer ton CV actuel par celui du fichier ?')) return;
      const tab = settings.tab;
      if (parsed.settings) settings = normalizeSettings({ ...parsed.settings, tab });
      else if (TEMPLATES[parsed.template]) settings.template = parsed.template;
      renderDesignPanel();
      replaceData(payload);
      toast('CV importé');
    } catch { toast('Ce fichier n’est pas une sauvegarde TrouveToiUnTaf valide.', 'error'); }
  });

  function exportPdf() {
    clearTimeout(saveTimer); save();
    T.printDoc(`${isLetter() ? 'Lettre' : 'CV'} - ${data.fullName.trim() || 'TrouveToiUnTaf'}`);
  }

  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    const btn = $('#themeBtn'), dark = t === 'dark';
    btn.innerHTML = icon(dark ? 'sun' : 'moon');
    btn.setAttribute('aria-label', dark ? 'Activer le thème clair' : 'Activer le thème sombre');
    btn.title = btn.getAttribute('aria-label');
  }

  const COMMANDS = {
    example: () => {
      if (hasContent(data) && !confirm('Remplacer ton CV actuel par l’exemple ?')) return;
      replaceData({ ...EXAMPLE, photo: data.photo });
      toast('Exemple chargé : modifie-le à ta sauce');
    },
    import: () => $('#importInput').click(),
    export: exportJson,
    clear: () => {
      if (!hasContent(data) || !confirm('Tout effacer (CV et lettre) ? Pense à « Sauvegarder » avant si tu veux garder une copie.')) return;
      replaceData(blankData());
      toast('CV effacé');
    },
    theme: () => {
      const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      store.set(KEYS.theme, t); store.del('darkMode');
      applyTheme(t);
    },
    pdf: exportPdf,
    draft: draftLetter
  };

  /* =========================================================
     Boot
     ========================================================= */
  $('#year').textContent = new Date().getFullYear();
  applyTheme(document.documentElement.dataset.theme);
  renderContentPanel();
  renderDesignPanel();
  renderLetterPanel();
  fillFields();
  setTab(settings.tab, false, false);
  setStatus('saved');
})();
