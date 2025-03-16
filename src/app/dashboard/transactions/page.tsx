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
      console.log('Fetching categories...');
      const response = await fetch('/api/transactions/categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-electron-app': 'true'
        },
        // Add cache: 'no-store' to prevent caching issues
        cache: 'no-store'
      });
      
      console.log('Categories response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Categories data received:', data);
      setCategories(data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Set empty categories array to prevent UI issues
      setCategories([]);
    }
  };

  const fetchTransactions = async () => {
    try {
      console.log('Fetching transactions...');
      const response = await fetch('/api/transactions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-electron-app': 'true'
        },
        // Add cache: 'no-store' to prevent caching issues
        cache: 'no-store'
      });
      
      console.log('Transactions response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Transactions data received:', data);
      
      // Ensure data is an array
      const transactionsArray = Array.isArray(data) ? data : [];
      setTransactions(transactionsArray);
      setFilteredTransactions(transactionsArray);
      
      // Calculate summary with proper number conversion
      const income = transactionsArray
        .filter((t: Transaction) => t.type === 'income')
        .reduce((sum: number, t: Transaction) => sum + (Number(t.amount) || 0), 0);
      
      const expenses = transactionsArray
        .filter((t: Transaction) => t.type === 'expense')
        .reduce((sum: number, t: Transaction) => sum + (Number(t.amount) || 0), 0);
      
      setSummary({
        totalIncome: income,
        totalExpenses: expenses,
        balance: income - expenses,
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
      setLoading(false);
      // Set empty arrays to prevent UI issues
      setTransactions([]);
      setFilteredTransactions([]);
      // Reset summary to prevent NaN issues
      setSummary({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0
      });
    }
  };

  const calculateSummary = (data: Transaction[]) => {
    if (!Array.isArray(data)) {
      setSummary({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0
      });
      return;
    }

    const summary = data.reduce(
      (acc, transaction) => {
        const amount = Number(transaction.amount) || 0;
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
      totalIncome: summary.totalIncome,
      totalExpenses: summary.totalExpenses,
      balance: summary.totalIncome - summary.totalExpenses,
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
        headers: {
          'Content-Type': 'application/json',
          'x-electron-app': 'true'
        }
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
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Error loading transactions</span>
        </div>
        <p>{error}</p>
        <button 
          onClick={fetchTransactions}
          className="mt-3 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-md transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Transactions</h1>
        <Link
          href="/dashboard/transactions/new"
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
          Add Transaction
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">Total Income</h3>
          <p className="text-lg sm:text-2xl font-bold text-green-600">
            ${typeof summary.totalIncome === 'number' ? summary.totalIncome.toFixed(2) : '0.00'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">Total Expenses</h3>
          <p className="text-lg sm:text-2xl font-bold text-red-600">
            ${typeof summary.totalExpenses === 'number' ? summary.totalExpenses.toFixed(2) : '0.00'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">Balance</h3>
          <p className={`text-lg sm:text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${typeof summary.balance === 'number' ? Math.abs(summary.balance).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              aria-label={showFilters ? "Hide filters" : "Show filters"}
              title={showFilters ? "Hide filters" : "Show filters"}
            >
              <FunnelIcon className="w-4 h-4 mr-1.5" />
              Filters
            </button>
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full sm:w-64 pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 placeholder:text-gray-500 text-sm"
                aria-label="Search transactions"
              />
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" aria-hidden="true" />
            </div>
          </div>
          <button
            onClick={fetchTransactions}
            className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label htmlFor="startDate" className="block text-xs font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 text-sm"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-xs font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 text-sm"
              />
            </div>
            <div>
              <label htmlFor="typeFilter" className="block text-xs font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                id="typeFilter"
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as 'all' | 'income' | 'expense' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 text-sm"
              >
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label htmlFor="categoryFilter" className="block text-xs font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="categoryFilter"
                value={filters.categoryId}
                onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 text-sm"
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
                <th className="px-4 sm:px-6 py-3 text-left">
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
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 sm:px-6 py-3 text-left">
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
                <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left">
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
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                    <div className="sm:hidden inline-block mr-2">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          transaction.type === 'income'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </div>
                    <div className="line-clamp-2 sm:line-clamp-1">
                      {transaction.description}
                    </div>
                    <div className="sm:hidden text-xs text-gray-500 mt-1">
                      {transaction.category_name}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                    {transaction.category_name}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
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
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/dashboard/transactions/${transaction.id}/edit`}
                        className="text-primary-600 hover:text-primary-900"
                        aria-label={`Edit transaction: ${transaction.description}`}
                      >
                        <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-900"
                        aria-label={`Delete transaction: ${transaction.description}`}
                      >
                        <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 sm:px-6 py-4 text-center text-xs sm:text-sm text-gray-500">
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