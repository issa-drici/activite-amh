'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavigation from '@/components/AdminNavigation';

interface AdminData {
  id: number;
  name: string;
  username: string;
}

export default function AdminDashboard() {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'admin est connecté
    if (typeof window !== 'undefined') {
      const userLoggedIn = localStorage.getItem('userLoggedIn');
      const userType = localStorage.getItem('userType');
      const userData = localStorage.getItem('userData');
      
      if (!userLoggedIn || userType !== 'admin' || !userData) {
        router.push('/admin/login');
        return;
      }

      try {
        const adminInfo = JSON.parse(userData);
        setAdminData(adminInfo);
      } catch (_error) {
        console.error('Erreur lors du parsing des données admin:', _error);
        router.push('/admin/login');
        return;
      }
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!adminData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue, {adminData.name} !
          </h1>
          <p className="text-lg text-gray-600">
            Gestion des activités AMH Été 2025
          </p>
        </div>

        {/* Cartes d'action principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pointage */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pointage</h3>
              <p className="text-sm text-gray-600 mb-4">
                Scanner les QR codes des animateurs pour enregistrer leurs présences
              </p>
              <button
                onClick={() => router.push('/admin/pointage')}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                Commencer le pointage
              </button>
            </div>
          </div>

          {/* Activités */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Activités</h3>
              <p className="text-sm text-gray-600 mb-4">
                Créer et organiser les sorties et activités pour les enfants
              </p>
              <button
                onClick={() => router.push('/admin/activities')}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-700 transition-colors"
              >
                Gérer les activités
              </button>
            </div>
          </div>

          {/* Animateurs */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Animateurs</h3>
              <p className="text-sm text-gray-600 mb-4">
                Créer et gérer les comptes des animateurs et leurs QR codes
              </p>
              <button
                onClick={() => router.push('/admin/workers')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Gérer les animateurs
              </button>
            </div>
          </div>

          {/* Rapports */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-orange-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Rapports</h3>
              <p className="text-sm text-gray-600 mb-4">
                Exporter les données de présence et consulter les statistiques
              </p>
              <button
                onClick={() => router.push('/admin/reports')}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-orange-700 transition-colors"
              >
                Voir les rapports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 