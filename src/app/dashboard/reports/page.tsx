'use client';

import Link from 'next/link';
import {
  DocumentTextIcon,
  ChartBarIcon,
  ScaleIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

const reports = [
  {
    name: 'Balance Sheet',
    description: 'View your company\'s assets, liabilities, and equity',
    href: '/dashboard/reports/balance-sheet',
    icon: ScaleIcon,
  },
  {
    name: 'Profit & Loss',
    description: 'Track your revenue, expenses, and profit over time',
    href: '/dashboard/reports/profit-loss',
    icon: ChartBarIcon,
  },
  {
    name: 'Cash Flow',
    description: 'Monitor your cash inflows and outflows',
    href: '/dashboard/reports/cash-flow',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'General Ledger',
    description: 'View detailed transaction history and account balances',
    href: '/dashboard/reports/general-ledger',
    icon: DocumentTextIcon,
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {reports.map((report) => (
          <Link
            key={report.name}
            href={report.href}
            className="relative group rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-500 hover:shadow-sm transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <report.icon className="h-8 w-8 text-gray-400 group-hover:text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-500">
                  {report.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{report.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 