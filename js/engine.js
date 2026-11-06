/* Shared engine for the book (index.html) and expert mode (atelier.html):
   data schema and validation, CV and letter rendering, A4 pagination, printing, advice, list editors. */
window.TTU = (() => {
  'use strict';
  const { TEMPLATES, FONTS, DENSITIES, LEVEL_STYLES, DOMAINS, VERBS, WEAK, CLOSINGS } = window.TTU_CONTENT;
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
    template: 'minimal-pro', accent: '', font: 'auto', density: 'normal', fitD: 1, levels: 'text', levelsSet: false,
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
    if (DENSITIES[raw.density] || raw.density === 'fit') s.density = raw.density;
    if (typeof raw.fitD === 'number' && raw.fitD >= 0.7 && raw.fitD <= 1.1) s.fitD = raw.fitD;
    if (LEVEL_STYLES[raw.levels]) s.levels = raw.levels;
    s.levelsSet = raw.levelsSet === true;
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
    return `<li class="level" style="--p:${r * 25}%"><span class="level__name">${esc(x.nom)}</span><span class="level__label">${esc(x.niveau)}</span>`
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
    const full = d.fullName.trim(), cut = full.indexOf(' ');
    // First and last name in their own spans so a template can set them on two lines.
    const name = !full ? '<span class="ph">Ton nom</span>'
      : cut < 0 ? `<span class="cv__last">${esc(full)}</span>`
        : `<span class="cv__first">${esc(full.slice(0, cut))}</span> <span class="cv__last">${esc(full.slice(cut + 1))}</span>`;
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
    const style = [`--d:${densityValue(s)}`];
    if (s.accent) style.push(`--a:${s.accent}`);
    if (f.head) style.push(`--fh:${f.head}`, `--fb:${f.body}`);
    return `<article class="cv cv--${s.template} lv-${t.forceLevels || (!s.levelsSet && t.defaultLevels) || s.levels}${t.side ? ' cv--side' : ''}${t.cards ? ' cv--cards' : ''}${extra}" style="${esc(style.join(';'))}">`;
  }

  function layout(d, s, sideHtml, mainHtml, fullHtml) {
    const t = TEMPLATES[s.template], p = headParts(d, t);
    if (t.side) {
      // nameSide puts the name in the sidebar, above ('before') or under ('after') the photo.
      const top = t.nameSide === 'before' ? p.identity + p.photo : t.nameSide === 'after' ? p.photo + p.identity : p.photo;
      return `${articleOpen(s)}<aside class="cv__side">${top}${p.contact ? sec('contact', 'Contact', p.contact) : ''}${sideHtml}</aside>`
        + `<div class="cv__main">${t.nameSide ? '' : p.identity}${mainHtml}</div></article>`;
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
      : `<p>${ph('Écris ta lettre, ou génère un brouillon à partir de ton CV.')}</p>`;
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

  const densityValue = s => (s.density === 'fit' ? s.fitD : DENSITIES[s.density].value);

  /* =========================================================
     Persistence
     ========================================================= */
  function loadState() {
    let data, raw = null;
    try { data = normalize(JSON.parse(store.get(KEYS.data) || 'null')); } catch { data = blankData(); }
    try { raw = JSON.parse(store.get(KEYS.settings) || 'null'); } catch { raw = null; }
    if (!raw) raw = { template: store.get(KEYS.legacyTemplate) }; // v2 kept only the template
    return { data, settings: normalizeSettings(raw) };
  }
  const saveState = (data, settings) => store.set(KEYS.data, JSON.stringify(data)) && store.set(KEYS.settings, JSON.stringify(settings));

  /* =========================================================
     A4 pagination: no block is ever cut by a page edge, pages 2+
     get a top margin, and the sheet is a whole number of A4 pages.
     ========================================================= */
  const PAGE_TOP = 14 * MM, PAGE_BOTTOM = 14 * MM;
  const ATOMS = ['.cv__head', '.cv__main > .cv__id', '.cv__side > .cv__id', '.cv__side > .cv__photo', '.cv-sec__title', '.entry', '.levels', '.chips', '.infos',
    '.refs', '.cv-text', '.cv__side .cv__contact', '.letter__to', '.letter__place', '.letter__obj', '.letter__appel',
    '.letter__body > p', '.letter__closing', '.letter__sign'].join(',');

  function paginate(article) {
    if (!article || !article.offsetHeight) return 1;
    article.querySelectorAll('.pg-spacer').forEach(el => el.remove());
    article.style.minHeight = '';
    const scale = article.getBoundingClientRect().height / article.offsetHeight || 1; // the preview is scaled down
    const y = (el, edge) => (el.getBoundingClientRect()[edge] - article.getBoundingClientRect().top) / scale;
    // Card templates keep each section whole when it fits on a page; a longer one breaks between its blocks.
    const usable = A4_H - PAGE_TOP - PAGE_BOTTOM;
    const cards = article.matches('.cv--cards')
      ? new Set([...article.querySelectorAll('.cv-sec')].filter(el => el.offsetHeight <= usable * 0.6)) : new Set();
    const atoms = [...cards, ...[...article.querySelectorAll(ATOMS)].filter(el => ![...cards].some(c => c.contains(el)))]
      .filter(el => !el.parentElement.closest(ATOMS))
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    atoms.forEach((el, i) => {
      // A section title travels with the first block under it.
      const next = atoms[i + 1];
      const end = el.matches('.cv-sec__title') && next && el.parentElement.contains(next) ? next : el;
      const top = y(el, 'top'), bottom = y(end, 'bottom');
      const pageTop = Math.floor(top / A4_H) * A4_H;
      let target = null;
      if (pageTop > 0 && top < pageTop + PAGE_TOP) target = pageTop + PAGE_TOP;
      else if (bottom > pageTop + A4_H - PAGE_BOTTOM && bottom - top <= A4_H - PAGE_TOP - PAGE_BOTTOM) target = pageTop + A4_H + PAGE_TOP;
      if (target === null) return;
      const sp = document.createElement('div');
      sp.className = 'pg-spacer';
      sp.setAttribute('aria-hidden', 'true');
      sp.style.height = `${target - top}px`;
      el.before(sp);
      const off = target - y(el, 'top'); // margin collapsing can shift it a little: correct once
      if (Math.abs(off) > 0.5) sp.style.height = `${Math.max(0, target - top + off)}px`;
    });
    const pages = Math.max(1, Math.ceil(article.offsetHeight / A4_H - 0.005));
    article.style.minHeight = `${pages * 297}mm`;
    return pages;
  }

  // Off-screen, unscaled copy used for printing and measuring.
  function printHost() {
    let host = document.getElementById('printHost');
    if (!host) {
      host = document.createElement('div');
      host.id = 'printHost';
      host.setAttribute('aria-hidden', 'true');
      document.body.append(host);
    }
    return host;
  }
  function measure(html) {
    const host = printHost();
    host.innerHTML = html;
    return paginate(host.firstElementChild);
  }

  let printSource = null;
  window.addEventListener('beforeprint', () => { if (printSource) measure(printSource()); });
  // getHtml is read on every print, including Ctrl+P from the browser menu.
  const setPrintSource = getHtml => { printSource = getHtml; };

  async function printDoc(title) {
    await document.fonts?.ready;
    measure(printSource());
    const prev = document.title;
    document.title = title; // browsers use the title as the PDF file name
    window.addEventListener('afterprint', () => { document.title = prev; }, { once: true });
    window.print();
  }

  // Largest density (up to the current one) that keeps the CV on one page.
  async function fitOnePage(data, settings) {
    await document.fonts?.ready;
    const start = densityValue(settings);
    for (const d of [1.08, 1, 0.96, 0.92, 0.88, 0.85, 0.82, 0.79, 0.76].filter(v => v <= start + 0.001)) {
      if (measure(renderCv(data, { ...settings, density: 'fit', fitD: d })) === 1) return { fitD: d, pages: 1 };
    }
    return { fitD: 0.76, pages: measure(renderCv(data, { ...settings, density: 'fit', fitD: 0.76 })) };
  }

  /* =========================================================
     List editors shared by the book and expert mode
     ========================================================= */
  const MISSION_NOTE = '<p class="ph-note">Remplace les passages entre crochets, comme <code>[X]</code>, par tes vraies informations.</p>';
  function missionAssist(i, domain) {
    const dom = DOMAINS[domain], target = `experiences-${i}-description`;
    return `<details class="assist"><summary>${icon('pen')}Idées de missions</summary><div class="assist__body">
      <span class="assist__label">Missions types · ${esc(dom.name)}</span>
      <div class="suggest">${dom.missions.map(m => `<button type="button" data-insert="${target}" data-mode="line" data-text="${esc(m)}">${esc(m)}</button>`).join('')}</div>
      <span class="assist__label">Verbes d’action</span>
      <div class="verbs">${VERBS.map(v => `<button type="button" data-insert="${target}" data-mode="verb" data-text="${esc(v)}">${esc(v)}</button>`).join('')}</div>
      ${MISSION_NOTE}</div></details>`;
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

  function listHtml(list, items, domain) {
    const spec = LISTS[list];
    if (!items.length) return `<p class="empty">${esc(spec.empty)}</p>`;
    return items.map((item, i) => {
      const n = `${spec.label} ${i + 1}`;
      const btn = (action, ico, label, disabled, extra = '') =>
        `<button type="button" class="icon-btn${extra}" data-action="${action}" data-list="${list}" data-index="${i}" aria-label="${label} : ${esc(n)}" title="${label}"${disabled ? ' disabled' : ''}>${icon(ico)}</button>`;
      return `<fieldset class="item">
        <legend>${esc(n)}</legend>
        <div class="item__tools">${btn('up', 'up', 'Monter', i === 0)}${btn('down', 'down', 'Descendre', i === items.length - 1)}${btn('remove', 'x', 'Supprimer', false, ' icon-btn--danger')}</div>
        <div class="item__grid">${spec.fields.map(f => itemField(list, i, f, item[f.key])).join('')}${list === 'experiences' ? missionAssist(i, domain) : ''}</div>
      </fieldset>`;
    }).join('');
  }

  // Applies an add / remove / up / down button to data[list]; returns the element to focus, or null if cancelled.
  function listAction(btn, data, rerender) {
    const { action, list } = btn.dataset, i = +btn.dataset.index, items = data[list];
    const firstKey = LISTS[list].fields[0].key;
    if (action === 'add') {
      if (items.length >= MAX_ITEMS) return null;
      items.push(blankItem(list));
      rerender(list);
      return () => document.getElementById(`${list}-${items.length - 1}-${firstKey}`);
    }
    if (action === 'remove') {
      if (isFilled(items[i]) && !confirm(`Supprimer « ${items[i][firstKey].trim() || `${LISTS[list].label} ${i + 1}`} » ?`)) return null;
      items.splice(i, 1);
      rerender(list);
      return () => document.querySelector(`[data-action="add"][data-list="${list}"]`);
    }
    const j = action === 'up' ? i - 1 : i + 1;
    [items[i], items[j]] = [items[j], items[i]];
    rerender(list);
    return () => {
      const same = document.querySelector(`[data-action="${action}"][data-list="${list}"][data-index="${j}"]`);
      return same && !same.disabled ? same : document.getElementById(`${list}-${j}-${firstKey}`);
    };
  }

  // Writes one input event into data; returns false when the target is not a data field.
  function applyInput(t, data) {
    const ds = t.dataset;
    if (ds.field) data[ds.field] = t.value;
    else if (ds.list) data[ds.list][+ds.index][ds.key] = t.value;
    else if (ds.letter) data.letter[ds.letter] = t.value;
    else return false;
    return true;
  }

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

  function buildDraft(data) {
    const L = data.letter;
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
    return [p1, p2, p3].join('\n\n');
  }

  /* =========================================================
     Guides and one-click suggestions
     ========================================================= */
  const { GUIDES, LEVEL_HINTS, SKILLS, LANGUAGES } = window.TTU_CONTENT;
  function guideHtml(key, open = false) {
    const g = GUIDES[key];
    if (!g) return '';
    const levels = g.levels
      ? `<dl class="guide__levels">${Object.entries(LEVEL_HINTS[g.levels]).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : '';
    return `<details class="guide"${open ? ' open' : ''}><summary>${icon('help')}<span>${esc(g.q)}</span></summary><div class="guide__body">`
      + `${g.body ? `<p>${esc(g.body)}</p>` : ''}${g.tips.length ? `<ul>${g.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}${levels}</div></details>`;
  }

  const suggestionsFor = (list, domain) => (list === 'competences' ? SKILLS[domain] : list === 'langues' ? LANGUAGES : []) || [];
  function suggestHtml(list, domain, data) {
    if (list !== 'competences' && list !== 'langues') return '';
    const have = new Set(data[list].map(x => x.nom.trim().toLowerCase()));
    const items = suggestionsFor(list, domain).filter(x => !have.has(x.toLowerCase()));
    const label = list === 'competences' ? `Idées · ${esc(DOMAINS[domain].name)}` : 'Langues courantes';
    return `<div class="suggest-chips" id="suggest-${list}">${items.length ? `<span class="assist__label">${label}</span>
      <div class="verbs">${items.map(x => `<button type="button" data-add="${list}" data-text="${esc(x)}">${icon('plus')}${esc(x)}</button>`).join('')}</div>` : ''}</div>`;
  }
  function addSuggestion(list, text, data) {
    if (data[list].length >= MAX_ITEMS || data[list].some(x => x.nom.trim().toLowerCase() === text.toLowerCase())) return false;
    data[list].push({ ...blankItem(list), nom: text });
    return true;
  }

  const fileSlug = d => (d.fullName.trim() || 'TrouveToiUnTaf').replace(/[^\p{L}\p{N}]+/gu, '-');

  return {
    KEYS, SKILL_LEVELS, LANG_LEVELS, TEXT_FIELDS, LETTER_FIELDS, LETTER_DEFAULTS, TABS, MAX_IMPORT_BYTES, MAX_ITEMS, MM, A4_W, A4_H,
    LISTS, SECTIONS, DEFAULT_ORDER, blankItem, blankLetter, blankData, defaultSettings, normalize, normalizeSettings,
    esc, store, icon, isFilled, hasContent, plural, today, densityValue,
    renderCv, renderLetter, defaultObjet, analyze, resizeImage,
    loadState, saveState, paginate, measure, setPrintSource, printDoc, fitOnePage,
    listHtml, missionAssist, listAction, applyInput, insertText, buildDraft, fileSlug, guideHtml, suggestHtml, addSuggestion
  };
})();
