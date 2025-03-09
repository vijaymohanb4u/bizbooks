'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface IncomeStatement {
  revenue: {
    sales: number;
    otherIncome: number;
    totalRevenue: number;
  };
  expenses: {
    costOfGoodsSold: number;
    operatingExpenses: {
      purchases: number;
      salaries: number;
      utilities: number;
      rent: number;
      other: number;
    };
    totalOperatingExpenses: number;
    totalExpenses: number;
  };
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
}

export default function IncomeStatementPage() {
  const [dateRange, setDateRange] = useState({
    start: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement | null>(null);

  useEffect(() => {
    fetchIncomeStatement();
  }, [dateRange]);

  const fetchIncomeStatement = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/income-statement?start_date=${dateRange.start}&end_date=${dateRange.end}`
      );
      if (!response.ok) throw new Error('Failed to fetch income statement data');
      const data = await response.json();
      setIncomeStatement(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load income statement');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/reports"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Reports
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Income Statement</h1>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="start_date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="end_date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {incomeStatement && (
        <div className="grid grid-cols-1 gap-6">
          {/* Revenue Section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Revenue</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="pl-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sales Revenue</span>
                    <span className="text-gray-900">
                      {formatCurrency(incomeStatement.revenue.sales)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Other Income</span>
                    <span className="text-gray-900">
                      {formatCurrency(incomeStatement.revenue.otherIncome)}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-semibold">
                  <span className="text-gray-900">Total Revenue</span>
                  <span className="text-gray-900">
                    {formatCurrency(incomeStatement.revenue.totalRevenue)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cost of Goods Sold */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Cost of Goods Sold</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cost of Goods Sold</span>
                  <span className="text-gray-900">
                    {formatCurrency(incomeStatement.expenses.costOfGoodsSold)}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-semibold">
                  <span className="text-gray-900">Gross Profit</span>
                  <span className={`text-gray-900 ${
                    incomeStatement.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(incomeStatement.grossProfit)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Operating Expenses */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Operating Expenses</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="pl-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Purchases</span>
                    <span className="text-gray-900">
                      {formatCurrency(incomeStatement.expenses.operatingExpenses.purchases)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Salaries</span>
                    <span className="text-gray-900">
                      {formatCurrency(incomeStatement.expenses.operatingExpenses.salaries)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Utilities</span>
                    <span className="text-gray-900">
                      {formatCurrency(incomeStatement.expenses.operatingExpenses.utilities)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rent</span>
                    <span className="text-gray-900">
                      {formatCurrency(incomeStatement.expenses.operatingExpenses.rent)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Other Expenses</span>
                    <span className="text-gray-900">
                      {formatCurrency(incomeStatement.expenses.operatingExpenses.other)}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-semibold">
                  <span className="text-gray-900">Total Operating Expenses</span>
                  <span className="text-gray-900">
                    {formatCurrency(incomeStatement.expenses.totalOperatingExpenses)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Income */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Net Income</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Operating Income</span>
                  <span className={`${
                    incomeStatement.operatingIncome >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(incomeStatement.operatingIncome)}
                  </span>
                </div>
                <div className="pt-2 border-t-2 border-gray-200 flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Net Income</span>
                  <span className={`${
                    incomeStatement.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(incomeStatement.netIncome)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 