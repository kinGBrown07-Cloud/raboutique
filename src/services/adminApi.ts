import axios from 'axios';
import { 
    FinancialReport, 
    RevenueData, 
    TopSeller, 
    PaymentStats, 
    RefundStats,
    PaymentConfig,
    DateRangeFilter
} from '../types/admin';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const AdminApi = {
    // Rapports financiers
    getFinancialReport: async (
        dateRange: DateRangeFilter,
        filters?: { payment_method?: string; transaction_type?: string; status?: string }
    ) => {
        const response = await axios.get<{ data: { report: FinancialReport[] } }>(
            `${API_URL}/admin/reports/financial`,
            { params: { ...dateRange, ...filters } }
        );
        return response.data.data.report;
    },

    // Revenus par période
    getRevenue: async (period: 'daily' | 'weekly' | 'monthly' | 'yearly', limit?: number) => {
        const response = await axios.get<{ data: { revenue: RevenueData[] } }>(
            `${API_URL}/admin/reports/revenue/${period}`,
            { params: { limit } }
        );
        return response.data.data.revenue;
    },

    // Top vendeurs
    getTopSellers: async (dateRange: DateRangeFilter, limit?: number) => {
        const response = await axios.get<{ data: { topSellers: TopSeller[] } }>(
            `${API_URL}/admin/reports/top-sellers`,
            { params: { ...dateRange, limit } }
        );
        return response.data.data.topSellers;
    },

    // Statistiques de paiement
    getPaymentStats: async (dateRange: DateRangeFilter) => {
        const response = await axios.get<{ data: { stats: PaymentStats[] } }>(
            `${API_URL}/admin/reports/payment-stats`,
            { params: dateRange }
        );
        return response.data.data.stats;
    },

    // Statistiques de remboursement
    getRefundStats: async (dateRange: DateRangeFilter) => {
        const response = await axios.get<{ data: { stats: RefundStats[] } }>(
            `${API_URL}/admin/reports/refund-stats`,
            { params: dateRange }
        );
        return response.data.data.stats;
    },

    // Configuration des paiements
    getPaymentConfig: async (provider: string, key: string) => {
        const response = await axios.get<{ data: { config: any } }>(
            `${API_URL}/admin/payment-config/${provider}/${key}`
        );
        return response.data.data.config;
    },

    updatePaymentConfig: async (provider: string, key: string, value: any) => {
        const response = await axios.put(
            `${API_URL}/admin/payment-config/${provider}/${key}`,
            { value }
        );
        return response.data;
    },

    // Traitement des remboursements
    processRefund: async (data: {
        transaction_id: number;
        reason: string;
        amount?: number;
    }) => {
        const response = await axios.post(
            `${API_URL}/admin/refunds/process`,
            data
        );
        return response.data;
    }
};
