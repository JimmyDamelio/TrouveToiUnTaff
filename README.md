# TrouveToiUnTaf · CV et lettre de motivation

Crée ton CV et ta lettre de motivation en quelques minutes, directement dans ton navigateur.
Gratuit, sans compte, sans backend : tes données ne quittent jamais ton appareil.

**Utilisation :** ouvre `index.html` dans un navigateur, ou héberge le dossier tel quel (Netlify, GitHub Pages). Aucun build.

## Fonctionnalités

**Contenu**
- Identité et photo, profil, objectif, expérience professionnelle, formation, compétences, langues
- Projets, certifications, engagement bénévole, centres d'intérêt, permis et disponibilité, références
- Sections libres avec le titre de ton choix
- Réorganisation des éléments (↑ ↓) dans chaque section

**Aide à la rédaction**
- Phrases de profil et missions types pour 10 domaines (tech, vente, santé, logistique, étudiant…)
- Verbes d'action insérés au curseur
- Conseils en direct : résultats chiffrés manquants, mots vagues (« responsable de », « participé à »), longueur du profil, passages entre crochets oubliés, CV de plus de 2 pages

**Design**
- 11 modèles : Minimal Pro, Corporate, Timeline, Modern Asymmetric, Compact, Elegant Classic, Pastel, Bold Creative, Tech Futurist, Dark Edition, ATS Sobre (sans photo ni colonnes, pour les logiciels de recrutement)
- Couleur d'accent, police, densité, affichage des niveaux (texte, points, barres, masqué)
- Sections masquables et réordonnables
- Aperçu A4 à l'échelle exacte, avec les sauts de page indiqués

**Lettre de motivation**
- Même modèle, mêmes couleurs, même en-tête que le CV
- Brouillon généré à partir du CV (poste, dernière expérience, compétences clés), à compléter

**Export et sauvegarde**
- PDF vectoriel via la fenêtre d'impression (« Enregistrer au format PDF ») : texte sélectionnable, lisible par les logiciels de recrutement
- Sauvegarde automatique sur l'appareil, export et import `.json` pour garder une copie ou changer d'ordinateur
- Thème clair et sombre, interface responsive, accessible au clavier

## Structure

```
index.html       coque de la page
css/app.css      interface (atelier éditorial)
css/cv.css       les 11 modèles de CV et la lettre
js/content.js    modèles, polices, couleurs, phrases types, exemple
js/app.js        logique de l'application
tests/smoke.mjs  test de fumée Playwright
```

## Confidentialité

Tout est stocké dans le `localStorage` du navigateur. Rien n'est envoyé à un serveur.
Les seules ressources externes chargées sont les polices Google Fonts.

## Tests

```bash
node tests/smoke.mjs
```

---

© TrouveToiUnTaf · Appartient à **Edunos Studio**.
