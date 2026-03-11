# TrouveToiUnTaf - Générateur de CV Ultra-Pro 💼

Une application web 100% gratuite pour créer des CV professionnels et stylés en français. Zéro abonnement, zéro backend, tout fonctionne dans ton navigateur !

## 🚀 Fonctionnalités

- ✨ **6 templates premium** vraiment distincts (pas du copier-coller d'IA)
- 📸 **Upload de photo** avec preview instantanée
- ⚡ **Édition en temps réel** - voir les changements instantanément
- 💾 **Sauvegarde automatique** dans localStorage
- 📄 **Export PDF** de haute qualité
- 🌙 **Mode sombre/clair**
- 📱 **100% responsive** - parfait sur mobile et desktop
- 🎯 **Remplissage automatique** avec données d'exemple
- 🔒 **Confidentialité totale** - tout reste dans ton navigateur

## 📋 Sections du CV

1. Photo de profil
2. Informations personnelles (nom, titre, contact)
3. Profil personnel
4. Objectif professionnel
5. Formation
6. Compétences (avec niveaux)
7. Langues (avec niveaux)
8. Centres d'intérêt

## 🎨 Templates disponibles

### 1. Minimal Pro
- Design épuré et élégant
- Typographie Archivo
- Parfait pour les profils corporate

### 2. Bold Creative
- Design audacieux et asymétrique
- Couleurs vives (jaune/rouge)
- Idéal pour les créatifs

### 3. Tech Futurist
- Style cyberpunk/tech
- Police monospace
- Parfait pour les développeurs

### 4. Elegant Classic
- Style classique et raffiné
- Police serif (Crimson Text)
- Idéal pour les profils traditionnels

### 5. Modern Asymmetric
- Layout à deux colonnes
- Design contemporain
- Parfait pour se démarquer

### 6. Dark Mode Edition
- Fond sombre avec accents néon
- Gradients subtils
- Pour les profils modernes

## 🛠️ Comment tester localement

1. **Télécharge le fichier `index.html`**
2. **Double-clique sur le fichier** pour l'ouvrir dans ton navigateur
3. C'est tout ! 🎉

Aucune installation, aucun serveur, aucune configuration nécessaire.

## 📝 Comment utiliser l'application

1. **Remplis tes informations** dans le panneau de gauche
2. **Ajoute ta photo** avec le bouton "Parcourir"
3. **Choisis ton template** en haut de la page
4. **Regarde le rendu** en temps réel à droite
5. **Exporte en PDF** quand tu es satisfait

### Astuces

- Clique sur **"Exemple"** pour voir l'application pré-remplie
- Tes données sont **sauvegardées automatiquement**
- Change de template **autant de fois que tu veux**
- Le bouton **"Effacer"** réinitialise tout

## 🎨 Comment personnaliser les templates

Ouvre `index.html` dans un éditeur de texte et cherche les sections correspondantes :

### Changer les couleurs

Cherche les classes CSS comme `.cv-minimal-pro`, `.cv-bold-creative`, etc. et modifie les propriétés :

```css
.cv-minimal-pro {
    background: white;  /* Change la couleur de fond */
    color: #1a1a1a;     /* Change la couleur du texte */
}
```

### Modifier les polices

Change les `font-family` dans les styles CSS :

```css
.cv-minimal-pro {
    font-family: 'Archivo', sans-serif;  /* Change la police */
}
```

### Ajuster les espacements

Modifie les `padding`, `margin` et autres propriétés :

```css
.cv-minimal-pro {
    padding: 3rem 2.5rem;  /* Change les marges internes */
}
```

## 🔧 Technologies utilisées

- **HTML5** - Structure
- **Tailwind CSS** (via CDN) - Styling
- **JavaScript Vanilla** - Logique et interactions
- **localStorage** - Sauvegarde des données
- **html2canvas + jsPDF** - Export PDF

## 💡 Pourquoi c'est différent ?

Cette app n'est PAS un produit d'IA générique. Voici pourquoi :

❌ **Pas de** gradients violets partout
❌ **Pas de** police Inter/Roboto unique
❌ **Pas de** layouts symétriques parfaits
❌ **Pas de** glow CSS abusif

✅ **6 designs vraiment distincts** avec leurs propres identités
✅ **Typographies variées** et bien pensées
✅ **Micro-asymétries** qui donnent un aspect humain
✅ **Accessibilité AAA** avec focus states parfaits
✅ **Transitions fluides** et naturelles

## 📊 Stockage des données

- Toutes les données sont stockées dans **localStorage** de ton navigateur
- **Aucune donnée n'est envoyée à un serveur**
- Les photos sont converties en **base64** et stockées localement
- Supprime tes données à tout moment avec le bouton "Effacer"

## 🐛 Problèmes connus

- L'export PDF fonctionne mieux sur Chrome/Edge que sur Firefox
- Les photos très volumineuses (>5MB) peuvent ralentir l'app
- Le mode impression standard (Ctrl+P) peut donner des résultats variables selon le template

## 📱 Compatibilité

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile (iOS Safari, Chrome Android)

## 🎯 Roadmap (améliorations futures possibles)

- Export en format Word (.docx)
- Plus de templates
- Import/export de profils
- Partage de CV via URL
- Templates A/B testing

## 🤝 Contribution

Ce projet est open source ! Si tu veux ajouter des templates ou améliorer l'app, n'hésite pas.

## 📄 Licence

MIT - Utilise-le comme tu veux, même commercialement !

## 💬 Support

Tu as un problème ? Une question ? Une idée ?
- Vérifie que JavaScript est activé dans ton navigateur
- Assure-toi d'utiliser un navigateur récent
- Vide le cache si quelque chose semble cassé

---

**Fait avec ❤️ par un humain (pas une IA qui copie-colle des gradients violets)**

Maintenant, va chercher du taf champion ! 💪
