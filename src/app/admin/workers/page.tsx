'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminNavigation from '@/components/AdminNavigation';

interface AdminData {
  id: number;
  name: string;
  username: string;
}

interface Worker {
  id: number;
  name: string;
  username: string;
  qr_code: string;
  created_at: string;
}

export default function WorkersPage() {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [newWorker, setNewWorker] = useState({
    name: '',
    username: '',
    password: ''
  });
  const router = useRouter();

  const loadWorkers = useCallback(async () => {
    try {
      const response = await fetch('/api/workers');
      const data = await response.json();
      if (data.success) {
        setWorkers(data.workers);
      }
    } catch (_error) {
      console.error('Erreur lors du chargement des animateurs:', _error);
    }
  }, []);

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

  useEffect(() => {
    if (adminData) {
      loadWorkers();
    }
  }, [adminData, loadWorkers]);

  const createWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorker.name.trim() || !newWorker.username.trim() || !newWorker.password.trim()) {
      setMessage('❌ Tous les champs sont requis');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newWorker.name,
          username: newWorker.username,
          password: newWorker.password
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewWorker({
          name: '',
          username: '',
          password: ''
        });
        setMessage('✅ Animateur créé avec succès !');
        loadWorkers();
        setShowCreateForm(false);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${data.message || 'Erreur lors de la création'}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch {
      setMessage('❌ Erreur de connexion au serveur');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      timeZone: 'Europe/Paris'
    });
  };

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
      
      <div className="p-4 pb-24">
        {/* En-tête */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            👥 Animateurs
          </h1>
          <p className="text-gray-600">
            Créer et gérer les comptes
          </p>
        </div>

        {message && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-800 text-sm">{message}</p>
          </div>
        )}

        {/* Bouton créer animateur */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors text-lg"
          >
            {showCreateForm ? '❌ Annuler' : '➕ Créer un animateur'}
          </button>
        </div>

        {/* Formulaire de création */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Nouvel Animateur</h2>
            
            <form onSubmit={createWorker} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  placeholder="Nom de l&apos;animateur"
                  value={newWorker.name}
                  onChange={(e) => setNewWorker({...newWorker, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom d&apos;utilisateur *
                </label>
                <input
                  type="text"
                  placeholder="Nom d&apos;utilisateur"
                  value={newWorker.username}
                  onChange={(e) => setNewWorker({...newWorker, username: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={newWorker.password}
                  onChange={(e) => setNewWorker({...newWorker, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 px-4 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '⏳ Création...' : '✅ Créer l\'animateur'}
              </button>
            </form>
          </div>
        )}

        {/* Liste des animateurs */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Liste des Animateurs</h2>
          
          {workers.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <p className="text-gray-500 font-medium">Aucun animateur créé</p>
              <p className="text-gray-400 text-sm mt-1">Créez votre premier animateur !</p>
            </div>
          ) : (
            workers.map((worker) => (
              <div
                key={worker.id}
                className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-blue-500"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{worker.name}</h3>
                    <p className="text-sm text-gray-600">@{worker.username}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Créé le {formatDate(worker.created_at)}
                    </p>
                  </div>
                  <Link
                    href={`/admin/workers/${worker.id}`}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    📱 QR Code
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 