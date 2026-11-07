# TrouveToiUnTaf · direction artistique

Validée avec le propriétaire (Edunos Studio) avant la réalisation. Toute couleur, police ou durée vient d'ici.

## Thèse visuelle

**Un livre qui a de l'énergie.** Le public a 16 à 30 ans et cherche un job : le site doit accrocher l'œil en une
seconde, donner envie de commencer et rester lisible jusqu'au PDF. On garde le livre (formulaire à gauche, CV en
direct à droite) et on l'habille d'une palette vive construite sur un contraste complémentaire.

### Palette « violet électrique + orange »

Le violet et l'orange sont presque opposés sur le cercle chromatique : ensemble, ils créent le contraste le plus
fort qu'on puisse obtenir sans tomber dans le rouge/vert. Le fond reste froid (lilas très pâle), et **un seul
élément par écran est orange : l'action principale**. C'est l'effet d'isolement (Von Restorff) : ce qui diffère du
reste est vu et retenu en premier. Le jaune soleil sert aux surlignages, jamais au texte.

| Rôle | Clair | Sombre |
|---|---|---|
| Fond | lilas pâle `#F6F3FF` | nuit `#0F0B26` |
| Surface | blanc `#FFFFFF` | `#19143A` |
| Encre (texte) | indigo nuit `#17123B` | `#F2EEFF` |
| Texte secondaire | `#5E5884` | `#ADA6D6` |
| Accent (liens, focus, sélection) | violet électrique `#5B2EFF` | `#A08BFF` |
| Action principale | orange vif `#FF6B2C`, texte indigo nuit | `#FF7A3D` |
| Surlignage | jaune soleil `#FFD23F` | idem |
| Réussite (décor) | menthe `#1FC59A` | idem |

Contraste : texte ≥ 4,5:1 partout. Sur l'orange et sur les encres claires, le texte est indigo nuit, pas blanc ;
la couleur du texte posé sur une encre est calculée (contraste WCAG le plus fort entre blanc et indigo).
La couleur n'est jamais le seul signal : un chapitre fini porte aussi une coche.

### Encres de chapitre

Chaque chapitre a son encre : pastille du numéro, bandeau, onglet du sommaire, bouton « Suivant », et teinte du
fond de toute la page, qui glisse d'une encre à l'autre (600 ms) quand on tourne la page.

| Chapitre | Encre |
|---|---|
| Photo | corail `#FF5A5F` |
| Qui es-tu ? | violet `#5B2EFF` |
| Ton accroche | magenta `#D9338A` |
| Expériences | bleu `#1F6BFF` |
| Formation | vert `#13A35A` |
| Compétences | citron vert `#7BC71E` |
| Langues | turquoise `#00A6B8` |
| Les petits plus | orange `#FF7A1A` |
| Ton modèle | soleil `#FFC21A` |
| Finitions | rose `#F0386B` |
| C'est prêt | violet `#5B2EFF` |

### Typographie

- Titres : **Bricolage Grotesque** (700–800). Une grotesque à caractère, avec des formes un peu irrégulières qui
  donnent une voix jeune et directe sans faire « appli pour enfants » (Fredoka, Baloo, proposés par la base
  ui-ux-pro-max pour « playful », ont été écartés pour cette raison). Accents français complets.
- Interface et formulaires : **DM Sans**, neutre et très lisible en petite taille.
- Les CV gardent leurs propres polices (modèles) : la direction du site ne touche pas au document.

Composants : coins de 10 px (cartes) et 8 px (champs, boutons), bordures fines lilas, ombres colorées douces sous
les feuilles et les cartes au survol.

## Thèse d'interaction

Animations : **GSAP** (fourni dans `vendor/`, aucune dépendance réseau) pour l'interface, **Three.js** (chargé à la
demande, uniquement sur l'écran d'accueil) pour la scène 3D.

- **Accueil 3D** : des feuilles de CV en couleur flottent dans l'espace et tournent lentement ; elles suivent la
  souris (parallaxe douce). Sur « Oui », elles se rassemblent en une pile, la pile fonce vers l'écran et laisse
  place au choix CV / lettre (≈ 900 ms). Pendant le chargement, sans WebGL ou en mouvement réduit : la feuille
  dessinée en SVG prend sa place.
- **Titres** : lettres qui montent avec un léger dépassement (`back.out`), 40 ms entre les lettres.
- **Page qui se tourne** : la page est découpée en bandes verticales qui tournent les unes après les autres autour
  de la reliure ; la page se courbe au lieu de pivoter d'un bloc (600 ms), avec une ombre qui suit le pli.
- **Champs** : quand un champ passe de vide à rempli, une coche apparaît à côté de son libellé (pop 320 ms).
- **Sommaire** : quand un chapitre est complet, sa coche apparaît avec un petit anneau qui s'élargit.
- **CV en direct** : le bloc qui vient de changer est surligné de l'encre du chapitre, puis le surlignage s'efface
  (700 ms). Le surlignage est une couche posée au-dessus de l'aperçu, jamais dans le document ni dans le PDF.
- **C'est prêt** : une pluie de confettis aux couleurs de la palette (1,4 s, une fois).
- Survols : cartes qui se soulèvent de 3 px avec ombre colorée, 150 ms.
- Boîtes d'allumettes pour choisir le modèle (inchangé) : tiroir 220 ms, glissement 380 ms, ouverture 420 ms.
- Interdit : animation déclenchée au défilement, texte en dégradé, verre dépoli, boucle d'animation hors de
  l'accueil 3D.
- **Mouvement réduit** (`prefers-reduced-motion`) : pas de scène 3D, pas de confettis, pas de courbure ; tout est
  instantané. **Téléphone** : scène plus légère (moins de feuilles, résolution limitée). Le PDF reste statique.

Allowed patterns: fond lilas teinté par l'encre du chapitre, dégradé radial d'encre derrière le livre, palette
vive complémentaire violet/orange, orange réservé à l'action principale, grotesque d'affichage Bricolage Grotesque,
pastilles de numéro colorées, scène Three.js de feuilles flottantes sur l'accueil, page qui se courbe en bandes,
confettis à la fin, coches qui apparaissent, surlignage du CV en direct, boîtes d'allumettes en 3D CSS,
dépassement `back.out` sur les titres et les coches.
