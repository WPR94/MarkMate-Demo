import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export function AdminNav() {
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: HomeIcon },
    { path: '/admin/users', label: 'Users', icon: UserGroupIcon },
    { path: '/admin/analytics', label: 'Analytics', icon: ChartBarIcon },
    { path: '/admin/activity', label: 'Activity', icon: ClockIcon },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Admin Section Label */}
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Exit Admin
            </Link>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Admin Portal
            </span>
          </div>

          {/* Nav Links */}
          <nav className="flex gap-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
