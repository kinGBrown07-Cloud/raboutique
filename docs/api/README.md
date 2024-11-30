# Documentation API REMag

## 🔐 Authentification

### Obtenir une clé API

```http
POST /api/api-keys
Content-Type: application/json
Authorization: Bearer YOUR_OAUTH_TOKEN

{
  "client_name": "My Application",
  "scopes": ["read:products", "write:orders"]
}
```

### OAuth2 Authentication

```http
POST /api/oauth/token
Content-Type: application/json

{
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "grant_type": "client_credentials",
  "scope": "read:products write:orders"
}
```

## 📦 Produits

### Liste des produits

```http
GET /api/products
X-API-Key: YOUR_API_KEY

Query Parameters:
- page (default: 1)
- limit (default: 20)
- category
- min_price
- max_price
- location
```

### Créer un produit

```http
POST /api/products
Content-Type: application/json
Authorization: Bearer YOUR_OAUTH_TOKEN

{
  "name": "Tomates Bio",
  "description": "Tomates biologiques fraîches",
  "category": "légumes",
  "price": 2.99,
  "quantity": 100,
  "unit": "kg"
}
```

## 🛒 Commandes

### Liste des commandes

```http
GET /api/orders
Authorization: Bearer YOUR_OAUTH_TOKEN

Query Parameters:
- page (default: 1)
- limit (default: 20)
- status
```

### Créer une commande

```http
POST /api/orders
Content-Type: application/json
Authorization: Bearer YOUR_OAUTH_TOKEN

{
  "product_id": "uuid",
  "quantity": 5
}
```

## 📊 Limites et Quotas

- Rate limit: 1000 requêtes/heure par clé API
- Taille maximale des requêtes: 10MB
- Timeout: 30 secondes

## 🔍 Codes d'erreur

- 400: Requête invalide
- 401: Non authentifié
- 403: Non autorisé
- 404: Ressource non trouvée
- 429: Trop de requêtes
- 500: Erreur serveur

## 📚 Modèles de données

### Product

```typescript
{
  id: string;          // UUID
  name: string;        // Nom du produit
  description: string; // Description
  category: string;    // Catégorie
  price: number;       // Prix unitaire
  quantity: number;    // Quantité disponible
  unit: string;        // Unité (kg, unité, etc.)
  seller: {
    id: string;
    name: string;
    rating: number;
  };
  created_at: string;  // ISO 8601
  updated_at: string;  // ISO 8601
}
```

### Order

```typescript
{
  id: string;          // UUID
  product_id: string;  // UUID du produit
  quantity: number;    // Quantité commandée
  total_price: number; // Prix total
  status: string;      // Status de la commande
  buyer: {
    id: string;
    name: string;
  };
  created_at: string;  // ISO 8601
  updated_at: string;  // ISO 8601
}
```

## 🔄 Webhooks

### Configuration

```http
POST /api/webhooks
Content-Type: application/json
Authorization: Bearer YOUR_OAUTH_TOKEN

{
  "url": "https://your-domain.com/webhook",
  "events": ["order.created", "order.updated"],
  "secret": "your_webhook_secret"
}
```

### Format des événements

```typescript
{
  "id": "evt_123",
  "type": "order.created",
  "created_at": "2023-01-01T12:00:00Z",
  "data": {
    // Données spécifiques à l'événement
  }
}
```

## 📦 SDK

- [JavaScript/TypeScript SDK](https://github.com/remag/sdk-js)
- [Python SDK](https://github.com/remag/sdk-python)
- [PHP SDK](https://github.com/remag/sdk-php)

## 🤝 Support

- Email: api-support@remag.com
- Documentation: https://docs.remag.com
- Status: https://status.remag.com
