'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CategoryFormProps {
  categoryId?: string;
}

interface CategoryData {
  name: string;
  type: 'income' | 'expense';
  description?: string;
  color?: string;
}

export default function CategoryForm({ categoryId }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryData>({
    name: '',
    type: 'expense',
    description: '',
    color: '#000000'
  });

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/transactions/categories/${categoryId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch category');
      }
      const data = await response.json();
      setFormData({
        name: data.name,
        type: data.type,
        description: data.description || '',
        color: data.color || '#000000'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch category');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = categoryId
        ? `/api/transactions/categories/${categoryId}`
        : '/api/transactions/categories';
      
      const response = await fetch(url, {
        method: categoryId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save category');
      }

      router.push('/dashboard/transactions/categories');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-2">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 text-base text-gray-900"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="type" className="block text-sm font-medium text-gray-800 mb-2">
          Type
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 text-base text-gray-900"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-medium text-gray-800 mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 text-base text-gray-900"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="color" className="block text-sm font-medium text-gray-800 mb-2">
          Color
        </label>
        <div className="mt-1 flex items-center gap-4">
          <input
            type="color"
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="h-12 w-12 rounded border border-gray-300 cursor-pointer p-0"
          />
          <input
            type="text"
            value={formData.color}
            onChange={handleChange}
            name="color"
            title="Color hex value"
            placeholder="#000000"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 text-base text-gray-900"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6">
        <button
          type="button"
          onClick={() => router.push('/dashboard/transactions/categories')}
          className="px-5 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : categoryId ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
} 