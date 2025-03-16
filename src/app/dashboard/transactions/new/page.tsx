'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
}

export default function NewTransactionPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      console.log('NewTransaction: Fetching categories...');
      const response = await fetch('/api/transactions/categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-electron-app': 'true'
        },
        cache: 'no-store'
      });
      
      console.log('NewTransaction: Categories response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }
      
      const { data } = await response.json();
      console.log('NewTransaction: Fetched categories:', data);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('NewTransaction: Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load categories');
      setCategories([]); // Set empty array on error
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Filter categories based on selected type
  const filteredCategories = categories.filter((category) => {
    console.log('Filtering category:', category, 'Selected type:', type); // Debug log
    return category.type?.toLowerCase() === type?.toLowerCase();
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      date: formData.get('date'),
      description: formData.get('description'),
      amount: parseFloat(formData.get('amount') as string),
      type: type, // Use the state value directly
      category_id: parseInt(formData.get('category_id') as string),
      payment_method: formData.get('payment_method'),
      reference_number: formData.get('reference_number'),
      notes: formData.get('notes'),
    };

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create transaction');
      }

      router.push('/dashboard/transactions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Transaction</h1>
        <Link
          href="/dashboard/transactions"
          className="text-primary-600 hover:text-primary-900"
        >
          Back to Transactions
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 placeholder:text-gray-500"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                id="type"
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                step="0.01"
                min="0"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 placeholder:text-gray-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category_id"
                name="category_id"
                required
                disabled={isLoadingCategories}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 disabled:text-gray-500"
              >
                <option value="">
                  {isLoadingCategories ? 'Loading categories...' : 'Select a category'}
                </option>
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 placeholder:text-gray-500"
                placeholder="Enter transaction description"
              />
            </div>

            <div>
              <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <input
                type="text"
                id="payment_method"
                name="payment_method"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 placeholder:text-gray-500"
                placeholder="e.g., Cash, Credit Card"
              />
            </div>

            <div>
              <label htmlFor="reference_number" className="block text-sm font-medium text-gray-700 mb-2">
                Reference Number
              </label>
              <input
                type="text"
                id="reference_number"
                name="reference_number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 placeholder:text-gray-500"
                placeholder="e.g., Invoice #, Receipt #"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 placeholder:text-gray-500"
                placeholder="Add any additional notes"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Link
              href="/dashboard/transactions"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || isLoadingCategories}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Transaction'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 