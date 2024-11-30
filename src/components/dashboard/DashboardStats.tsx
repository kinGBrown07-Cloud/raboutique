import React from 'react';
import { TrendingUp, Eye, ShoppingCart, DollarSign } from 'lucide-react';

const stats = [
  {
    label: 'Total Views',
    value: '2,847',
    change: '+12.5%',
    icon: Eye,
  },
  {
    label: 'Active Listings',
    value: '24',
    change: '+4.3%',
    icon: TrendingUp,
  },
  {
    label: 'Total Sales',
    value: '186',
    change: '+8.2%',
    icon: ShoppingCart,
  },
  {
    label: 'Revenue',
    value: '$12,847',
    change: '+15.3%',
    icon: DollarSign,
  },
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-semibold mt-1">{stat.value}</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg">
              <stat.icon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-500 text-sm font-medium">
              {stat.change}
            </span>
            <span className="text-gray-600 text-sm ml-2">vs last month</span>
          </div>
        </div>
      ))}
    </div>
  );
}