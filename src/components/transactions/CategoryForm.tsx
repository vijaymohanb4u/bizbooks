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
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {categoryId ? 'Edit Category' : 'Add Category'}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700">
            Color
          </label>
          <div className="mt-1 flex items-center">
            <input
              type="color"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="h-8 w-8 rounded-full border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={formData.color}
              onChange={handleChange}
              name="color"
              title="Color hex value"
              className="ml-2 block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {loading ? 'Saving...' : categoryId ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
} 