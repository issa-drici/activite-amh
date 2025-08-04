'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavigation from '@/components/AdminNavigation';

interface AdminData {
  id: number;
  name: string;
  username: string;
}

interface Activity {
  id: number;
  title: string;
  description?: string;
  location: string;
  date: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  transport_mode: string;
  category: string;
  created_by_name: string;
}

interface Worker {
  id: number;
  name: string;
  username: string;
}

interface AssignedWorker {
  worker_id: number;
  worker_name: string;
  assigned_at: string;
}

export default function AssignWorkersPage({ params }: { params: Promise<{ id: string }> }) {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [assignedWorkers, setAssignedWorkers] = useState<AssignedWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activityId, setActivityId] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setActivityId(resolvedParams.id);
    };
    loadParams();
  }, [params]);

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
    if (adminData && activityId) {
      loadActivity();
      loadWorkers();
      loadAssignedWorkers();
    }
  }, [adminData, activityId]);

  const loadActivity = async () => {
    try {
      const response = await fetch(`/api/activities/${activityId}`);
      const data = await response.json();
      if (data.success) {
        setActivity(data.activity);
      }
    } catch (_error) {
      console.error('Erreur lors du chargement de l\'activité:', _error);
    }
  };

  const loadWorkers = async () => {
    try {
      const response = await fetch('/api/workers');
      const data = await response.json();
      if (data.success) {
        setWorkers(data.workers);
      }
    } catch (_error) {
      console.error('Erreur lors du chargement des animateurs:', _error);
    }
  };

  const loadAssignedWorkers = async () => {
    try {
      const response = await fetch(`/api/activities/${activityId}/assign`);
      const data = await response.json();
      if (data.success) {
        setAssignedWorkers(data.assignedWorkers);
      }
    } catch (_error) {
      console.error('Erreur lors du chargement des animateurs assignés:', _error);
    }
  };

  const assignWorker = async (workerId: number) => {
    try {
      const response = await fetch(`/api/activities/${activityId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('✅ Animateur assigné avec succès !');
        loadAssignedWorkers();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${data.message || 'Erreur lors de l\'attribution'}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch {
      setMessage('❌ Erreur de connexion au serveur');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const unassignWorker = async (workerId: number) => {
    try {
      const response = await fetch(`/api/activities/${activityId}/assign`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('✅ Animateur retiré avec succès !');
        loadAssignedWorkers();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${data.message || 'Erreur lors du retrait'}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch {
      setMessage('❌ Erreur de connexion au serveur');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      return date.toLocaleDateString('fr-FR', {
        timeZone: 'Europe/Paris'
      });
    } catch {
      return 'Date invalide';
    }
  };

  const isWorkerAssigned = (workerId: number) => {
    return assignedWorkers.some(aw => aw.worker_id === workerId);
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

  if (!adminData || !activity) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      
      <div className="p-4 pb-24">
        {/* En-tête */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            👥 Attribuer des Animateurs
          </h1>
          <p className="text-gray-600">
            {activity.title}
          </p>
        </div>

        {message && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-800 text-sm">{message}</p>
          </div>
        )}

        {/* Détails de l'activité */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border-l-4 border-purple-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Détails de l&apos;activité</h2>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>📍 {activity.location}</div>
            <div>📅 {formatDate(activity.date)}</div>
            <div>🕐 {activity.start_time} - {activity.end_time}</div>
            <div>👥 {activity.max_participants} participants</div>
            <div>🚌 {activity.transport_mode}</div>
            <div>👥 {activity.category}</div>
          </div>
          {activity.description && (
            <p className="text-sm text-gray-600 mt-2">{activity.description}</p>
          )}
        </div>

        {/* Animateurs assignés */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Animateurs assignés ({assignedWorkers.length})
          </h2>
          
          {assignedWorkers.length === 0 ? (
            <div className="text-center py-6 bg-white rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">👥</span>
              </div>
              <p className="text-gray-500 font-medium">Aucun animateur assigné</p>
              <p className="text-gray-400 text-sm mt-1">Assignez des animateurs ci-dessous</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignedWorkers.map((assignedWorker) => (
                <div
                  key={assignedWorker.worker_id}
                  className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-green-500"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">{assignedWorker.worker_name}</h3>
                      <p className="text-xs text-gray-500">
                        Assigné le {formatDate(assignedWorker.assigned_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => unassignWorker(assignedWorker.worker_id)}
                      className="bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      ❌ Retirer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Liste des animateurs disponibles */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Animateurs disponibles
          </h2>
          
          <div className="space-y-3">
            {workers.length === 0 ? (
              <div className="text-center py-6 bg-white rounded-2xl shadow-sm">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">👥</span>
                </div>
                <p className="text-gray-500 font-medium">Aucun animateur disponible</p>
                <p className="text-gray-400 text-sm mt-1">Créez des animateurs d&apos;abord</p>
              </div>
            ) : (
              workers.map((worker) => (
                <div
                  key={worker.id}
                  className={`bg-white rounded-2xl shadow-sm p-4 border-l-4 ${
                    isWorkerAssigned(worker.id) ? 'border-gray-300 opacity-50' : 'border-blue-500'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">{worker.name}</h3>
                      <p className="text-sm text-gray-600">@{worker.username}</p>
                    </div>
                    {isWorkerAssigned(worker.id) ? (
                      <span className="text-green-600 text-sm font-medium">✅ Assigné</span>
                    ) : (
                      <button
                        onClick={() => assignWorker(worker.id)}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        ➕ Assigner
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 