'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QRScanner from '@/components/QRScanner';

interface Worker {
  id: number;
  name: string;
  username: string;
  qr_code: string;
  created_at: string;
}

interface Attendance {
  name: string;
  period: string;
  created_at: string;
  admin_name: string;
}

interface AdminData {
  id: number;
  name: string;
  username: string;
}

export default function AdminDashboard() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerUsername, setNewWorkerUsername] = useState('');
  const [newWorkerPassword, setNewWorkerPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'morning' | 'afternoon'>('morning');
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const router = useRouter();

  const loadWorkers = useCallback(async () => {
    try {
      const response = await fetch('/api/workers');
      const data = await response.json();
      if (data.success) {
        setWorkers(data.workers);
      }
    } catch (_error) {
      console.error('Erreur lors du chargement des travailleurs:', _error);
    }
  }, []);

  const loadAttendance = useCallback(async () => {
    try {
      const response = await fetch(`/api/attendance?date=${selectedDate}`);
      const data = await response.json();
      if (data.success) {
        setAttendance(data.attendance);
      }
    } catch (_error) {
      console.error('Erreur lors du chargement des présences:', _error);
    }
  }, [selectedDate]);

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
    }

    loadWorkers();
    loadAttendance();
  }, [router, loadWorkers, loadAttendance]);



  const createWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName.trim() || !newWorkerUsername.trim() || !newWorkerPassword.trim()) {
      setMessage('Tous les champs sont requis');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newWorkerName,
          username: newWorkerUsername,
          password: newWorkerPassword
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewWorkerName('');
        setNewWorkerUsername('');
        setNewWorkerPassword('');
        setMessage('Travailleur créé avec succès !');
        loadWorkers();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.message || 'Erreur lors de la création');
      }
    } catch {
      setMessage('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async (qrCode: string) => {
    if (!adminData) {
      setMessage('Erreur: données admin non disponibles');
      return;
    }

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCode,
          date: selectedDate,
          period: selectedPeriod,
          adminId: adminData.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage(`Présence enregistrée : ${data.worker} (${data.period})`);
        loadAttendance();
        setShowScanner(false);
      } else {
        setMessage(data.message || 'Erreur lors de l&apos;enregistrement');
      }
    } catch {
      setMessage('Erreur de connexion au serveur');
    }
  };

  const logout = () => {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    router.push('/admin/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
                      <div className="flex items-center">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                </svg>
              </div>
                          <div>
              <h1 className="text-lg font-semibold text-gray-900">Activités AMH Été 2025</h1>
              <p className="text-sm text-gray-600">{adminData?.name || 'Admin'} - Pointage</p>
            </div>
            </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Accueil
            </Link>
            <button
              onClick={logout}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {message && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-800 text-sm">{message}</p>
          </div>
        )}

        {/* Section Pointage - FONCTIONNALITÉ PRINCIPALE */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
                        <h2 className="text-xl font-bold text-gray-900">Scanner Présence</h2>
          <p className="text-sm text-gray-600">Pointage des animateurs</p>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date du pointage
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setSelectedPeriod('morning');
                  setShowScanner(true);
                }}
                className="py-4 px-6 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors text-lg"
              >
                📱 Scanner - Matin
              </button>
              <button
                onClick={() => {
                  setSelectedPeriod('afternoon');
                  setShowScanner(true);
                }}
                className="py-4 px-6 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors text-lg"
              >
                📱 Scanner - Après-midi
              </button>
            </div>
          </div>

          {showScanner && (
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Scanner QR Code - {selectedPeriod === 'morning' ? 'Matin' : 'Après-midi'}
                </h3>
                <p className="text-blue-800 text-sm">
                  Présentez le QR code de l&apos;animateur devant la caméra
                </p>
              </div>
              <QRScanner
                onScan={handleQRScan}
                onError={(error) => setMessage(`Erreur scanner: ${error}`)}
              />
              <button
                onClick={() => setShowScanner(false)}
                className="mt-3 w-full py-3 px-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
              >
                Annuler le scan
              </button>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">
              Présences du {formatDate(selectedDate)}
            </h3>
            <div className="space-y-2">
              {attendance.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">Aucune présence enregistrée</p>
                  <p className="text-gray-400 text-sm mt-1">Scannez un QR code pour commencer</p>
                </div>
              ) : (
                attendance.map((record, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <span className="font-semibold text-gray-900">{record.name}</span>
                      <p className="text-xs text-gray-500">Pointé par {record.admin_name}</p>
                    </div>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      record.period === 'morning' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {record.period === 'morning' ? 'Matin' : 'Après-midi'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Section Gestion des Animateurs - FONCTIONNALITÉ SECONDAIRE */}
        <details className="bg-white rounded-2xl shadow-sm">
          <summary className="p-6 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Gestion des Animateurs</h2>
                  <p className="text-sm text-gray-600">Créer et gérer les comptes</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </summary>
          
          <div className="px-6 pb-6 space-y-4">
            <form onSubmit={createWorker} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  placeholder="Nom de l&apos;animateur"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  required
                />
              </div>
              
              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom d&apos;utilisateur
                  </label>
                <input
                  type="text"
                  placeholder="Nom d&apos;utilisateur"
                  value={newWorkerUsername}
                  onChange={(e) => setNewWorkerUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={newWorkerPassword}
                  onChange={(e) => setNewWorkerPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Création...' : 'Créer l&apos;animateur'}
              </button>
            </form>

            <div className="border-t pt-4">
              <h3 className="text-md font-semibold mb-3">Liste des Animateurs</h3>
              <div className="space-y-2">
                {workers.map((worker) => (
                  <div
                    key={worker.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <span className="font-medium text-gray-900">{worker.name}</span>
                      <p className="text-sm text-gray-600">@{worker.username}</p>
                    </div>
                    <Link
                      href={`/admin/workers/${worker.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      QR Code
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
} 