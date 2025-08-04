'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    router.push('/');
  };

  const navItems = [
    { href: '/admin/dashboard', label: 'Accueil', icon: '🏠' },
    { href: '/admin/pointage', label: 'Pointage', icon: '📱' },
    { href: '/admin/activities', label: 'Activités', icon: '📅' },
    { href: '/admin/workers', label: 'Animateurs', icon: '👥' },
  ];

  return (
    <>
      {/* Header simple */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">AMH</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">
              AMH Été 2025
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            🚪 Se déconnecter
          </button>
        </div>
      </div>

      {/* Navigation mobile - Barre du bas */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-3 px-2 flex-1 transition-colors ${
                pathname === item.href
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Espace en bas pour éviter que le contenu soit caché par la navigation */}
      <div className="h-20"></div>
    </>
  );
} 