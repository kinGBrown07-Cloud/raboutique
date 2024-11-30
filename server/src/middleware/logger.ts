import { Request, Response, NextFunction } from 'express';
import { LogService } from '../services/log.service';

export const requestLogger = async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Capturer la réponse
    const oldSend = res.send;
    res.send = function (data: any) {
        (res as any).responseData = data;
        return oldSend.apply(res, arguments as any);
    };

    // Continuer le traitement
    next();

    // Une fois la requête terminée
    res.on('finish', async () => {
        const duration = Date.now() - startTime;
        
        try {
            await LogService.log({
                level: res.statusCode >= 400 ? 'error' : 'info',
                category: 'http',
                action: `${req.method} ${req.path}`,
                details: {
                    method: req.method,
                    path: req.path,
                    query: req.query,
                    body: req.method !== 'GET' ? req.body : undefined,
                    status: res.statusCode,
                    duration,
                    user_agent: req.headers['user-agent']
                },
                user_id: (req as any).user?.id,
                ip_address: req.ip
            });
        } catch (error) {
            console.error('Request logging error:', error);
        }
    });
};

export const errorLogger = async (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        await LogService.log({
            level: 'error',
            category: 'system',
            action: 'error_handler',
            details: {
                error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                },
                request: {
                    method: req.method,
                    path: req.path,
                    query: req.query,
                    body: req.method !== 'GET' ? req.body : undefined
                }
            },
            user_id: (req as any).user?.id,
            ip_address: req.ip
        });
    } catch (logError) {
        console.error('Error logging error:', logError);
    }

    next(error);
};
