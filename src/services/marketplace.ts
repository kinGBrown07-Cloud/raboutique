export interface Commission {
  percentage: number;
  minAmount: number;
  maxAmount: number;
}

export interface MarketplaceConfig {
  commissionRates: {
    [key: string]: Commission;
  };
}

const config: MarketplaceConfig = {
  commissionRates: {
    default: {
      percentage: 15,
      minAmount: 1,
      maxAmount: 10000,
    },
    premium: {
      percentage: 10,
      minAmount: 1,
      maxAmount: 5000,
    },
    enterprise: {
      percentage: 8,
      minAmount: 1,
      maxAmount: 3000,
    },
  },
};

export function calculateCommission(price: number, userTier: string = 'default'): number {
  const rate = config.commissionRates[userTier] || config.commissionRates.default;
  const commission = (price * rate.percentage) / 100;
  
  if (commission < rate.minAmount) return rate.minAmount;
  if (commission > rate.maxAmount) return rate.maxAmount;
  
  return commission;
}

export function calculateSellerAmount(price: number, userTier: string = 'default'): number {
  const commission = calculateCommission(price, userTier);
  return price - commission;
}