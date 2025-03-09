'use client';

import CategoryForm from '@/components/transactions/CategoryForm';

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Category</h1>
      <CategoryForm categoryId={params.id} />
    </div>
  );
} 