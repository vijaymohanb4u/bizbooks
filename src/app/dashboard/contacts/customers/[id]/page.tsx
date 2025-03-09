'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import {
  PencilIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';

interface Invoice {
  id: number;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: string;
  total: number;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  tax_number: string;
  invoice_count: number;
  total_paid: number;
  total_outstanding: number;
  recent_invoices: Invoice[];
}

export default function CustomerDetailPage() {
  const params = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomer();
  }, []);

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer');
      }
      const data = await response.json();
      setCustomer(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customer');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  if (!customer) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 p-4 rounded-lg">
        Customer not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
        <Link
          href={`/dashboard/contacts/customers/${customer.id}/edit`}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PencilIcon className="w-5 h-5 mr-2" />
          Edit Customer
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Customer Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <EnvelopeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-900">Email</div>
                <div className="text-sm text-gray-600">
                  {customer.email || 'Not provided'}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <PhoneIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-900">Phone</div>
                <div className="text-sm text-gray-600">
                  {customer.phone || 'Not provided'}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-900">Address</div>
                <div className="text-sm text-gray-600 whitespace-pre-line">
                  {customer.address || 'Not provided'}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <IdentificationIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-900">Tax Number</div>
                <div className="text-sm text-gray-600">
                  {customer.tax_number || 'Not provided'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Invoice Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-900">
                Total Invoices
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {customer.invoice_count}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-900">Total Paid</div>
              <div className="text-2xl font-bold text-green-600">
                ${customer.total_paid?.toFixed(2) || '0.00'}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg sm:col-span-2">
              <div className="text-sm font-medium text-red-900">Outstanding</div>
              <div className="text-2xl font-bold text-red-600">
                ${customer.total_outstanding?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Recent Invoices</h2>
            <Link
              href={`/dashboard/invoices/new?customer_id=${customer.id}`}
              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
            >
              Create Invoice
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customer.recent_invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    <Link href={`/dashboard/invoices/${invoice.id}`}>
                      {invoice.invoice_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(invoice.issue_date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${invoice.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {customer.recent_invoices.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new invoice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 