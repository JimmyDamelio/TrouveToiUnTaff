# TrouveToiUnTaf — Générateur de CV 💼

Crée un CV professionnel en quelques minutes, directement dans ton navigateur.
Gratuit, sans compte, sans backend : tes données ne quittent jamais ton appareil.

**Utilisation :** ouvre `index.html` dans un navigateur (ou héberge-le sur GitHub Pages / Netlify). Aucun build.

## Fonctionnalités

- **6 modèles** : Minimal Pro, Bold Creative, Tech Futurist, Elegant Classic, Modern Asymmetric, Dark Edition
- **Aperçu A4 en direct**, à l'échelle exacte de l'impression
- **Export PDF** vectoriel (texte sélectionnable, lisible par les logiciels de recrutement) via la fenêtre d'impression → « Enregistrer au format PDF »
- **Sections** : identité + photo, profil, objectif, expérience professionnelle (missions en puces), formation, compétences et langues avec niveaux, centres d'intérêt
- **Réorganisation** des expériences, formations, compétences et langues (↑ ↓)
- **Sauvegarde automatique** sur l'appareil + **export / import `.json`** pour garder une copie ou changer d'ordinateur
- **Photo** redimensionnée automatiquement (pas de dépassement du stockage)
- **Thème clair / sombre**, interface responsive (onglets Éditer / Aperçu sur mobile), accessible au clavier
- **Indicateur de complétude** du CV

## Confidentialité

Tout est stocké dans le `localStorage` du navigateur. Rien n'est envoyé à un serveur.
Les seules ressources externes chargées sont les polices Google Fonts.

## Tests

Test de fumée (Playwright) : saisie hostile, persistance, les 6 modèles, impression, mobile.

```bash
node tests/smoke.mjs
```

---

© TrouveToiUnTaf — Appartient à **Edunos Studio**.
