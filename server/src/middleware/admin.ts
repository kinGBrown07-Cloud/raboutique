import { Request, Response, NextFunction } from 'express';
import { db } from '../database/db';

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Non authentifié'
            });
        }

        const [user] = await db.query(
            'SELECT role FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!user.length || user[0].role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Accès non autorisé'
            });
        }

        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur serveur'
        });
    }
};
