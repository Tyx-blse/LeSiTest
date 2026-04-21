# Cahier des charges — Quiz d'Extraversion
> Document destiné à la génération de code par une IA. Toutes les décisions techniques sont définitives.

---

## 1. Résumé du projet

Site web statique multi-pages permettant à l'utilisateur de découvrir son score d'extraversion à travers une série de questions au coefficient pondéré. L'utilisateur déclare d'abord son propre ressenti (intro/extraverti), puis répond à des questions de personnalité présentées comme neutres. La page de résultats compare le score calculé avec l'auto-évaluation initiale.

**Pas de backend. Pas de compte. Pas de base de données. Zéro donnée persistante côté serveur.**

---

## 2. Contraintes techniques

| Paramètre | Valeur |
|---|---|
| Type | Site statique HTML/CSS/JS |
| Langue du code | Anglais |
| Langue de l'interface | Français uniquement |
| Stockage | `sessionStorage` uniquement (données de session, non persistantes) |
| JS | Minimum requis — pas de framework (vanilla JS) |
| CSS | Vanilla CSS avec variables custom |
| Données | Fichier `questions.json` lu dynamiquement via `fetch()` |
| Hébergement cible | Tout hébergeur de fichiers statiques (GitHub Pages, Netlify, etc.) |
| Base de données | ❌ Aucune |
| Compte utilisateur | ❌ Aucun |
| Build step | ❌ Aucun — fichiers servis directement |

---

## 3. Structure des fichiers

```
/
├── index.html           ← Page d'intro (auto-évaluation)
├── question.html        ← Page de question (réutilisée dynamiquement)
├── results.html         ← Page de résultats
├── style.css            ← Feuille de style globale
├── main.js              ← Logique JS globale (navigation, session, calcul)
├── questions.json       ← Données des questions (source de vérité)
└── assets/
    └── (images, icônes optionnelles)
```

> `question.html` est une page unique réutilisée pour toutes les questions via les paramètres d'URL (`?q=0`, `?q=1`, etc.).

---

## 4. Format du fichier `questions.json`

```json
[
  {
    "id": 0,
    "question": "Vous rentrez d'une longue journée. Que faites-vous ?",
    "labelMin": "Je reste seul(e) pour me ressourcer",
    "labelMax": "J'appelle des amis pour sortir",
    "coefficient": 1.2
  },
  {
    "id": 1,
    "question": "Quel type de musique préférez-vous écouter ?",
    "labelMin": "Ambiance calme, instrumentale",
    "labelMax": "Musique rythmée et entraînante",
    "coefficient": 0.8
  }
]
```

### Champs obligatoires

| Champ | Type | Description |
|---|---|---|
| `id` | `number` | Index de la question (0-based, utilisé dans l'URL) |
| `question` | `string` | Texte de la question affiché à l'utilisateur |
| `labelMin` | `string` | Libellé de l'extrême gauche du slider (introverti) |
| `labelMax` | `string` | Libellé de l'extrême droite du slider (extraverti) |
| `coefficient` | `number` | Poids de la question dans le calcul final (positif) |

> Un coefficient élevé signifie que la question pèse plus dans le score final. Le coefficient minimum recommandé est `0.5`, maximum `2.0`.

---

## 5. Pages et comportement

### 5.1 — `index.html` : Page d'introduction

**Objectif :** Présenter le projet et recueillir l'auto-évaluation de l'utilisateur.

**Contenu :**
- Titre du site
- Description courte du projet (2–3 phrases, ton neutre et légèrement mystérieux)
- Slider horizontal `0–10` avec :
  - Libellé gauche : `"Introverti(e)"`
  - Libellé droit : `"Extraverti(e)"`
  - Valeur par défaut : `5`
- Bouton **« Commencer »**


---

### 5.2 — `question.html` : Page de question

**Objectif :** Afficher une question à la fois, avec navigation séquentielle.

**Paramètre d'URL :** `?q={id}` (ex : `?q=0`, `?q=3`)

**Contenu :**
- Barre de progression en haut (ex : `Question 3 / 10`)
- Texte de la question (`question.question`)
- Slider horizontal `0–10` avec :
  - Libellé gauche : `question.labelMin`
  - Libellé droit : `question.labelMax`
  - Valeur par défaut : `5`
- Bouton **« Suivant »**

> `questions.json` est chargé à chaque page. Les navigateurs mettent automatiquement en cache les fichiers statiques — pas de problème de performance.

---

### 5.3 — `results.html` : Page de résultats

**Objectif :** Calculer et afficher le score d'extraversion, et le comparer à l'auto-évaluation.

**Contenu affiché :**
- Score calculé sur 10, visuellement mis en avant (grand chiffre ou jauge)
- Label de résultat dynamique selon le score :
  - `0–3` → `"Nettement introverti(e)"`
  - `3–4.5` → `"Plutôt introverti(e)"`
  - `4.5–5.5` → `"Ambiverti(e)"`
  - `5.5–7` → `"Plutôt extraverti(e)"`
  - `7–10` → `"Nettement extraverti(e)"`
- Comparaison avec l'auto-évaluation :
  - Afficher `selfScore` et `finalScore` côte à côte
  - Message contextuel :
    - Si `|finalScore - selfScore| <= 1` → `"Vous vous connaissez bien."`
    - Si `finalScore > selfScore + 1` → `"Plus extraverti(e) que vous ne le pensiez."`
    - Si `finalScore < selfScore - 1` → `"Plus introverti(e) que vous ne le pensiez."`
- Bouton **« Recommencer »** → `window.location.href = 'index.html'`

> À l'arrivée sur `results.html`, si `sessionStorage` ne contient pas de données valides, rediriger vers `index.html`.

---

## 6. Gestion de session et navigation

### Données stockées dans `sessionStorage`

| Clé | Type | Description |
|---|---|---|
| `selfScore` | `string` (float) | Score d'auto-évaluation (0–10) |
| `answers` | `string` (JSON array) | Tableau des réponses aux questions |

### Règles de navigation

- Si l'utilisateur accède directement à `question.html` sans `selfScore` en session → redirection vers `index.html`
- Si l'utilisateur accède directement à `results.html` sans `answers` valides → redirection vers `index.html`
- Pas de bouton "Précédent" — la navigation est linéaire et non réversible
- `sessionStorage` est nettoyé automatiquement à la fermeture de l'onglet (comportement natif)

---

## 7. Design et thème visuel

### Direction artistique : Liquid Glass

Thème clair, moderne, inspiré du "liquid glass" d'Apple (iOS 18+ / visionOS). L'esthétique repose sur la translucidité, les gradients subtils et la légèreté visuelle.

### Palette de couleurs (variables CSS)

```css
:root {
  --bg-base: #f0f4ff;                          /* Fond global très légèrement bleuté */
  --bg-gradient: linear-gradient(135deg, #e8f0fe 0%, #fce4ec 50%, #f3e5f5 100%);
  --glass-bg: rgba(255, 255, 255, 0.55);       /* Fond des cards */
  --glass-border: rgba(255, 255, 255, 0.8);    /* Bordure des cards */
  --glass-blur: 20px;                          /* backdrop-filter: blur */
  --glass-shadow: 0 8px 32px rgba(100, 120, 200, 0.12);
  --accent: #6c8ef5;                           /* Accent principal bleu-violet */
  --accent-soft: rgba(108, 142, 245, 0.15);
  --text-primary: #1a1f3c;
  --text-secondary: #6b7a99;
  --slider-track: rgba(108, 142, 245, 0.2);
  --slider-thumb: #6c8ef5;
  --progress-bar: linear-gradient(90deg, #6c8ef5, #b87cf5);
}
```

### Composants visuels

**Cards (conteneurs principaux) :**
```css
.card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  box-shadow: var(--glass-shadow);
  padding: 2.5rem;
}
```

**Fond de page :**
```css
body {
  min-height: 100vh;
  background: var(--bg-gradient);
  /* Orbes de couleur en arrière-plan */
}

/* Orbes décoratifs positionnés en absolute/fixed */
.orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  z-index: -1;
}
.orb-1 { width: 400px; height: 400px; background: #a8c5ff; top: -100px; left: -100px; }
.orb-2 { width: 300px; height: 300px; background: #f5b8ff; bottom: -50px; right: -50px; }
```

**Slider custom :**
```css
input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  background: var(--slider-track);
  border-radius: 3px;
  outline: none;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px; height: 24px;
  border-radius: 50%;
  background: var(--slider-thumb);
  box-shadow: 0 0 0 4px var(--accent-soft);
  cursor: pointer;
  transition: box-shadow 0.2s;
}
input[type="range"]::-webkit-slider-thumb:hover {
  box-shadow: 0 0 0 8px var(--accent-soft);
}
```

**Barre de progression :**
```css
.progress-bar-fill {
  height: 4px;
  border-radius: 2px;
  background: var(--progress-bar);
  transition: width 0.4s ease;
}
```

**Bouton principal :**
```css
.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 14px;
  padding: 0.85rem 2rem;
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 4px 15px rgba(108, 142, 245, 0.35);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(108, 142, 245, 0.5);
}
```

### Layout général

- Centré verticalement et horizontalement sur toutes les pages
- Largeur maximale de la card : `560px`
- Responsive mobile-first (une colonne, padding adaptatif)
- Pas d'animations JS — uniquement CSS `transition` et `transform`

---

## 8. Accessibilité et UX minimale

- Tous les sliders ont un `aria-label` descriptif
- La valeur courante du slider est affichée visuellement en temps réel (mise à jour `oninput`)
- Contraste texte/fond > 4.5:1 sur tous les éléments de contenu
- `<html lang="fr">` sur toutes les pages
- Pas de JavaScript requis pour lire le contenu de base (graceful degradation non requise, mais la structure HTML doit être sémantique)

---

## 9. Points hors périmètre (à ne pas implémenter)

- ❌ Partage des résultats (réseaux sociaux, lien)
- ❌ Traduction / i18n
- ❌ Mode sombre
- ❌ Animations d'entrée complexes (JS)
- ❌ Analytics ou tracking quelconque
- ❌ Service Worker / PWA
- ❌ Bouton retour entre les questions

---

## 10. Checklist de livraison

- [ ] `questions.json` contient au minimum 8 questions avec coefficients variés
- [ ] `index.html` : slider + bouton fonctionnel, sauvegarde en sessionStorage
- [ ] `question.html` : chargement dynamique depuis JSON, barre de progression, navigation
- [ ] `results.html` : calcul pondéré correct, comparaison self/calculé, bouton reset
- [ ] `style.css` : variables CSS complètes, design Liquid Glass cohérent sur toutes les pages
- [ ] `main.js` : logique de navigation et guards de redirection
- [ ] Aucune console error au chargement des pages
- [ ] Fonctionnel sur Chrome, Firefox, Safari (desktop et mobile)
