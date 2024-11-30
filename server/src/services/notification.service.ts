import { Pool } from 'pg';
import { WebSocket } from 'ws';
import axios from 'axios';
import { IntegrationService } from './integration.service';
import { db } from '../database/db';

interface Alert {
    type: string;
    metric?: string;
    value?: number;
    threshold?: number;
    message?: string;
    severity?: 'info' | 'warning' | 'error' | 'critical';
    timestamp: Date;
    details?: Record<string, any>;
}

interface NotificationChannel {
    type: 'email' | 'slack' | 'teams' | 'webhook';
    config: Record<string, any>;
    enabled: boolean;
}

export class NotificationService {
    private static wsClients: Set<WebSocket> = new Set();
    private static notificationChannels: NotificationChannel[] = [];

    public static async initialize() {
        try {
            // Charger les configurations des canaux de notification depuis la base de données
            const channels = await IntegrationService.getEnabledIntegrations();
            this.notificationChannels = channels.map(channel => ({
                type: channel.type as 'email' | 'slack' | 'teams' | 'webhook',
                config: channel.config,
                enabled: channel.enabled
            }));
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du service de notification:', error);
        }
    }

    public static addWebSocketClient(client: WebSocket) {
        this.wsClients.add(client);
        client.on('close', () => {
            this.wsClients.delete(client);
        });
    }

    public static async sendAlert(alert: Alert) {
        try {
            // Déterminer la sévérité si non spécifiée
            if (!alert.severity) {
                alert.severity = this.determineSeverity(alert);
            }

            // Enrichir le message si non spécifié
            if (!alert.message) {
                alert.message = this.generateAlertMessage(alert);
            }

            // Enregistrer l'alerte dans la base de données
            await this.saveAlert(alert);

            // Envoyer aux clients WebSocket
            this.broadcastToWebSocketClients({
                type: 'alert',
                data: alert
            });

            // Envoyer aux canaux de notification configurés
            await this.sendToNotificationChannels(alert);

            return true;
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'alerte:', error);
            return false;
        }
    }

    private static determineSeverity(alert: Alert): 'info' | 'warning' | 'error' | 'critical' {
        if (!alert.value || !alert.threshold) return 'info';

        const deviation = Math.abs(alert.value - alert.threshold) / alert.threshold;

        if (deviation > 0.5) return 'critical';
        if (deviation > 0.3) return 'error';
        if (deviation > 0.1) return 'warning';
        return 'info';
    }

    private static generateAlertMessage(alert: Alert): string {
        switch (alert.type) {
            case 'ANOMALY_DETECTED':
                return `Anomalie détectée pour la métrique ${alert.metric}: ${alert.value} (seuil: ${alert.threshold})`;
            case 'THRESHOLD_EXCEEDED':
                return `Seuil dépassé pour ${alert.metric}: ${alert.value} > ${alert.threshold}`;
            case 'PREDICTION_WARNING':
                return `Prédiction critique pour ${alert.metric}: ${alert.value} attendu dans l'heure`;
            default:
                return `Alerte: ${alert.type}`;
        }
    }

    private static async saveAlert(alert: Alert) {
        const query = `
            INSERT INTO alerts (
                type,
                metric,
                value,
                threshold,
                message,
                severity,
                timestamp,
                details
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;

        await db.query(query, [
            alert.type,
            alert.metric,
            alert.value,
            alert.threshold,
            alert.message,
            alert.severity,
            alert.timestamp,
            JSON.stringify(alert.details)
        ]);
    }

    private static broadcastToWebSocketClients(message: any) {
        const messageStr = JSON.stringify(message);
        this.wsClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(messageStr);
            }
        });
    }

    private static async sendToNotificationChannels(alert: Alert) {
        const promises = this.notificationChannels
            .filter(channel => channel.enabled)
            .map(channel => this.sendToChannel(channel, alert));

        await Promise.allSettled(promises);
    }

    private static async sendToChannel(channel: NotificationChannel, alert: Alert) {
        try {
            switch (channel.type) {
                case 'email':
                    await this.sendEmail(channel.config, alert);
                    break;
                case 'slack':
                    await this.sendSlackNotification(channel.config, alert);
                    break;
                case 'teams':
                    await this.sendTeamsNotification(channel.config, alert);
                    break;
                case 'webhook':
                    await this.sendWebhookNotification(channel.config, alert);
                    break;
            }
        } catch (error) {
            console.error(`Erreur lors de l'envoi vers ${channel.type}:`, error);
        }
    }

    private static async sendEmail(config: Record<string, any>, alert: Alert) {
        // Implémenter l'envoi d'email via SMTP ou service d'email
        // Utiliser nodemailer ou un service similaire
    }

    private static async sendSlackNotification(config: Record<string, any>, alert: Alert) {
        const { webhookUrl } = config;
        const color = this.getSlackColor(alert.severity);

        await axios.post(webhookUrl, {
            attachments: [{
                color,
                title: `Alerte: ${alert.type}`,
                text: alert.message,
                fields: [
                    {
                        title: 'Métrique',
                        value: alert.metric,
                        short: true
                    },
                    {
                        title: 'Valeur',
                        value: alert.value?.toString(),
                        short: true
                    },
                    {
                        title: 'Sévérité',
                        value: alert.severity,
                        short: true
                    },
                    {
                        title: 'Timestamp',
                        value: alert.timestamp.toISOString(),
                        short: true
                    }
                ]
            }]
        });
    }

    private static async sendTeamsNotification(config: Record<string, any>, alert: Alert) {
        const { webhookUrl } = config;

        await axios.post(webhookUrl, {
            "@type": "MessageCard",
            "@context": "http://schema.org/extensions",
            "summary": `Alerte: ${alert.type}`,
            "themeColor": this.getTeamsColor(alert.severity),
            "title": `Alerte: ${alert.type}`,
            "sections": [{
                "facts": [
                    {
                        "name": "Métrique",
                        "value": alert.metric
                    },
                    {
                        "name": "Valeur",
                        "value": alert.value?.toString()
                    },
                    {
                        "name": "Sévérité",
                        "value": alert.severity
                    },
                    {
                        "name": "Timestamp",
                        "value": alert.timestamp.toISOString()
                    }
                ],
                "text": alert.message
            }]
        });
    }

    private static async sendWebhookNotification(config: Record<string, any>, alert: Alert) {
        const { url, headers = {} } = config;
        await axios.post(url, alert, { headers });
    }

    private static getSlackColor(severity?: string): string {
        switch (severity) {
            case 'critical': return '#FF0000';
            case 'error': return '#FF9900';
            case 'warning': return '#FFCC00';
            default: return '#36a64f';
        }
    }

    private static getTeamsColor(severity?: string): string {
        switch (severity) {
            case 'critical': return 'FF0000';
            case 'error': return 'FF9900';
            case 'warning': return 'FFCC00';
            default: return '36a64f';
        }
    }

    public static async getRecentAlerts(limit: number = 100): Promise<Alert[]> {
        const query = `
            SELECT *
            FROM alerts
            ORDER BY timestamp DESC
            LIMIT $1
        `;

        const result = await db.query(query, [limit]);
        return result.rows.map(row => ({
            ...row,
            details: row.details ? JSON.parse(row.details) : undefined
        }));
    }

    public static async markAlertAsResolved(alertId: number, resolvedBy: string) {
        const query = `
            UPDATE alerts
            SET resolved = true,
                resolved_at = NOW(),
                resolved_by = $2
            WHERE id = $1
        `;

        await db.query(query, [alertId, resolvedBy]);
    }
}
