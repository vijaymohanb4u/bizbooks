'use client';

import CategoryForm from '@/components/transactions/CategoryForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { use } from 'react';

interface EditCategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  // Use React.use to unwrap the Promise in client components
  const { id } = use(params);
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/dashboard/transactions/categories"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Categories
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Category</h1>
          <CategoryForm categoryId={id} />
        </div>
      </div>
    </div>
  );
} 