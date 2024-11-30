# Ra Boutik - Documentation Technique

## Aperçu du Projet
Ra Boutik est une plateforme e-commerce moderne développée avec les dernières technologies web.

## Stack Technologique
- **Frontend Framework**: React avec TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router
- **Styling**: Emotion
- **Authentication**: Supabase

## Structure du Projet
```
raboutique/
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   ├── common/
│   │   │   └── Logo.tsx
│   │   └── layout/
│   │       ├── Footer.tsx
│   │       ├── Layout.tsx
│   │       └── Navbar.tsx
│   ├── pages/
│   │   └── HomePage.tsx
│   ├── theme.ts
│   └── App.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Design System

### Palette de Couleurs
- **Couleur Principale**: Vert Forêt (#2E7D32)
  - Light: #4CAF50
  - Dark: #1B5E20
- **Couleur Secondaire**: Orange Chaleureux (#FF8F00)
  - Light: #FFB74D
  - Dark: #F57C00
- **Arrière-plan**:
  - Default: #F9FAFB
  - Paper: #FFFFFF
- **Texte**:
  - Primary: #111827
  - Secondary: #6B7280

### Typographie
- Font Family: "Inter", "Roboto", "Helvetica", "Arial", sans-serif
- Hiérarchie:
  - H1: 2.5rem, 700 weight
  - H2: 2rem, 600 weight
  - H3: 1.75rem, 600 weight
  - Body: 1rem

### Composants

#### Logo
- Icône: StorefrontIcon de Material-UI
- Taille: 32px
- Couleur: Couleur principale (#2E7D32)

#### Navbar
- Fond blanc
- Ombre légère
- Navigation responsive
- Menu utilisateur pour l'authentification

#### Footer
- 4 sections principales:
  1. Boutique (Produits, Nouveautés, etc.)
  2. Client (Compte, Commandes, etc.)
  3. Légal (CGV, Mentions légales)
  4. Aide (FAQ, Contact)
- Réseaux sociaux: Facebook, Twitter, Instagram
- Copyright en bas de page

#### Page d'Accueil
- Hero section avec image de fond
- Sections de fonctionnalités
- Appels à l'action clairs
- Design responsive

## Fonctionnalités Principales

### Authentication
- Inscription
- Connexion
- Récupération de mot de passe
- Protection des routes

### Navigation
- Routing avec React Router
- Routes protégées
- Navigation responsive

### Interface Utilisateur
- Design responsive
- Animations subtiles
- Feedback utilisateur
- Messages d'erreur clairs

## Nouvelles Fonctionnalités Ajoutées

### Page d'Annonces
- Interface moderne avec bannière héroïque
- 4 plans d'abonnement clairement présentés :
  * Plan Basic (gratuit)
  * Plan Standard (9.99€/mois)
  * Plan Premium (19.99€/mois)
  * Plan Pro (49.99€/mois)
- Section "Annonces en Vedette" avec mise en avant des annonces premium
- Section "Produits Populaires" affichant les meilleures ventes
- Section "Articles à la Une" présentant les derniers articles du blog

### Navigation Améliorée
- Menu principal restructuré avec sous-menus intuitifs :
  * Annonces (avec plans d'abonnement)
  * Boutique (produits, nouveautés, promotions)
  * Catégories (par type de produit)
  * Blog
- Menu utilisateur organisé en sections :
  * Mon Espace (profil, adresses, notifications)
  * Mes Achats (commandes, favoris, liste d'envies)
  * Mes Annonces (gestion, création, statistiques)

### Footer Optimisé
- Structure en 4 colonnes principales :
  * Annonces (plans et publication)
  * Boutique (produits et catégories)
  * Mon Compte (tableau de bord et gestion)
  * Aide & Contact (support et ressources)
- Navigation plus claire et organisée
- Liens rapides vers les fonctionnalités principales

### Design et UX
- Interface responsive adaptée à tous les écrans
- Animations subtiles pour une meilleure interaction
- Mise en avant des éléments importants
- Navigation intuitive et cohérente

## Bonnes Pratiques

### Performance
- Lazy loading des composants
- Optimisation des images
- Minification du code
- Splitting du code

### Sécurité
- Protection CSRF
- Validation des entrées
- Authentification sécurisée
- Gestion sécurisée des tokens

### Accessibilité
- Contraste des couleurs
- Navigation au clavier
- Labels appropriés
- ARIA attributes

## Maintenance

### Scripts Disponibles
- `npm run dev`: Lance le serveur de développement
- `npm run build`: Build pour la production
- `npm run preview`: Preview de la build
- `npm run test`: Lance les tests
- `npm run lint`: Vérifie le code

### Dépendances Principales
```json
{
  "dependencies": {
    "@emotion/react": "^11.x",
    "@emotion/styled": "^11.x",
    "@mui/material": "^5.x",
    "@mui/icons-material": "^5.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "typescript": "^4.x"
  }
}
```

## Déploiement
1. Vérifier la configuration
2. Lancer les tests
3. Build du projet
4. Déploiement sur le serveur

## Prochaines Étapes
1. Implémentation du panier
2. Système de paiement
3. Gestion des commandes
4. Système de recherche
5. Filtres produits
6. Système de reviews
7. Dashboard admin

## Support et Contact
Pour toute question ou support technique, contacter l'équipe de développement.
