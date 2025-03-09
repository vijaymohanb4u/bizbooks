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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
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
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="relative group rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-500 hover:shadow-sm transition-all"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-gray-400 group-hover:text-blue-500" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-base font-medium text-gray-900">{stat.name}</h3>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p
                    className={`ml-2 text-sm ${
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
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Revenue vs Expenses (Last 6 Months)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueExpensesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="Revenue" fill="#0088FE" />
                <Bar dataKey="Expenses" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Customers Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top 5 Customers by Revenue</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.charts.topCustomers}
                layout="vertical"
                margin={{ left: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Receivables Aging Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Receivables Aging</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.charts.receivablesAging}
                  dataKey="amount"
                  nameKey="period"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.period}: ${formatCurrency(entry.amount)}`}
                >
                  {metrics.charts.receivablesAging.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
} 