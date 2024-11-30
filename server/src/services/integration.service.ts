import { db } from '../database/db';
import { LogService } from './log.service';
import axios from 'axios';
import crypto from 'crypto';

interface Integration {
    id: number;
    name: string;
    type: 'slack' | 'email' | 'webhook' | 'sms' | 'teams';
    config: {
        url?: string;
        token?: string;
        channel?: string;
        email?: string;
        phone?: string;
        headers?: Record<string, string>;
        template?: string;
    };
    enabled: boolean;
    created_at: Date;
    updated_at: Date;
}

interface NotificationPayload {
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    data?: any;
}

export class IntegrationService {
    private static readonly ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key';
    private static readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';

    static async createIntegration(integration: Omit<Integration, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
        try {
            // Chiffrer les informations sensibles
            const encryptedConfig = await this.encryptSensitiveData(integration.config);

            const [result] = await db.query(`
                INSERT INTO integrations
                (name, type, config, enabled)
                VALUES (?, ?, ?, ?)
            `, [
                integration.name,
                integration.type,
                JSON.stringify(encryptedConfig),
                integration.enabled
            ]);

            await LogService.log({
                level: 'info',
                category: 'integration',
                action: 'create_integration',
                details: { integration_id: (result as any).insertId }
            });

            return (result as any).insertId;
        } catch (error) {
            console.error('Error creating integration:', error);
            await LogService.log({
                level: 'error',
                category: 'integration',
                action: 'create_integration',
                details: { error }
            });
            throw error;
        }
    }

    static async getIntegration(id: number): Promise<Integration> {
        const [integrations] = await db.query(
            'SELECT * FROM integrations WHERE id = ?',
            [id]
        );

        if (!integrations || (integrations as any[]).length === 0) {
            throw new Error(`Integration ${id} not found`);
        }

        const integration = (integrations as any[])[0];
        integration.config = await this.decryptSensitiveData(JSON.parse(integration.config));
        return integration;
    }

    static async updateIntegration(id: number, updates: Partial<Integration>): Promise<void> {
        const updateFields: string[] = [];
        const values: any[] = [];

        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
                updateFields.push(`${key} = ?`);
                if (key === 'config') {
                    const encryptedConfig = await this.encryptSensitiveData(value);
                    values.push(JSON.stringify(encryptedConfig));
                } else {
                    values.push(value);
                }
            }
        }

        if (updateFields.length === 0) return;

        values.push(id);
        await db.query(`
            UPDATE integrations
            SET ${updateFields.join(', ')}, updated_at = NOW()
            WHERE id = ?
        `, values);

        await LogService.log({
            level: 'info',
            category: 'integration',
            action: 'update_integration',
            details: { integration_id: id }
        });
    }

    static async deleteIntegration(id: number): Promise<void> {
        await db.query('DELETE FROM integrations WHERE id = ?', [id]);
        await LogService.log({
            level: 'info',
            category: 'integration',
            action: 'delete_integration',
            details: { integration_id: id }
        });
    }

    static async sendNotification(integrationId: number, payload: NotificationPayload): Promise<void> {
        try {
            const integration = await this.getIntegration(integrationId);
            if (!integration.enabled) return;

            const formattedPayload = this.formatPayload(integration, payload);
            await this.deliverNotification(integration, formattedPayload);

            await LogService.log({
                level: 'info',
                category: 'integration',
                action: 'send_notification',
                details: {
                    integration_id: integrationId,
                    severity: payload.severity
                }
            });
        } catch (error) {
            console.error('Error sending notification:', error);
            await LogService.log({
                level: 'error',
                category: 'integration',
                action: 'send_notification',
                details: { error, integration_id: integrationId }
            });
            throw error;
        }
    }

    private static formatPayload(integration: Integration, payload: NotificationPayload): any {
        switch (integration.type) {
            case 'slack':
                return {
                    channel: integration.config.channel,
                    text: `*${payload.title}*\n${payload.message}`,
                    attachments: [{
                        color: this.getSeverityColor(payload.severity),
                        fields: payload.data ? Object.entries(payload.data).map(([key, value]) => ({
                            title: key,
                            value: value,
                            short: true
                        })) : []
                    }]
                };

            case 'teams':
                return {
                    "@type": "MessageCard",
                    "@context": "http://schema.org/extensions",
                    "summary": payload.title,
                    "themeColor": this.getSeverityColor(payload.severity),
                    "title": payload.title,
                    "sections": [{
                        "text": payload.message,
                        "facts": payload.data ? Object.entries(payload.data).map(([key, value]) => ({
                            "name": key,
                            "value": value
                        })) : []
                    }]
                };

            case 'email':
                return {
                    to: integration.config.email,
                    subject: `[${payload.severity.toUpperCase()}] ${payload.title}`,
                    html: this.generateEmailTemplate(payload)
                };

            case 'webhook':
                return {
                    title: payload.title,
                    message: payload.message,
                    severity: payload.severity,
                    timestamp: new Date().toISOString(),
                    data: payload.data
                };

            case 'sms':
                return `${payload.title}\n${payload.message}`;

            default:
                return payload;
        }
    }

    private static async deliverNotification(integration: Integration, payload: any): Promise<void> {
        switch (integration.type) {
            case 'slack':
                await axios.post(integration.config.url!, payload, {
                    headers: {
                        'Authorization': `Bearer ${integration.config.token}`
                    }
                });
                break;

            case 'teams':
                await axios.post(integration.config.url!, payload);
                break;

            case 'email':
                // Utiliser un service d'email comme nodemailer
                // Code d'envoi d'email ici
                break;

            case 'webhook':
                await axios.post(integration.config.url!, payload, {
                    headers: integration.config.headers
                });
                break;

            case 'sms':
                // Intégrer avec un service SMS
                // Code d'envoi SMS ici
                break;
        }
    }

    private static getSeverityColor(severity: string): string {
        const colors = {
            info: '#36a64f',
            warning: '#ffcc00',
            error: '#ff9900',
            critical: '#ff0000'
        };
        return colors[severity as keyof typeof colors] || colors.info;
    }

    private static generateEmailTemplate(payload: NotificationPayload): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { padding: 20px; }
                    .severity { font-weight: bold; }
                    .message { margin: 20px 0; }
                    .data-table { border-collapse: collapse; width: 100%; }
                    .data-table td, .data-table th { 
                        border: 1px solid #ddd; 
                        padding: 8px; 
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>${payload.title}</h2>
                    <p class="severity">Severity: ${payload.severity}</p>
                    <div class="message">${payload.message}</div>
                    ${payload.data ? `
                        <table class="data-table">
                            <tr><th>Key</th><th>Value</th></tr>
                            ${Object.entries(payload.data).map(([key, value]) => `
                                <tr><td>${key}</td><td>${value}</td></tr>
                            `).join('')}
                        </table>
                    ` : ''}
                </div>
            </body>
            </html>
        `;
    }

    private static async encryptSensitiveData(config: any): Promise<any> {
        const sensitiveFields = ['token', 'password', 'apiKey', 'secret'];
        const encryptedConfig = { ...config };

        for (const field of sensitiveFields) {
            if (encryptedConfig[field]) {
                const iv = crypto.randomBytes(12);
                const cipher = crypto.createCipheriv(
                    this.ENCRYPTION_ALGORITHM,
                    Buffer.from(this.ENCRYPTION_KEY),
                    iv
                );

                let encrypted = cipher.update(encryptedConfig[field], 'utf8', 'hex');
                encrypted += cipher.final('hex');
                const authTag = cipher.getAuthTag();

                encryptedConfig[field] = {
                    iv: iv.toString('hex'),
                    encrypted,
                    authTag: authTag.toString('hex')
                };
            }
        }

        return encryptedConfig;
    }

    private static async decryptSensitiveData(config: any): Promise<any> {
        const sensitiveFields = ['token', 'password', 'apiKey', 'secret'];
        const decryptedConfig = { ...config };

        for (const field of sensitiveFields) {
            if (decryptedConfig[field] && typeof decryptedConfig[field] === 'object') {
                const { iv, encrypted, authTag } = decryptedConfig[field];

                const decipher = crypto.createDecipheriv(
                    this.ENCRYPTION_ALGORITHM,
                    Buffer.from(this.ENCRYPTION_KEY),
                    Buffer.from(iv, 'hex')
                );

                decipher.setAuthTag(Buffer.from(authTag, 'hex'));

                let decrypted = decipher.update(encrypted, 'hex', 'utf8');
                decrypted += decipher.final('utf8');

                decryptedConfig[field] = decrypted;
            }
        }

        return decryptedConfig;
    }

    static async testIntegration(id: number): Promise<boolean> {
        try {
            const testPayload: NotificationPayload = {
                title: 'Test Notification',
                message: 'This is a test notification from the monitoring system.',
                severity: 'info',
                data: {
                    timestamp: new Date().toISOString(),
                    source: 'System Test'
                }
            };

            await this.sendNotification(id, testPayload);
            return true;
        } catch (error) {
            console.error('Integration test failed:', error);
            return false;
        }
    }

    static async getEnabledIntegrations(): Promise<Integration[]> {
        const [integrations] = await db.query(
            'SELECT * FROM integrations WHERE enabled = true'
        );

        return Promise.all((integrations as any[]).map(async (integration) => {
            integration.config = await this.decryptSensitiveData(JSON.parse(integration.config));
            return integration;
        }));
    }
}
