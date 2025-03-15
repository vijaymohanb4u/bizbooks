'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { isElectron } from '@/lib/environment';
import { api } from '@/lib/api';
import {
  HomeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const menuItems = [
  { name: 'Dashboard', icon: HomeIcon, href: '/dashboard' },
  {
    name: 'Transactions',
    icon: CurrencyDollarIcon,
    href: '/dashboard/transactions',
    submenu: [
      {
        name: 'All Transactions',
        href: '/dashboard/transactions',
      },
      {
        name: 'Income',
        href: '/dashboard/transactions/income',
      },
      {
        name: 'Expenses',
        href: '/dashboard/transactions/expenses',
      },
      {
        name: 'Categories',
        href: '/dashboard/transactions/categories',
      },
    ],
  },
  {
    name: 'Invoices',
    icon: DocumentTextIcon,
    href: '/dashboard/invoices',
    submenu: [
      { name: 'Create Invoice', href: '/dashboard/invoices/new' },
      { name: 'Manage Invoices', href: '/dashboard/invoices/manage' },
    ],
  },
  {
    name: 'Contacts',
    icon: UserGroupIcon,
    href: '/dashboard/contacts',
    submenu: [
      { name: 'Customers', href: '/dashboard/contacts/customers' },
      { name: 'Vendors', href: '/dashboard/contacts/vendors' },
    ],
  },
  {
    name: 'Reports',
    icon: ChartBarIcon,
    href: '/dashboard/reports',
    submenu: [
      { name: 'Balance Sheet', href: '/dashboard/reports/balance-sheet' },
      { name: 'Profit & Loss', href: '/dashboard/reports/profit-loss' },
    ],
  },
  { name: 'Settings', icon: Cog6ToothIcon, href: '/dashboard/settings' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    if (!isSidebarCollapsed) {
      setExpandedItem(null);
    }
  };

  const handleMenuItemClick = (item: typeof menuItems[0]) => {
    if (item.submenu) {
      setExpandedItem(expandedItem === item.name ? null : item.name);
      router.push(item.href);
    }
  };

  const handleLogout = async () => {
    console.log('[DASHBOARD] Handling logout');
    
    // Check if we're in Electron environment
    const electronEnv = isElectron();
    console.log(`[DASHBOARD] Running in Electron: ${electronEnv}`);
    
    if (electronEnv) {
      console.log('[DASHBOARD] Using Electron logout');
      try {
        // Clear token in Electron
        await api.logout();
        console.log('[DASHBOARD] Electron logout successful');
        
        // Redirect to login page
        router.push('/login');
      } catch (error) {
        console.error('[DASHBOARD] Error during Electron logout:', error);
      }
    } else {
      console.log('[DASHBOARD] Using NextAuth logout');
      // Use NextAuth for web browser
      await signOut({ 
        callbackUrl: '/login',
        redirect: true 
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-white shadow-lg transition-all duration-300 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {!isSidebarCollapsed && (
            <span className="text-xl font-bold text-gray-800">BizBooks</span>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isSidebarCollapsed ? (
              <ChevronRightIcon className="w-5 h-5" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                {item.submenu ? (
                  <button
                    onClick={() => handleMenuItemClick(item)}
                    className={`flex items-center w-full p-2 rounded-lg transition-colors ${
                      pathname.startsWith(item.href)
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-900 hover:bg-gray-50 hover:text-blue-600 font-medium'
                    }`}
                  >
                    <item.icon className={`w-6 h-6 ${
                      pathname.startsWith(item.href) ? 'text-blue-700' : 'text-gray-500'
                    }`} />
                    {!isSidebarCollapsed && (
                      <span className="ml-3">{item.name}</span>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center p-2 rounded-lg transition-colors ${
                      pathname === item.href
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-900 hover:bg-gray-50 hover:text-blue-600 font-medium'
                    }`}
                  >
                    <item.icon className={`w-6 h-6 ${
                      pathname === item.href ? 'text-blue-700' : 'text-gray-500'
                    }`} />
                    {!isSidebarCollapsed && (
                      <span className="ml-3">{item.name}</span>
                    )}
                  </Link>
                )}
                {!isSidebarCollapsed && item.submenu && expandedItem === item.name && (
                  <ul className="mt-2 ml-8 space-y-2">
                    {item.submenu.map((subitem) => (
                      <li key={subitem.name}>
                        <Link
                          href={subitem.href}
                          className={`block p-2 rounded-lg transition-colors ${
                            pathname === subitem.href
                              ? 'text-blue-700 font-semibold'
                              : 'text-gray-800 hover:text-blue-600 font-medium'
                          }`}
                        >
                          {subitem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center w-full p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                {!isSidebarCollapsed && <span className="ml-3">Logout</span>}
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
} 