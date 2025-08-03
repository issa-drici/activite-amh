'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCodeDisplay from '@/components/QRCodeDisplay';

interface Worker {
  id: number;
  name: string;
  qr_code: string;
  created_at: string;
}

interface Attendance {
  date: string;
  period: string;
  created_at: string;
}

export default async function WorkerDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  return <WorkerDetailClient workerId={resolvedParams.id} />;
}

function WorkerDetailClient({ workerId }: { workerId: string }) {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadWorkerData = useCallback(async () => {
    try {
      const response = await fetch(`/api/workers/${workerId}/attendance`);
      const data = await response.json();
      
      if (data.success) {
        setWorker(data.worker);
        setAttendance(data.attendance);
        setTotalSessions(data.totalSessions);
      } else {
        console.error('Erreur lors du chargement des données:', data.message);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  }, [workerId]);

  useEffect(() => {
    // Vérifier si l'admin est connecté
    if (typeof window !== 'undefined' && !localStorage.getItem('adminLoggedIn')) {
      router.push('/admin/login');
      return;
    }

    loadWorkerData();
  }, [router, loadWorkerData]);

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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Animateur non trouvé
        </h2>
        <Link
          href="/admin/dashboard"
          className="text-blue-600 hover:text-blue-800"
        >
          Retour au dashboard
        </Link>
      </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/admin/dashboard"
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                ← Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                {worker.name}
              </h1>
            </div>
            <div className="flex items-center">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900"
              >
                Accueil
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* QR Code */}
          <div>
            <h2 className="text-lg font-semibold mb-4">QR Code Personnel</h2>
            <QRCodeDisplay qrCode={worker.qr_code} workerName={worker.name} />
          </div>

          {/* Statistiques et Présences */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Statistiques</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {totalSessions}
                  </div>
                  <div className="text-sm text-blue-800">
                    Demi-journées totales
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {attendance.length}
                  </div>
                  <div className="text-sm text-green-800">
                    Présences enregistrées
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Historique des Présences</h2>
              {attendance.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Aucune présence enregistrée
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {attendance.map((record, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                    >
                      <div>
                        <span className="font-medium">
                          {formatDate(record.date)}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          {formatPeriod(record.period)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(record.created_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 