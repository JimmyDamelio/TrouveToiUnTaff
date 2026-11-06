# TrouveToiUnTaf · CV et lettre de motivation

Crée ton CV et ta lettre de motivation en quelques minutes, directement dans ton navigateur.
Gratuit, sans compte, sans backend : tes données ne quittent jamais ton appareil.

**Utilisation :** ouvre `index.html` dans un navigateur, ou héberge le dossier tel quel (Netlify, GitHub Pages). Aucun build.

## Le parcours

1. **Ouverture animée** : la feuille se pose, s'écrit, « Bienvenue. » apparaît (bouton « Passer », version courte aux visites suivantes, aucune animation si l'appareil demande moins de mouvement).
2. **La question** « Prêt(e) à décrocher ton prochain taf ? » : « Pas encore » garde le visiteur sur l'accueil, « Oui » ouvre la suite.
3. **Le choix** : CV ou lettre de motivation.
4. **Le livre** : un chapitre par page, qui se tourne, chacun avec sa couleur. Page de gauche : le formulaire et son guide. Page de droite : le document en direct, avec ses sauts de page.
   - CV : photo (facultative, rappelée à la fin), identité, accroche, expériences, formation, compétences, langues, petits plus, modèle, finitions, téléchargement.
   - Lettre : coordonnées, destinataire, texte (brouillon écrit à partir du CV), modèle, téléchargement.
5. **Le modèle** se choisit en ouvrant des boîtes d'allumettes (21 modèles).
6. **Mode expert** (`atelier.html`) : tout l'éditeur sur une seule page, pour les retouches fines.

## Aide à la rédaction

- Un guide « C'est quoi ? » à chaque étape (ce qui compte comme expérience, ce qu'est une compétence, comment choisir son niveau de langue…)
- Compétences et langues en un clic, adaptées au domaine choisi
- Phrases d'accroche et missions types pour 10 domaines, verbes d'action
- Conseils en direct : chiffres manquants, mots vagues, longueur, crochets oubliés

## PDF

- Pagination réelle en pages A4 : aucun bloc n'est coupé, les pages suivantes ont leur marge, les fonds de modèle continuent sur chaque page
- « Tout faire tenir sur 1 page » : resserre texte et espacements jusqu'à une taille encore lisible
- PDF vectoriel via la fenêtre d'impression (« Enregistrer au format PDF »)
- `tests/pdf.mjs` vérifie les 21 modèles en version courte, normale et longue, plus la lettre

## Structure

```
index.html       le livre (parcours guidé)
atelier.html     le mode expert
css/app.css      styles communs et mode expert
css/book.css     le livre, l'ouverture, les boîtes d'allumettes
css/cv.css       les 21 modèles de CV, la lettre, l'impression
js/content.js    modèles, polices, phrases types, guides, exemple
js/engine.js     moteur commun : données, rendu, pagination A4, conseils
js/book.js       le livre
js/app.js        le mode expert
design/MASTER.md direction artistique
tests/           book.mjs, smoke.mjs (mode expert), pdf.mjs
```

## Confidentialité

Tout est stocké dans le `localStorage` du navigateur. Rien n'est envoyé à un serveur.
Les seules ressources externes chargées sont les polices Google Fonts.

## Tests

```bash
node tests/book.mjs
```

```bash
node tests/smoke.mjs
```

```bash
node tests/pdf.mjs
```

---

© TrouveToiUnTaf · Appartient à **Edunos Studio**.
