import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeftIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function Custom404() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">BizBooks</h1>
          <div className="w-16 h-1 bg-blue-500 mx-auto"></div>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Go Back</span>
          </button>
          
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <HomeIcon className="w-5 h-5" />
            <span>Go to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 