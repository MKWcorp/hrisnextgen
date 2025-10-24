'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: '🏠',
  },
  {
    name: 'Create Goal',
    href: '/dashboard/goals/create',
    icon: '➕',
  },
  {
    name: 'All Goals',
    href: '/dashboard/goals',
    icon: '📋',
  },
  {
    name: 'KPI Approval',
    href: '/dashboard/kpis',
    icon: '✅',
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: '📊',
  },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HR</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                HRIS Next Gen
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Info (Optional) */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">Manager</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">AU</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
