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

interface AssignedWorker {
  worker_id: number;
  worker_name: string;
  assigned_at: string;
}

interface Checklist {
  id: number;
  activity_id: number;
  worker_id: number;
  departure_check: boolean;
  return_check: boolean;
  comments: string;
  mood: 'happy' | 'neutral' | 'sad' | null;
  last_updated: string;
  worker_name: string;
}

export default function ActivityChecklistPage({ params }: { params: Promise<{ id: string }> }) {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [assignedWorkers, setAssignedWorkers] = useState<AssignedWorker[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);

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
      loadAssignedWorkers();
      loadChecklists();
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

  const loadChecklists = async () => {
    try {
      const response = await fetch(`/api/activities/${activityId}/checklist`);
      const data = await response.json();
      if (data.success) {
        setChecklists(data.checklists);
      }
    } catch (_error) {
      console.error('Erreur lors du chargement des feuilles de route:', _error);
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

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Heure invalide';
      }
      // Ajouter 2 heures pour corriger le décalage
      date.setHours(date.getHours() + 2);
      
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Paris'
      });
    } catch {
      return 'Heure invalide';
    }
  };

  const getChecklistForWorker = (workerId: number) => {
    return checklists.find(checklist => checklist.worker_id === workerId);
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
            📋 Feuilles de Route
          </h1>
          <p className="text-gray-600">
            {activity.title}
          </p>
        </div>



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

        {/* Feuilles de route des animateurs */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Feuilles de route des animateurs ({assignedWorkers.length})
          </h2>
          
          {assignedWorkers.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <p className="text-gray-500 font-medium">Aucun animateur assigné</p>
              <p className="text-gray-400 text-sm mt-1">Assignez des animateurs pour voir leurs feuilles de route</p>
            </div>
          ) : (
            assignedWorkers.map((assignedWorker) => {
              const checklist = getChecklistForWorker(assignedWorker.worker_id);
              
              return (
                <div
                  key={assignedWorker.worker_id}
                  className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-green-500"
                >
                  <div className="space-y-4">
                    {/* En-tête de l'animateur */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{assignedWorker.worker_name}</h3>
                        <p className="text-xs text-gray-500">
                          Assigné le {formatDate(assignedWorker.assigned_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                          checklist ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {checklist ? '✅ Complétée' : '⏳ En attente'}
                        </span>
                      </div>
                    </div>

                    {/* Checklist */}
                    {checklist ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              checklist.departure_check ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {checklist.departure_check ? '✓' : '○'}
                            </span>
                            <span className="text-sm font-medium">Départ vérifié</span>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              checklist.return_check ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {checklist.return_check ? '✓' : '○'}
                            </span>
                            <span className="text-sm font-medium">Retour vérifié</span>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-900">Commentaires :</h4>
                            <div className="text-sm text-gray-600">
                              Ressenti : {
                                checklist.mood === 'happy' ? '😊 Heureux' :
                                checklist.mood === 'neutral' ? '😐 Moyen' :
                                checklist.mood === 'sad' ? '😔 Triste' :
                                '❓ Non renseigné'
                              }
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{checklist.comments}</p>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Dernière mise à jour : {formatDate(checklist.last_updated)} à {formatTime(checklist.last_updated)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-xl">📋</span>
                        </div>
                        <p className="text-gray-500 font-medium">Feuille de route non complétée</p>
                        <p className="text-gray-400 text-sm mt-1">L&apos;animateur n&apos;a pas encore rempli sa feuille</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bouton retour */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/admin/activities')}
            className="bg-gray-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-700 transition-colors"
          >
            ← Retour aux activités
          </button>
        </div>
      </div>
    </div>
  );
} 