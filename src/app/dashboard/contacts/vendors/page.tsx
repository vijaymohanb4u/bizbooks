'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  PlusIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface Vendor {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  tax_number: string;
  bill_count: number;
  total_paid: number;
  total_outstanding: number;
}

function VendorList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  useEffect(() => {
    fetchVendors();
  }, [searchTerm]);

  const fetchVendors = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/vendors?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch vendors');
      }
      const data = await response.json();
      setVendors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    router.push(`/dashboard/contacts/vendors?${params.toString()}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
        <Link
          href="/dashboard/contacts/vendors/new"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Vendor
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vendors..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bills
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outstanding
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {vendor.name}
                    </div>
                    <div className="text-sm text-gray-500">{vendor.address}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{vendor.email}</div>
                    <div className="text-sm text-gray-500">{vendor.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {vendor.tax_number || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {vendor.bill_count} bills
                    </div>
                    <div className="text-sm text-green-600">
                      ${vendor.total_paid.toFixed(2)} paid
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-red-600">
                      ${vendor.total_outstanding.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm space-x-3">
                    <Link
                      href={`/dashboard/contacts/vendors/${vendor.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                    <Link
                      href={`/dashboard/contacts/vendors/${vendor.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {vendors.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No vendors found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VendorsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VendorList />
    </Suspense>
  );
} 