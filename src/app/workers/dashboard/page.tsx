'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface WorkerData {
  id: number;
  name: string;
  username: string;
  qr_code: string;
}

interface AssignedActivity {
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
  assigned_at: string;
}

interface Attendance {
  date: string;
  period: string;
  created_at: string;
}

export default function WorkerDashboard() {
  const [workerData, setWorkerData] = useState<WorkerData | null>(null);
  const [assignedActivities, setAssignedActivities] = useState<AssignedActivity[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadAssignedActivities = useCallback(async () => {
    if (!workerData) return;
    
    try {
      const response = await fetch(`/api/workers/${workerData.id}/activities`);
      const data = await response.json();
      if (data.success) {
        setAssignedActivities(data.activities);
      }
    } catch (_error) {
      console.error('Erreur lors du chargement des activités:', _error);
    }
  }, [workerData]);

  const loadAttendance = useCallback(async () => {
    if (!workerData) return;
    
    try {
      const response = await fetch(`/api/workers/${workerData.id}/attendance`);
      const data = await response.json();
      if (data.success) {
        setAttendance(data.attendance);
        setTotalSessions(data.totalSessions);
      }
    } catch (_error) {
      console.error('Erreur lors du chargement des présences:', _error);
    }
  }, [workerData]);

  useEffect(() => {
    // Vérifier si l'animateur est connecté
    if (typeof window !== 'undefined') {
      const userLoggedIn = localStorage.getItem('userLoggedIn');
      const userType = localStorage.getItem('userType');
      const userData = localStorage.getItem('userData');
      
      if (!userLoggedIn || userType !== 'worker' || !userData) {
        router.push('/workers/login');
        return;
      }

      try {
        const workerInfo = JSON.parse(userData);
        setWorkerData(workerInfo);
      } catch (_error) {
        console.error('Erreur lors du parsing des données animateur:', _error);
        router.push('/workers/login');
        return;
      }
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (workerData) {
      loadAssignedActivities();
      loadAttendance();
    }
  }, [workerData, loadAssignedActivities, loadAttendance]);

  const logout = () => {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      timeZone: 'Europe/Paris'
    });
  };

  const formatTime = (dateString: string) => {
    // Ajouter 2 heures pour corriger le décalage
    const date = new Date(dateString);
    date.setHours(date.getHours() + 2);
    
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris'
    });
  };

  const getPeriodLabel = (period: string) => {
    return period === 'morning' ? 'Matin' : 'Après-midi';
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

  if (!workerData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">AMH</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Espace Animateur</h1>
              <p className="text-sm text-gray-600">{workerData.name}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50"
          >
            🚪 Déconnexion
          </button>
        </div>
      </div>

      <div className="p-4 pb-24">
        {/* En-tête */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            👋 Bonjour, {workerData.name} !
          </h1>
          <p className="text-gray-600">
            Voici vos activités assignées et vos présences
          </p>
        </div>

        {/* QR Code personnel */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border-l-4 border-green-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📱 Mon QR Code</h2>
          <div className="text-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${workerData.qr_code}`}
              alt="QR Code personnel"
              className="mx-auto mb-4 rounded-lg"
            />
            <p className="text-sm text-gray-600">
              Présentez ce QR code pour pointer votre présence
            </p>
          </div>
        </div>

        {/* Activités assignées */}
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            📅 Mes Activités ({assignedActivities.length})
          </h2>
          
          {assignedActivities.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <p className="text-gray-500 font-medium">Aucune activité assignée</p>
              <p className="text-gray-400 text-sm mt-1">Vous serez notifié quand une activité vous sera assignée</p>
            </div>
          ) : (
            assignedActivities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-purple-500"
              >
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 text-lg">{activity.title}</h3>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>📍 {activity.location}</div>
                    <div>📅 {formatDate(activity.date)}</div>
                    <div>🕐 {activity.start_time} - {activity.end_time}</div>
                    <div>👥 {activity.max_participants} participants</div>
                    <div>🚌 {activity.transport_mode}</div>
                    <div>👥 {activity.category}</div>
                  </div>
                  
                  {activity.description && (
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  )}
                  
                  <div className="flex space-x-2 mt-3">
                    <Link
                      href={`/workers/activities/${activity.id}/checklist`}
                      className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors text-center"
                    >
                      📋 Feuille de route
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Statistiques de présence */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-blue-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Mes Présences</h2>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-blue-600">{totalSessions}</div>
            <div className="text-sm text-gray-600">Sessions totales</div>
          </div>
          
          {attendance.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Aucune présence enregistrée</p>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Dernières présences :</h3>
              {attendance.slice(0, 5).map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{formatDate(session.date)}</div>
                      <div className="text-sm text-gray-600">{getPeriodLabel(session.period)}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(session.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 