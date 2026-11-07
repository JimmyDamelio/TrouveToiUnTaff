(() => {
  'use strict';
  const C = window.TTU_CONTENT, T = window.TTU;
  const { TEMPLATES, FONTS, ACCENTS, DENSITIES, LEVEL_STYLES, DOMAINS, CLOSINGS, EXAMPLE } = C;
  const { esc, icon, store, isFilled, hasContent, plural, today, A4_W, A4_H, LISTS } = T;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // GSAP drives the interface motion; without it (or with reduced motion) everything is simply shown.
  const G = () => (window.gsap && !reduced() ? window.gsap : null);
  // Text colour on an ink: whichever of white and night indigo has the higher WCAG contrast.
  const lum = hex => {
    const n = parseInt(hex.slice(1), 16);
    return [16, 8, 0].map(s => ((n >> s) & 255) / 255).map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
      .reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0);
  };
  const onInk = hex => (1.05 / (lum(hex) + 0.05) >= (lum(hex) + 0.05) / (lum('#17123B') + 0.05) ? '#FFFFFF' : '#17123B');

  let { data, settings } = T.loadState();
  const BOOK_KEY = 'bookState', INTRO_KEY = 'introSeen';
  let book = { doc: 'cv', cv: 0, lettre: 0 };
  try { book = { ...book, ...JSON.parse(store.get(BOOK_KEY) || '{}') }; } catch { /* keep defaults */ }
  if (!['cv', 'lettre'].includes(book.doc)) book.doc = 'cv';

  /* =========================================================
     Chapters (inks from design/MASTER.md)
     ========================================================= */
  const CV = [
    { id: 'photo', title: 'Ta photo', ink: '#FF5A5F', skip: 'Je préfère sans photo', lead: 'Une photo, ou pas : c’est toi qui décides. Tu pourras toujours l’ajouter à la fin.' },
    { id: 'identite', title: 'Qui es-tu ?', ink: '#5B2EFF', lead: 'Ton nom, le poste que tu vises et comment te joindre.' },
    { id: 'accroche', title: 'Ton accroche', ink: '#D9338A', lead: 'Deux ou trois phrases qui donnent envie de lire la suite.' },
    { id: 'experiences', title: 'Tes expériences', ink: '#1F6BFF', lead: 'Tes jobs, stages et missions, du plus récent au plus ancien.' },
    { id: 'formations', title: 'Ta formation', ink: '#13A35A', lead: 'Tes diplômes et formations utiles pour le poste.' },
    { id: 'competences', title: 'Tes compétences', ink: '#7BC71E', lead: 'Ce que tu sais faire concrètement. Clique sur une idée pour l’ajouter.' },
    { id: 'langues', title: 'Tes langues', ink: '#00A6B8', lead: 'Les langues que tu parles, avec ton vrai niveau.' },
    { id: 'bonus', title: 'Les petits plus', ink: '#FF7A1A', skip: 'Passer cette étape', lead: 'Projets, certifications, bénévolat, permis : tout ce qui peut faire la différence. Rien d’obligatoire.' },
    { id: 'modele', title: 'Ton modèle', ink: '#FFC21A', lead: 'Ouvre les boîtes et choisis l’habit de ton CV. Tu peux en changer à tout moment.' },
    { id: 'finitions', title: 'Les finitions', ink: '#F0386B', lead: 'Couleur, police et mise en page. Une touche suffit.' },
    { id: 'fin', title: 'C’est prêt', ink: '#5B2EFF', lead: '' }
  ];
  const LETTRE = [
    { id: 'toi', title: 'Qui es-tu ?', ink: '#5B2EFF', lead: 'Tes coordonnées, reprises en haut de la lettre. Si tu as déjà fait ton CV, elles sont déjà là.' },
    { id: 'destinataire', title: 'À qui écris-tu ?', ink: '#1F6BFF', lead: 'L’entreprise, la personne et le poste visé.' },
    { id: 'texte', title: 'Ta lettre', ink: '#D9338A', lead: 'Trois paragraphes courts. Le brouillon part de ton CV, il ne te reste qu’à le personnaliser.' },
    { id: 'modele', title: 'Ton modèle', ink: '#FFC21A', lead: 'Le même habit que ton CV, pour une candidature cohérente.' },
    { id: 'fin', title: 'C’est prêt', ink: '#5B2EFF', lead: '' }
  ];
  const chapters = () => (book.doc === 'cv' ? CV : LETTRE);
  const isLetter = () => book.doc === 'lettre';
  const idx = () => Math.min(book[book.doc] || 0, chapters().length - 1);
  // Where the live advice of each data area is shown.
  const TIP_CHAPTER = { identite: 'identite', profil: 'accroche', experiences: 'experiences', competences: 'competences', references: 'bonus', lettre: 'texte' };

  /* =========================================================
     Persistence and feedback
     ========================================================= */
  let saveTimer, lastSaveOk = true;
  const statusEl = $('#saveStatus');
  function setStatus(state) {
    statusEl.dataset.state = state;
    statusEl.textContent = { saving: 'Enregistrement…', saved: 'Enregistré', error: 'Non enregistré' }[state];
  }
  function save() {
    saveTimer = null;
    const ok = T.saveState(data, settings);
    store.set(BOOK_KEY, JSON.stringify(book));
    setStatus(ok ? 'saved' : 'error');
    if (!ok && lastSaveOk) toast('Sauvegarde impossible : le stockage du navigateur est plein ou bloqué.', 'error');
    lastSaveOk = ok;
  }
  function queueSave() { setStatus('saving'); clearTimeout(saveTimer); saveTimer = setTimeout(save, 350); }
  window.addEventListener('beforeunload', () => { if (saveTimer) { clearTimeout(saveTimer); save(); } });

  let toastTimer;
  function toast(msg, kind = 'info') {
    const t = $('#toast');
    t.textContent = msg; t.dataset.kind = kind; t.classList.add('is-visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('is-visible'), kind === 'error' ? 6000 : 3200);
  }

  /* =========================================================
     Screens
     ========================================================= */
  function showScreen(id) {
    const next = $(`#${id}`);
    $$('.screen').forEach(s => { if (s !== next) s.hidden = true; });
    next.hidden = false;
    $('#siteFooter').hidden = id === 'book';
    G()?.from(next, { autoAlpha: 0, y: 12, duration: 0.32, ease: 'power2.out', clearProps: 'transform,opacity,visibility' });
    window.scrollTo(0, 0);
  }

  /* ---------- Intro, played on the welcome screen ---------- */
  let introTl = null;
  function playIntro() {
    const title = $('#welcomeTitle');
    title.innerHTML = [...'Bienvenue.'].map(ch => `<span aria-hidden="true">${ch}</span>`).join('');
    const g = G();
    if (!g) return;
    const skip = $('#skipIntro');
    skip.hidden = false;
    const tl = introTl = g.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { skip.hidden = true; } });
    if (store.get(INTRO_KEY) === '1') tl.timeScale(2.4);
    store.set(INTRO_KEY, '1');
    tl.from('#introSheet', { y: -40, rotation: -8, autoAlpha: 0, duration: 0.72, transformOrigin: '50% 60%' }, 0)
      .from('#introSheet .ln', { strokeDashoffset: 1, duration: 0.38, stagger: 0.09, ease: 'power2.out' }, 0.42)
      .from('#introSheet .ink', { strokeDashoffset: 1, duration: 0.7, ease: 'power2.inOut' }, 1.15)
      .from('#introBrand', { y: 14, autoAlpha: 0, duration: 0.4 }, 0.25)
      .from('#welcomeTitle span', { yPercent: 70, rotation: 10, autoAlpha: 0, duration: 0.5, stagger: 0.045, ease: 'back.out(2.2)' }, 0.75)
      .from('#introLead', { y: 14, autoAlpha: 0, duration: 0.42 }, 1.45)
      .from('#introQ', { y: 14, autoAlpha: 0, duration: 0.42 }, 1.8)
      .fromTo('#introQ .hl', { '--hl': 0 }, { '--hl': 1, duration: 0.45, ease: 'power2.out' }, 2.1)
      .from('#introActions > *', { y: 16, autoAlpha: 0, duration: 0.4, stagger: 0.08, ease: 'back.out(1.8)' }, 2.15);
    // The 3D sheets replace the drawn one once Three.js has loaded.
    window.TTU_SCENE?.start($('#scene'), $('.welcome__art')).then(ok => {
      if (!ok || $('#welcome').hidden) { if (ok) window.TTU_SCENE.stop(); return; }
      $('.welcome').classList.add('is-3d');
      $('#scene').classList.add('is-on');
    });
  }
  function skipIntro() {
    introTl?.progress(1);
    $('#skipIntro').hidden = true;
    $('[data-go="yes"]').focus();
  }
  function leaveWelcome() {
    const sc = window.TTU_SCENE, el = $('#scene');
    introTl?.progress(1);
    if (!sc?.active) return 0;
    el.classList.add('is-leaving');
    sc.leave().then(() => { el.classList.remove('is-on', 'is-leaving'); });
    return 0.45;
  }

  function openChoice() {
    const resume = (doc, list) => {
      const i = book[doc] || 0;
      return i > 0 ? `Reprendre au chapitre ${i + 1} : ${list[Math.min(i, list.length - 1)].title}` : '';
    };
    $('#resumeCv').textContent = resume('cv', CV);
    $('#resumeLettre').textContent = resume('lettre', LETTRE);
    const delay = $('#welcome').hidden ? 0 : leaveWelcome();
    showScreen('choice');
    $('#choiceTitle').focus();
    const g = G();
    if (g) {
      g.from('.doc-choice__eyebrow, #choiceTitle', { y: 22, autoAlpha: 0, duration: 0.45, stagger: 0.07, delay, ease: 'power3.out', clearProps: 'transform,opacity,visibility' });
      g.from('.doc-card', { y: 46, rotation: i => (i ? 3 : -3), autoAlpha: 0, duration: 0.55, stagger: 0.1, delay: delay + 0.15, ease: 'back.out(1.6)', clearProps: 'transform,opacity,visibility' });
      g.from('.doc-choice__more', { autoAlpha: 0, duration: 0.4, delay: delay + 0.45, clearProps: 'opacity,visibility' });
    }
  }

  function openBook(doc) {
    book.doc = doc;
    showScreen('book');
    renderToc();
    renderChapter(0);
    renderDoc();
    queueSave();
  }

  /* =========================================================
     Chapter content
     ========================================================= */
  const field = (key, label, { type = 'text', ph = '', help = '', rows = 3, auto = 'off', wide = false } = {}) => {
    const id = `f-${key}`;
    const control = type === 'textarea'
      ? `<textarea id="${id}" data-field="${key}" rows="${rows}" placeholder="${esc(ph)}">${esc(data[key])}</textarea>`
      : `<input type="${type}" id="${id}" data-field="${key}" value="${esc(data[key])}" placeholder="${esc(ph)}" autocomplete="${auto}">`;
    return `<div class="field${wide ? ' field--wide' : ''}"><label for="${id}">${label}</label>${control}${help ? `<span class="help">${help}</span>` : ''}</div>`;
  };
  const letterField = (key, label, { type = 'text', ph = '', help = '', rows = 3, wide = false, options } = {}) => {
    const id = `l-${key}`, v = data.letter[key];
    const control = type === 'textarea'
      ? `<textarea id="${id}" data-letter="${key}" rows="${rows}" placeholder="${esc(ph)}">${esc(v)}</textarea>`
      : type === 'select'
        ? `<select id="${id}" data-letter="${key}">${options.map(o => `<option${o === v ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`
        : `<input type="text" id="${id}" data-letter="${key}" value="${esc(v)}" placeholder="${esc(ph)}" autocomplete="off">`;
    return `<div class="field${wide ? ' field--wide' : ''}"><label for="${id}">${label}</label>${control}${help ? `<span class="help">${help}</span>` : ''}</div>`;
  };
  const listBlock = list => `${T.suggestHtml(list, settings.domain, data)}<div class="list" id="list-${list}">${T.listHtml(list, data[list], settings.domain)}</div>
    <button type="button" class="btn btn--sm add-btn" data-action="add" data-list="${list}">${icon('plus')}${LISTS[list].add}</button>`;
  const domainSelect = () => `<div class="field"><label for="domain">Ton domaine</label><select id="domain">${Object.entries(DOMAINS).map(([k, v]) =>
    `<option value="${k}"${k === settings.domain ? ' selected' : ''}>${esc(v.name)}</option>`).join('')}</select>
    <span class="help">Il sert à te proposer des phrases, des missions et des compétences adaptées.</span></div>`;
  const isPoly = () => data.cible === 'polyvalent';
  const profilIdeas = () => {
    const dom = DOMAINS[settings.domain];
    const ideas = isPoly() ? [...C.POLY_PROFILS, ...dom.profils] : dom.profils;
    return `<details class="assist" id="assist-profil" open><summary>${icon('pen')}Idées d’accroche · ${isPoly() ? 'CV polyvalent' : esc(dom.name)}</summary>
      <div class="assist__body"><div class="suggest">${ideas.map(p =>
        `<button type="button" data-insert="f-profil" data-mode="replace" data-text="${esc(p)}">${esc(p)}</button>`).join('')}</div>
      <p class="ph-note">Remplace les passages entre crochets, comme <code>[X]</code>, par tes vraies informations.</p></div></details>`;
  };
  const photoBlock = () => `<div class="photo-drop">
      <div class="photo-drop__frame">${data.photo ? `<img src="${esc(data.photo)}" alt="Ta photo">` : icon('camera')}</div>
      <div class="photo-drop__actions">
        <label class="btn btn--ch" for="photoInput">${data.photo ? 'Changer de photo' : 'Choisir une photo'}</label>
        ${data.photo ? '<button type="button" class="btn" data-cmd="photo-remove">Retirer</button>' : ''}
      </div>
      <p class="help">JPG ou PNG. Elle est redimensionnée automatiquement et ne quitte jamais ton appareil.</p>
    </div>`;
  const sub = (title, hint, body, open) => `<details class="subcard"${open ? ' open' : ''}><summary>${title}<span>${hint}</span></summary><div class="subcard__body">${body}</div></details>`;

  function swatches() {
    const t = TEMPLATES[settings.template];
    return `<div class="swatches" role="group" aria-label="Couleur d’accent">
      <button type="button" class="swatch swatch--default" style="--sw-a:${t.accent}" data-set="accent" data-value="" aria-pressed="${!settings.accent}" title="Couleur du modèle" aria-label="Couleur du modèle"></button>
      ${ACCENTS.map(c => `<button type="button" class="swatch" style="background:${c}" data-set="accent" data-value="${c}" aria-pressed="${settings.accent === c}" aria-label="Couleur ${c}" title="${c}"></button>`).join('')}
      <label class="swatch-custom${settings.accent && !ACCENTS.includes(settings.accent) ? ' is-active' : ''}" title="Couleur personnalisée">${icon('plus')}<input type="color" data-set="accent-custom" value="${settings.accent || t.accent}" aria-label="Couleur personnalisée"></label>
    </div>`;
  }
  const segmented = (set, entries, label) => `<div class="segmented" role="group" aria-label="${label}">${entries.map(([k, v]) =>
    `<button type="button" data-set="${set}" data-value="${k}" aria-pressed="${settings[set] === k}">${v}</button>`).join('')}</div>`;

  const BODY = {
    photo: () => photoBlock(),
    identite: () => `<div class="finish-row"><span class="label" id="lbl-cible">Ton CV vise…</span>
        <div class="segmented" role="group" aria-labelledby="lbl-cible">
          <button type="button" data-cible="poste" aria-pressed="${!isPoly()}">Un poste précis</button>
          <button type="button" data-cible="polyvalent" aria-pressed="${isPoly()}">Plusieurs postes (CV polyvalent)</button>
        </div></div>
      <div class="grid-2">
      ${field('fullName', 'Prénom et nom', { ph: 'Sophie Martin', auto: 'name' })}
      ${isPoly()
        ? field('jobTitle', 'Tes domaines (facultatif)', { ph: 'Vente · Accueil · Logistique', help: 'Laisse vide si tu préfères : ton CV reste impeccable sans titre.' })
        : field('jobTitle', 'Le poste que tu vises', { ph: 'Vendeuse conseil', auto: 'organization-title' })}
      ${field('email', 'Email', { type: 'email', ph: 'prenom.nom@email.fr', auto: 'email' })}
      ${field('phone', 'Téléphone', { type: 'tel', ph: '06 12 34 56 78', auto: 'tel' })}
      ${field('address', 'Ville', { ph: 'Lyon', auto: 'address-level2' })}
      ${field('website', 'LinkedIn ou site (facultatif)', { ph: 'linkedin.com/in/…', auto: 'url' })}
      </div>${domainSelect()}`,
    accroche: () => field('profil', 'Ton accroche', { type: 'textarea', rows: 5, ph: 'Qui tu es, ce que tu apportes, ce que tu cherches.' })
      + profilIdeas() + field('objectif', 'Ton objectif (facultatif)', { type: 'textarea', rows: 2, ph: isPoly() ? 'Les types de postes que tu vises (vente, accueil…), et à partir de quand.' : 'Le poste ou le contrat visé, et à partir de quand.' }),
    experiences: () => listBlock('experiences'),
    formations: () => listBlock('formations'),
    competences: () => listBlock('competences'),
    langues: () => listBlock('langues'),
    bonus: () => [
      sub('Projets', 'Perso, école, freelance', listBlock('projets'), data.projets.length),
      sub('Certifications', 'TOEIC, CACES, SST…', listBlock('certifications'), data.certifications.length),
      sub('Engagement bénévole', 'Associations, sport', listBlock('benevolat'), data.benevolat.length),
      sub('Permis et disponibilité', 'Souvent demandés', `<div class="grid-2">${field('permis', 'Permis', { ph: 'Permis B, véhiculé' })}${field('disponibilite', 'Disponibilité', { ph: 'Immédiate' })}</div>`, data.permis || data.disponibilite),
      sub('Centres d’intérêt', '3 ou 4, précis', field('interets', 'Centres d’intérêt', { type: 'textarea', rows: 2, ph: 'Football en club, photographie, cuisine', help: 'Sépare-les par des virgules.' }), data.interets.trim()),
      sub('Références', 'Avec leur accord', listBlock('references'), data.references.length),
      sub('Section libre', 'Le titre de ton choix', listBlock('custom'), data.custom.length)
    ].join(''),
    modele: () => `${matchboxHtml()}<div class="mbx-info" id="mbxInfo"></div>`,
    finitions: () => `
      <div class="finish-row"><span class="label">Couleur d’accent</span>${swatches()}</div>
      <div class="finish-row"><span class="label">Police</span><div class="font-grid" role="group" aria-label="Police">${Object.entries(FONTS).map(([k, f]) => `
        <button type="button" class="choice" data-set="font" data-value="${k}" aria-pressed="${settings.font === k}">
          <span class="choice__sample" style="font-family:${esc(f.head || 'var(--f-ui)')}">${f.sample}</span><span class="choice__name">${esc(f.name)}</span></button>`).join('')}</div></div>
      <div class="finish-row"><span class="label">Mise en page</span>${segmented('density', [...Object.entries(DENSITIES).map(([k, v]) => [k, v.name]), ['fit', '1 page']], 'Densité')}
        <div class="fit-line" id="fitLine"></div></div>
      <div class="finish-row"><span class="label">Niveaux des compétences et langues</span>${segmented('levels', Object.entries(LEVEL_STYLES), 'Niveaux')}</div>`,
    fin: () => finBody(),
    toi: () => `<div class="grid-2">
      ${field('fullName', 'Prénom et nom', { ph: 'Sophie Martin', auto: 'name' })}
      ${field('jobTitle', 'Ton titre professionnel (facultatif)', { ph: 'Vendeuse conseil', auto: 'organization-title' })}
      ${field('email', 'Email', { type: 'email', ph: 'prenom.nom@email.fr', auto: 'email' })}
      ${field('phone', 'Téléphone', { type: 'tel', ph: '06 12 34 56 78', auto: 'tel' })}
      ${field('address', 'Ville', { ph: 'Lyon', auto: 'address-level2' })}
      </div>`,
    destinataire: () => `<div class="grid-2">
      ${letterField('poste', 'Poste visé (facultatif)', { ph: 'Vendeur conseil', help: 'Laisse vide pour une candidature spontanée.' })}
      ${letterField('entreprise', 'Entreprise', { ph: 'Décathlon' })}
      ${letterField('contact', 'Destinataire', { ph: 'Mme Dupont, Responsable RH' })}
      ${letterField('lieu', 'Ta ville', { ph: 'Lille' })}
      ${letterField('adresse', 'Adresse de l’entreprise', { type: 'textarea', rows: 2, ph: '4 boulevard de Mons\n59650 Villeneuve-d’Ascq', wide: true })}
      ${letterField('date', 'Date', { ph: today(), help: 'Laisse vide pour la date du jour.' })}
      ${letterField('objet', 'Objet', { ph: 'Candidature au poste de …', help: 'Laisse vide : on le remplit avec le poste visé, ou « Candidature spontanée ».' })}
      </div>`,
    texte: () => `<div class="row"><span class="help">Le brouillon reprend ton poste, ta dernière expérience et tes compétences clés.</span>
        <button type="button" class="btn btn--sm btn--ch" data-cmd="draft">${icon('pen')}Écrire un brouillon pour moi</button></div>
      ${letterField('appel', 'Formule d’appel', { ph: 'Madame, Monsieur,' })}
      ${letterField('corps', 'Ta lettre', { type: 'textarea', rows: 14, ph: 'Sépare les paragraphes par une ligne vide.' })}
      ${letterField('formule', 'Formule de politesse', { type: 'select', options: CLOSINGS })}`
  };
  const GUIDE = { toi: 'identite', fin: 'fin' };

  function finBody() {
    const t = T.analyze(data);
    const fixes = Object.entries(t).filter(([k]) => (k === 'lettre') === isLetter() && TIP_CHAPTER[k])
      .flatMap(([k, msgs]) => msgs.map(m => ({ chapter: TIP_CHAPTER[k], m }))).slice(0, 6);
    const doc = isLetter() ? 'ta lettre' : 'ton CV';
    return `<div class="done-hero">
        <p><strong id="finPages">${isLetter() ? 'Ta lettre est prête.' : 'Ton CV est prêt.'}</strong> Format A4, prêt à imprimer ou à envoyer.</p>
        <div class="done-hero__actions">
          <button type="button" class="btn btn--primary btn--lg" data-cmd="pdf">${icon('download')}Télécharger ${doc} en PDF</button>
          <button type="button" class="btn btn--lg" data-cmd="fit" id="finFit" hidden>Tout faire tenir sur 1 page</button>
        </div>
        <p class="help">Une fenêtre d’impression s’ouvre : choisis « Enregistrer au format PDF » (sur iPhone : Partager, puis Enregistrer dans Fichiers).</p>
      </div>
      ${!isLetter() && !data.photo ? `<div class="photo-later">${icon('camera')}<span>Tu n’as pas mis de photo. Tu veux l’ajouter maintenant ?</span>
        <label class="btn btn--sm" for="photoInput">Ajouter une photo</label></div>` : ''}
      ${fixes.length ? `<div class="fixes"><span class="assist__label">Encore quelques détails à soigner</span>${fixes.map(f =>
        `<div class="fix"><span>${f.m}</span><button type="button" class="btn btn--sm" data-chapter="${f.chapter}">Corriger</button></div>`).join('')}</div>` : ''}
      <div class="more-links">
        ${isLetter() ? '<button type="button" class="btn" data-doc="cv">Revenir à mon CV</button>' : '<button type="button" class="btn" data-doc="lettre">Écrire ma lettre de motivation</button>'}
        <button type="button" class="btn" data-cmd="export">${icon('save')}Garder une copie (.json)</button>
        <a class="btn" href="atelier.html">Mode expert : tout retoucher</a>
      </div>`;
  }

  function chapterHtml(i) {
    const list = chapters(), ch = list[i], last = i === list.length - 1;
    const next = list[i + 1];
    const guide = T.guideHtml(GUIDE[ch.id] || ch.id, true);
    return `<article class="chapter" style="--ch:${ch.ink};--ch-on:${onInk(ch.ink)}" data-ch="${ch.id}">
      <div class="chapter__band"></div>
      <p class="chapter__num">Chapitre ${i + 1} sur ${list.length}</p>
      <h2 class="chapter__title" tabindex="-1">${ch.title}</h2>
      ${ch.lead ? `<p class="chapter__lead">${ch.lead}</p>` : ''}
      <div class="chapter__grid">
        ${guide ? `<aside class="chapter__guide" aria-label="Guide">${guide}</aside>` : ''}
        <div class="chapter__form">${BODY[ch.id]()}<div class="tips" data-tips="${Object.keys(TIP_CHAPTER).find(k => TIP_CHAPTER[k] === ch.id) || ''}"></div></div>
      </div>
      <footer class="chapter__nav">
        ${i > 0 ? `<button type="button" class="btn" data-nav="prev">${icon('back')}Retour</button>` : '<button type="button" class="btn" data-home>' + icon('back') + 'Accueil</button>'}
        <span class="spacer"></span>
        ${ch.skip ? `<button type="button" class="btn btn--ghost" data-nav="next">${ch.skip}</button>` : ''}
        ${last ? '' : `<button type="button" class="btn btn--ch" data-nav="next">Suivant : ${next.title}${icon('next')}</button>`}
      </footer>
    </article>`;
  }

  /* ---------- Page turn: a copy of the page, cut into hinged strips, bends around the spine ---------- */
  const inner = $('#pageInner');
  const STRIPS = 6;
  function snapshot(curl) {
    const src = inner.cloneNode(true);
    src.querySelectorAll('[data-mbx-thumb]').forEach(el => { el.textContent = ''; }); // 26 CV thumbnails: not worth copying
    src.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    src.querySelectorAll('input, textarea, select, button, a, label, summary').forEach(el => el.setAttribute('tabindex', '-1'));
    // Typed values live in properties, not attributes: copy them so the turning page shows them.
    const live = $$('input, textarea, select', inner), copies = $$('input, textarea, select', src);
    copies.forEach((el, k) => { if (el.tagName === 'TEXTAREA') el.textContent = live[k].value; else if (el.tagName === 'SELECT') el.selectedIndex = live[k].selectedIndex; else el.setAttribute('value', live[k].value); });
    const W = inner.clientWidth, H = inner.clientHeight, html = src.innerHTML, top = inner.scrollTop;
    const c = document.createElement('div');
    c.className = 'turn';
    c.setAttribute('aria-hidden', 'true');
    c.style.top = `${inner.offsetTop}px`;
    c.style.height = `${H}px`;
    const face = k => `<div class="turn__face"><div class="turn__content" style="width:${W}px;left:${-k * W / (curl ? STRIPS : 1)}px;margin-top:${-top}px">${html}</div></div>`;
    if (!curl) { c.classList.add('turn--under'); c.innerHTML = `<div class="turn__content" style="width:${W}px;margin-top:${-top}px">${html}</div>`; return c; }
    const sw = W / STRIPS;
    let parent = c;
    for (let k = 0; k < STRIPS; k++) {
      const h = document.createElement('div');
      h.className = 'turn__hinge';
      h.style.width = `${sw + 0.5}px`; // half a pixel of overlap hides the seams
      h.style.left = k ? `${sw}px` : '0';
      h.innerHTML = face(k);
      parent.append(h);
      parent = h;
    }
    return c;
  }
  // One timeline from flat (0) to turned (1): the root strip swings round the spine, the outer strips lead, so the page curls.
  function curlTimeline(g, el) {
    const hinges = $$('.turn__hinge', el), faces = $$('.turn__face', el);
    const tl = g.timeline({ paused: true });
    tl.to(hinges[0], { rotationY: -108, duration: 0.6, ease: 'power2.inOut' }, 0);
    hinges.slice(1).forEach((h, k) => tl.to(h, { keyframes: [{ rotationY: -(5 + k * 4), duration: 0.26, ease: 'power1.out' }, { rotationY: 0, duration: 0.34, ease: 'power1.in' }] }, 0));
    tl.fromTo(faces, { '--shade': 0 }, { '--shade': (k) => 0.35 + k * 0.12, duration: 0.6, ease: 'power1.in' }, 0);
    tl.to(el, { autoAlpha: 0, duration: 0.12, ease: 'none' }, 0.48);
    return tl;
  }
  let turning = false;
  // Titles arrive letter by letter; words stay whole so a line never breaks inside one.
  const splitTitle = el => {
    el.setAttribute('aria-label', el.textContent);
    el.innerHTML = el.textContent.replace(/ ([?!:;»])/g, '\u00a0$1').split(' ').map(w => `<span class="w" aria-hidden="true">${[...w].map(c => `<span class="c">${esc(c)}</span>`).join('')}</span>`).join(' ');
    return $$('.c', el);
  };
  function enterChapter(g, delay) {
    const chars = splitTitle($('.chapter__title', inner));
    g.from(chars, { yPercent: 80, rotation: 8, autoAlpha: 0, duration: 0.42, stagger: 0.022, delay, ease: 'back.out(2)' });
    g.from($$('.chapter__num, .chapter__lead, .chapter__guide, .chapter__form > *, .chapter__nav', inner).slice(0, 10),
      { y: 16, autoAlpha: 0, duration: 0.36, stagger: 0.035, delay: delay + 0.08, ease: 'power3.out', clearProps: 'transform,opacity,visibility' });
  }
  function renderChapter(dir) {
    const i = idx(), page = inner.parentElement, g = G();
    const animate = dir !== 0 && g && inner.innerHTML;
    let old = null;
    if (animate && dir > 0) old = snapshot(true);
    if (animate && dir < 0) old = snapshot(false);
    inner.innerHTML = chapterHtml(i);
    inner.scrollTop = 0;
    window.scrollTo(0, 0);
    afterRender(dir);
    if (animate) {
      turning = true;
      const done = () => { turning = false; };
      if (dir > 0) {
        page.append(old);
        curlTimeline(g, old).eventCallback('onComplete', () => { old.remove(); done(); }).play();
        enterChapter(g, 0.18);
      } else {
        const fresh = snapshot(true);
        page.append(old, fresh);
        const tl = curlTimeline(g, fresh);
        tl.progress(1).eventCallback('onReverseComplete', () => { old.remove(); fresh.remove(); done(); }).reverse();
        enterChapter(g, 0.5);
      }
    } else if (g) enterChapter(g, 0);
    $('.chapter__title', inner).focus({ preventScroll: true });
  }

  // A field that goes from empty to filled earns a check beside its label.
  function markFilled(el, pop) {
    const f = el.closest?.('.field');
    if (!f || !inner.contains(f) || !('value' in el) || ['checkbox', 'radio', 'file', 'color'].includes(el.type)) return;
    const filled = !!String(el.value).trim();
    if (filled === f.classList.contains('is-filled')) return;
    let ok = $('.field__ok', f);
    if (!ok) { $('label', f)?.insertAdjacentHTML('beforeend', `<span class="field__ok" aria-hidden="true">${icon('check')}</span>`); ok = $('.field__ok', f); }
    f.classList.toggle('is-filled', filled);
    if (filled && pop && ok) G()?.fromTo(ok, { scale: 0, rotation: -60 }, { scale: 1, rotation: 0, duration: 0.32, ease: 'back.out(3)' });
  }

  // A burst of paper in the palette colours, once per document and per visit.
  const celebrated = new Set();
  function confetti() {
    const g = G();
    if (!g || celebrated.has(book.doc)) return;
    celebrated.add(book.doc);
    const host = document.createElement('div');
    host.className = 'confetti';
    host.setAttribute('aria-hidden', 'true');
    const colors = ['#5B2EFF', '#FF6B2C', '#FFD23F', '#1FC59A', '#FF4F9A', '#00A6B8'];
    const n = innerWidth < 700 ? 40 : 80;
    host.innerHTML = Array.from({ length: n }, (_, k) => `<i style="background:${colors[k % colors.length]}"></i>`).join('');
    document.body.append(host);
    const R = g.utils.random;
    $$('i', host).forEach(p => {
      const x0 = innerWidth * R(0.3, 0.7), y0 = innerHeight * 0.55;
      g.set(p, { x: x0, y: y0, rotation: R(0, 360), scale: R(0.6, 1.2) });
      g.to(p, { x: x0 + R(-1, 1) * innerWidth * 0.45, duration: 1.4, ease: 'power2.out' });
      g.to(p, { keyframes: [{ y: y0 - innerHeight * R(0.3, 0.6), duration: 0.55, ease: 'power2.out' }, { y: innerHeight + 40, duration: 0.85, ease: 'power2.in' }] });
      g.to(p, { rotation: `+=${R(-540, 540)}`, rotationX: R(180, 720), duration: 1.4, ease: 'none' });
    });
    setTimeout(() => host.remove(), 1600);
  }

  function afterRender(dir = 0) {
    const list = chapters(), i = idx(), ch = list[i];
    document.documentElement.style.setProperty('--ch', ch.ink);
    document.documentElement.style.setProperty('--ch-on', onInk(ch.ink));
    $$('input, textarea', inner).forEach(el => markFilled(el, false));
    if (ch.id === 'fin' && dir) setTimeout(confetti, 350);
    $('#progressLabel').textContent = `${isLetter() ? 'Lettre' : 'CV'} · chapitre ${i + 1} sur ${list.length}`;
    $('#progressFill').style.transform = `scaleX(${(i + 1) / list.length})`;
    $$('.toc__item').forEach((b, j) => { if (j === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    if (ch.id === 'modele') initMatchbox();
    // The guide stays open beside the form; stacked above it, it folds so the fields stay in view.
    const guide = $('.chapter__guide details', inner);
    if (guide && inner.clientWidth < 760) guide.open = false;
    showPages();
    renderTips();
  }

  function goTo(i) {
    if (turning) return;
    const list = chapters();
    const j = Math.max(0, Math.min(list.length - 1, i));
    if (j === idx()) return;
    const dir = j > idx() ? 1 : -1;
    book[book.doc] = j;
    renderChapter(dir);
    document.body.classList.remove('toc-open');
    queueSave();
  }

  function renderToc() {
    const list = chapters();
    $('#toc').innerHTML = `<p class="toc__title">${isLetter() ? 'Ta lettre' : 'Ton CV'}</p>${list.map((c, i) => `
      <button type="button" class="toc__item" style="--ch:${c.ink};--ch-on:${onInk(c.ink)}" data-goto="${i}"${i === idx() ? ' aria-current="step"' : ''}>
        <span class="toc__n">${i + 1}</span><span>${c.title}</span><span class="toc__done" data-done="${c.id}"></span></button>`).join('')}`;
  }
  const DONE = {
    photo: d => d.photo, identite: d => d.fullName.trim() && (d.email.trim() || d.phone.trim()), accroche: d => d.profil.trim(),
    experiences: d => d.experiences.some(isFilled), formations: d => d.formations.some(isFilled), competences: d => d.competences.some(isFilled),
    langues: d => d.langues.some(isFilled), toi: d => d.fullName.trim(), destinataire: d => d.letter.entreprise.trim(), texte: d => d.letter.corps.trim()
  };
  function updateToc() {
    $$('[data-done]').forEach(el => {
      const done = !!DONE[el.dataset.done]?.(data), was = el.dataset.state;
      el.dataset.state = done ? 'done' : 'todo';
      if (was === el.dataset.state) return;
      el.innerHTML = done ? icon('check') : '';
      const g = G();
      if (!done || !was || !g) return; // first paint: no fanfare
      g.fromTo($('svg', el), { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.4, ease: 'back.out(3)' });
      el.insertAdjacentHTML('beforeend', '<i class="toc__ring"></i>');
      const ring = el.lastElementChild;
      g.fromTo(ring, { scale: 0.4, opacity: 1 }, { scale: 2.2, opacity: 0, duration: 0.6, ease: 'power2.out', onComplete: () => ring.remove() });
    });
  }

  /* =========================================================
     Live document on the right page
     ========================================================= */
  const preview = $('#docPreview'), stage = $('#stage'), sizer = $('#sizer');
  let raf, pages = 1;
  const docHtml = () => (isLetter() ? T.renderLetter(data, settings) : T.renderCv(data, settings));
  T.setPrintSource(docHtml);
  function queueRender() { cancelAnimationFrame(raf); raf = requestAnimationFrame(renderDoc); }
  // The block that just changed in the live document is lit in the chapter ink, then fades.
  // The light is a layer above the preview, never part of the document or the PDF.
  const BLOCKS = '.cv__head, .cv-sec, .letter__to, .letter__obj, .letter__body, .letter__sign';
  let flashNext = false;
  function flash(before) {
    const g = G(), now = $$(BLOCKS, preview);
    if (!g || !before || before.length !== now.length) return;
    const s0 = sizer.getBoundingClientRect();
    now.filter((el, k) => el.textContent !== before[k]).slice(0, 2).forEach(el => {
      const r = el.getBoundingClientRect();
      const f = document.createElement('div');
      f.className = 'flash';
      Object.assign(f.style, { left: `${r.left - s0.left - 4}px`, top: `${r.top - s0.top - 3}px`, width: `${r.width + 8}px`, height: `${r.height + 6}px` });
      sizer.append(f);
      g.fromTo(f, { opacity: 1 }, { opacity: 0, duration: 0.7, delay: 0.2, ease: 'power1.in', onComplete: () => f.remove() });
    });
  }
  function renderDoc() {
    if ($('#book').hidden) return;
    const before = flashNext ? $$(BLOCKS, preview).map(el => el.textContent) : null;
    flashNext = false;
    preview.innerHTML = docHtml();
    $('#docTitle').textContent = isLetter() ? 'Ta lettre en direct' : 'Ton CV en direct';
    $('.peek-btn').lastChild.textContent = isLetter() ? 'Voir ma lettre' : 'Voir mon CV';
    fitPreview();
    flash(before);
    renderTips();
    updateToc();
  }
  function fitPreview() {
    const page = preview.firstElementChild;
    const cs = getComputedStyle(stage);
    const avail = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (!page || avail <= 0) { pages = T.measure(docHtml()); showPages(); return; } // preview hidden (phone): measure off screen
    const scale = Math.min(1, avail / page.offsetWidth);
    preview.style.transform = `scale(${scale})`;
    preview.style.transformOrigin = 'top left';
    pages = T.paginate(page);
    sizer.style.width = `${page.offsetWidth * scale}px`;
    sizer.style.height = `${page.offsetHeight * scale}px`;
    $$('.page-break', sizer).forEach(el => el.remove());
    for (let k = 1; k < pages; k++) sizer.insertAdjacentHTML('beforeend', `<div class="page-break" style="top:${k * A4_H * scale}px"><span>Page ${k + 1}</span></div>`);
    showPages();
  }
  function showPages() {
    $('#pageCount').textContent = `${plural(pages, 'page', 'pages')} A4`;
    const finFit = $('#finFit');
    if (finFit) finFit.hidden = isLetter() || pages < 2;
    updateFit();
  }
  new ResizeObserver(() => { fitPreview(); layoutMatchbox(); }).observe(stage);
  document.fonts?.ready.then(() => { fitPreview(); layoutMatchbox(); });

  function updateFit() {
    const el = $('#fitLine');
    if (!el) return;
    el.innerHTML = isLetter() ? '' : pages > 1
      ? `Ton CV fait ${pages} pages. <button type="button" class="btn btn--sm" data-cmd="fit">Tout faire tenir sur 1 page</button>`
      : 'Ton CV tient sur une page.';
  }

  function renderTips() {
    const t = T.analyze(data);
    $$('[data-tips]', inner).forEach(el => {
      const list = el.dataset.tips ? t[el.dataset.tips] || [] : [];
      el.innerHTML = list.map(m => `<p class="tip">${icon('alert')}<span>${m}</span></p>`).join('');
    });
  }

  /* =========================================================
     Matchbox template picker
     ========================================================= */
  const SLEEVES = {
    'minimal-pro': '#E9E4D8', corporate: '#1E3A5F', timeline: '#0F766E', 'modern-asymmetric': '#E2B13C', compact: '#5A6B7F',
    'elegant-classic': '#B89A72', pastel: '#D8B9E6', 'bold-creative': '#C8553D', 'tech-futurist': '#14213A', 'dark-mode': '#2B2B31', ats: '#F1EEE6',
    'studio-bleu': '#1555C6', bulles: '#9DC9FA', pilule: '#BED8ED', bordeaux: '#5C010E', 'rouge-presse': '#AB0304',
    polaroid: '#F2B9DC', grenat: '#8B161E', prune: '#541C23', 'marine-or': '#192B41', ardoise: '#3B3C47',
    carnet: '#E6ECED', lavande: '#A3B1F6', 'mauve-web': '#D8A8C6', retro: '#810A12', timbre: '#88231E'
  };
  const readable = hex => {
    const n = parseInt(hex.slice(1), 16);
    const l = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
    return l > 0.6 ? '#1E1B18' : '#FBF8F3';
  };
  const TPL_IDS = Object.keys(TEMPLATES);
  let mbx = { at: 0, open: true, busy: false };

  function matchboxHtml() {
    const n = TPL_IDS.length;
    return `<div class="mbx" id="mbx" role="region" aria-roledescription="carrousel" aria-label="Modèles de CV" tabindex="0">
      <div class="mbx__stage"><div class="mbx__table">${TPL_IDS.map((id, i) => {
        const t = TEMPLATES[id], tint = SLEEVES[id];
        return `<div class="mbx__box" data-box="${i}" role="group" aria-roledescription="modèle" aria-label="${i + 1} sur ${n} : ${esc(t.name)}">
          <div class="mbx__shadow"></div>
          <div class="mbx__tray"><div class="mbx__pic"><div class="mbx__page" data-mbx-thumb="${id}"></div></div></div>
          <div class="mbx__sleeve" style="--tint:${tint};--ink-on:${readable(tint)}">
            <div class="mbx__top"><span>N° ${String(i + 1).padStart(2, '0')}</span><span class="mbx__mark">${esc(t.name[0])}</span></div>
            <div class="mbx__name">${esc(t.name)}</div><div class="mbx__detail">${esc(t.desc)}</div>
          </div></div>`;
      }).join('')}</div></div>
      <div class="mbx__controls">
        <span class="mbx__count" id="mbxCount" aria-hidden="true"></span>
        <button type="button" class="mbx__btn" data-mbx="-1" aria-label="Modèle précédent">${icon('back')}</button>
        <button type="button" class="mbx__btn" data-mbx="1" aria-label="Modèle suivant">${icon('next')}</button>
      </div>
      <p class="sr-only" aria-live="polite" id="mbxLive"></p>
    </div>`;
  }

  const offsetOf = (i, at) => {
    const n = TPL_IDS.length, half = Math.floor((n - 1) / 2);
    const k = ((i - at) % n + n) % n;
    return k > n - 1 - half ? k - n : k;
  };
  let geo = null;
  function layoutMatchbox(prevAt) {
    const root = $('#mbx');
    if (!root) return;
    const W = root.clientWidth;
    if (!W) return;
    const bw = Math.max(96, Math.min(180, W * 0.28)), bh = bw * 297 / 210, out = bh * 0.9;
    geo = { bw, bh, out, P: bw * 1.2 };
    root.style.setProperty('--bw', `${bw}px`);
    root.style.setProperty('--bh', `${bh}px`);
    root.style.setProperty('--out', `${out}px`);
    root.style.setProperty('--stage-h', `${(bh + out) * Math.cos(24 * Math.PI / 180) + 70}px`);
    $$('.mbx__box', root).forEach(box => {
      const i = +box.dataset.box, k = offsetOf(i, mbx.at);
      const jump = prevAt !== undefined && Math.abs(offsetOf(i, prevAt) - k) > 1;
      box.classList.toggle('is-jump', jump);
      box.classList.toggle('is-active', k === 0);
      box.classList.toggle('is-open', k === 0 && mbx.open);
      box.style.transform = `translate3d(${k * geo.P - bw / 2}px, 0, 0)`;
      box.style.opacity = Math.abs(k) > 2 ? 0 : 1;
      box.style.pointerEvents = Math.abs(k) > 2 ? 'none' : '';
      box.setAttribute('aria-hidden', k !== 0);
    });
    const picW = bw * 0.94 * 0.9;
    $$('[data-mbx-thumb]', root).forEach(el => { el.style.transform = `scale(${picW / A4_W})`; });
    const t = TEMPLATES[TPL_IDS[mbx.at]];
    $('#mbxCount').textContent = `${String(mbx.at + 1).padStart(2, '0')} / ${String(TPL_IDS.length).padStart(2, '0')}`;
    $('#mbxLive').textContent = `${t.name}, modèle ${mbx.at + 1} sur ${TPL_IDS.length}`;
    const info = $('#mbxInfo');
    if (info) info.innerHTML = `<strong>${esc(t.name)}</strong><span>${esc(t.desc)}. C’est le modèle de ${isLetter() ? 'ta lettre' : 'ton CV'}, visible à droite.</span>`;
  }
  let thumbTimer;
  function renderThumbs() {
    const sample = hasContent(data) ? data : T.normalize(EXAMPLE);
    $$('[data-mbx-thumb]').forEach(el => {
      const s = { ...settings, template: el.dataset.mbxThumb };
      el.innerHTML = isLetter() ? T.renderLetter(sample, s) : T.renderCv(sample, s);
    });
  }
  function initMatchbox() {
    mbx = { at: Math.max(0, TPL_IDS.indexOf(settings.template)), open: true, busy: false };
    renderThumbs();
    layoutMatchbox();
  }

  // Close the tray, slide the boxes, open the next tray. Each step stays under 500 ms.
  function moveMatchbox(to) {
    const n = TPL_IDS.length, target = ((to % n) + n) % n;
    if (target === mbx.at || mbx.busy) return;
    const prevAt = mbx.at;
    settings.template = TPL_IDS[target];
    changed();
    if (reduced()) { mbx.at = target; layoutMatchbox(prevAt); return; }
    mbx.busy = true; mbx.open = false; layoutMatchbox();
    setTimeout(() => { mbx.at = target; layoutMatchbox(prevAt); }, 220);
    setTimeout(() => { mbx.open = true; mbx.busy = false; layoutMatchbox(); }, 220 + 380);
  }

  let drag = null;
  document.addEventListener('pointerdown', e => {
    const root = e.target.closest('#mbx');
    if (root && e.button === 0) drag = { x: e.clientX, y: e.clientY, t: Date.now() };
  });
  document.addEventListener('pointerup', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y, fast = Math.abs(dx) / Math.max(1, Date.now() - drag.t) > 0.5;
    drag = null;
    if (Math.abs(dx) > Math.abs(dy) && (Math.abs(dx) > 50 || fast)) { moveMatchbox(mbx.at + (dx < 0 ? 1 : -1)); dragged = true; setTimeout(() => { dragged = false; }); }
  });
  let dragged = false;

  /* =========================================================
     Events
     ========================================================= */
  function changed() { queueSave(); queueRender(); if ($('#mbx')) { clearTimeout(thumbTimer); thumbTimer = setTimeout(renderThumbs, 300); } }

  document.addEventListener('input', e => {
    const t = e.target, ds = t.dataset;
    if (T.applyInput(t, data)) { flashNext = true; markFilled(t, true); }
    else if (ds.set === 'accent-custom') { settings.accent = t.value.toLowerCase(); }
    else if (t.id === 'domain') { settings.domain = t.value; }
    else return;
    changed();
  });

  $('#photoInput').addEventListener('change', async e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast('Choisis une image (JPG, PNG, WebP…).', 'error');
    try {
      data.photo = await T.resizeImage(file, 600);
      changed();
      const ch = chapters()[idx()].id;
      if (ch === 'photo' || ch === 'fin') { inner.innerHTML = chapterHtml(idx()); afterRender(); }
      toast('Photo ajoutée');
    } catch { toast('Impossible de lire cette image. Essaie un JPG ou un PNG.', 'error'); }
  });

  function rerenderList(list) {
    const el = document.getElementById(`list-${list}`);
    if (el) el.innerHTML = T.listHtml(list, data[list], settings.domain);
    const chips = document.getElementById(`suggest-${list}`);
    if (chips) chips.outerHTML = T.suggestHtml(list, settings.domain, data);
  }

  async function fitPage() {
    const r = await T.fitOnePage(data, { ...settings, density: 'airy' }); // search down from the airiest setting
    settings.density = 'fit'; settings.fitD = r.fitD;
    $$('[data-set="density"]').forEach(b => b.setAttribute('aria-pressed', b.dataset.value === 'fit'));
    changed();
    toast(r.pages === 1 ? 'Ton CV tient maintenant sur une page' : `Même resserré, ton CV fait ${r.pages} pages : raccourcis quelques descriptions.`);
  }

  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    const btn = $('#themeBtn'), dark = t === 'dark';
    btn.innerHTML = icon(dark ? 'sun' : 'moon');
    btn.setAttribute('aria-label', dark ? 'Activer le thème clair' : 'Activer le thème sombre');
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ app: 'TrouveToiUnTaf', version: 3, settings, data }, null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `CV-${T.fileSlug(data)}.json` });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Copie téléchargée : garde-la pour reprendre sur un autre appareil');
  }

  const COMMANDS = {
    pdf: () => { clearTimeout(saveTimer); save(); T.printDoc(`${isLetter() ? 'Lettre' : 'CV'}-${T.fileSlug(data)}`); },
    fit: fitPage,
    draft: () => {
      if (data.letter.corps.trim() && !confirm('Remplacer le texte actuel de ta lettre par un brouillon ?')) return;
      data.letter.corps = T.buildDraft(data);
      if (!data.letter.poste.trim() && !isPoly() && data.jobTitle.trim()) data.letter.poste = data.jobTitle.trim();
      const el = $('#l-corps'); if (el) el.value = data.letter.corps;
      changed();
      toast('Brouillon prêt : complète les passages entre crochets');
    },
    'photo-remove': () => { data.photo = ''; changed(); inner.innerHTML = chapterHtml(idx()); afterRender(); },
    theme: () => {
      const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      store.set(T.KEYS.theme, t); store.del('darkMode'); applyTheme(t);
    },
    peek: () => { document.body.classList.toggle('peek'); fitPreview(); },
    toc: () => { const open = document.body.classList.toggle('toc-open'); $('[data-cmd="toc"]').setAttribute('aria-expanded', open); },
    export: exportJson
  };

  document.addEventListener('click', e => {
    const el = e.target.closest('button, .mbx__box');
    if (!el || el.disabled) return;
    const ds = el.dataset;
    if (ds.go === 'yes') openChoice();
    else if (ds.go === 'no') $('#welcomeWait').textContent = 'Prends ton temps, on t’attend ici.';
    else if (el.id === 'skipIntro') skipIntro();
    else if (ds.doc) openBook(ds.doc);
    else if ('home' in ds) { document.body.classList.remove('peek', 'toc-open'); openChoice(); }
    else if (ds.nav) goTo(idx() + (ds.nav === 'prev' ? -1 : 1));
    else if (ds.goto) goTo(+ds.goto);
    else if (ds.chapter) goTo(chapters().findIndex(c => c.id === ds.chapter));
    else if (ds.cmd) COMMANDS[ds.cmd]();
    else if (ds.cible) {
      data.cible = ds.cible;
      const keep = inner.scrollTop;
      inner.innerHTML = chapterHtml(idx()); afterRender(); inner.scrollTop = keep;
      $(`[data-cible="${ds.cible}"]`).focus();
      changed();
    }
    else if (ds.mbx) moveMatchbox(mbx.at + +ds.mbx);
    else if (ds.box && !dragged) { const k = offsetOf(+ds.box, mbx.at); if (k) moveMatchbox(mbx.at + Math.sign(k)); }
    else if (ds.set && 'value' in ds) {
      settings[ds.set] = ds.value;
      if (ds.set === 'levels') settings.levelsSet = true;
      if (ds.set === 'density' && ds.value === 'fit') return fitPage();
      $$(`[data-set="${ds.set}"][data-value]`).forEach(b => b.setAttribute('aria-pressed', b.dataset.value === ds.value));
      changed();
    } else if (ds.action) {
      const focus = T.listAction(el, data, rerenderList);
      if (!focus) return;
      focus()?.focus();
      changed();
    } else if (ds.add) { if (T.addSuggestion(ds.add, ds.text, data)) { rerenderList(ds.add); changed(); toast(`« ${ds.text} » ajouté`); } }
    else if (ds.insert) { const target = document.getElementById(ds.insert); if (target) T.insertText(target, ds.text, ds.mode); }
  });

  document.addEventListener('keydown', e => {
    if (e.target.closest?.('#mbx') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      moveMatchbox(mbx.at + (e.key === 'ArrowRight' ? 1 : -1));
    } else if (e.key === 'Escape') document.body.classList.remove('peek', 'toc-open');
  });

  /* =========================================================
     Boot
     ========================================================= */
  $('#year').textContent = new Date().getFullYear();
  applyTheme(document.documentElement.dataset.theme);
  if (location.hash === '#livre') { history.replaceState(null, '', location.pathname); openBook(book.doc); }
  else playIntro();
})();
