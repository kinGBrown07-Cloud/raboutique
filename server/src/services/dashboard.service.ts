import { db } from '../database/db';
import { LogService } from './log.service';

interface DashboardWidget {
    id: number;
    name: string;
    type: 'graph' | 'counter' | 'table' | 'alert';
    metrics: string[];
    config: {
        refreshInterval?: number;
        chartType?: 'line' | 'bar' | 'pie';
        timeRange?: string;
        aggregation?: 'sum' | 'avg' | 'min' | 'max';
        filters?: any;
        thresholds?: {
            warning?: number;
            critical?: number;
        };
    };
    layout: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
}

interface Dashboard {
    id: number;
    name: string;
    description: string;
    owner: number;
    shared_with: number[];
    widgets: DashboardWidget[];
    created_at: Date;
    updated_at: Date;
}

export class DashboardService {
    static async createDashboard(dashboard: Omit<Dashboard, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
        try {
            const [result] = await db.query(`
                INSERT INTO dashboards
                (name, description, owner, shared_with, widgets)
                VALUES (?, ?, ?, ?, ?)
            `, [
                dashboard.name,
                dashboard.description,
                dashboard.owner,
                JSON.stringify(dashboard.shared_with),
                JSON.stringify(dashboard.widgets)
            ]);

            await LogService.log({
                level: 'info',
                category: 'dashboard',
                action: 'create_dashboard',
                details: { dashboard_id: (result as any).insertId }
            });

            return (result as any).insertId;
        } catch (error) {
            console.error('Error creating dashboard:', error);
            await LogService.log({
                level: 'error',
                category: 'dashboard',
                action: 'create_dashboard',
                details: { error }
            });
            throw error;
        }
    }

    static async getDashboard(id: number): Promise<Dashboard> {
        const [dashboards] = await db.query(
            'SELECT * FROM dashboards WHERE id = ?',
            [id]
        );

        if (!dashboards || (dashboards as any[]).length === 0) {
            throw new Error(`Dashboard ${id} not found`);
        }

        const dashboard = (dashboards as any[])[0];
        return {
            ...dashboard,
            shared_with: JSON.parse(dashboard.shared_with),
            widgets: JSON.parse(dashboard.widgets)
        };
    }

    static async updateDashboard(id: number, updates: Partial<Dashboard>): Promise<void> {
        const updateFields: string[] = [];
        const values: any[] = [];

        Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined) {
                updateFields.push(`${key} = ?`);
                values.push(typeof value === 'object' ? JSON.stringify(value) : value);
            }
        });

        if (updateFields.length === 0) return;

        values.push(id);
        await db.query(`
            UPDATE dashboards
            SET ${updateFields.join(', ')}, updated_at = NOW()
            WHERE id = ?
        `, values);

        await LogService.log({
            level: 'info',
            category: 'dashboard',
            action: 'update_dashboard',
            details: { dashboard_id: id, updates }
        });
    }

    static async deleteDashboard(id: number): Promise<void> {
        await db.query('DELETE FROM dashboards WHERE id = ?', [id]);
        await LogService.log({
            level: 'info',
            category: 'dashboard',
            action: 'delete_dashboard',
            details: { dashboard_id: id }
        });
    }

    static async getWidgetData(widget: DashboardWidget): Promise<any> {
        try {
            const timeRangeQuery = this.buildTimeRangeQuery(widget.config.timeRange);
            const metricsQuery = this.buildMetricsQuery(widget.metrics, widget.config.aggregation);
            const filtersQuery = this.buildFiltersQuery(widget.config.filters);

            const query = `
                SELECT 
                    ${metricsQuery}
                FROM ${this.getMetricsTable(widget.metrics)}
                WHERE ${timeRangeQuery}
                ${filtersQuery ? `AND ${filtersQuery}` : ''}
                GROUP BY time_bucket
                ORDER BY time_bucket ASC
            `;

            const [data] = await db.query(query);
            return this.formatWidgetData(widget, data as any[]);
        } catch (error) {
            console.error('Error fetching widget data:', error);
            await LogService.log({
                level: 'error',
                category: 'dashboard',
                action: 'get_widget_data',
                details: { error, widget_id: widget.id }
            });
            throw error;
        }
    }

    private static buildTimeRangeQuery(timeRange: string = '24h'): string {
        const intervals: { [key: string]: string } = {
            '1h': 'INTERVAL 1 HOUR',
            '24h': 'INTERVAL 24 HOUR',
            '7d': 'INTERVAL 7 DAY',
            '30d': 'INTERVAL 30 DAY'
        };

        return `created_at >= DATE_SUB(NOW(), ${intervals[timeRange] || intervals['24h']})`;
    }

    private static buildMetricsQuery(metrics: string[], aggregation: string = 'avg'): string {
        return `
            DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') as time_bucket,
            ${metrics.map(metric => `${aggregation}(${metric}) as ${metric}`).join(',')}
        `;
    }

    private static buildFiltersQuery(filters: any): string {
        if (!filters) return '';

        return Object.entries(filters)
            .map(([key, value]) => `${key} = ${db.escape(value)}`)
            .join(' AND ');
    }

    private static getMetricsTable(metrics: string[]): string {
        // Détermine si les métriques sont système ou business
        const isSystem = metrics.some(m => m.startsWith('sys_'));
        return isSystem ? 'system_metrics' : 'business_metrics';
    }

    private static formatWidgetData(widget: DashboardWidget, data: any[]): any {
        switch (widget.type) {
            case 'counter':
                return this.formatCounterData(data);
            case 'graph':
                return this.formatGraphData(data);
            case 'table':
                return this.formatTableData(data);
            case 'alert':
                return this.formatAlertData(widget, data);
            default:
                return data;
        }
    }

    private static formatCounterData(data: any[]): number {
        if (data.length === 0) return 0;
        const lastRow = data[data.length - 1];
        return Object.values(lastRow)[1] as number;
    }

    private static formatGraphData(data: any[]): any {
        return {
            labels: data.map(row => row.time_bucket),
            datasets: Object.keys(data[0])
                .filter(key => key !== 'time_bucket')
                .map(metric => ({
                    label: metric,
                    data: data.map(row => row[metric])
                }))
        };
    }

    private static formatTableData(data: any[]): any {
        return {
            columns: Object.keys(data[0]).map(key => ({
                Header: key,
                accessor: key
            })),
            data
        };
    }

    private static formatAlertData(widget: DashboardWidget, data: any[]): any {
        const lastValue = this.formatCounterData(data);
        const { warning, critical } = widget.config.thresholds || {};

        return {
            value: lastValue,
            status: critical && lastValue >= critical ? 'critical'
                : warning && lastValue >= warning ? 'warning'
                : 'normal'
        };
    }

    static async shareDashboard(dashboardId: number, userId: number): Promise<void> {
        const dashboard = await this.getDashboard(dashboardId);
        if (!dashboard.shared_with.includes(userId)) {
            dashboard.shared_with.push(userId);
            await this.updateDashboard(dashboardId, {
                shared_with: dashboard.shared_with
            });
        }
    }

    static async unshareashboard(dashboardId: number, userId: number): Promise<void> {
        const dashboard = await this.getDashboard(dashboardId);
        dashboard.shared_with = dashboard.shared_with.filter(id => id !== userId);
        await this.updateDashboard(dashboardId, {
            shared_with: dashboard.shared_with
        });
    }

    static async getUserDashboards(userId: number): Promise<Dashboard[]> {
        const [dashboards] = await db.query(`
            SELECT * FROM dashboards 
            WHERE owner = ? OR JSON_CONTAINS(shared_with, ?)
            ORDER BY created_at DESC
        `, [userId, userId]);

        return (dashboards as any[]).map(dashboard => ({
            ...dashboard,
            shared_with: JSON.parse(dashboard.shared_with),
            widgets: JSON.parse(dashboard.widgets)
        }));
    }

    static async duplicateDashboard(id: number, newName: string): Promise<number> {
        const dashboard = await this.getDashboard(id);
        const newDashboard: Omit<Dashboard, 'id' | 'created_at' | 'updated_at'> = {
            ...dashboard,
            name: newName,
            shared_with: []
        };

        return this.createDashboard(newDashboard);
    }
}
