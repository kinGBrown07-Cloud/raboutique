import { db } from '../database/db';
import { LogService } from './log.service';
import { WebSocket } from 'ws';
import os from 'os';

interface SystemMetrics {
    cpu_usage: number;
    memory_usage: number;
    active_connections: number;
    request_rate: number;
    error_rate: number;
    response_time: number;
}

interface BusinessMetrics {
    active_users: number;
    transaction_volume: number;
    conversion_rate: number;
    revenue: number;
}

export class MonitoringService {
    private static wsClients: Set<WebSocket> = new Set();
    private static metricsInterval: NodeJS.Timeout;
    private static readonly METRICS_INTERVAL = 10000; // 10 seconds

    static addWebSocketClient(ws: WebSocket) {
        this.wsClients.add(ws);
        ws.on('close', () => this.wsClients.delete(ws));
    }

    static startMetricsCollection() {
        this.metricsInterval = setInterval(
            async () => await this.collectAndBroadcastMetrics(),
            this.METRICS_INTERVAL
        );
    }

    static stopMetricsCollection() {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
    }

    private static async collectAndBroadcastMetrics() {
        try {
            const systemMetrics = await this.collectSystemMetrics();
            const businessMetrics = await this.collectBusinessMetrics();

            this.notifyWebSocketClients({
                type: 'metrics_update',
                data: {
                    timestamp: new Date(),
                    system: systemMetrics,
                    business: businessMetrics
                }
            });

            // Stocker les métriques dans la base de données
            await this.storeMetrics(systemMetrics, businessMetrics);
        } catch (error) {
            console.error('Error collecting metrics:', error);
            await LogService.log({
                level: 'error',
                category: 'monitoring',
                action: 'collect_metrics',
                details: { error }
            });
        }
    }

    private static async collectSystemMetrics(): Promise<SystemMetrics> {
        // CPU Usage
        const cpus = os.cpus();
        const cpuUsage = cpus.reduce((acc, cpu) => {
            const total = Object.values(cpu.times).reduce((a, b) => a + b);
            const idle = cpu.times.idle;
            return acc + ((total - idle) / total);
        }, 0) / cpus.length;

        // Memory Usage
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const memoryUsage = (totalMem - freeMem) / totalMem;

        // Requêtes et erreurs des 5 dernières minutes
        const [requestStats] = await db.query(`
            SELECT 
                COUNT(*) as total_requests,
                COUNT(CASE WHEN level = 'error' THEN 1 END) as error_count,
                AVG(CAST(details->>'$.duration' AS DECIMAL)) as avg_response_time
            FROM system_logs
            WHERE 
                category = 'http'
                AND created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        `);

        const stats = (requestStats as any)[0];
        const requestRate = stats.total_requests / 5; // requests per minute
        const errorRate = stats.error_count / stats.total_requests;

        // Connexions actives
        const [connections] = await db.query(`
            SELECT COUNT(*) as count
            FROM user_sessions
            WHERE last_activity >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        `);

        return {
            cpu_usage: cpuUsage,
            memory_usage: memoryUsage,
            active_connections: (connections as any)[0].count,
            request_rate: requestRate,
            error_rate: errorRate,
            response_time: stats.avg_response_time
        };
    }

    private static async collectBusinessMetrics(): Promise<BusinessMetrics> {
        // Utilisateurs actifs des dernières 24h
        const [activeUsers] = await db.query(`
            SELECT COUNT(DISTINCT user_id) as count
            FROM system_logs
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        `);

        // Transactions des dernières 24h
        const [transactions] = await db.query(`
            SELECT 
                COUNT(*) as total_count,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as success_count,
                SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_amount
            FROM transactions
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        `);

        const txStats = (transactions as any)[0];
        const conversionRate = txStats.total_count > 0 
            ? txStats.success_count / txStats.total_count 
            : 0;

        return {
            active_users: (activeUsers as any)[0].count,
            transaction_volume: txStats.total_count,
            conversion_rate: conversionRate,
            revenue: txStats.total_amount || 0
        };
    }

    private static async storeMetrics(
        systemMetrics: SystemMetrics,
        businessMetrics: BusinessMetrics
    ) {
        await db.query(
            `INSERT INTO system_metrics 
            (cpu_usage, memory_usage, active_connections, request_rate, error_rate, response_time)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                systemMetrics.cpu_usage,
                systemMetrics.memory_usage,
                systemMetrics.active_connections,
                systemMetrics.request_rate,
                systemMetrics.error_rate,
                systemMetrics.response_time
            ]
        );

        await db.query(
            `INSERT INTO business_metrics 
            (active_users, transaction_volume, conversion_rate, revenue)
            VALUES (?, ?, ?, ?)`,
            [
                businessMetrics.active_users,
                businessMetrics.transaction_volume,
                businessMetrics.conversion_rate,
                businessMetrics.revenue
            ]
        );
    }

    private static notifyWebSocketClients(message: any) {
        const messageStr = JSON.stringify(message);
        this.wsClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(messageStr);
            }
        });
    }

    static async getHistoricalMetrics(period: string) {
        const periodMap: { [key: string]: string } = {
            '1h': 'INTERVAL 1 HOUR',
            '24h': 'INTERVAL 24 HOUR',
            '7d': 'INTERVAL 7 DAY',
            '30d': 'INTERVAL 30 DAY'
        };

        const timeWindow = periodMap[period] || periodMap['24h'];

        const [systemMetrics] = await db.query(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:00') as timestamp,
                AVG(cpu_usage) as cpu_usage,
                AVG(memory_usage) as memory_usage,
                AVG(active_connections) as active_connections,
                AVG(request_rate) as request_rate,
                AVG(error_rate) as error_rate,
                AVG(response_time) as response_time
            FROM system_metrics
            WHERE created_at >= DATE_SUB(NOW(), ${timeWindow})
            GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:00')
            ORDER BY timestamp ASC
        `);

        const [businessMetrics] = await db.query(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:00') as timestamp,
                AVG(active_users) as active_users,
                SUM(transaction_volume) as transaction_volume,
                AVG(conversion_rate) as conversion_rate,
                SUM(revenue) as revenue
            FROM business_metrics
            WHERE created_at >= DATE_SUB(NOW(), ${timeWindow})
            GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:00')
            ORDER BY timestamp ASC
        `);

        return {
            system: systemMetrics,
            business: businessMetrics
        };
    }
}
