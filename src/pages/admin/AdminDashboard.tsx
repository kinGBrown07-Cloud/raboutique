import React from 'react';
import { Users, ShoppingBag, DollarSign, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const stats = [
  {
    label: 'Total Users',
    value: '1,234',
    change: '+12.5%',
    icon: Users,
  },
  {
    label: 'Active Listings',
    value: '567',
    change: '+23.1%',
    icon: ShoppingBag,
  },
  {
    label: 'Total Revenue',
    value: '$89,432',
    change: '+18.7%',
    icon: DollarSign,
  },
  {
    label: 'Reported Items',
    value: '23',
    change: '-5.2%',
    icon: AlertTriangle,
  },
];

export function AdminDashboard() {
  const user = useAuthStore((state) => state.user);

  if (user?.role !== 'admin') {
    return <div>Access denied</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor and manage your platform</p>
      </div>

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
              <span className={`text-sm font-medium ${
                stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.change}
              </span>
              <span className="text-gray-600 text-sm ml-2">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Users</h2>
          <div className="space-y-4">
            {/* Add user list here */}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Reports</h2>
          <div className="space-y-4">
            {/* Add reports list here */}
          </div>
        </div>
      </div>
    </div>
  );
}