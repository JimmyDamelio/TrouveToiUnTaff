/* Static content for TrouveToiUnTaf: templates, typefaces, colours, writing help, example CV.
   Loaded before app.js as a classic script so the site also works opened from file://. */
window.TTU_CONTENT = (() => {
  'use strict';

  // side: which column holds the sidebar sections (false = single column).
  const TEMPLATES = {
    'minimal-pro':       { name: 'Minimal Pro',       desc: 'Épuré, beaucoup de blanc',        accent: '#1a1a1a', paper: '#ffffff', side: false },
    'corporate':         { name: 'Corporate',         desc: 'Bandeau sobre, banque et conseil', accent: '#1e3a5f', paper: '#ffffff', side: false },
    'timeline':          { name: 'Timeline',          desc: 'Parcours sur une frise',           accent: '#0f766e', paper: '#ffffff', side: false },
    'modern-asymmetric': { name: 'Modern Asymmetric', desc: 'Colonne sombre à gauche',          accent: '#fbbf24', paper: '#ffffff', side: 'left' },
    'compact':           { name: 'Compact',           desc: 'Dense, tient sur une page',        accent: '#334155', paper: '#ffffff', side: 'right' },
    'elegant-classic':   { name: 'Elegant Classic',   desc: 'Serif, centré, intemporel',        accent: '#8b7355', paper: '#faf9f7', side: false },
    'pastel':            { name: 'Pastel',            desc: 'Doux et arrondi',                  accent: '#b57edc', paper: '#fffaf5', side: false },
    'bold-creative':     { name: 'Bold Creative',     desc: 'Audacieux, pour les créatifs',     accent: '#dc2626', paper: '#fcd34d', side: false },
    'tech-futurist':     { name: 'Tech Futurist',     desc: 'Terminal, pour les devs',          accent: '#00ff88', paper: '#0f172a', side: false },
    'dark-mode':         { name: 'Dark Edition',      desc: 'Fond sombre, accent vif',          accent: '#06b6d4', paper: '#18181b', side: false },
    'studio-bleu':       { name: 'Studio Bleu',       desc: 'Grand nom en relief, touche manuscrite', accent: '#1555c6', paper: '#fefefe', side: 'right' },
    'bulles':            { name: 'Bulles',            desc: 'Cartes arrondies, tout en douceur',  accent: '#18428e', paper: '#e7f3fd', side: false, cards: true },
    'pilule':            { name: 'Pilule',            desc: 'Colonne blanche arrondie sur fond bleu', accent: '#4f86c6', paper: '#bed8ed', side: 'left' },
    'bordeaux':          { name: 'Bordeaux',          desc: 'Fond bordeaux, contenu sur carte blanche', accent: '#a1122b', paper: '#5c010e', side: 'left', nameSide: 'after' },
    'rouge-presse':      { name: 'Rouge Presse',      desc: 'Titres massifs, colonne rouge et noire', accent: '#ab0304', paper: '#ffffff', side: 'left', nameSide: 'before' },
    'polaroid':          { name: 'Polaroïd',          desc: 'Damier, photo instantanée, carte rose', accent: '#2a2658', paper: '#fcece5', side: 'right' },
    'grenat':            { name: 'Grenat',            desc: 'Colonne rouge, compétences en anneaux', accent: '#8b161e', paper: '#ffffff', side: 'right', defaultLevels: 'bars' },
    'prune':             { name: 'Prune',             desc: 'Colonne prune, titres en pastilles',  accent: '#541c23', paper: '#ffffff', side: 'left', defaultLevels: 'dots' },
    'marine-or':         { name: 'Marine & Or',       desc: 'Bleu marine et liserés dorés',        accent: '#192b41', paper: '#f8f7f6', side: 'left', defaultLevels: 'bars' },
    'ardoise':           { name: 'Ardoise',           desc: 'Bandeau ardoise, photo en arche',     accent: '#3b3c47', paper: '#ffffff', side: 'left', defaultLevels: 'bars' },
    'carnet':            { name: 'Carnet',            desc: 'Papier quadrillé, feutre et bord déchiré', accent: '#e6eced', paper: '#191919', side: 'left', head: 'full', defaultLevels: 'dots',
                           sideKeys: ['profil', 'objectif', 'formations', 'competences', 'langues', 'interets', 'infos'] },
    'lavande':           { name: 'Lavande',           desc: 'Panneau lavande sur fond anthracite',  accent: '#a3b1f6', paper: '#212224', side: 'right' },
    'mauve-web':         { name: 'Fenêtre Mauve',     desc: 'Quadrillage, pastilles et fenêtre web', accent: '#622e57', paper: '#f3f0ea', side: 'right', defaultLevels: 'bars',
                           sideKeys: ['profil', 'langues', 'interets', 'certifications', 'infos', 'references'] },
    'retro':             { name: 'Rétro',             desc: 'Typo rétro, cartes rouge cerise',     accent: '#810a12', paper: '#fefdec', side: 'left',
                           sideKeys: ['formations', 'competences', 'certifications', 'infos', 'references'] },
    'timbre':            { name: 'Timbre',            desc: 'Photo timbre-poste, cartes translucides', accent: '#fef3d7', paper: '#88231e', side: 'right', cards: true },
    'ats':               { name: 'ATS Sobre',         desc: 'Sans photo ni colonnes, lu par les logiciels de recrutement', accent: '#111111', paper: '#ffffff', side: false, noPhoto: true, forceLevels: 'text' }
  };

  // head/body font stacks. 'auto' keeps each template's own pairing.
  const FONTS = {
    auto:      { name: 'Police du modèle', sample: 'Aa', head: '', body: '' },
    serif:     { name: 'Classique',  sample: 'Aa', head: "'Source Serif 4', Georgia, serif",   body: "'Source Serif 4', Georgia, serif" },
    mixte:     { name: 'Mixte',      sample: 'Aa', head: "'Source Serif 4', Georgia, serif",   body: "'Inter', Arial, sans-serif" },
    moderne:   { name: 'Moderne',    sample: 'Aa', head: "'Inter', Arial, sans-serif",          body: "'Inter', Arial, sans-serif" },
    doux:      { name: 'Doux',       sample: 'Aa', head: "'Nunito', Arial, sans-serif",         body: "'Nunito', Arial, sans-serif" },
    elegant:   { name: 'Élégant',    sample: 'Aa', head: "'Crimson Text', Georgia, serif",      body: "'Crimson Text', Georgia, serif" },
    standard:  { name: 'Standard',   sample: 'Aa', head: 'Arial, Helvetica, sans-serif',        body: 'Arial, Helvetica, sans-serif' }
  };

  const ACCENTS = ['#1f3a93', '#0369a1', '#0f766e', '#15803d', '#b45309', '#b91c1c', '#be185d', '#6d28d9', '#334155', '#111111'];

  const DENSITIES = { compact: { name: 'Serré', value: 0.9 }, normal: { name: 'Normal', value: 1 }, airy: { name: 'Aéré', value: 1.08 } };

  const LEVEL_STYLES = { text: 'Texte', dots: 'Points', bars: 'Barres', hidden: 'Masqué' };

  const DOMAINS = {
    tech: {
      name: 'Développement & Tech',
      profils: [
        'Avec [X] ans d’expérience en développement [web / mobile], je conçois des applications fiables et faciles à maintenir. J’aime travailler au plus près des utilisateurs et livrer souvent.',
        'Je cherche à rejoindre une équipe où la qualité du code et l’entraide comptent autant que la vitesse, pour construire des produits réellement utiles.'
      ],
      missions: [
        'Développé [fonctionnalité] utilisée par [X] utilisateurs',
        'Réduit le temps de chargement de [X] % en optimisant [élément]',
        'Mis en place des tests automatisés couvrant [X] % du code',
        'Migré [application] vers [technologie] sans interruption de service',
        'Conçu une API [REST / GraphQL] utilisée par [X] applications',
        'Accompagné [X] développeurs juniors grâce aux revues de code'
      ]
    },
    vente: {
      name: 'Commerce & Vente',
      profils: [
        'Avec [X] ans d’expérience en vente [B2B / B2C], je développe des relations durables avec mes clients et dépasse régulièrement mes objectifs.',
        'À l’écoute et persévérant(e), je transforme les besoins de mes clients en solutions concrètes, du premier contact à la signature.'
      ],
      missions: [
        'Dépassé l’objectif de chiffre d’affaires annuel de [X] %',
        'Développé un portefeuille de [X] clients sur [secteur / zone]',
        'Négocié des contrats d’une valeur totale de [X] €',
        'Porté le taux de réachat à [X] % grâce au suivi client',
        'Conseillé jusqu’à [X] clients par jour en magasin',
        'Formé [X] nouveaux vendeurs aux techniques de vente'
      ]
    },
    marketing: {
      name: 'Marketing & Communication',
      profils: [
        'Spécialisé(e) en marketing [digital / produit], je construis des campagnes mesurables qui font grandir l’audience et les ventes.',
        'Créatif(ve) et attentif(ve) aux chiffres, j’aime relier une bonne idée à un résultat concret et mesurable.'
      ],
      missions: [
        'Piloté des campagnes [Google Ads / Meta] avec un budget de [X] € par mois',
        'Augmenté le trafic organique de [X] % en [X] mois',
        'Fait passer la communauté [réseau] de [X] à [X] abonnés',
        'Rédigé [X] articles et newsletters (taux d’ouverture : [X] %)',
        'Organisé [X] événements réunissant [X] participants',
        'Lancé [produit] : [X] ventes le premier mois'
      ]
    },
    admin: {
      name: 'Administration & Gestion',
      profils: [
        'Rigoureux(se) et organisé(e), j’assure le bon fonctionnement administratif d’une équipe de [X] personnes et j’aime simplifier les processus.',
        'Avec [X] ans d’expérience en gestion [administrative / comptable], je suis la personne sur qui l’on peut compter pour les dossiers sensibles et les délais serrés.'
      ],
      missions: [
        'Géré l’agenda et les déplacements de [X] responsables',
        'Traité [X] factures par mois sans retard de paiement',
        'Mis en place un outil de suivi qui a réduit les délais de [X] %',
        'Accueilli et orienté [X] visiteurs et appels par jour',
        'Préparé les éléments de paie de [X] salariés',
        'Organisé [X] réunions et séminaires par an'
      ]
    },
    resto: {
      name: 'Restauration & Hôtellerie',
      profils: [
        'Avec [X] ans d’expérience en salle et en cuisine, je garde le sourire et le rythme, même pendant les coups de feu.',
        'Attentif(ve) au détail et au confort des clients, je veux contribuer à une expérience dont on se souvient.'
      ],
      missions: [
        'Assuré le service de [X] couverts par soir',
        'Encadré une équipe de [X] serveurs',
        'Appliqué les normes d’hygiène HACCP lors de [X] contrôles réussis',
        'Géré les stocks et réduit le gaspillage de [X] %',
        'Accueilli une clientèle internationale en [langues]',
        'Obtenu une note moyenne de [X]/5 sur [plateforme d’avis]'
      ]
    },
    sante: {
      name: 'Santé & Social',
      profils: [
        '[Métier] diplômé(e) depuis [année], j’accompagne les patients avec écoute et rigueur en service [type de service].',
        'Engagé(e) auprès des publics fragiles, je place la relation humaine au cœur de mon travail.'
      ],
      missions: [
        'Pris en charge jusqu’à [X] patients par jour en service [type]',
        'Accompagné [X] personnes dans leurs démarches [administratives / d’insertion]',
        'Co-construit [X] projets de soins personnalisés avec l’équipe pluridisciplinaire',
        'Animé des ateliers [thème] pour des groupes de [X] personnes',
        'Assuré la traçabilité des soins dans [logiciel]',
        'Formé [X] stagiaires aux protocoles du service'
      ]
    },
    logistique: {
      name: 'Logistique & Transport',
      profils: [
        'Fiable et organisé(e), je garantis des livraisons à l’heure et des stocks justes, avec [X] ans d’expérience en [entrepôt / transport].',
        'Titulaire des CACES [catégories], je travaille vite et en sécurité.'
      ],
      missions: [
        'Préparé jusqu’à [X] commandes par jour avec moins de [X] % d’erreurs',
        'Réalisé [X] livraisons par jour sur [zone]',
        'Réorganisé l’entrepôt et réduit les temps de préparation de [X] %',
        'Conduit des chariots élévateurs (CACES [catégorie]) en toute sécurité',
        'Réalisé les inventaires mensuels sur [X] références',
        'Coordonné [X] transporteurs pour tenir les délais'
      ]
    },
    btp: {
      name: 'Bâtiment & Industrie',
      profils: [
        '[Métier] avec [X] ans d’expérience sur chantier, je livre un travail soigné dans le respect des délais et des règles de sécurité.',
        'Habile de mes mains et curieux(se) des nouvelles techniques, j’aime voir un projet prendre forme, du plan à la réception.'
      ],
      missions: [
        'Réalisé [type de travaux] sur [X] chantiers [résidentiels / industriels]',
        'Lu et interprété les plans de [X] projets',
        'Encadré une équipe de [X] compagnons',
        'Assuré la maintenance préventive de [X] machines',
        'Réduit les rebuts de production de [X] %',
        'Tenu [X] jours sans accident grâce au respect des consignes'
      ]
    },
    education: {
      name: 'Éducation & Animation',
      profils: [
        'Titulaire du [BAFA / diplôme], j’anime des activités qui donnent envie d’apprendre à des groupes de [X] enfants.',
        'Patient(e) et créatif(ve), j’aime adapter mes méthodes à chacun pour faire progresser tout le groupe.'
      ],
      missions: [
        'Encadré des groupes de [X] enfants de [âge] ans',
        'Conçu et animé [X] ateliers [thème]',
        'Accompagné [X] élèves en soutien scolaire : [résultat obtenu]',
        'Organisé [X] sorties et séjours en toute sécurité',
        'Préparé des séquences pédagogiques pour le niveau [niveau]',
        'Tenu informées [X] familles chaque semaine'
      ]
    },
    etudiant: {
      name: 'Étudiant / Premier emploi',
      profils: [
        'Étudiant(e) en [formation] à [école], je cherche [un stage / une alternance / un premier emploi] en [domaine] à partir de [date].',
        'Curieux(se) et motivé(e), j’ai développé mon sens des responsabilités grâce à [job étudiant, association, projet] et j’apprends vite.'
      ],
      missions: [
        'Réalisé un projet [d’école / personnel] : [résultat]',
        'Travaillé [X] heures par semaine en parallèle de mes études',
        'Organisé [événement] pour l’association [nom] ([X] participants)',
        'Servi jusqu’à [X] clients par jour en job d’été',
        'Rédigé un mémoire sur [sujet] (note : [X]/20)',
        'Animé les réseaux sociaux de [association / projet]'
      ]
    }
  };

  const VERBS = ['Piloté', 'Conçu', 'Développé', 'Lancé', 'Négocié', 'Optimisé', 'Réduit', 'Augmenté', 'Organisé', 'Encadré',
    'Formé', 'Coordonné', 'Analysé', 'Créé', 'Mis en place', 'Géré', 'Amélioré', 'Automatisé', 'Fidélisé', 'Rédigé',
    'Animé', 'Résolu', 'Supervisé', 'Accompagné', 'Réalisé', 'Planifié', 'Déployé', 'Simplifié'];

  // Vague phrases recruiters skim past, with what to write instead.
  const WEAK = [
    { re: /\bresponsable d[eu']/i, word: 'responsable de', fix: 'Piloté, Géré, Supervisé' },
    { re: /\bcharg[ée]+s? d[eu']/i, word: 'chargé de', fix: 'Géré, Réalisé, Assuré' },
    { re: /\bparticip[ée]+s? (à|au|aux)\b/i, word: 'participé à', fix: 'Réalisé, Co-construit, Contribué à [résultat]' },
    { re: /\baid[ée]+s? (à|au|aux)\b/i, word: 'aidé à', fix: 'Accompagné, Facilité, Soutenu' },
    { re: /\bdivers(es)?\b/i, word: 'divers', fix: 'cite précisément lesquels' },
    { re: /\betc\.?/i, word: 'etc.', fix: 'liste seulement ce qui compte' },
    { re: /\bt[âa]ches\b/i, word: 'tâches', fix: 'parle de missions et de résultats' }
  ];

  const CLOSINGS = [
    'Je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.',
    'Dans l’attente de votre retour, je vous prie de recevoir, Madame, Monsieur, mes salutations respectueuses.',
    'Je reste à votre disposition pour un entretien et vous adresse mes sincères salutations.',
    'Bien cordialement,'
  ];

  const EXAMPLE = {
    fullName: 'Sophie Martin', jobTitle: 'Développeuse Full-Stack',
    email: 'sophie.martin@email.fr', phone: '06 12 34 56 78', address: 'Paris, France', website: 'linkedin.com/in/sophie-martin',
    permis: 'Permis B', disponibilite: 'Préavis d’un mois',
    profil: 'Développeuse avec 5 ans d’expérience dans la création d’applications web. Spécialisée en React et Node.js, j’aime transformer des problèmes complexes en interfaces simples et livrer souvent.',
    objectif: 'Rejoindre une équipe produit pour construire des outils qui ont un impact réel sur leurs utilisateurs.',
    experiences: [
      { poste: 'Développeuse Full-Stack Senior', entreprise: 'Studio Nova, Paris', periode: '2022 – aujourd’hui', description: 'Refondu le parcours de réservation : +18 % de conversion\nMis en place les tests end-to-end : 40 % de régressions en moins\nAccompagné 3 développeurs juniors' },
      { poste: 'Développeuse Front-End', entreprise: 'Agence Pixel, Lyon', periode: '2019 – 2022', description: 'Livré 15 sites e-commerce pour des PME\nCréé un design system React partagé entre 6 projets' }
    ],
    formations: [
      { titre: 'Master Informatique', ecole: 'Université Lyon 1', annee: '2019' },
      { titre: 'Licence Mathématiques', ecole: 'Université Lyon 1', annee: '2017' }
    ],
    projets: [
      { nom: 'Application de covoiturage étudiant', contexte: 'Projet personnel', periode: '2023', description: '1 200 inscrits sur le campus en 3 mois' }
    ],
    competences: [
      { nom: 'JavaScript / TypeScript', niveau: 'Expert' }, { nom: 'React & Next.js', niveau: 'Avancé' },
      { nom: 'Node.js', niveau: 'Avancé' }, { nom: 'PostgreSQL', niveau: 'Intermédiaire' },
      { nom: 'Design UI', niveau: 'Avancé' }, { nom: 'Tests automatisés', niveau: 'Avancé' }
    ],
    langues: [{ nom: 'Français', niveau: 'Natif' }, { nom: 'Anglais', niveau: 'Courant' }, { nom: 'Espagnol', niveau: 'Intermédiaire' }],
    certifications: [{ nom: 'AWS Certified Developer', organisme: 'Amazon Web Services', annee: '2023' }],
    benevolat: [{ role: 'Mentore', organisation: 'Association Femmes & Code', periode: 'Depuis 2021', description: 'Accompagné 12 personnes en reconversion vers le développement' }],
    interets: 'Photographie, randonnée, open source, cuisine',
    letter: { poste: 'Développeuse Full-Stack', entreprise: 'Studio Lumen', contact: 'Service recrutement', adresse: '12 rue des Lilas\n75011 Paris', lieu: 'Paris' }
  };

  // Skill ideas per domain, offered as one-click chips next to the skills list.
  const SKILLS = {
    tech: ['JavaScript', 'Python', 'SQL', 'Git', 'React', 'API REST', 'Tests automatisés', 'Linux'],
    vente: ['Techniques de vente', 'Encaissement', 'Prospection', 'Négociation', 'Gestion des stocks', 'Merchandising', 'Fidélisation client', 'CRM (Salesforce, HubSpot)'],
    marketing: ['Réseaux sociaux', 'Google Ads', 'SEO', 'Canva', 'Rédaction web', 'Google Analytics', 'Emailing', 'Photoshop'],
    admin: ['Excel', 'Word', 'Gestion d’agenda', 'Facturation', 'Paie', 'Classement et archivage', 'Accueil téléphonique', 'SAP'],
    resto: ['Service en salle', 'Prise de commande', 'Normes HACCP', 'Mise en place', 'Bar et cocktails', 'Encaissement', 'Gestion des stocks', 'Accueil client'],
    sante: ['Soins d’hygiène', 'Prise de constantes', 'Dossier patient informatisé', 'Gestes d’urgence (AFGSU)', 'Accompagnement social', 'Écoute active', 'Protocoles d’hygiène', 'Travail en équipe pluridisciplinaire'],
    logistique: ['Préparation de commandes', 'CACES 1, 3, 5', 'Gestion des stocks', 'Lecture de bons de livraison', 'Logiciel WMS', 'Chargement et déchargement', 'Inventaire', 'Conduite de poids lourd'],
    btp: ['Lecture de plans', 'Maçonnerie', 'Électricité', 'Plomberie', 'Soudure', 'Règles de sécurité chantier', 'Utilisation d’outils électroportatifs', 'Habilitation électrique'],
    education: ['Animation de groupe', 'BAFA', 'Préparation de séquences', 'Gestion de conflits', 'Premiers secours (PSC1)', 'Activités manuelles', 'Soutien scolaire', 'Communication avec les familles'],
    etudiant: ['Pack Office', 'Travail en équipe', 'Recherche documentaire', 'Prise de parole', 'Gestion de projet', 'Réseaux sociaux', 'Anglais professionnel', 'Organisation']
  };

  const LANGUAGES = ['Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien', 'Arabe', 'Portugais', 'Chinois'];

  const LEVEL_HINTS = {
    competences: {
      'Débutant': 'Tu en as les bases et tu l’as déjà un peu pratiqué.',
      'Intermédiaire': 'Tu l’utilises seul(e) pour les tâches courantes.',
      'Avancé': 'Tu le maîtrises : on peut te confier des tâches complexes.',
      'Expert': 'Tu pourrais le former à d’autres personnes.'
    },
    langues: {
      'Débutant': 'A1 à A2 : tu te présentes et tu comprends des phrases simples.',
      'Intermédiaire': 'B1 : tu te débrouilles au quotidien et en voyage.',
      'Courant': 'B2 à C1 : tu tiens une conversation ou une réunion de travail.',
      'Natif': 'C’est ta langue maternelle.'
    }
  };

  // Short guides shown next to the fields: what goes here, and how to write it well.
  const GUIDES = {
    photo: { q: 'Faut-il mettre une photo ?', body: 'En France, la photo n’est pas obligatoire. Elle aide surtout pour les métiers en contact avec le public : vente, accueil, restauration.',
      tips: ['Fond clair et uni, cadrage du visage aux épaules.', 'Une tenue proche de celle du poste visé.', 'Pas de selfie, de photo de vacances ni de lunettes de soleil.', 'Grande entreprise qui trie les CV par logiciel : le modèle ATS Sobre n’affiche pas de photo.'] },
    identite: { q: 'Quelles infos mettre ?', body: 'Juste ce qu’il faut pour qu’on te recontacte facilement.',
      tips: ['Un email sérieux, idéalement prenom.nom@…', 'Ta ville suffit, pas besoin de l’adresse complète.', 'Le titre, c’est le poste que tu vises, pas forcément celui que tu occupes.', 'Âge, situation familiale, numéro de sécurité sociale : inutile, ce n’est pas demandé.'] },
    accroche: { q: 'C’est quoi, une accroche ?', body: '2 ou 3 phrases tout en haut du CV : qui tu es, ce que tu apportes, ce que tu cherches. C’est souvent la seule partie lue en entier.',
      tips: ['Adapte-la à chaque offre en reprenant un ou deux mots de l’annonce.', 'Parle de ce que tu sais faire, pas seulement de tes qualités.', 'L’objectif dit le poste ou le contrat visé, et quand tu es disponible.'] },
    experiences: { q: 'Qu’est-ce qui compte comme expérience ?', body: 'Tout ce où tu as travaillé : CDI, CDD, intérim, stage, alternance, job d’été, mission en freelance.',
      tips: ['Commence par la plus récente.', '2 à 4 missions par expérience, une par ligne, chacune avec un verbe d’action.', 'Un chiffre vaut mieux qu’un adjectif : « 60 clients par jour » plutôt que « beaucoup de clients ».', 'Un trou dans ton parcours ? Une formation, un projet ou du bénévolat peuvent le combler.'] },
    formations: { q: 'Quelles formations mettre ?', body: 'Tes diplômes du plus récent au plus ancien, et les formations utiles pour le poste.',
      tips: ['À partir de bac +2, le bac n’est plus indispensable.', 'Diplôme en cours ? Écris « en cours » ou l’année prévue.', 'Les certifications courtes (CACES, SST, TOEIC) vont dans « Les petits plus ».'] },
    competences: { q: 'C’est quoi, une compétence ?', body: 'Ce que tu sais faire concrètement et qui sert au poste : un outil, une technique, un savoir-faire.',
      tips: ['Exemples : Excel, encaissement, soudure, prise de commande, Photoshop, gestion des stocks.', 'Les qualités (rigueur, ponctualité) vont plutôt dans ton accroche, où tu peux les illustrer.', '6 à 10 compétences suffisent : choisis celles que l’annonce demande.', 'Reste honnête sur les niveaux : on peut te tester en entretien.'], levels: 'competences' },
    langues: { q: 'Comment choisir mon niveau ?', body: 'Choisis le niveau qui correspond à ce que tu sais faire aujourd’hui, pas à ce que tu as étudié.', tips: [], levels: 'langues' },
    bonus: { q: 'À quoi servent ces sections ?', body: 'Elles font la différence quand ton expérience est courte, ou quand elles touchent au poste. Aucune n’est obligatoire.',
      tips: ['Un projet perso ou d’école prouve ce que tu sais faire.', 'Le bénévolat montre ton engagement et ce que tu sais gérer.', 'Le permis B compte pour beaucoup de postes : indique-le.', 'Centres d’intérêt : 3 ou 4, précis (« football en club depuis 8 ans » plutôt que « sport »).'] },
    modele: { q: 'Quel modèle choisir ?', body: 'Le bon modèle dépend du secteur, pas seulement de tes goûts.',
      tips: ['Banque, conseil, administration : Corporate, Minimal Pro ou Elegant Classic.', 'Création, communication : Studio Bleu, Polaroïd, Carnet, Lavande, Rétro ou Bold Creative.', 'Réseaux sociaux, web : Fenêtre Mauve, Timbre ou Bulles.', 'Vente, marketing, accueil : Grenat, Bordeaux, Rouge Presse ou Pilule.', 'Enseignement, santé, administration : Ardoise, Prune ou Marine & Or.', 'Tech : Tech Futurist, Timeline ou Compact.', 'Candidature en ligne dans une grande entreprise : ATS Sobre, que les logiciels de tri lisent sans erreur.'] },
    finitions: { q: 'Les bons réglages', body: 'Une seule couleur d’accent et une police lisible suffisent.',
      tips: ['Un CV tient idéalement sur une page, deux au maximum avec beaucoup d’expérience.', 'Les niveaux en texte sont plus clairs pour un recruteur que les points ou les barres.'] },
    fin: { q: 'Avant d’envoyer', body: '',
      tips: ['Relis-toi à voix haute, ou fais-toi relire : une faute se voit tout de suite.', 'Envoie toujours un PDF, jamais un document modifiable.', 'Nomme ton fichier « CV-Prénom-Nom.pdf ».', 'Adapte ton titre et ton accroche à chaque offre.'] },
    destinataire: { q: 'À qui adresser la lettre ?', body: 'Si l’annonce donne un nom, utilise-le : « Madame Dupont » touche plus que « Madame, Monsieur ».',
      tips: ['Pas de nom ? Le service recrutement, ou le responsable du poste.', 'Reprends l’intitulé exact du poste de l’annonce.', 'Candidature spontanée : écris-le dans l’objet.'] },
    texte: { q: 'Comment structurer ta lettre ?', body: 'Trois paragraphes courts, sur une page : vous, moi, nous.',
      tips: ['Vous : ce qui t’attire chez cette entreprise, précisément.', 'Moi : une ou deux réussites qui prouvent que tu peux faire le poste.', 'Nous : ce que vous ferez ensemble, et la demande d’entretien.', '250 à 350 mots, c’est la bonne longueur.'] }
  };

  return { TEMPLATES, FONTS, ACCENTS, DENSITIES, LEVEL_STYLES, DOMAINS, VERBS, WEAK, CLOSINGS, EXAMPLE, SKILLS, LANGUAGES, LEVEL_HINTS, GUIDES };
})();
