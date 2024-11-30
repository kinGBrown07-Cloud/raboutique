export interface FinancialReport {
    date: string;
    transaction_type: 'subscription' | 'lease' | 'listing_sale';
    payment_method: 'paypal' | 'crypto';
    transaction_count: number;
    total_amount: number;
    total_fees: number;
    total_commission: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
}

export interface RevenueData {
    period: string;
    revenue: number;
    commission: number;
    transaction_count: number;
}

export interface TopSeller {
    seller_id: number;
    username: string;
    transaction_count: number;
    total_sales: number;
    total_commission: number;
}

export interface PaymentStats {
    payment_method: string;
    usage_count: number;
    total_amount: number;
    total_fees: number;
    avg_transaction_amount: number;
}

export interface RefundStats {
    transaction_type: string;
    refund_count: number;
    refunded_amount: number;
    avg_time_to_refund: number;
}

export interface PaymentConfig {
    provider: string;
    config_key: string;
    config_value: string;
    is_active: boolean;
}

export interface DateRangeFilter {
    start_date: string;
    end_date: string;
}
