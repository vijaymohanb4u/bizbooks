'use client';

import { LinkComponent } from '@/components/LinkComponent';
import {
  IconBuilding,
  IconUser,
  IconSettings,
  IconWallet,
  IconClock,
  IconBuildingStore,
  IconCurrencyDollar,
  IconTax,
  IconCreditCard,
  IconUsers,
  IconUserCircle,
  IconShield,
  IconFileInvoice,
  IconNumbers,
  IconMail,
  IconBuildingBank,
  IconApps,
  IconCloud,
  IconDownload,
  IconTrash
} from '@tabler/icons-react';

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>
      
      <div className="space-y-8">
        {/* Company Settings */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <IconBuildingStore size={24} className="text-gray-400" />
            Company Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <LinkComponent
              href="/dashboard/settings/company"
              title="Company Profile"
              description="Update your company information, logo, and business details"
              icon={<IconBuildingStore size={24} />}
            />
            <LinkComponent
              href="/dashboard/settings/hours"
              title="Business Hours"
              description="Set your operating hours and business calendar"
              icon={<IconClock size={24} />}
            />
            <LinkComponent
              href="/dashboard/settings/locations"
              title="Locations"
              description="Manage multiple business locations and addresses"
              icon={<IconBuilding size={24} />}
            />
          </div>
        </div>

        {/* Financial Settings */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <IconWallet size={24} className="text-gray-400" />
            Financial Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <LinkComponent
              href="/dashboard/settings/currency"
              title="Currency Settings"
              description="Configure your default currency and exchange rates"
              icon={<IconCurrencyDollar size={24} />}
            />
            <LinkComponent
              href="/dashboard/settings/tax"
              title="Tax Configuration"
              description="Set up tax rates and tax rules"
              icon={<IconTax size={24} />}
            />
            <LinkComponent
              href="/dashboard/settings/payments"
              title="Payment Methods"
              description="Manage accepted payment methods and gateways"
              icon={<IconCreditCard size={24} />}
            />
          </div>
        </div>

        {/* User Management */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <IconUsers size={24} className="text-gray-400" />
            User Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <LinkComponent
              href="/dashboard/settings/users"
              title="User Accounts"
              description="Manage users, roles, and permissions"
              icon={<IconUser size={24} />}
            />
            <LinkComponent
              href="/dashboard/settings/teams"
              title="Teams"
              description="Organize users into teams and departments"
              icon={<IconUserCircle size={24} />}
            />
            <LinkComponent
              href="/dashboard/settings/access"
              title="Access Control"
              description="Configure role-based access control"
              icon={<IconShield size={24} />}
            />
          </div>
        </div>

        {/* Document Settings */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <IconFileInvoice size={24} className="text-gray-400" />
            Document Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <LinkComponent
              href="/dashboard/settings/invoice-templates"
              title="Invoice Templates"
              description="Customize invoice layouts and templates"
              icon={<IconFileInvoice size={24} />}
            />
            <LinkComponent
              href="/dashboard/settings/numbering"
              title="Document Numbering"
              description="Configure document numbering formats"
              icon={<IconNumbers size={24} />}
            />
            <LinkComponent
              href="/dashboard/settings/email-templates"
              title="Email Templates"
              description="Customize email templates for notifications"
              icon={<IconMail size={24} />}
            />
          </div>
        </div>

        {/* Integrations */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <IconApps size={24} className="text-gray-400" />
            Integrations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <LinkComponent
              href="/dashboard/settings/banking"
              title="Banking Integration"
              description="Connect your bank accounts and configure reconciliation"
              icon={<IconBuildingBank size={24} />}
            />
            <LinkComponent
              href="/dashboard/settings/payment-gateways"
              title="Payment Gateways"
              description="Set up payment processing integrations"
              icon={<IconCreditCard size={24} />}
            />
            <LinkComponent
              href="/dashboard/settings/integrations"
              title="Third-party Apps"
              description="Manage connections with external services"
              icon={<IconApps size={24} />}
            />
          </div>
        </div>

        {/* Backup & Data */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <IconCloud size={24} className="text-gray-400" />
            Backup & Data
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <LinkComponent
              href="/dashboard/settings/backup"
              title="Backup Settings"
              description="Configure automated backups and data export"
              icon={<IconCloud size={24} />}
            />
            <LinkComponent
              href="/dashboard/settings/import-export"
              title="Import/Export"
              description="Import or export business data"
              icon={<IconDownload size={24} />}
            />
            <LinkComponent
              href="/dashboard/settings/cleanup"
              title="Data Cleanup"
              description="Archive or delete old records"
              icon={<IconTrash size={24} />}
            />
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <IconSettings size={24} className="text-gray-400" />
            Preferences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <LinkComponent
              href="/dashboard/settings/preferences"
              title="Application Settings"
              description="Customize application settings and defaults"
              icon={<IconSettings size={24} />}
            />
          </div>
        </div>
      </div>
    </div>
  )
}