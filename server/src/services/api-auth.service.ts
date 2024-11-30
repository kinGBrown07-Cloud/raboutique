import { db } from '../database/db';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

interface ApiKey {
    id: string;
    key: string;
    client_id: string;
    client_name: string;
    scopes: string[];
    created_at: Date;
    last_used: Date;
    rate_limit: number;
    status: 'active' | 'revoked';
}

interface OAuth2Client {
    id: string;
    client_id: string;
    client_secret: string;
    name: string;
    scopes: string[];
    redirect_uris: string[];
    created_at: Date;
    updated_at: Date;
    status: 'active' | 'revoked';
}

interface OAuth2Token {
    access_token: string;
    token_type: 'Bearer';
    expires_in: number;
    refresh_token?: string;
    scope: string;
}

export class ApiAuthService {
    private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    private static readonly TOKEN_EXPIRATION = '1h';
    private static readonly REFRESH_TOKEN_EXPIRATION = '30d';

    public static async createApiKey(clientName: string, scopes: string[]): Promise<ApiKey> {
        const apiKey: ApiKey = {
            id: uuidv4(),
            key: this.generateApiKey(),
            client_id: this.generateClientId(),
            client_name: clientName,
            scopes,
            created_at: new Date(),
            last_used: new Date(),
            rate_limit: 1000, // Requêtes par heure par défaut
            status: 'active'
        };

        await db.query(`
            INSERT INTO api_keys (
                id, key, client_id, client_name, scopes,
                created_at, last_used, rate_limit, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
            apiKey.id,
            apiKey.key,
            apiKey.client_id,
            apiKey.client_name,
            apiKey.scopes,
            apiKey.created_at,
            apiKey.last_used,
            apiKey.rate_limit,
            apiKey.status
        ]);

        return apiKey;
    }

    public static async createOAuth2Client(
        name: string,
        scopes: string[],
        redirectUris: string[]
    ): Promise<OAuth2Client> {
        const client: OAuth2Client = {
            id: uuidv4(),
            client_id: this.generateClientId(),
            client_secret: this.generateClientSecret(),
            name,
            scopes,
            redirect_uris: redirectUris,
            created_at: new Date(),
            updated_at: new Date(),
            status: 'active'
        };

        await db.query(`
            INSERT INTO oauth_clients (
                id, client_id, client_secret, name,
                scopes, redirect_uris, created_at,
                updated_at, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
            client.id,
            client.client_id,
            client.client_secret,
            client.name,
            client.scopes,
            client.redirect_uris,
            client.created_at,
            client.updated_at,
            client.status
        ]);

        return client;
    }

    public static async validateApiKey(apiKey: string): Promise<ApiKey | null> {
        const result = await db.query(
            'SELECT * FROM api_keys WHERE key = $1 AND status = $2',
            [apiKey, 'active']
        );

        if (result.rows.length === 0) {
            return null;
        }

        const key = result.rows[0];

        // Mettre à jour last_used
        await db.query(
            'UPDATE api_keys SET last_used = $1 WHERE id = $2',
            [new Date(), key.id]
        );

        return key;
    }

    public static async generateOAuth2Token(
        clientId: string,
        clientSecret: string,
        requestedScopes?: string[]
    ): Promise<OAuth2Token | null> {
        const result = await db.query(
            'SELECT * FROM oauth_clients WHERE client_id = $1 AND client_secret = $2 AND status = $3',
            [clientId, clientSecret, 'active']
        );

        if (result.rows.length === 0) {
            return null;
        }

        const client = result.rows[0];
        const grantedScopes = requestedScopes
            ? requestedScopes.filter(scope => client.scopes.includes(scope))
            : client.scopes;

        if (grantedScopes.length === 0) {
            return null;
        }

        const token: OAuth2Token = {
            access_token: jwt.sign(
                {
                    client_id: client.client_id,
                    scopes: grantedScopes
                },
                this.JWT_SECRET,
                { expiresIn: this.TOKEN_EXPIRATION }
            ),
            token_type: 'Bearer',
            expires_in: 3600, // 1 heure
            refresh_token: jwt.sign(
                {
                    client_id: client.client_id,
                    scopes: grantedScopes,
                    type: 'refresh'
                },
                this.JWT_SECRET,
                { expiresIn: this.REFRESH_TOKEN_EXPIRATION }
            ),
            scope: grantedScopes.join(' ')
        };

        await this.saveToken(token, client.id);

        return token;
    }

    public static async refreshToken(refreshToken: string): Promise<OAuth2Token | null> {
        try {
            const decoded = jwt.verify(refreshToken, this.JWT_SECRET) as any;
            if (decoded.type !== 'refresh') {
                return null;
            }

            const result = await db.query(
                'SELECT * FROM oauth_clients WHERE client_id = $1 AND status = $2',
                [decoded.client_id, 'active']
            );

            if (result.rows.length === 0) {
                return null;
            }

            const client = result.rows[0];
            const token: OAuth2Token = {
                access_token: jwt.sign(
                    {
                        client_id: client.client_id,
                        scopes: decoded.scopes
                    },
                    this.JWT_SECRET,
                    { expiresIn: this.TOKEN_EXPIRATION }
                ),
                token_type: 'Bearer',
                expires_in: 3600,
                scope: decoded.scopes.join(' ')
            };

            await this.saveToken(token, client.id);

            return token;
        } catch (error) {
            return null;
        }
    }

    public static async validateToken(token: string): Promise<boolean> {
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET) as any;
            const result = await db.query(
                'SELECT * FROM oauth_tokens WHERE token = $1 AND revoked = $2',
                [token, false]
            );

            return result.rows.length > 0;
        } catch (error) {
            return false;
        }
    }

    public static async revokeApiKey(apiKeyId: string): Promise<boolean> {
        const result = await db.query(
            'UPDATE api_keys SET status = $1 WHERE id = $2',
            ['revoked', apiKeyId]
        );

        return result.rowCount > 0;
    }

    public static async revokeOAuth2Client(clientId: string): Promise<boolean> {
        const result = await db.query(
            'UPDATE oauth_clients SET status = $1 WHERE client_id = $2',
            ['revoked', clientId]
        );

        return result.rowCount > 0;
    }

    private static generateApiKey(): string {
        return `remag_${crypto.randomBytes(32).toString('hex')}`;
    }

    private static generateClientId(): string {
        return `remag_${crypto.randomBytes(16).toString('hex')}`;
    }

    private static generateClientSecret(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    private static async saveToken(token: OAuth2Token, clientId: string): Promise<void> {
        await db.query(`
            INSERT INTO oauth_tokens (
                token, client_id, expires_at, revoked
            ) VALUES ($1, $2, $3, $4)
        `, [
            token.access_token,
            clientId,
            new Date(Date.now() + token.expires_in * 1000),
            false
        ]);
    }

    public static async getApiKeyUsage(apiKeyId: string): Promise<any> {
        const result = await db.query(`
            SELECT 
                DATE_TRUNC('hour', timestamp) as hour,
                COUNT(*) as requests
            FROM api_requests
            WHERE api_key_id = $1
            AND timestamp >= NOW() - INTERVAL '24 hours'
            GROUP BY hour
            ORDER BY hour DESC
        `, [apiKeyId]);

        return result.rows;
    }

    public static async checkRateLimit(apiKeyId: string): Promise<boolean> {
        const result = await db.query(`
            SELECT COUNT(*) as request_count
            FROM api_requests
            WHERE api_key_id = $1
            AND timestamp >= NOW() - INTERVAL '1 hour'
        `, [apiKeyId]);

        const apiKey = await db.query(
            'SELECT rate_limit FROM api_keys WHERE id = $1',
            [apiKeyId]
        );

        if (apiKey.rows.length === 0) {
            return false;
        }

        return parseInt(result.rows[0].request_count) < apiKey.rows[0].rate_limit;
    }

    public static async logApiRequest(
        apiKeyId: string,
        endpoint: string,
        method: string,
        responseTime: number,
        statusCode: number
    ): Promise<void> {
        await db.query(`
            INSERT INTO api_requests (
                api_key_id, endpoint, method,
                response_time, status_code, timestamp
            ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
            apiKeyId,
            endpoint,
            method,
            responseTime,
            statusCode,
            new Date()
        ]);
    }
}
