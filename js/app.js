(() => {
  'use strict';
  const { TEMPLATES, FONTS, ACCENTS, DENSITIES, LEVEL_STYLES, DOMAINS, VERBS, WEAK, CLOSINGS, EXAMPLE } = window.TTU_CONTENT;

  /* =========================================================
     Schema
     ========================================================= */
  const KEYS = { data: 'cvData', settings: 'cvSettings', legacyTemplate: 'currentTemplate', theme: 'theme' };
  const SKILL_LEVELS = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'];
  const LANG_LEVELS = ['Débutant', 'Intermédiaire', 'Courant', 'Natif'];
  const LEVEL_RANK = { 'Débutant': 1, 'Intermédiaire': 2, 'Avancé': 3, 'Courant': 3, 'Expert': 4, 'Natif': 4 };
  const TEXT_FIELDS = ['fullName', 'jobTitle', 'email', 'phone', 'address', 'website', 'permis', 'disponibilite', 'profil', 'objectif', 'interets'];
  const LETTER_FIELDS = ['poste', 'entreprise', 'contact', 'adresse', 'lieu', 'date', 'objet', 'appel', 'corps', 'formule'];
  const LETTER_DEFAULTS = { appel: 'Madame, Monsieur,', formule: CLOSINGS[0] };
  const TABS = ['contenu', 'design', 'lettre'];
  const MAX_IMPORT_BYTES = 8 * 1024 * 1024;
  const MAX_ITEMS = 40;
  const MM = 96 / 25.4;
  const A4_W = 210 * MM, A4_H = 297 * MM;

  const LISTS = {
    experiences: {
      label: 'Expérience', add: 'Ajouter une expérience', empty: 'Aucune expérience pour l’instant. Stages et jobs étudiants comptent aussi.',
      fields: [
        { key: 'poste', label: 'Poste', placeholder: 'Vendeur conseil' },
        { key: 'entreprise', label: 'Entreprise, ville', placeholder: 'Décathlon, Lille' },
        { key: 'periode', label: 'Période', placeholder: 'Sept. 2022 – aujourd’hui', wide: true },
        { key: 'description', label: 'Missions et résultats, une par ligne', type: 'textarea', placeholder: 'Conseillé jusqu’à 60 clients par jour\nAtteint 115 % de l’objectif de ventes', wide: true }
      ]
    },
    formations: {
      label: 'Formation', add: 'Ajouter une formation', empty: 'Commence par le diplôme le plus récent.',
      fields: [
        { key: 'titre', label: 'Diplôme', placeholder: 'BTS Management Commercial Opérationnel', wide: true },
        { key: 'ecole', label: 'École, ville', placeholder: 'Lycée Gaston Berger, Lille' },
        { key: 'annee', label: 'Année', placeholder: '2023' }
      ]
    },
    competences: {
      label: 'Compétence', add: 'Ajouter une compétence', empty: 'Liste 6 à 10 compétences utiles pour le poste visé.',
      fields: [
        { key: 'nom', label: 'Compétence', placeholder: 'Encaissement, Excel, soudure…' },
        { key: 'niveau', label: 'Niveau', type: 'select', options: SKILL_LEVELS, default: 'Intermédiaire' }
      ]
    },
    langues: {
      label: 'Langue', add: 'Ajouter une langue', empty: 'Le français compte aussi, ajoute-le.',
      fields: [
        { key: 'nom', label: 'Langue', placeholder: 'Anglais' },
        { key: 'niveau', label: 'Niveau', type: 'select', options: LANG_LEVELS, default: 'Intermédiaire' }
      ]
    },
    projets: {
      label: 'Projet', add: 'Ajouter un projet', empty: 'Un projet perso ou d’école montre ce que tu sais faire, surtout sans expérience.',
      fields: [
        { key: 'nom', label: 'Nom du projet', placeholder: 'Site de l’association de foot' },
        { key: 'contexte', label: 'Contexte', placeholder: 'Projet personnel' },
        { key: 'periode', label: 'Période', placeholder: '2024', wide: true },
        { key: 'description', label: 'Ce que tu as fait et le résultat', type: 'textarea', placeholder: 'Créé le site avec WordPress\n300 visites par mois', wide: true }
      ]
    },
    certifications: {
      label: 'Certification', add: 'Ajouter une certification', empty: 'TOEIC, CACES, SST, Google Ads, PSC1…',
      fields: [
        { key: 'nom', label: 'Certification', placeholder: 'TOEIC 850', wide: true },
        { key: 'organisme', label: 'Organisme', placeholder: 'ETS Global' },
        { key: 'annee', label: 'Année', placeholder: '2024' }
      ]
    },
    benevolat: {
      label: 'Engagement', add: 'Ajouter un engagement', empty: 'Associations, sport, entraide : ça compte pour les recruteurs.',
      fields: [
        { key: 'role', label: 'Rôle', placeholder: 'Trésorier' },
        { key: 'organisation', label: 'Organisation', placeholder: 'Restos du Cœur, Nantes' },
        { key: 'periode', label: 'Période', placeholder: 'Depuis 2022', wide: true },
        { key: 'description', label: 'Ce que tu fais', type: 'textarea', placeholder: 'Géré un budget annuel de 8 000 €', wide: true }
      ]
    },
    references: {
      label: 'Référence', add: 'Ajouter une référence', empty: 'Demande toujours l’accord de la personne avant de la citer.',
      fields: [
        { key: 'nom', label: 'Nom', placeholder: 'Claire Dubois' },
        { key: 'poste', label: 'Poste et entreprise', placeholder: 'Responsable de magasin, Fnac' },
        { key: 'contact', label: 'Email ou téléphone', placeholder: 'claire.dubois@email.fr', wide: true }
      ]
    },
    custom: {
      label: 'Section', add: 'Ajouter une section', empty: 'Publications, prix, expositions, permis bateau… à toi de choisir le titre.',
      fields: [
        { key: 'titre', label: 'Titre de la section', placeholder: 'Distinctions', wide: true },
        { key: 'contenu', label: 'Contenu, un élément par ligne', type: 'textarea', placeholder: 'Prix du meilleur projet de fin d’études, 2024', wide: true }
      ]
    }
  };

  // side: shown in the sidebar column on sidebar templates.
  const SECTIONS = {
    profil: { title: 'Profil' },
    objectif: { title: 'Objectif' },
    experiences: { title: 'Expérience professionnelle' },
    formations: { title: 'Formation' },
    projets: { title: 'Projets' },
    competences: { title: 'Compétences', side: true },
    langues: { title: 'Langues', side: true },
    certifications: { title: 'Certifications', side: true },
    benevolat: { title: 'Engagement bénévole' },
    interets: { title: 'Centres d’intérêt', side: true },
    infos: { title: 'Informations', side: true },
    references: { title: 'Références', side: true },
    custom: { title: 'Sections libres' }
  };
  const DEFAULT_ORDER = Object.keys(SECTIONS);

  const blankItem = list => Object.fromEntries(LISTS[list].fields.map(f => [f.key, f.default || '']));
  const blankLetter = () => ({ ...Object.fromEntries(LETTER_FIELDS.map(k => [k, ''])), ...LETTER_DEFAULTS });
  const blankData = () => ({
    photo: '',
    ...Object.fromEntries(TEXT_FIELDS.map(k => [k, ''])),
    ...Object.fromEntries(Object.keys(LISTS).map(k => [k, []])),
    letter: blankLetter()
  });
  const defaultSettings = () => ({
    template: 'minimal-pro', accent: '', font: 'auto', density: 'normal', levels: 'text',
    order: [...DEFAULT_ORDER], hidden: [], domain: 'tech', tab: 'contenu'
  });

  const str = v => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '');

  // Everything read from storage or an imported file goes through these: unknown keys dropped, types coerced.
  function normalize(raw) {
    const d = blankData();
    if (!raw || typeof raw !== 'object') return d;
    for (const k of TEXT_FIELDS) d[k] = str(raw[k]);
    if (typeof raw.photo === 'string' && /^data:image\/(png|jpe?g|webp|gif);base64,/.test(raw.photo)) d.photo = raw.photo;
    for (const [list, spec] of Object.entries(LISTS)) {
      if (!Array.isArray(raw[list])) continue;
      d[list] = raw[list].filter(x => x && typeof x === 'object').slice(0, MAX_ITEMS).map(x =>
        Object.fromEntries(spec.fields.map(f => {
          const v = str(x[f.key]);
          return [f.key, f.options && !f.options.includes(v) ? f.default : v];
        })));
    }
    if (raw.letter && typeof raw.letter === 'object') {
      for (const k of LETTER_FIELDS) if (str(raw.letter[k])) d.letter[k] = str(raw.letter[k]);
    }
    return d;
  }

  function normalizeSettings(raw) {
    const s = defaultSettings();
    if (!raw || typeof raw !== 'object') return s;
    if (TEMPLATES[raw.template]) s.template = raw.template;
    if (typeof raw.accent === 'string' && /^#[0-9a-f]{6}$/i.test(raw.accent)) s.accent = raw.accent.toLowerCase();
    if (FONTS[raw.font]) s.font = raw.font;
    if (DENSITIES[raw.density]) s.density = raw.density;
    if (LEVEL_STYLES[raw.levels]) s.levels = raw.levels;
    if (DOMAINS[raw.domain]) s.domain = raw.domain;
    if (TABS.includes(raw.tab)) s.tab = raw.tab;
    if (Array.isArray(raw.order)) {
      const o = [...new Set(raw.order.filter(k => SECTIONS[k]))];
      s.order = [...o, ...DEFAULT_ORDER.filter(k => !o.includes(k))];
    }
    if (Array.isArray(raw.hidden)) s.hidden = [...new Set(raw.hidden.filter(k => SECTIONS[k]))];
    return s;
  }

  /* =========================================================
     Helpers
     ========================================================= */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ESC[c]);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch { /* storage blocked: nothing to delete */ } }
  };
  const icon = id => `<svg class="i" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const isFilled = item => Object.entries(item).some(([k, v]) => k !== 'niveau' && v.trim());
  const hasContent = d => TEXT_FIELDS.some(k => d[k].trim()) || d.photo || Object.keys(LISTS).some(l => d[l].length) || d.letter.corps.trim();
  const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;
  const today = () => new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  /* =========================================================
     State & persistence
     ========================================================= */
  let data = blankData();
  let settings = defaultSettings();

  function load() {
    try { data = normalize(JSON.parse(store.get(KEYS.data) || 'null')); } catch { data = blankData(); }
    let raw = null;
    try { raw = JSON.parse(store.get(KEYS.settings) || 'null'); } catch { raw = null; }
    if (!raw) raw = { template: store.get(KEYS.legacyTemplate) }; // v2 kept only the template
    settings = normalizeSettings(raw);
  }

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
    const ok = store.set(KEYS.data, JSON.stringify(data)) && store.set(KEYS.settings, JSON.stringify(settings));
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
     Document rendering (CV and letter share header + styling)
     ========================================================= */
  const multiline = s => esc(s.trim()).replace(/\n+/g, '<br>');
  function bullets(s) {
    const lines = s.split('\n').map(l => l.replace(/^\s*[-•*–]\s*/, '').trim()).filter(Boolean);
    if (!lines.length) return '';
    if (lines.length === 1) return `<p class="entry__desc">${esc(lines[0])}</p>`;
    return `<ul class="entry__bullets">${lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul>`;
  }
  const sec = (key, title, body) => `<section class="cv-sec cv-sec--${key}"><h2 class="cv-sec__title">${title}</h2>${body}</section>`;
  const entry = (title, sub, date, desc = '') => `<div class="entry">
      <div class="entry__head"><h3>${esc(title.trim() || sub.trim())}</h3>${date.trim() ? `<span class="entry__date">${esc(date)}</span>` : ''}</div>
      ${title.trim() && sub.trim() ? `<p class="entry__sub">${esc(sub)}</p>` : ''}${desc}</div>`;
  const levelList = items => `<ul class="levels">${items.map(x => {
    const r = LEVEL_RANK[x.niveau] || 2;
    return `<li class="level"><span class="level__name">${esc(x.nom)}</span><span class="level__label">${esc(x.niveau)}</span>`
      + `<span class="dots" aria-hidden="true">${[1, 2, 3, 4].map(n => `<i${n <= r ? ' class="on"' : ''}></i>`).join('')}</span>`
      + `<span class="meter" aria-hidden="true"><i style="width:${r * 25}%"></i></span></li>`;
  }).join('')}</ul>`;
  const entries = (key, map) => d => {
    const l = d[key].filter(isFilled);
    return l.length > 0 && sec(key, SECTIONS[key].title, l.map(x => entry(...map(x))).join(''));
  };

  const RENDER = {
    profil: d => d.profil.trim() && sec('profil', 'Profil', `<p class="cv-text">${multiline(d.profil)}</p>`),
    objectif: d => d.objectif.trim() && sec('objectif', 'Objectif', `<p class="cv-text">${multiline(d.objectif)}</p>`),
    experiences: entries('experiences', x => [x.poste, x.entreprise, x.periode, bullets(x.description)]),
    formations: entries('formations', x => [x.titre, x.ecole, x.annee]),
    projets: entries('projets', x => [x.nom, x.contexte, x.periode, bullets(x.description)]),
    certifications: entries('certifications', x => [x.nom, x.organisme, x.annee]),
    benevolat: entries('benevolat', x => [x.role, x.organisation, x.periode, bullets(x.description)]),
    competences: d => { const l = d.competences.filter(isFilled); return l.length > 0 && sec('competences', 'Compétences', levelList(l)); },
    langues: d => { const l = d.langues.filter(isFilled); return l.length > 0 && sec('langues', 'Langues', levelList(l)); },
    interets: d => {
      const l = d.interets.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
      return l.length > 0 && sec('interets', SECTIONS.interets.title, `<ul class="chips">${l.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`);
    },
    infos: d => {
      const rows = [['Permis', d.permis], ['Disponibilité', d.disponibilite]].filter(([, v]) => v.trim());
      return rows.length > 0 && sec('infos', 'Informations', `<ul class="infos">${rows.map(([k, v]) => `<li><b>${k} :</b> ${esc(v)}</li>`).join('')}</ul>`);
    },
    references: d => {
      const l = d.references.filter(isFilled);
      return l.length > 0 && sec('references', 'Références', `<ul class="refs">${l.map(r =>
        `<li><b>${esc(r.nom)}</b>${r.poste.trim() ? `<span>${esc(r.poste)}</span>` : ''}${r.contact.trim() ? `<span>${esc(r.contact)}</span>` : ''}</li>`).join('')}</ul>`);
    },
    custom: d => d.custom.filter(isFilled).map(c => sec('custom', c.titre.trim() ? esc(c.titre) : 'Section', bullets(c.contenu))).join('')
  };

  function headParts(d, t) {
    const photo = d.photo && !t.noPhoto ? `<img class="cv__photo" src="${esc(d.photo)}" alt="Photo de ${esc(d.fullName.trim() || 'profil')}">` : '';
    const name = d.fullName.trim() ? esc(d.fullName) : '<span class="ph">Ton nom</span>';
    const title = d.jobTitle.trim() ? esc(d.jobTitle) : '<span class="ph">Ton titre professionnel</span>';
    const contacts = [d.email, d.phone, d.address, d.website].map(s => s.trim()).filter(Boolean);
    return {
      photo,
      contact: contacts.length ? `<ul class="cv__contact">${contacts.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : '',
      identity: `<div class="cv__id"><h1 class="cv__name">${name}</h1><p class="cv__title">${title}</p></div>`
    };
  }

  function articleOpen(s, extra = '') {
    const t = TEMPLATES[s.template], f = FONTS[s.font];
    const style = [`--d:${DENSITIES[s.density].value}`];
    if (s.accent) style.push(`--a:${s.accent}`);
    if (f.head) style.push(`--fh:${f.head}`, `--fb:${f.body}`);
    return `<article class="cv cv--${s.template} lv-${t.forceLevels || s.levels}${t.side ? ' cv--side' : ''}${extra}" style="${esc(style.join(';'))}">`;
  }

  function layout(d, s, sideHtml, mainHtml, fullHtml) {
    const t = TEMPLATES[s.template], p = headParts(d, t);
    if (t.side) {
      return `${articleOpen(s)}<aside class="cv__side">${p.photo}${p.contact ? sec('contact', 'Contact', p.contact) : ''}${sideHtml}</aside>`
        + `<div class="cv__main">${p.identity}${mainHtml}</div></article>`;
    }
    return `${articleOpen(s)}<header class="cv__head">${p.photo}<div class="cv__headtext">${p.identity}${p.contact}</div></header>${fullHtml}</article>`;
  }

  function renderCv(d, s) {
    const visible = s.order.filter(k => !s.hidden.includes(k));
    const pick = keys => keys.map(k => RENDER[k](d) || '').join('');
    return layout(d, s, pick(visible.filter(k => SECTIONS[k].side)), pick(visible.filter(k => !SECTIONS[k].side)), pick(visible));
  }

  const defaultObjet = d => `Candidature au poste de ${d.letter.poste.trim() || d.jobTitle.trim() || '[poste visé]'}`;
  function renderLetter(d, s) {
    const L = d.letter, ph = x => `<span class="ph">${x}</span>`;
    const to = [L.entreprise.trim() ? `<strong>${esc(L.entreprise)}</strong>` : ph('Entreprise'),
      L.contact.trim() ? esc(L.contact) : '', L.adresse.trim() ? multiline(L.adresse) : ''].filter(Boolean).join('<br>');
    const place = `${L.lieu.trim() ? `${esc(L.lieu)}, le ` : 'Le '}${esc(L.date.trim() || today())}`;
    const body = L.corps.trim()
      ? L.corps.trim().split(/\n\s*\n/).map(p => `<p>${multiline(p)}</p>`).join('')
      : `<p>${ph('Écris ta lettre dans l’onglet Lettre, ou clique sur « Générer un brouillon ».')}</p>`;
    const letter = `<div class="letter">
      <div class="letter__to">${to}</div>
      <p class="letter__place">${place}</p>
      <p class="letter__obj"><strong>Objet :</strong> ${esc(L.objet.trim() || defaultObjet(d))}</p>
      <p class="letter__appel">${esc(L.appel.trim() || LETTER_DEFAULTS.appel)}</p>
      <div class="letter__body">${body}</div>
      <p class="letter__closing">${esc(L.formule || CLOSINGS[0])}</p>
      <p class="letter__sign">${d.fullName.trim() ? esc(d.fullName) : ph('Ton nom')}</p>
    </div>`;
    return layout(d, s, '', letter, letter);
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
    sizer.style.width = `${page.offsetWidth * scale}px`;
    sizer.style.height = `${page.offsetHeight * scale}px`;
    pages = Math.max(1, Math.ceil(page.offsetHeight / A4_H - 0.02));
    $$('.page-break', sizer).forEach(el => el.remove());
    for (let k = 1; k < pages; k++) {
      sizer.insertAdjacentHTML('beforeend', `<div class="page-break no-print" style="top:${k * A4_H * scale}px"><span>Page ${k + 1}</span></div>`);
    }
    $('#pageCount').textContent = plural(pages, 'page', 'pages');
  }
  new ResizeObserver(() => { fitPreview(); scaleThumbs(); }).observe(stage);
  document.fonts?.ready.then(() => { fitPreview(); renderTips(); });

  // Fill whole A4 sheets when printing so a template background never stops mid-page.
  window.addEventListener('beforeprint', () => {
    const page = preview.firstElementChild;
    if (!page) return;
    page.style.minHeight = '';
    page.style.minHeight = `${Math.max(1, Math.ceil(page.offsetHeight / A4_H - 0.02)) * 297}mm`;
  });
  window.addEventListener('afterprint', () => { const page = preview.firstElementChild; if (page) page.style.minHeight = ''; });

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

  /* =========================================================
     Live advice
     ========================================================= */
  const BRACKETS = /\[[^\]]+\]/;
  const weakIn = s => WEAK.filter(w => w.re.test(s));
  function analyze(d) {
    const t = {};
    const add = (k, msg) => (t[k] ||= []).push(msg);

    const email = d.email.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) add('identite', 'L’adresse email semble incomplète.');
    if (d.phone.trim() && d.phone.replace(/\D/g, '').length < 9) add('identite', 'Le numéro de téléphone semble incomplet.');
    if (d.fullName.trim() && !d.jobTitle.trim()) add('identite', 'Ajoute un <b>titre professionnel</b> : c’est la première ligne que lit le recruteur.');

    const p = d.profil.trim();
    if (p) {
      if (p.length < 120) add('profil', 'Ton profil est court : vise 2 à 3 phrases, soit 300 à 500 caractères.');
      else if (p.length > 650) add('profil', `Ton profil fait ${p.length} caractères : vise 300 à 500 pour qu’il soit lu en entier.`);
      if (BRACKETS.test(p)) add('profil', 'Il reste des passages entre crochets à compléter.');
      weakIn(p).forEach(w => add('profil', `« ${w.word} » est vague. Essaie plutôt : ${w.fix}.`));
    }

    d.experiences.forEach((x, i) => {
      if (!isFilled(x)) return;
      const n = `<b>${esc(x.poste.trim() || `Expérience ${i + 1}`)}</b>`;
      const desc = x.description.trim();
      if (!x.periode.trim()) add('experiences', `${n} : indique la période.`);
      if (!desc) { add('experiences', `${n} : décris 2 à 4 missions, une par ligne.`); return; }
      if (!/\d/.test(desc)) add('experiences', `${n} : ajoute un résultat chiffré (%, €, nombre de clients…). C’est ce que les recruteurs retiennent.`);
      if (/^\s*(je|j['’])/im.test(desc)) add('experiences', `${n} : commence chaque ligne par un verbe d’action plutôt que par « je ».`);
      if (BRACKETS.test(desc)) add('experiences', `${n} : il reste des passages entre crochets à compléter.`);
      weakIn(desc).forEach(w => add('experiences', `${n} : « ${w.word} » est vague. Essaie plutôt : ${w.fix}.`));
    });

    const comps = d.competences.filter(isFilled).length;
    if (comps > 12) add('competences', `${comps} compétences, c’est beaucoup : garde les 6 à 10 plus utiles pour le poste visé.`);
    if (d.references.some(isFilled) && d.references.filter(isFilled).length > 3) add('references', 'Deux ou trois références suffisent.');

    const L = d.letter, words = L.corps.trim() ? L.corps.trim().split(/\s+/).length : 0;
    if (words > 420) add('lettre', `Ta lettre fait ${words} mots : vise 250 à 350 pour qu’elle tienne sur une page.`);
    if (words && words < 120) add('lettre', 'Ta lettre est courte : développe en trois paragraphes (vous, moi, nous).');
    if (BRACKETS.test(L.corps)) add('lettre', 'Il reste des passages entre crochets à compléter.');
    if (words && !L.entreprise.trim()) add('lettre', 'Indique le nom de l’entreprise : une lettre personnalisée a beaucoup plus d’impact.');
    return t;
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
  function missionAssist(i) {
    const dom = DOMAINS[settings.domain], target = `experiences-${i}-description`;
    return `<details class="assist"><summary>${icon('pen')}Idées de missions</summary><div class="assist__body">
      <span class="assist__label">Missions types · ${esc(dom.name)}</span>
      <div class="suggest">${dom.missions.map(m => `<button type="button" data-insert="${target}" data-mode="line" data-text="${esc(m)}">${esc(m)}</button>`).join('')}</div>
      <span class="assist__label">Verbes d’action</span>
      <div class="verbs">${VERBS.map(v => `<button type="button" data-insert="${target}" data-mode="verb" data-text="${esc(v)}">${esc(v)}</button>`).join('')}</div>
      ${phNote}</div></details>`;
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
            ${c.list ? `<div class="list" id="list-${c.list}"></div>
              <button type="button" class="btn btn--sm add-btn" data-action="add" data-list="${c.list}">${icon('plus')}${LISTS[c.list].add}</button>` : c.body()}
            <div class="tips" data-tips="${c.id}"></div>
          </div>
        </details>`).join('')}`;
    Object.keys(LISTS).forEach(renderList);
    renderPhoto();
  }

  function itemField(list, i, f, value) {
    const id = `${list}-${i}-${f.key}`;
    const attrs = `id="${id}" data-list="${list}" data-index="${i}" data-key="${f.key}"`;
    const ph = f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : '';
    let control;
    if (f.type === 'select') control = `<select ${attrs}>${f.options.map(o => `<option${o === value ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    else if (f.type === 'textarea') control = `<textarea ${attrs} rows="3"${ph}>${esc(value)}</textarea>`;
    else control = `<input type="text" ${attrs} value="${esc(value)}"${ph} autocomplete="off">`;
    return `<div class="field${f.wide ? ' field--wide' : ''}"><label for="${id}">${esc(f.label)}</label>${control}</div>`;
  }

  function renderList(list) {
    const spec = LISTS[list], items = data[list], el = document.getElementById(`list-${list}`);
    if (!el) return;
    if (!items.length) { el.innerHTML = `<p class="empty">${esc(spec.empty)}</p>`; return; }
    el.innerHTML = items.map((item, i) => {
      const n = `${spec.label} ${i + 1}`;
      const btn = (action, ico, label, disabled, extra = '') =>
        `<button type="button" class="icon-btn${extra}" data-action="${action}" data-list="${list}" data-index="${i}" aria-label="${label} : ${esc(n)}" title="${label}"${disabled ? ' disabled' : ''}>${icon(ico)}</button>`;
      return `<fieldset class="item">
        <legend>${esc(n)}</legend>
        <div class="item__tools">${btn('up', 'up', 'Monter', i === 0)}${btn('down', 'down', 'Descendre', i === items.length - 1)}${btn('remove', 'x', 'Supprimer', false, ' icon-btn--danger')}</div>
        <div class="item__grid">${spec.fields.map(f => itemField(list, i, f, item[f.key])).join('')}${list === 'experiences' ? missionAssist(i) : ''}</div>
      </fieldset>`;
    }).join('');
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
          <div class="segmented" role="group" aria-labelledby="lbl-density">${Object.entries(DENSITIES).map(([k, v]) => `<button type="button" data-set="density" data-value="${k}">${v.name}</button>`).join('')}</div></div>
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
    const poste = L.poste.trim() || data.jobTitle.trim() || '[poste visé]';
    const ent = L.entreprise.trim() || '[nom de l’entreprise]';
    const exp = data.experiences.find(isFilled), form = data.formations.find(isFilled);
    const skills = data.competences.filter(isFilled).slice(0, 3).map(c => c.nom.trim()).filter(Boolean);
    const list = a => a.length > 1 ? `${a.slice(0, -1).join(', ')} et ${a[a.length - 1]}` : a[0];
    const where = x => x.trim() ? ` chez ${x.trim().split(',')[0]}` : '';

    const p1 = `Votre offre pour le poste de ${poste} a retenu toute mon attention. [Ce qui t’attire chez ${ent} : un projet, une valeur, un produit précis.]`;
    let p2 = exp
      ? `Mon expérience de ${exp.poste.trim() || '[poste]'}${where(exp.entreprise)} m’a permis de [résultat concret, idéalement chiffré].`
      : form ? `Titulaire d’un ${form.titre.trim()}${form.ecole.trim() ? ` (${form.ecole.trim()})` : ''}, j’ai acquis [les compétences clés pour ce poste].`
        : '[Ton parcours en une ou deux phrases.]';
    if (skills.length) p2 += ` Je maîtrise notamment ${list(skills)}, des atouts directement utiles pour ce poste.`;
    const p3 = `Rejoindre ${ent}, c’est pour moi l’occasion de [ce que tu veux apporter ou apprendre]. Je serais ravi(e) de vous exposer ma motivation lors d’un entretien.`;

    L.corps = [p1, p2, p3].join('\n\n');
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

  function insertText(el, text, mode) {
    const v = el.value;
    let start, end, insert = text;
    if (mode === 'replace') {
      if (v.trim() && !confirm('Remplacer ton texte actuel par cette suggestion ?')) return;
      start = 0; end = v.length;
    } else if (mode === 'line') {
      start = end = v.length;
      insert = (v && !v.endsWith('\n') ? '\n' : '') + text;
    } else {
      start = el.selectionStart ?? v.length; end = el.selectionEnd ?? v.length;
      if (document.activeElement !== el) start = end = v.length;
      const before = v.slice(0, start), atLineStart = !before || before.endsWith('\n');
      insert = atLineStart ? `${text} ` : `${before.endsWith(' ') ? '' : ' '}${text.toLowerCase()} `;
    }
    el.focus();
    el.setSelectionRange(start, end);
    // execCommand keeps Ctrl+Z working; setRangeText is the fallback where it is gone.
    if (!document.execCommand('insertText', false, insert)) {
      el.setRangeText(insert, start, end, 'end');
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  const editor = $('#editor');
  editor.addEventListener('input', e => {
    const t = e.target, ds = t.dataset;
    if (ds.field) data[ds.field] = t.value;
    else if (ds.list) data[ds.list][+ds.index][ds.key] = t.value;
    else if (ds.letter) data.letter[ds.letter] = t.value;
    else if (ds.set === 'accent-custom') { settings.accent = t.value.toLowerCase(); updateDesignState(); }
    else if (ds.secToggle) {
      settings.hidden = t.checked ? settings.hidden.filter(k => k !== ds.secToggle) : [...settings.hidden, ds.secToggle];
      t.closest('.sec-row').classList.toggle('is-off', !t.checked);
    } else if (t.id === 'domain') {
      settings.domain = t.value;
      $('#assist-profil').outerHTML = profilAssist();
      renderList('experiences');
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
    const { action, list } = b.dataset, i = +b.dataset.index, items = data[list];
    const firstKey = LISTS[list].fields[0].key;
    if (action === 'add') {
      if (items.length >= MAX_ITEMS) return toast('Tu as atteint le nombre maximum d’éléments pour cette section.');
      items.push(blankItem(list));
      renderList(list);
      document.getElementById(`${list}-${items.length - 1}-${firstKey}`).focus();
    } else if (action === 'remove') {
      if (isFilled(items[i]) && !confirm(`Supprimer « ${items[i][firstKey].trim() || `${LISTS[list].label} ${i + 1}`} » ?`)) return;
      items.splice(i, 1);
      renderList(list);
      $(`[data-action="add"][data-list="${list}"]`).focus();
    } else {
      const j = action === 'up' ? i - 1 : i + 1;
      [items[i], items[j]] = [items[j], items[i]];
      renderList(list);
      const same = $(`[data-action="${action}"][data-list="${list}"][data-index="${j}"]`);
      (same && !same.disabled ? same : document.getElementById(`${list}-${j}-${firstKey}`)).focus();
    }
    changed();
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
    } else if (ds.set && 'value' in ds) {
      settings[ds.set] = ds.value;
      updateDesignState(); changed();
    } else if (ds.secMove) moveSection(el);
    else if (ds.action) listAction(el);
    else if (ds.insert) { const target = document.getElementById(ds.insert); if (target) insertText(target, ds.text, ds.mode); }
    else if (el.id === 'tipsBtn') jumpToTips();
    else if (el.id === 'photoRemove') { data.photo = ''; renderPhoto(); changed(); $('#photoInput').focus(); }
  });

  /* =========================================================
     Photo (resized so localStorage never overflows)
     ========================================================= */
  function resizeImage(file, max) {
    return new Promise((resolve, reject) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.naturalWidth * s));
        c.height = Math.max(1, Math.round(img.naturalHeight * s));
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); // transparent PNG -> white, not black
        ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', 0.86));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unreadable')); };
      img.src = url;
    });
  }

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
      download: `CV-${(data.fullName.trim() || 'TrouveToiUnTaf').replace(/[^\p{L}\p{N}]+/gu, '-')}.json`
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
    renderDoc();
    const prev = document.title;
    document.title = `${isLetter() ? 'Lettre' : 'CV'} - ${data.fullName.trim() || 'TrouveToiUnTaf'}`; // browsers use the title as the PDF filename
    window.addEventListener('afterprint', () => { document.title = prev; }, { once: true });
    window.print();
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
  load();
  renderContentPanel();
  renderDesignPanel();
  renderLetterPanel();
  fillFields();
  setTab(settings.tab, false, false);
  setStatus('saved');
})();
