'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

interface CategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const router = useRouter();
  // Use React.use to unwrap the Promise in client components
  const { id } = use(params);

  useEffect(() => {
    router.replace(`/dashboard/transactions/categories/${id}/edit`);
  }, [id, router]);

  return (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );
} 