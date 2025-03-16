'use client';

import { useState, useEffect } from 'react';
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
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import ErrorBoundary from '@/components/ErrorBoundary';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Auto-collapse sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    if (!isSidebarCollapsed) {
      setExpandedItem(null);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMenuItemClick = (item: typeof menuItems[0]) => {
    if (item.submenu) {
      setExpandedItem(expandedItem === item.name ? null : item.name);
      router.push(item.href);
    }
  };

  const handleLogout = async () => {
    // Check if we're in Electron environment
    const electronEnv = isElectron();
    
    if (electronEnv) {
      try {
        // Clear token in Electron
        await api.logout();
        
        // Redirect to login page
        router.push('/login');
      } catch (error) {
        // Silent error
      }
    } else {
      // Use NextAuth for web browser
      await signOut({ 
        callbackUrl: '/login',
        redirect: true 
      });
    }
  };

  const renderNavItems = () => (
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
              {(!isSidebarCollapsed || isMobileMenuOpen) && (
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
              {(!isSidebarCollapsed || isMobileMenuOpen) && (
                <span className="ml-3">{item.name}</span>
              )}
            </Link>
          )}
          {(!isSidebarCollapsed || isMobileMenuOpen) && item.submenu && expandedItem === item.name && (
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
          {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="ml-3">Logout</span>}
        </button>
      </li>
    </ul>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg bg-white shadow-md text-gray-700"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar - desktop */}
      <aside
        className={`bg-white shadow-lg transition-all duration-300 hidden md:block ${
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
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
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
          {renderNavItems()}
        </nav>
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300 transform md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <span className="text-xl font-bold text-gray-800">BizBooks</span>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label="Close menu"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {renderNavItems()}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
} 