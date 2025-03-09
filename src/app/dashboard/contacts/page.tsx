'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  PlusIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface ContactStats {
  total_customers: number;
  active_customers: number;
  total_outstanding: number;
  total_vendors: number;
  active_vendors: number;
  total_payable: number;
}

export default function ContactsPage() {
  const [stats, setStats] = useState<ContactStats>({
    total_customers: 0,
    active_customers: 0,
    total_outstanding: 0,
    total_vendors: 0,
    active_vendors: 0,
    total_payable: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/contacts/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching contact stats:', error);
      setError('Failed to load contact statistics');
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customers Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
                <h2 className="ml-3 text-xl font-semibold text-gray-900">
                  Customers
                </h2>
              </div>
              <Link
                href="/dashboard/contacts/customers"
                className="flex items-center text-blue-600 hover:text-blue-900"
              >
                View all
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Customers</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {stats.total_customers}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Customers</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {stats.active_customers}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">
                  Outstanding Amount
                </p>
                <p className="mt-1 text-2xl font-semibold text-red-600">
                  ${typeof stats.total_outstanding === 'number' 
                    ? stats.total_outstanding.toFixed(2) 
                    : Number(stats.total_outstanding).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Manage your customers and their invoices
              </span>
              <Link
                href="/dashboard/contacts/customers/new"
                className="text-sm font-medium text-blue-600 hover:text-blue-900"
              >
                Add Customer
              </Link>
            </div>
          </div>
        </div>

        {/* Vendors Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                <h2 className="ml-3 text-xl font-semibold text-gray-900">
                  Vendors
                </h2>
              </div>
              <Link
                href="/dashboard/contacts/vendors"
                className="flex items-center text-blue-600 hover:text-blue-900"
              >
                View all
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Vendors</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {stats.total_vendors}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Vendors</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {stats.active_vendors}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">
                  Total Payable
                </p>
                <p className="mt-1 text-2xl font-semibold text-red-600">
                  ${typeof stats.total_payable === 'number'
                    ? stats.total_payable.toFixed(2)
                    : Number(stats.total_payable).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Manage your vendors and their bills
              </span>
              <Link
                href="/dashboard/contacts/vendors/new"
                className="text-sm font-medium text-blue-600 hover:text-blue-900"
              >
                Add Vendor
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard/contacts/customers/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            <UserGroupIcon className="h-6 w-6 mr-3" />
            <div>
              <p className="font-medium">New Customer</p>
              <p className="text-sm text-gray-500">Add a new customer</p>
            </div>
          </Link>
          <Link
            href="/dashboard/contacts/vendors/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            <BuildingOfficeIcon className="h-6 w-6 mr-3" />
            <div>
              <p className="font-medium">New Vendor</p>
              <p className="text-sm text-gray-500">Add a new vendor</p>
            </div>
          </Link>
          <Link
            href="/dashboard/invoices/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            <DocumentTextIcon className="h-6 w-6 mr-3" />
            <div>
              <p className="font-medium">New Invoice</p>
              <p className="text-sm text-gray-500">Create a new invoice</p>
            </div>
          </Link>
          <Link
            href="/dashboard/bills/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            <DocumentTextIcon className="h-6 w-6 mr-3" />
            <div>
              <p className="font-medium">New Bill</p>
              <p className="text-sm text-gray-500">Create a new bill</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
} 