# REMag - Marketplace Agricole SaaS

## 📋 Description

REMag est une plateforme SaaS de marketplace agricole permettant aux agriculteurs de vendre leurs produits directement aux consommateurs. La plateforme offre des fonctionnalités avancées de gestion, de monitoring et d'analyse des performances.

## 🚀 Fonctionnalités

- Gestion des produits et commandes
- Système de messagerie intégré
- Tableau de bord analytique
- Monitoring des performances
- API publique
- Rapports personnalisables
- Système de notification multi-canal

## 🛠 Technologies

- Frontend: React, TypeScript, Material-UI
- Backend: Node.js, Express, TypeScript
- Base de données: PostgreSQL
- Cache: Redis
- Monitoring: Sentry, New Relic
- Tests: Jest, Cypress, k6

## 📦 Installation

### Prérequis

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose

### Installation locale

1. Cloner le repository
```bash
git clone https://github.com/votre-org/remag.git
cd remag
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

4. Démarrer la base de données et Redis
```bash
docker-compose up -d postgres redis
```

5. Exécuter les migrations
```bash
npm run migrate
```

6. Démarrer l'application
```bash
npm run dev
```

## 🧪 Tests

### Tests unitaires
```bash
npm run test
```

### Tests d'intégration
```bash
npm run test:integration
```

### Tests E2E
```bash
npm run test:e2e
```

### Tests de performance
```bash
npm run test:performance
```

## 🚀 Déploiement

### Production

1. Construire les images Docker
```bash
docker-compose build
```

2. Déployer
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Staging

```bash
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```

## 📊 Monitoring

### Sentry
- Dashboard: https://sentry.io/organizations/your-org/
- Documentation: [Configuration Sentry](./docs/monitoring/sentry.md)

### New Relic
- Dashboard: https://one.newrelic.com/
- Documentation: [Configuration New Relic](./docs/monitoring/newrelic.md)

## 📚 Documentation

- [Guide d'utilisation](./docs/user-guide.md)
- [Documentation API](./docs/api/README.md)
- [Architecture](./docs/architecture.md)
- [Guide de contribution](./CONTRIBUTING.md)

## 🔒 Sécurité

- [Politique de sécurité](./SECURITY.md)
- [Signalement de vulnérabilités](./docs/security/vulnerability-reporting.md)

## 📄 Licence

Ce projet est sous licence [MIT](./LICENSE).

## 🤝 Contribution

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour plus d'informations.
