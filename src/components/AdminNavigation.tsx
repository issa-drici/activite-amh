'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/dashboard', label: '🏠 Accueil', icon: '🏠' },
    { href: '/admin/pointage', label: '📱 Pointage', icon: '📱' },
    { href: '/admin/activities', label: '📅 Activités', icon: '📅' },
    { href: '/admin/workers', label: '👥 Animateurs', icon: '👥' },
    { href: '/admin/reports', label: '📊 Rapports', icon: '📊' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo et titre */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">AMH</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">
              Activités AMH Été 2025
            </h1>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.icon}</span>
              </Link>
            ))}
          </div>

          {/* Déconnexion */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50"
            >
              🚪 Déconnexion
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 