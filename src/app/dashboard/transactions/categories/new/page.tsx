'use client';

import CategoryForm from '@/components/transactions/CategoryForm';

export default function NewCategoryPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">New Category</h1>
      <CategoryForm />
    </div>
  );
} 