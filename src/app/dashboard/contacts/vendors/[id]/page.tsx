'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PencilIcon } from '@heroicons/react/24/outline';

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
  created_at: string;
  updated_at: string;
}

interface Bill {
  id: number;
  number: string;
  date: string;
  due_date: string;
  amount: number;
  status: string;
}

export default function VendorDetailPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);

  useEffect(() => {
    fetchVendor();
    fetchBills();
  }, []);

  const fetchVendor = async () => {
    try {
      const response = await fetch(`/api/vendors/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch vendor');
      }
      const data = await response.json();
      setVendor(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vendor');
    } finally {
      setLoading(false);
    }
  };

  const fetchBills = async () => {
    try {
      const response = await fetch(`/api/vendors/${params.id}/bills`);
      if (!response.ok) {
        throw new Error('Failed to fetch bills');
      }
      const data = await response.json();
      setBills(data);
    } catch (err) {
      console.error('Failed to load bills:', err);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error || !vendor) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        {error || 'Failed to load vendor'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
        <Link
          href={`/dashboard/contacts/vendors/${vendor.id}/edit`}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PencilIcon className="w-5 h-5 mr-2" />
          Edit Vendor
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vendor Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Vendor Information
          </h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{vendor.email || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">{vendor.phone || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {vendor.address || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Tax Number</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {vendor.tax_number || '-'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Vendor Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Billing Summary
          </h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Bills</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">
                {vendor.bill_count}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Paid</dt>
              <dd className="mt-1 text-2xl font-semibold text-green-600">
                ${vendor.total_paid.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Outstanding Amount</dt>
              <dd className="mt-1 text-2xl font-semibold text-red-600">
                ${vendor.total_outstanding.toFixed(2)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Recent Bills */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Recent Bills</h2>
            <Link
              href={`/dashboard/bills/new?vendor_id=${vendor.id}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-900"
            >
              Create Bill
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {bill.number}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(bill.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(bill.due_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ${bill.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${
                          bill.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : bill.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      `}
                    >
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                    <Link
                      href={`/dashboard/bills/${bill.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                    <Link
                      href={`/dashboard/bills/${bill.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {bills.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No bills found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 