import { Router } from 'express';
import { apiKeyAuth, oauth2Auth, requireScopes } from '../middleware/api-auth.middleware';
import { ProductService } from '../services/product.service';
import { OrderService } from '../services/order.service';
import { ApiAuthService } from '../services/api-auth.service';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const router = Router();

// Documentation OpenAPI
const openApiDocument = YAML.load(path.join(__dirname, '../api/openapi.yaml'));
router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(openApiDocument));

// Routes d'authentification
router.post('/oauth/token', async (req, res) => {
    const { client_id, client_secret, grant_type, refresh_token, scope } = req.body;

    if (grant_type === 'client_credentials') {
        const token = await ApiAuthService.generateOAuth2Token(
            client_id,
            client_secret,
            scope?.split(' ')
        );

        if (!token) {
            return res.status(401).json({
                error: 'Invalid client credentials'
            });
        }

        return res.json(token);
    }

    if (grant_type === 'refresh_token' && refresh_token) {
        const token = await ApiAuthService.refreshToken(refresh_token);

        if (!token) {
            return res.status(401).json({
                error: 'Invalid refresh token'
            });
        }

        return res.json(token);
    }

    res.status(400).json({
        error: 'Invalid grant type'
    });
});

// Routes des produits
router.get('/products',
    apiKeyAuth,
    requireScopes(['read:products']),
    async (req, res) => {
        const {
            page = 1,
            limit = 20,
            category,
            min_price,
            max_price,
            location
        } = req.query;

        try {
            const products = await ProductService.getProducts({
                page: Number(page),
                limit: Number(limit),
                category: category as string,
                minPrice: min_price ? Number(min_price) : undefined,
                maxPrice: max_price ? Number(max_price) : undefined,
                location: location as string
            });

            res.json(products);
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                details: error.message
            });
        }
    }
);

router.post('/products',
    oauth2Auth,
    requireScopes(['write:products']),
    async (req, res) => {
        try {
            const product = await ProductService.createProduct(req.body);
            res.status(201).json(product);
        } catch (error) {
            res.status(400).json({
                error: 'Invalid product data',
                details: error.message
            });
        }
    }
);

router.get('/products/:id',
    apiKeyAuth,
    requireScopes(['read:products']),
    async (req, res) => {
        try {
            const product = await ProductService.getProductById(req.params.id);
            if (!product) {
                return res.status(404).json({
                    error: 'Product not found'
                });
            }
            res.json(product);
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                details: error.message
            });
        }
    }
);

router.put('/products/:id',
    oauth2Auth,
    requireScopes(['write:products']),
    async (req, res) => {
        try {
            const product = await ProductService.updateProduct(
                req.params.id,
                req.body
            );
            if (!product) {
                return res.status(404).json({
                    error: 'Product not found'
                });
            }
            res.json(product);
        } catch (error) {
            res.status(400).json({
                error: 'Invalid product data',
                details: error.message
            });
        }
    }
);

router.delete('/products/:id',
    oauth2Auth,
    requireScopes(['write:products']),
    async (req, res) => {
        try {
            const success = await ProductService.deleteProduct(req.params.id);
            if (!success) {
                return res.status(404).json({
                    error: 'Product not found'
                });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                details: error.message
            });
        }
    }
);

// Routes des commandes
router.get('/orders',
    oauth2Auth,
    requireScopes(['read:orders']),
    async (req, res) => {
        const {
            page = 1,
            limit = 20,
            status
        } = req.query;

        try {
            const orders = await OrderService.getOrders({
                page: Number(page),
                limit: Number(limit),
                status: status as string
            });

            res.json(orders);
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                details: error.message
            });
        }
    }
);

router.post('/orders',
    oauth2Auth,
    requireScopes(['write:orders']),
    async (req, res) => {
        try {
            const order = await OrderService.createOrder(req.body);
            res.status(201).json(order);
        } catch (error) {
            res.status(400).json({
                error: 'Invalid order data',
                details: error.message
            });
        }
    }
);

router.get('/orders/:id',
    oauth2Auth,
    requireScopes(['read:orders']),
    async (req, res) => {
        try {
            const order = await OrderService.getOrderById(req.params.id);
            if (!order) {
                return res.status(404).json({
                    error: 'Order not found'
                });
            }
            res.json(order);
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                details: error.message
            });
        }
    }
);

router.put('/orders/:id',
    oauth2Auth,
    requireScopes(['write:orders']),
    async (req, res) => {
        try {
            const order = await OrderService.updateOrder(
                req.params.id,
                req.body
            );
            if (!order) {
                return res.status(404).json({
                    error: 'Order not found'
                });
            }
            res.json(order);
        } catch (error) {
            res.status(400).json({
                error: 'Invalid order data',
                details: error.message
            });
        }
    }
);

// Routes de gestion des clés API
router.post('/api-keys',
    oauth2Auth,
    requireScopes(['admin']),
    async (req, res) => {
        try {
            const { client_name, scopes } = req.body;
            const apiKey = await ApiAuthService.createApiKey(
                client_name,
                scopes
            );
            res.status(201).json(apiKey);
        } catch (error) {
            res.status(400).json({
                error: 'Invalid request',
                details: error.message
            });
        }
    }
);

router.get('/api-keys/:id/usage',
    oauth2Auth,
    requireScopes(['admin']),
    async (req, res) => {
        try {
            const usage = await ApiAuthService.getApiKeyUsage(req.params.id);
            res.json(usage);
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                details: error.message
            });
        }
    }
);

router.post('/api-keys/:id/revoke',
    oauth2Auth,
    requireScopes(['admin']),
    async (req, res) => {
        try {
            const success = await ApiAuthService.revokeApiKey(req.params.id);
            if (!success) {
                return res.status(404).json({
                    error: 'API key not found'
                });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({
                error: 'Internal server error',
                details: error.message
            });
        }
    }
);

export default router;
