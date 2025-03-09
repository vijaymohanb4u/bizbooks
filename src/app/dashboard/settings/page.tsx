'use client';

import Link from 'next/link';
import {
  Cog6ToothIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

const settingsGroups = [
  {
    title: 'Company Settings',
    icon: BuildingOfficeIcon,
    items: [
      {
        name: 'Company Profile',
        description: 'Update your company information, logo, and business details',
        href: '/dashboard/settings/company'
      },
      {
        name: 'Business Hours',
        description: 'Set your operating hours and business calendar',
        href: '/dashboard/settings/hours'
      },
      {
        name: 'Locations',
        description: 'Manage multiple business locations and addresses',
        href: '/dashboard/settings/locations'
      }
    ]
  },
  {
    title: 'Financial Settings',
    icon: CurrencyDollarIcon,
    items: [
      {
        name: 'Currency Settings',
        description: 'Configure your default currency and exchange rates',
        href: '/dashboard/settings/currency'
      },
      {
        name: 'Tax Configuration',
        description: 'Set up tax rates and tax rules',
        href: '/dashboard/settings/tax'
      },
      {
        name: 'Payment Methods',
        description: 'Manage accepted payment methods and gateways',
        href: '/dashboard/settings/payments'
      }
    ]
  },
  {
    title: 'User Management',
    icon: UserGroupIcon,
    items: [
      {
        name: 'User Accounts',
        description: 'Manage users, roles, and permissions',
        href: '/dashboard/settings/users'
      },
      {
        name: 'Teams',
        description: 'Organize users into teams and departments',
        href: '/dashboard/settings/teams'
      },
      {
        name: 'Access Control',
        description: 'Configure role-based access control',
        href: '/dashboard/settings/access'
      }
    ]
  },
  {
    title: 'Document Settings',
    icon: DocumentTextIcon,
    items: [
      {
        name: 'Invoice Templates',
        description: 'Customize invoice layouts and templates',
        href: '/dashboard/settings/invoice-templates'
      },
      {
        name: 'Document Numbering',
        description: 'Configure document numbering formats',
        href: '/dashboard/settings/numbering'
      },
      {
        name: 'Email Templates',
        description: 'Customize email templates for notifications',
        href: '/dashboard/settings/email-templates'
      }
    ]
  },
  {
    title: 'Security',
    icon: ShieldCheckIcon,
    items: [
      {
        name: 'Security Settings',
        description: 'Configure password policies and 2FA',
        href: '/dashboard/settings/security'
      },
      {
        name: 'Audit Log',
        description: 'View system audit logs and activity history',
        href: '/dashboard/settings/audit'
      },
      {
        name: 'Data Privacy',
        description: 'Manage data retention and privacy settings',
        href: '/dashboard/settings/privacy'
      }
    ]
  },
  {
    title: 'Integrations',
    icon: BanknotesIcon,
    items: [
      {
        name: 'Banking Integration',
        description: 'Connect your bank accounts and configure reconciliation',
        href: '/dashboard/settings/banking'
      },
      {
        name: 'Payment Gateways',
        description: 'Set up payment processing integrations',
        href: '/dashboard/settings/payment-gateways'
      },
      {
        name: 'Third-party Apps',
        description: 'Manage connections with external services',
        href: '/dashboard/settings/integrations'
      }
    ]
  },
  {
    title: 'Backup & Data',
    icon: CloudArrowUpIcon,
    items: [
      {
        name: 'Backup Settings',
        description: 'Configure automated backups and data export',
        href: '/dashboard/settings/backup'
      },
      {
        name: 'Import/Export',
        description: 'Import or export business data',
        href: '/dashboard/settings/import-export'
      },
      {
        name: 'Data Cleanup',
        description: 'Archive or delete old records',
        href: '/dashboard/settings/cleanup'
      }
    ]
  }
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Cog6ToothIcon className="h-8 w-8 text-gray-500" />
          <h1 className="text-2xl font-bold text-gray-900">Settings(WIP)</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {settingsGroups.map((group) => (
          <div key={group.title} className="space-y-4">
            <div className="flex items-center gap-2">
              <group.icon className="h-6 w-6 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">{group.title}</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative group rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-500 hover:shadow-sm transition-all"
                >
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-500">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 