import { Pool } from 'pg';
import { db } from '../database/db';
import { MonitoringService } from './monitoring.service';
import { PredictionService } from './prediction.service';
import { NotificationService } from './notification.service';

interface PerformanceMetric {
    name: string;
    value: number;
    timestamp: Date;
    metadata?: Record<string, any>;
}

interface ResourceUsage {
    cpu: number;
    memory: number;
    disk: number;
    network: {
        bytesIn: number;
        bytesOut: number;
    };
}

interface Bottleneck {
    resource: string;
    severity: 'low' | 'medium' | 'high';
    impact: number;
    recommendations: string[];
    metadata?: Record<string, any>;
}

interface PerformanceAnalysis {
    timestamp: Date;
    overallScore: number;
    metrics: PerformanceMetric[];
    resourceUsage: ResourceUsage;
    bottlenecks: Bottleneck[];
    recommendations: string[];
}

export class PerformanceService {
    private static readonly PERFORMANCE_THRESHOLDS = {
        cpu: { warning: 70, critical: 85 },
        memory: { warning: 80, critical: 90 },
        disk: { warning: 85, critical: 95 },
        responseTime: { warning: 1000, critical: 2000 }, // en ms
        errorRate: { warning: 1, critical: 5 }, // en %
        concurrentUsers: { warning: 100, critical: 200 }
    };

    public static async analyzePerformance(): Promise<PerformanceAnalysis> {
        const timestamp = new Date();
        const metrics = await this.collectPerformanceMetrics();
        const resourceUsage = await this.getResourceUsage();
        const bottlenecks = await this.detectBottlenecks(metrics, resourceUsage);
        const recommendations = await this.generateRecommendations(bottlenecks);
        const overallScore = this.calculateOverallScore(metrics, resourceUsage, bottlenecks);

        const analysis: PerformanceAnalysis = {
            timestamp,
            overallScore,
            metrics,
            resourceUsage,
            bottlenecks,
            recommendations
        };

        await this.saveAnalysis(analysis);
        await this.notifyIfNeeded(analysis);

        return analysis;
    }

    private static async collectPerformanceMetrics(): Promise<PerformanceMetric[]> {
        const metrics: PerformanceMetric[] = [];
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

        // Temps de réponse moyen
        const responseTimeQuery = `
            SELECT AVG(response_time) as avg_response_time
            FROM request_logs
            WHERE timestamp >= $1
        `;
        const responseTimeResult = await db.query(responseTimeQuery, [fiveMinutesAgo]);
        metrics.push({
            name: 'avg_response_time',
            value: responseTimeResult.rows[0].avg_response_time,
            timestamp: now
        });

        // Taux d'erreur
        const errorRateQuery = `
            SELECT 
                COUNT(CASE WHEN status_code >= 500 THEN 1 END) * 100.0 / COUNT(*) as error_rate
            FROM request_logs
            WHERE timestamp >= $1
        `;
        const errorRateResult = await db.query(errorRateQuery, [fiveMinutesAgo]);
        metrics.push({
            name: 'error_rate',
            value: errorRateResult.rows[0].error_rate,
            timestamp: now
        });

        // Utilisateurs concurrents
        const concurrentUsersQuery = `
            SELECT COUNT(DISTINCT user_id) as concurrent_users
            FROM sessions
            WHERE last_activity >= $1
        `;
        const concurrentUsersResult = await db.query(concurrentUsersQuery, [fiveMinutesAgo]);
        metrics.push({
            name: 'concurrent_users',
            value: concurrentUsersResult.rows[0].concurrent_users,
            timestamp: now
        });

        return metrics;
    }

    private static async getResourceUsage(): Promise<ResourceUsage> {
        // Simulé pour l'exemple - à remplacer par de vraies métriques système
        return {
            cpu: Math.random() * 100,
            memory: Math.random() * 100,
            disk: Math.random() * 100,
            network: {
                bytesIn: Math.random() * 1000000,
                bytesOut: Math.random() * 1000000
            }
        };
    }

    private static async detectBottlenecks(
        metrics: PerformanceMetric[],
        resourceUsage: ResourceUsage
    ): Promise<Bottleneck[]> {
        const bottlenecks: Bottleneck[] = [];

        // CPU
        if (resourceUsage.cpu >= this.PERFORMANCE_THRESHOLDS.cpu.critical) {
            bottlenecks.push({
                resource: 'CPU',
                severity: 'high',
                impact: 0.9,
                recommendations: [
                    'Optimiser les opérations intensives en CPU',
                    'Envisager la mise à l\'échelle horizontale',
                    'Vérifier les processus en arrière-plan'
                ]
            });
        } else if (resourceUsage.cpu >= this.PERFORMANCE_THRESHOLDS.cpu.warning) {
            bottlenecks.push({
                resource: 'CPU',
                severity: 'medium',
                impact: 0.6,
                recommendations: [
                    'Surveiller l\'utilisation du CPU',
                    'Planifier une optimisation des processus'
                ]
            });
        }

        // Mémoire
        if (resourceUsage.memory >= this.PERFORMANCE_THRESHOLDS.memory.critical) {
            bottlenecks.push({
                resource: 'Memory',
                severity: 'high',
                impact: 0.85,
                recommendations: [
                    'Vérifier les fuites de mémoire potentielles',
                    'Optimiser la gestion du cache',
                    'Augmenter la RAM disponible'
                ]
            });
        }

        // Temps de réponse
        const avgResponseTime = metrics.find(m => m.name === 'avg_response_time')?.value;
        if (avgResponseTime && avgResponseTime >= this.PERFORMANCE_THRESHOLDS.responseTime.critical) {
            bottlenecks.push({
                resource: 'Response Time',
                severity: 'high',
                impact: 0.95,
                recommendations: [
                    'Optimiser les requêtes de base de données',
                    'Mettre en place ou améliorer le cache',
                    'Vérifier les appels API externes'
                ]
            });
        }

        return bottlenecks;
    }

    private static async generateRecommendations(bottlenecks: Bottleneck[]): Promise<string[]> {
        const recommendations = new Set<string>();

        // Ajouter les recommandations spécifiques aux goulots
        bottlenecks.forEach(bottleneck => {
            bottleneck.recommendations.forEach(rec => recommendations.add(rec));
        });

        // Ajouter des recommandations générales si nécessaire
        if (bottlenecks.length > 2) {
            recommendations.add('Effectuer un audit de performance complet');
            recommendations.add('Envisager une refactorisation des composants critiques');
        }

        return Array.from(recommendations);
    }

    private static calculateOverallScore(
        metrics: PerformanceMetric[],
        resourceUsage: ResourceUsage,
        bottlenecks: Bottleneck[]
    ): number {
        let score = 100;

        // Impact des goulots d'étranglement
        bottlenecks.forEach(bottleneck => {
            score -= bottleneck.impact * 10;
        });

        // Impact de l'utilisation des ressources
        if (resourceUsage.cpu > this.PERFORMANCE_THRESHOLDS.cpu.warning) {
            score -= (resourceUsage.cpu - this.PERFORMANCE_THRESHOLDS.cpu.warning) * 0.5;
        }
        if (resourceUsage.memory > this.PERFORMANCE_THRESHOLDS.memory.warning) {
            score -= (resourceUsage.memory - this.PERFORMANCE_THRESHOLDS.memory.warning) * 0.4;
        }

        // Impact des métriques
        const errorRate = metrics.find(m => m.name === 'error_rate')?.value;
        if (errorRate && errorRate > this.PERFORMANCE_THRESHOLDS.errorRate.warning) {
            score -= (errorRate - this.PERFORMANCE_THRESHOLDS.errorRate.warning) * 5;
        }

        return Math.max(0, Math.min(100, score));
    }

    private static async saveAnalysis(analysis: PerformanceAnalysis): Promise<void> {
        const query = `
            INSERT INTO performance_analysis (
                timestamp,
                overall_score,
                metrics,
                resource_usage,
                bottlenecks,
                recommendations
            ) VALUES ($1, $2, $3, $4, $5, $6)
        `;

        await db.query(query, [
            analysis.timestamp,
            analysis.overallScore,
            JSON.stringify(analysis.metrics),
            JSON.stringify(analysis.resourceUsage),
            JSON.stringify(analysis.bottlenecks),
            JSON.stringify(analysis.recommendations)
        ]);
    }

    private static async notifyIfNeeded(analysis: PerformanceAnalysis): Promise<void> {
        // Notifier en cas de score faible
        if (analysis.overallScore < 50) {
            await NotificationService.sendAlert({
                level: 'critical',
                title: 'Performance Critique',
                message: `Score de performance: ${analysis.overallScore}. Action immédiate requise.`,
                details: {
                    bottlenecks: analysis.bottlenecks,
                    recommendations: analysis.recommendations
                }
            });
        } else if (analysis.overallScore < 70) {
            await NotificationService.sendAlert({
                level: 'warning',
                title: 'Performance Dégradée',
                message: `Score de performance: ${analysis.overallScore}. Optimisation recommandée.`,
                details: {
                    bottlenecks: analysis.bottlenecks,
                    recommendations: analysis.recommendations
                }
            });
        }
    }

    public static async getHistoricalPerformance(
        startDate: Date,
        endDate: Date
    ): Promise<PerformanceAnalysis[]> {
        const query = `
            SELECT *
            FROM performance_analysis
            WHERE timestamp BETWEEN $1 AND $2
            ORDER BY timestamp ASC
        `;

        const result = await db.query(query, [startDate, endDate]);
        return result.rows.map(row => ({
            ...row,
            metrics: JSON.parse(row.metrics),
            resourceUsage: JSON.parse(row.resource_usage),
            bottlenecks: JSON.parse(row.bottlenecks),
            recommendations: JSON.parse(row.recommendations)
        }));
    }

    public static async getTrends(): Promise<any> {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const historicalData = await this.getHistoricalPerformance(oneWeekAgo, now);
        
        // Analyser les tendances
        const trends = {
            overallScore: {
                current: historicalData[historicalData.length - 1]?.overallScore || 0,
                trend: this.calculateTrend(historicalData.map(d => d.overallScore))
            },
            resourceUsage: {
                cpu: this.calculateTrend(historicalData.map(d => d.resourceUsage.cpu)),
                memory: this.calculateTrend(historicalData.map(d => d.resourceUsage.memory)),
                disk: this.calculateTrend(historicalData.map(d => d.resourceUsage.disk))
            },
            commonBottlenecks: this.analyzeCommonBottlenecks(historicalData)
        };

        return trends;
    }

    private static calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
        if (values.length < 2) return 'stable';

        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));

        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        const difference = secondAvg - firstAvg;
        const threshold = 5; // Seuil de 5% pour considérer un changement significatif

        if (difference > threshold) return 'up';
        if (difference < -threshold) return 'down';
        return 'stable';
    }

    private static analyzeCommonBottlenecks(data: PerformanceAnalysis[]): any {
        const bottleneckCounts = new Map<string, number>();
        
        data.forEach(analysis => {
            analysis.bottlenecks.forEach(bottleneck => {
                const count = bottleneckCounts.get(bottleneck.resource) || 0;
                bottleneckCounts.set(bottleneck.resource, count + 1);
            });
        });

        return Array.from(bottleneckCounts.entries())
            .map(([resource, count]) => ({
                resource,
                frequency: count / data.length,
                severity: this.calculateAverageSeverity(data, resource)
            }))
            .sort((a, b) => b.frequency - a.frequency);
    }

    private static calculateAverageSeverity(data: PerformanceAnalysis[], resource: string): string {
        const severityScores = {
            low: 1,
            medium: 2,
            high: 3
        };

        const bottlenecks = data
            .flatMap(analysis => analysis.bottlenecks)
            .filter(bottleneck => bottleneck.resource === resource);

        const avgScore = bottlenecks.reduce((sum, bottleneck) => 
            sum + severityScores[bottleneck.severity], 0) / bottlenecks.length;

        if (avgScore >= 2.5) return 'high';
        if (avgScore >= 1.5) return 'medium';
        return 'low';
    }
}
