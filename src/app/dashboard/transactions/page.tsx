'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: number;
  category_name: string;
  payment_method: string;
  reference_number: string;
}

interface Filters {
  startDate: string;
  endDate: string;
  type: 'all' | 'income' | 'expense';
  categoryId: string;
  search: string;
}

interface Sort {
  field: 'date' | 'amount' | 'type';
  direction: 'asc' | 'desc';
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: number; name: string; type: string }>>([]);
  
  // Filters state
  const [filters, setFilters] = useState<Filters>({
    startDate: '',
    endDate: '',
    type: 'all',
    categoryId: '',
    search: '',
  });

  // Sorting state
  const [sort, setSort] = useState<Sort>({
    field: 'date',
    direction: 'desc',
  });

  // Summary state
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [transactions, filters, sort]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/transactions/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const { data } = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      setTransactions(data);
      setFilteredTransactions(data);
      calculateSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data: Transaction[]) => {
    const summary = data.reduce(
      (acc, transaction) => {
        const amount = Number(transaction.amount);
        if (transaction.type === 'income') {
          acc.totalIncome += amount;
        } else {
          acc.totalExpenses += amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0 }
    );

    setSummary({
      totalIncome: Number(summary.totalIncome),
      totalExpenses: Number(summary.totalExpenses),
      balance: Number(summary.totalIncome - summary.totalExpenses),
    });
  };

  const applyFiltersAndSort = () => {
    let filtered = [...transactions];

    // Apply date filters
    if (filters.startDate) {
      filtered = filtered.filter(t => t.date >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(t => t.date <= filters.endDate);
    }

    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Apply category filter
    if (filters.categoryId) {
      filtered = filtered.filter(t => t.category_id === parseInt(filters.categoryId));
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchLower) ||
        t.category_name.toLowerCase().includes(searchLower) ||
        t.payment_method?.toLowerCase().includes(searchLower) ||
        t.reference_number?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sort.field === 'date') {
        return sort.direction === 'asc'
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date);
      }
      if (sort.field === 'amount') {
        return sort.direction === 'asc'
          ? a.amount - b.amount
          : b.amount - a.amount;
      }
      if (sort.field === 'type') {
        return sort.direction === 'asc'
          ? a.type.localeCompare(b.type)
          : b.type.localeCompare(a.type);
      }
      return 0;
    });

    setFilteredTransactions(filtered);
    calculateSummary(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      setTransactions(transactions.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
    }
  };

  const handleSort = (field: Sort['field']) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <Link
          href="/dashboard/transactions/new"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Transaction
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">
            ${summary.totalIncome.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            ${summary.totalExpenses.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Balance</h3>
          <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${Math.abs(summary.balance).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              aria-label={showFilters ? "Hide filters" : "Show filters"}
              title={showFilters ? "Hide filters" : "Show filters"}
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filters
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 placeholder:text-gray-500"
                aria-label="Search transactions"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" aria-hidden="true" />
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                id="typeFilter"
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as 'all' | 'income' | 'expense' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
              >
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="categoryFilter"
                value={filters.categoryId}
                onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    aria-label={`Sort by date ${sort.field === 'date' ? `(${sort.direction})` : ''}`}
                  >
                    Date
                    {sort.field === 'date' && (
                      sort.direction === 'asc' ? <ArrowUpIcon className="w-4 h-4 ml-1" aria-hidden="true" /> : <ArrowDownIcon className="w-4 h-4 ml-1" aria-hidden="true" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('amount')}
                    className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    aria-label={`Sort by amount ${sort.field === 'amount' ? `(${sort.direction})` : ''}`}
                  >
                    Amount
                    {sort.field === 'amount' && (
                      sort.direction === 'asc' ? <ArrowUpIcon className="w-4 h-4 ml-1" aria-hidden="true" /> : <ArrowDownIcon className="w-4 h-4 ml-1" aria-hidden="true" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('type')}
                    className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    aria-label={`Sort by type ${sort.field === 'type' ? `(${sort.direction})` : ''}`}
                  >
                    Type
                    {sort.field === 'type' && (
                      sort.direction === 'asc' ? <ArrowUpIcon className="w-4 h-4 ml-1" aria-hidden="true" /> : <ArrowDownIcon className="w-4 h-4 ml-1" aria-hidden="true" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {transaction.category_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        transaction.type === 'income'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/dashboard/transactions/${transaction.id}/edit`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-900"
                        aria-label={`Delete transaction: ${transaction.description}`}
                      >
                        <TrashIcon className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 