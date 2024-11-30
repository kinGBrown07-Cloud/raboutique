import { Request, Response, NextFunction } from 'express';
import { ApiAuthService } from '../services/api-auth.service';

export interface AuthenticatedRequest extends Request {
    apiKey?: any;
    oauth2Client?: any;
}

export const apiKeyAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const apiKey = req.header('X-API-Key');
    if (!apiKey) {
        return res.status(401).json({
            error: 'API key is required'
        });
    }

    const key = await ApiAuthService.validateApiKey(apiKey);
    if (!key) {
        return res.status(401).json({
            error: 'Invalid API key'
        });
    }

    // Vérifier les limites de taux
    const withinLimit = await ApiAuthService.checkRateLimit(key.id);
    if (!withinLimit) {
        return res.status(429).json({
            error: 'Rate limit exceeded'
        });
    }

    // Enregistrer la requête
    const startTime = Date.now();
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        ApiAuthService.logApiRequest(
            key.id,
            req.path,
            req.method,
            responseTime,
            res.statusCode
        );
    });

    req.apiKey = key;
    next();
};

export const oauth2Auth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Bearer token is required'
        });
    }

    const token = authHeader.substring(7);
    const isValid = await ApiAuthService.validateToken(token);
    if (!isValid) {
        return res.status(401).json({
            error: 'Invalid or expired token'
        });
    }

    next();
};

export const requireScopes = (requiredScopes: string[]) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const scopes = req.apiKey?.scopes || [];
        const hasRequiredScopes = requiredScopes.every(scope => 
            scopes.includes(scope)
        );

        if (!hasRequiredScopes) {
            return res.status(403).json({
                error: 'Insufficient scopes',
                required_scopes: requiredScopes,
                provided_scopes: scopes
            });
        }

        next();
    };
};
