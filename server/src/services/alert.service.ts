import { db } from '../database/db';
import { LogService } from './log.service';
import nodemailer from 'nodemailer';
import { WebSocket } from 'ws';

interface Alert {
    id: number;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    details: any;
    created_at: Date;
}

interface AlertRule {
    id: number;
    name: string;
    condition: string;
    threshold: number;
    time_window: number;
    severity: string;
    notification_channels: string[];
    is_active: boolean;
}

export class AlertService {
    private static wsClients: Set<WebSocket> = new Set();
    private static transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    static addWebSocketClient(ws: WebSocket) {
        this.wsClients.add(ws);
        ws.on('close', () => this.wsClients.delete(ws));
    }

    static async checkAlertRules() {
        try {
            const [rules] = await db.query('SELECT * FROM alert_rules WHERE is_active = 1');
            
            for (const rule of rules as AlertRule[]) {
                await this.evaluateRule(rule);
            }
        } catch (error) {
            console.error('Error checking alert rules:', error);
            await LogService.log({
                level: 'error',
                category: 'alerts',
                action: 'check_rules',
                details: { error }
            });
        }
    }

    private static async evaluateRule(rule: AlertRule) {
        try {
            let threshold_exceeded = false;
            
            switch (rule.condition) {
                case 'error_rate':
                    threshold_exceeded = await this.checkErrorRate(rule);
                    break;
                case 'payment_failure':
                    threshold_exceeded = await this.checkPaymentFailures(rule);
                    break;
                case 'high_refund':
                    threshold_exceeded = await this.checkRefundRate(rule);
                    break;
                case 'system_load':
                    threshold_exceeded = await this.checkSystemLoad(rule);
                    break;
            }

            if (threshold_exceeded) {
                await this.createAlert({
                    type: rule.name,
                    severity: rule.severity as any,
                    message: `Alert rule "${rule.name}" triggered`,
                    details: { rule }
                });
            }
        } catch (error) {
            console.error(`Error evaluating rule ${rule.name}:`, error);
        }
    }

    private static async checkErrorRate(rule: AlertRule): Promise<boolean> {
        const [result] = await db.query(`
            SELECT COUNT(*) as error_count
            FROM system_logs
            WHERE 
                level = 'error'
                AND created_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
        `, [rule.time_window]);

        return (result as any)[0].error_count >= rule.threshold;
    }

    private static async checkPaymentFailures(rule: AlertRule): Promise<boolean> {
        const [result] = await db.query(`
            SELECT COUNT(*) as failure_count
            FROM transactions
            WHERE 
                status = 'failed'
                AND created_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
        `, [rule.time_window]);

        return (result as any)[0].failure_count >= rule.threshold;
    }

    private static async checkRefundRate(rule: AlertRule): Promise<boolean> {
        const [result] = await db.query(`
            SELECT 
                COUNT(CASE WHEN status = 'refunded' THEN 1 END) * 100.0 / COUNT(*) as refund_rate
            FROM transactions
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
        `, [rule.time_window]);

        return (result as any)[0].refund_rate >= rule.threshold;
    }

    private static async checkSystemLoad(rule: AlertRule): Promise<boolean> {
        const [result] = await db.query(`
            SELECT AVG(details->>'$.duration') as avg_duration
            FROM system_logs
            WHERE 
                category = 'http'
                AND created_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
        `, [rule.time_window]);

        return (result as any)[0].avg_duration >= rule.threshold;
    }

    static async createAlert(alert: Omit<Alert, 'id' | 'created_at'>) {
        try {
            // Enregistrer l'alerte
            const [result] = await db.query(
                `INSERT INTO alerts (type, severity, message, details)
                 VALUES (?, ?, ?, ?)`,
                [alert.type, alert.severity, alert.message, JSON.stringify(alert.details)]
            );

            const alertId = (result as any).insertId;

            // Notifier via WebSocket
            this.notifyWebSocketClients({
                type: 'new_alert',
                data: { ...alert, id: alertId }
            });

            // Envoyer email pour les alertes critiques
            if (alert.severity === 'critical') {
                await this.sendAlertEmail(alert);
            }

            // Logger l'alerte
            await LogService.log({
                level: alert.severity === 'critical' ? 'error' : 'warn',
                category: 'alerts',
                action: 'create_alert',
                details: { alert }
            });

            return alertId;
        } catch (error) {
            console.error('Error creating alert:', error);
            throw error;
        }
    }

    private static notifyWebSocketClients(message: any) {
        const messageStr = JSON.stringify(message);
        this.wsClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(messageStr);
            }
        });
    }

    private static async sendAlertEmail(alert: Omit<Alert, 'id' | 'created_at'>) {
        try {
            const [adminEmails] = await db.query(
                'SELECT email FROM users WHERE role = "admin"'
            );

            if (!adminEmails.length) return;

            await this.transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: adminEmails.map((admin: any) => admin.email).join(','),
                subject: `[ALERT] ${alert.type} - ${alert.severity.toUpperCase()}`,
                html: `
                    <h2>Alert Details</h2>
                    <p><strong>Type:</strong> ${alert.type}</p>
                    <p><strong>Severity:</strong> ${alert.severity}</p>
                    <p><strong>Message:</strong> ${alert.message}</p>
                    <pre>${JSON.stringify(alert.details, null, 2)}</pre>
                `
            });
        } catch (error) {
            console.error('Error sending alert email:', error);
        }
    }

    static async getAlerts(filters: {
        severity?: string;
        type?: string;
        startDate?: string;
        endDate?: string;
        limit?: number;
        offset?: number;
    }) {
        try {
            let query = 'SELECT * FROM alerts WHERE 1=1';
            const queryParams: any[] = [];

            if (filters.severity) {
                query += ' AND severity = ?';
                queryParams.push(filters.severity);
            }

            if (filters.type) {
                query += ' AND type = ?';
                queryParams.push(filters.type);
            }

            if (filters.startDate) {
                query += ' AND created_at >= ?';
                queryParams.push(filters.startDate);
            }

            if (filters.endDate) {
                query += ' AND created_at <= ?';
                queryParams.push(filters.endDate);
            }

            query += ' ORDER BY created_at DESC';

            if (filters.limit) {
                query += ' LIMIT ?';
                queryParams.push(filters.limit);
            }

            if (filters.offset) {
                query += ' OFFSET ?';
                queryParams.push(filters.offset);
            }

            const [alerts] = await db.query(query, queryParams);
            return alerts;
        } catch (error) {
            console.error('Error getting alerts:', error);
            throw error;
        }
    }
}
