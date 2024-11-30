import { Pool } from 'pg';
import { ExcelJS } from 'exceljs';
import PDFDocument from 'pdfkit';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MonitoringService } from './monitoring.service';
import { PredictionService } from './prediction.service';
import { NotificationService } from './notification.service';
import { db } from '../database/db';
import fs from 'fs/promises';
import path from 'path';

interface ReportTemplate {
    id: number;
    name: string;
    description: string;
    metrics: string[];
    format: 'pdf' | 'excel';
    schedule?: {
        frequency: 'daily' | 'weekly' | 'monthly';
        time?: string;
        dayOfWeek?: number;
        dayOfMonth?: number;
    };
    recipients: string[];
    customization?: {
        logo?: string;
        colors?: {
            primary: string;
            secondary: string;
        };
        header?: string;
        footer?: string;
    };
}

interface ReportData {
    metrics: {
        name: string;
        data: Array<{
            timestamp: Date;
            value: number;
        }>;
        statistics: {
            min: number;
            max: number;
            avg: number;
            trend: 'up' | 'down' | 'stable';
        };
        predictions?: Array<{
            timestamp: Date;
            value: number;
            confidence: number;
        }>;
        anomalies?: Array<{
            timestamp: Date;
            value: number;
            expected: number;
            deviation: number;
        }>;
    }[];
    period: {
        start: Date;
        end: Date;
    };
}

export class ReportService {
    private static readonly REPORTS_DIR = path.join(process.cwd(), 'reports');

    public static async initialize() {
        // Créer le dossier des rapports s'il n'existe pas
        await fs.mkdir(this.REPORTS_DIR, { recursive: true });

        // Planifier les rapports automatiques
        await this.scheduleReports();
    }

    private static async scheduleReports() {
        const templates = await this.getReportTemplates();
        
        for (const template of templates) {
            if (template.schedule) {
                this.scheduleReport(template);
            }
        }
    }

    private static scheduleReport(template: ReportTemplate) {
        const now = new Date();
        let nextRun: Date;

        switch (template.schedule?.frequency) {
            case 'daily':
                const [hours, minutes] = template.schedule.time?.split(':') || ['0', '0'];
                nextRun = new Date(now);
                nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                if (nextRun <= now) {
                    nextRun.setDate(nextRun.getDate() + 1);
                }
                break;

            case 'weekly':
                nextRun = new Date(now);
                nextRun.setDate(now.getDate() + ((template.schedule.dayOfWeek || 0) - now.getDay() + 7) % 7);
                break;

            case 'monthly':
                nextRun = new Date(now);
                nextRun.setDate(template.schedule.dayOfMonth || 1);
                if (nextRun <= now) {
                    nextRun.setMonth(nextRun.getMonth() + 1);
                }
                break;

            default:
                return;
        }

        const delay = nextRun.getTime() - now.getTime();
        setTimeout(() => {
            this.generateReport(template)
                .then(() => this.scheduleReport(template))
                .catch(console.error);
        }, delay);
    }

    public static async generateReport(template: ReportTemplate): Promise<string> {
        try {
            // Collecter les données
            const data = await this.collectReportData(template);

            // Générer le rapport dans le format approprié
            const reportPath = template.format === 'pdf'
                ? await this.generatePDFReport(template, data)
                : await this.generateExcelReport(template, data);

            // Notifier les destinataires
            await this.notifyRecipients(template, reportPath);

            return reportPath;
        } catch (error) {
            console.error('Erreur lors de la génération du rapport:', error);
            throw new Error('Erreur lors de la génération du rapport');
        }
    }

    private static async collectReportData(template: ReportTemplate): Promise<ReportData> {
        const end = new Date();
        const start = new Date(end);
        start.setDate(start.getDate() - 7); // Par défaut, 7 jours de données

        const metricsData = await Promise.all(
            template.metrics.map(async (metric) => {
                const data = await MonitoringService.getMetricData(metric, start, end);
                const predictions = await PredictionService.predictMetric(metric);
                const anomalies = await PredictionService.detectAnomalies(metric);
                const trend = await PredictionService.analyzeTrends(metric);

                const values = data.map(d => d.value);
                const statistics = {
                    min: Math.min(...values),
                    max: Math.max(...values),
                    avg: values.reduce((a, b) => a + b, 0) / values.length,
                    trend: trend.trend
                };

                return {
                    name: metric,
                    data,
                    statistics,
                    predictions,
                    anomalies
                };
            })
        );

        return {
            metrics: metricsData,
            period: { start, end }
        };
    }

    private static async generatePDFReport(template: ReportTemplate, data: ReportData): Promise<string> {
        const doc = new PDFDocument();
        const filename = `report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
        const filepath = path.join(this.REPORTS_DIR, filename);
        const stream = fs.createWriteStream(filepath);

        return new Promise((resolve, reject) => {
            doc.pipe(stream);

            // En-tête
            if (template.customization?.logo) {
                doc.image(template.customization.logo, 50, 45, { width: 50 });
            }
            doc.fontSize(25).text(template.name, 50, 50);
            doc.fontSize(12).text(template.description, 50, 80);

            // Période du rapport
            doc.moveDown()
                .fontSize(14)
                .text(`Période: ${format(data.period.start, 'PPP', { locale: fr })} - ${format(data.period.end, 'PPP', { locale: fr })}`);

            // Données des métriques
            data.metrics.forEach((metric, index) => {
                doc.addPage();
                
                // Titre de la métrique
                doc.fontSize(16).text(metric.name);

                // Statistiques
                doc.moveDown()
                    .fontSize(12)
                    .text(`Minimum: ${metric.statistics.min}`)
                    .text(`Maximum: ${metric.statistics.max}`)
                    .text(`Moyenne: ${metric.statistics.avg.toFixed(2)}`)
                    .text(`Tendance: ${metric.statistics.trend}`);

                // Anomalies
                if (metric.anomalies && metric.anomalies.length > 0) {
                    doc.moveDown()
                        .fontSize(14)
                        .text('Anomalies détectées:');
                    
                    metric.anomalies.forEach(anomaly => {
                        doc.fontSize(10)
                            .text(`${format(anomaly.timestamp, 'PPpp', { locale: fr })} - Valeur: ${anomaly.value} (Attendu: ${anomaly.expected})`);
                    });
                }
            });

            // Pied de page
            if (template.customization?.footer) {
                doc.fontSize(10).text(
                    template.customization.footer,
                    50,
                    doc.page.height - 50,
                    { align: 'center' }
                );
            }

            doc.end();

            stream.on('finish', () => resolve(filepath));
            stream.on('error', reject);
        });
    }

    private static async generateExcelReport(template: ReportTemplate, data: ReportData): Promise<string> {
        const workbook = new ExcelJS.Workbook();
        const filename = `report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
        const filepath = path.join(this.REPORTS_DIR, filename);

        // Feuille de résumé
        const summarySheet = workbook.addWorksheet('Résumé');
        summarySheet.columns = [
            { header: 'Métrique', key: 'metric' },
            { header: 'Minimum', key: 'min' },
            { header: 'Maximum', key: 'max' },
            { header: 'Moyenne', key: 'avg' },
            { header: 'Tendance', key: 'trend' }
        ];

        data.metrics.forEach(metric => {
            summarySheet.addRow({
                metric: metric.name,
                min: metric.statistics.min,
                max: metric.statistics.max,
                avg: metric.statistics.avg,
                trend: metric.statistics.trend
            });
        });

        // Feuilles de détails par métrique
        data.metrics.forEach(metric => {
            const sheet = workbook.addWorksheet(metric.name);
            
            // Données historiques
            sheet.columns = [
                { header: 'Timestamp', key: 'timestamp' },
                { header: 'Valeur', key: 'value' },
                { header: 'Prédiction', key: 'prediction' },
                { header: 'Anomalie', key: 'anomaly' }
            ];

            metric.data.forEach(point => {
                const prediction = metric.predictions?.find(p => 
                    p.timestamp.getTime() === point.timestamp.getTime()
                );
                const anomaly = metric.anomalies?.find(a =>
                    a.timestamp.getTime() === point.timestamp.getTime()
                );

                sheet.addRow({
                    timestamp: format(point.timestamp, 'PPpp', { locale: fr }),
                    value: point.value,
                    prediction: prediction?.value || '',
                    anomaly: anomaly ? 'Oui' : ''
                });
            });

            // Mise en forme
            sheet.getColumn('timestamp').width = 30;
            sheet.getColumn('value').width = 15;
            sheet.getColumn('prediction').width = 15;
            sheet.getColumn('anomaly').width = 10;
        });

        await workbook.xlsx.writeFile(filepath);
        return filepath;
    }

    private static async notifyRecipients(template: ReportTemplate, reportPath: string) {
        const fileContent = await fs.readFile(reportPath);
        const fileName = path.basename(reportPath);

        for (const recipient of template.recipients) {
            await NotificationService.sendEmail({
                to: recipient,
                subject: `Rapport: ${template.name}`,
                html: `<p>Veuillez trouver ci-joint le rapport "${template.name}".</p>`,
                attachments: [{
                    filename: fileName,
                    content: fileContent
                }]
            });
        }
    }

    public static async getReportTemplates(): Promise<ReportTemplate[]> {
        const query = 'SELECT * FROM report_templates ORDER BY name';
        const result = await db.query(query);
        return result.rows;
    }

    public static async saveReportTemplate(template: Omit<ReportTemplate, 'id'>): Promise<number> {
        const query = `
            INSERT INTO report_templates (
                name, description, metrics, format, schedule, recipients, customization
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `;

        const result = await db.query(query, [
            template.name,
            template.description,
            template.metrics,
            template.format,
            template.schedule,
            template.recipients,
            template.customization
        ]);

        return result.rows[0].id;
    }

    public static async updateReportTemplate(
        id: number,
        template: Partial<Omit<ReportTemplate, 'id'>>
    ): Promise<void> {
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (template.name) {
            updates.push(`name = $${paramCount}`);
            values.push(template.name);
            paramCount++;
        }

        if (template.description) {
            updates.push(`description = $${paramCount}`);
            values.push(template.description);
            paramCount++;
        }

        if (template.metrics) {
            updates.push(`metrics = $${paramCount}`);
            values.push(template.metrics);
            paramCount++;
        }

        if (template.format) {
            updates.push(`format = $${paramCount}`);
            values.push(template.format);
            paramCount++;
        }

        if (template.schedule) {
            updates.push(`schedule = $${paramCount}`);
            values.push(template.schedule);
            paramCount++;
        }

        if (template.recipients) {
            updates.push(`recipients = $${paramCount}`);
            values.push(template.recipients);
            paramCount++;
        }

        if (template.customization) {
            updates.push(`customization = $${paramCount}`);
            values.push(template.customization);
            paramCount++;
        }

        if (updates.length === 0) return;

        const query = `
            UPDATE report_templates
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
        `;

        values.push(id);
        await db.query(query, values);
    }

    public static async deleteReportTemplate(id: number): Promise<void> {
        const query = 'DELETE FROM report_templates WHERE id = $1';
        await db.query(query, [id]);
    }
}
