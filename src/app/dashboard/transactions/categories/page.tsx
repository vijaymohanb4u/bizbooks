'use client';

import { useState } from 'react';
import Link from 'next/link';
import CategoryList from '@/components/transactions/CategoryList';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function CategoriesPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
        <Link
          href="/dashboard/transactions/categories/new"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
          Add Category
        </Link>
      </div>

      <CategoryList />
    </div>
  );
} 