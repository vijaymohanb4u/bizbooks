'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BanknotesIcon,
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  DocumentTextIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardMetrics {
  overview: {
    totalRevenue: number;
    monthlyRevenue: number;
    totalExpenses: number;
    monthlyExpenses: number;
    netIncome: number;
    profitMargin: number;
  };
  receivables: {
    total: number;
    overdueCount: number;
  };
  payables: {
    total: number;
    overdueCount: number;
  };
  customers: {
    total: number;
    active: number;
  };
  vendors: {
    total: number;
    active: number;
  };
  monthlyComparison: {
    revenue: number;
    expenses: number;
    profit: number;
  };
  charts: {
    revenueByMonth: Array<{ month: string; amount: number }>;
    expensesByMonth: Array<{ month: string; amount: number }>;
    topCustomers: Array<{ name: string; revenue: number }>;
    receivablesAging: Array<{ period: string; amount: number }>;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      const response = await fetch('/api/dashboard/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError('Error loading dashboard metrics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    // For large numbers, use compact notation
    if (Math.abs(amount) >= 10000) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(amount);
    }
    
    // For smaller numbers, use standard format
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center mb-4">
            <ExclamationCircleIcon className="h-8 w-8 text-red-500 mr-3" />
            <h3 className="text-lg font-semibold text-red-700">Error Loading Dashboard</h3>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardMetrics}
            className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  // Prepare data for the Revenue vs Expenses chart
  const revenueExpensesData = metrics.charts.revenueByMonth.map((item, index) => ({
    month: item.month,
    Revenue: item.amount,
    Expenses: metrics.charts.expensesByMonth[index]?.amount || 0
  }));

  const stats = [
    {
      name: 'Total Revenue',
      value: formatCurrency(metrics.overview.totalRevenue),
      change: formatPercentage(metrics.overview.profitMargin),
      changeType: metrics.overview.profitMargin >= 0 ? 'positive' : 'negative',
      href: '/dashboard/reports/profit-loss',
      icon: BanknotesIcon,
    },
    {
      name: 'Monthly Revenue',
      value: formatCurrency(metrics.monthlyComparison.revenue),
      change: formatCurrency(metrics.monthlyComparison.profit),
      changeLabel: 'Monthly Profit',
      changeType: metrics.monthlyComparison.profit >= 0 ? 'positive' : 'negative',
      href: '/dashboard/reports/profit-loss',
      icon: ChartBarIcon,
    },
    {
      name: 'Accounts Receivable',
      value: formatCurrency(metrics.receivables.total),
      change: `${metrics.receivables.overdueCount} overdue`,
      changeType: metrics.receivables.overdueCount > 0 ? 'negative' : 'positive',
      href: '/dashboard/invoices',
      icon: ArrowTrendingUpIcon,
    },
    {
      name: 'Accounts Payable',
      value: formatCurrency(metrics.payables.total),
      change: `${metrics.payables.overdueCount} overdue`,
      changeType: metrics.payables.overdueCount > 0 ? 'negative' : 'positive',
      href: '/dashboard/bills',
      icon: ArrowTrendingDownIcon,
    },
    {
      name: 'Active Customers',
      value: metrics.customers.active.toString(),
      change: `${metrics.customers.total} total`,
      changeType: 'neutral',
      href: '/dashboard/contacts',
      icon: UsersIcon,
    },
    {
      name: 'Active Vendors',
      value: metrics.vendors.active.toString(),
      change: `${metrics.vendors.total} total`,
      changeType: 'neutral',
      href: '/dashboard/contacts',
      icon: BuildingOfficeIcon,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">Dashboard</h1>
        <button 
          onClick={fetchDashboardMetrics} 
          className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="relative group rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-500 hover:shadow-sm transition-all h-full"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <stat.icon className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
              </div>
              <div className="ml-3 flex-1 min-w-0 overflow-hidden">
                <h3 className="text-sm font-medium text-gray-900 truncate">{stat.name}</h3>
                <p className="text-lg font-semibold text-gray-900 truncate">{stat.value}</p>
                <p
                  className={`text-xs truncate mt-1 ${
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : stat.changeType === 'negative'
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}
                >
                  {stat.changeLabel ? `${stat.changeLabel}: ` : ''}
                  {stat.change}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Revenue vs Expenses</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueExpensesData} margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} tickFormatter={(value) => value.split(' ')[0]} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Revenue" fill="#0088FE" />
                <Bar dataKey="Expenses" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Customers Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Top 5 Customers</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.charts.topCustomers}
                layout="vertical"
                margin={{ left: 100, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value/1000}k`} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={100} 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 12)}...` : value}
                />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Receivables Aging Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Receivables Aging</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.charts.receivablesAging}
                  dataKey="amount"
                  nameKey="period"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ period, percent }) => `${period} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {metrics.charts.receivablesAging.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 20 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
} 