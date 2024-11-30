import { db } from '../database/db';
import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

interface LogEntry {
    level: string;
    category: string;
    action: string;
    details: any;
    user_id?: number;
    ip_address?: string;
}

export class LogService {
    private static logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        ),
        transports: [
            // Rotation quotidienne des logs
            new winston.transports.DailyRotateFile({
                filename: path.join(__dirname, '../../logs/error-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                level: 'error',
                maxFiles: '30d'
            }),
            new winston.transports.DailyRotateFile({
                filename: path.join(__dirname, '../../logs/combined-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                maxFiles: '30d'
            })
        ]
    });

    // Ajouter la sortie console en développement
    if (process.env.NODE_ENV !== 'production') {
        LogService.logger.add(new winston.transports.Console({
            format: winston.format.simple()
        }));
    }

    static async log(entry: LogEntry) {
        try {
            // Logger dans Winston
            this.logger.log({
                level: entry.level,
                message: `${entry.category}:${entry.action}`,
                ...entry
            });

            // Stocker dans la base de données
            await db.query(
                `INSERT INTO system_logs (
                    level,
                    category,
                    action,
                    details,
                    user_id,
                    ip_address
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    entry.level,
                    entry.category,
                    entry.action,
                    JSON.stringify(entry.details),
                    entry.user_id || null,
                    entry.ip_address || null
                ]
            );
        } catch (error) {
            console.error('Logging error:', error);
            // En cas d'erreur, on log au moins dans Winston
            this.logger.error('Logging error', { error });
        }
    }

    static async getSystemLogs(filters: {
        startDate?: string;
        endDate?: string;
        level?: string;
        category?: string;
        userId?: number;
        limit?: number;
        offset?: number;
    }) {
        try {
            let query = `
                SELECT 
                    sl.*,
                    u.username as user_name
                FROM system_logs sl
                LEFT JOIN users u ON sl.user_id = u.id
                WHERE 1=1
            `;
            const queryParams: any[] = [];

            if (filters.startDate) {
                query += ' AND sl.created_at >= ?';
                queryParams.push(filters.startDate);
            }

            if (filters.endDate) {
                query += ' AND sl.created_at <= ?';
                queryParams.push(filters.endDate);
            }

            if (filters.level) {
                query += ' AND sl.level = ?';
                queryParams.push(filters.level);
            }

            if (filters.category) {
                query += ' AND sl.category = ?';
                queryParams.push(filters.category);
            }

            if (filters.userId) {
                query += ' AND sl.user_id = ?';
                queryParams.push(filters.userId);
            }

            query += ' ORDER BY sl.created_at DESC';

            if (filters.limit) {
                query += ' LIMIT ?';
                queryParams.push(filters.limit);
            }

            if (filters.offset) {
                query += ' OFFSET ?';
                queryParams.push(filters.offset);
            }

            const [logs] = await db.query(query, queryParams);
            return logs;
        } catch (error) {
            console.error('Get system logs error:', error);
            throw new Error('Erreur lors de la récupération des logs système');
        }
    }

    static async getUserActivityLogs(userId: number) {
        try {
            const query = `
                SELECT *
                FROM system_logs
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT 100
            `;

            const [logs] = await db.query(query, [userId]);
            return logs;
        } catch (error) {
            console.error('Get user activity logs error:', error);
            throw new Error('Erreur lors de la récupération des logs d\'activité');
        }
    }

    static async getPaymentLogs(transactionId: number) {
        try {
            const query = `
                SELECT *
                FROM system_logs
                WHERE 
                    category = 'payment'
                    AND details LIKE ?
                ORDER BY created_at DESC
            `;

            const [logs] = await db.query(query, [`%"transaction_id":${transactionId}%`]);
            return logs;
        } catch (error) {
            console.error('Get payment logs error:', error);
            throw new Error('Erreur lors de la récupération des logs de paiement');
        }
    }

    static async getErrorLogs(startDate: string, endDate: string) {
        try {
            const query = `
                SELECT 
                    sl.*,
                    u.username as user_name
                FROM system_logs sl
                LEFT JOIN users u ON sl.user_id = u.id
                WHERE 
                    sl.level = 'error'
                    AND sl.created_at BETWEEN ? AND ?
                ORDER BY sl.created_at DESC
            `;

            const [logs] = await db.query(query, [startDate, endDate]);
            return logs;
        } catch (error) {
            console.error('Get error logs error:', error);
            throw new Error('Erreur lors de la récupération des logs d\'erreur');
        }
    }
}
