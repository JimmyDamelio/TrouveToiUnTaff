# TrouveToiUnTaf · direction artistique

Validée avec le propriétaire (Edunos Studio) avant la réalisation. Toute couleur, police ou durée vient d'ici.

## Thèse visuelle

Un carnet de candidature : l'utilisateur écrit son CV dans un livre ouvert. La page de gauche est le formulaire du
chapitre, la page de droite montre le CV en direct. Fond papier `#F5F2EA`, parce que le produit est une feuille A4
imprimée et que le site est un livre. Titres en **Source Serif 4**, une serif de texte faite pour les documents ;
interface en **DM Sans**. Chaque chapitre a sa propre encre (bandeau, numéro, onglet du sommaire, bouton principal),
choisie dans une palette de couleurs d'imprimerie :

| Chapitre | Encre |
|---|---|
| Photo | terracotta `#B5513A` |
| Qui es-tu ? | bleu encre `#1F3A93` |
| Ton accroche | prune `#7A3E6B` |
| Expériences | bleu canard `#1F6F78` |
| Formation | sauge `#56784F` |
| Compétences | moutarde `#A87B12` |
| Langues | bleu ardoise `#3D5A8C` |
| Les petits plus | brun `#8A5A44` |
| Ton modèle | encre noire `#2E2B28` |
| Finitions | framboise `#A8395F` |
| C'est prêt | bleu encre `#1F3A93` |

Composants plats, bordures fines, coins de 6 px ; la seule ombre est celle des feuilles.

## Thèse d'interaction

- Ouverture : 2,5 s la première fois, version courte ensuite, « Passer » toujours visible. La feuille se pose
  (720 ms, ease-out), ses lignes s'écrivent, un trait d'encre bleue se trace, « Bienvenue. » apparaît lettre à lettre.
- Page qui se tourne entre chapitres : 460 ms, rotation autour du bord gauche, ombre de pli.
- Boîtes d'allumettes pour choisir le modèle : tiroir qui se ferme (220 ms), boîtes qui glissent (380 ms), tiroir
  qui s'ouvre (420 ms). Aucune étape ne dépasse 500 ms.
- Survols : couleur et bordure seulement, 150 ms. Rien ne bouge au défilement.
- Interdit : rebond, parallaxe, animation en boucle, texte en dégradé, verre dépoli.
- `prefers-reduced-motion` : aucune animation, changements instantanés.

Allowed patterns: fond papier, serif d'affichage sur les titres, encre de chapitre, feuille de CV dessinée dans
l'ouverture, page qui se tourne, boîtes d'allumettes en 3D CSS.
