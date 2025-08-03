'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCodeDisplay from '@/components/QRCodeDisplay';

interface Worker {
  id: number;
  name: string;
  username: string;
  qr_code: string;
}

interface Attendance {
  date: string;
  period: string;
  created_at: string;
}

export default function WorkerDashboard() {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Vérifier si le travailleur est connecté
    if (typeof window !== 'undefined') {
      const userLoggedIn = localStorage.getItem('userLoggedIn');
      const userType = localStorage.getItem('userType');
      const userData = localStorage.getItem('userData');
      
      if (!userLoggedIn || userType !== 'worker' || !userData) {
        router.push('/login');
        return;
      }

      try {
        const workerInfo = JSON.parse(userData);
        setWorker(workerInfo);
        loadWorkerAttendance(workerInfo.id);
      } catch (error) {
        console.error('Erreur lors du parsing des données travailleur:', error);
        router.push('/login');
      }
    }
  }, [router]);

  const loadWorkerAttendance = async (workerId: number) => {
    try {
      const response = await fetch(`/api/workers/${workerId}/attendance`);
      const data = await response.json();
      
      if (data.success) {
        setAttendance(data.attendance);
        setTotalSessions(data.totalSessions);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des présences:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    router.push('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatPeriod = (period: string) => {
    return period === 'morning' ? 'Matin' : 'Après-midi';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!worker) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{worker.name}</h1>
              <p className="text-sm text-gray-600">@{worker.username}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Déconnexion
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Statistiques */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mes Statistiques</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">
                {totalSessions}
              </div>
              <div className="text-sm text-blue-800 font-medium">
                Demi-journées
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">
                {attendance.length}
              </div>
              <div className="text-sm text-green-800 font-medium">
                Présences
              </div>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mon QR Code</h2>
          <div className="flex justify-center">
            <div className="max-w-xs">
              <QRCodeDisplay qrCode={worker.qr_code} workerName={worker.name} />
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-4">
            Présentez ce QR code à l&apos;administrateur pour pointer votre présence
          </p>
        </div>

        {/* Historique des présences */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Historique des Présences</h2>
          {attendance.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Aucune présence enregistrée</p>
              <p className="text-gray-400 text-sm mt-1">Vos présences apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {attendance.map((record, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      record.period === 'morning' ? 'bg-green-500' : 'bg-orange-500'
                    }`}></div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatDate(record.date)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatPeriod(record.period)}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(record.created_at).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <Link
            href="/"
            className="flex items-center justify-center w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
} 