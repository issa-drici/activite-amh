'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface WorkerData {
  id: number;
  name: string;
  username: string;
  qr_code: string;
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
}

interface Checklist {
  id?: number;
  activity_id: number;
  worker_id: number;
  departure_check: boolean;
  return_check: boolean;
  comments?: string;
  last_updated?: string;
}

export default function WorkerChecklistPage({ params }: { params: Promise<{ id: string }> }) {
  const [workerData, setWorkerData] = useState<WorkerData | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [checklist, setChecklist] = useState<Checklist>({
    activity_id: 0,
    worker_id: 0,
    departure_check: false,
    return_check: false,
    comments: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    if (workerData && activityId) {
      loadActivity();
      loadChecklist();
    }
  }, [workerData, activityId]);

  const loadActivity = async () => {
    try {
      const response = await fetch(`/api/activities/${activityId}`);
      const data = await response.json();
      if (data.success) {
        setActivity(data.activity);
        setChecklist(prev => ({
          ...prev,
          activity_id: parseInt(activityId),
          worker_id: workerData!.id
        }));
      }
    } catch (_error) {
      console.error('Erreur lors du chargement de l\'activité:', _error);
    }
  };

  const loadChecklist = async () => {
    try {
      const response = await fetch(`/api/activities/${activityId}/checklist/${workerData!.id}`);
      const data = await response.json();
      if (data.success && data.checklist) {
        setChecklist(data.checklist);
      }
    } catch (_error) {
      console.error('Erreur lors du chargement de la feuille de route:', _error);
    }
  };

  const saveChecklist = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const response = await fetch(`/api/activities/${activityId}/checklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workerId: workerData!.id,
          departureCheck: checklist.departure_check,
          returnCheck: checklist.return_check,
          comments: checklist.comments
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ Feuille de route sauvegardée avec succès !');
        setChecklist(prev => ({
          ...prev,
          id: data.checklist.id,
          last_updated: new Date().toISOString()
        }));
      } else {
        setMessage('❌ Erreur lors de la sauvegarde : ' + data.message);
      }
    } catch (_error) {
      setMessage('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      timeZone: 'Europe/Paris'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
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

  if (!workerData || !activity) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/workers/dashboard')}
              className="mr-3 text-gray-600 hover:text-gray-800"
            >
              ←
            </button>
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">AMH</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Feuille de Route</h1>
              <p className="text-sm text-gray-600">{workerData.name}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {/* En-tête */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            📋 Ma Feuille de Route
          </h1>
          <p className="text-gray-600">
            {activity.title}
          </p>
        </div>

        {message && (
          <div className={`mb-4 rounded-xl p-4 ${
            message.includes('✅') 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="text-sm">{message}</p>
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

        {/* Formulaire de la feuille de route */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Vérifications</h2>
          
          <div className="space-y-4">
            {/* Vérification du départ */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🚌</span>
                <div>
                  <h3 className="font-medium text-gray-900">Départ vérifié</h3>
                  <p className="text-sm text-gray-600">Tous les enfants sont présents au départ</p>
                </div>
              </div>
              <button
                onClick={() => setChecklist(prev => ({ ...prev, departure_check: !prev.departure_check }))}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  checklist.departure_check 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {checklist.departure_check ? '✓' : '○'}
              </button>
            </div>

            {/* Vérification du retour */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🏠</span>
                <div>
                  <h3 className="font-medium text-gray-900">Retour vérifié</h3>
                  <p className="text-sm text-gray-600">Tous les enfants sont rentrés sains et saufs</p>
                </div>
              </div>
              <button
                onClick={() => setChecklist(prev => ({ ...prev, return_check: !prev.return_check }))}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  checklist.return_check 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {checklist.return_check ? '✓' : '○'}
              </button>
            </div>
          </div>
        </div>

        {/* Commentaires */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Commentaires</h2>
          <textarea
            value={checklist.comments || ''}
            onChange={(e) => setChecklist(prev => ({ ...prev, comments: e.target.value }))}
            placeholder="Ajoutez vos commentaires, remarques ou observations sur cette activité..."
            className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={4}
          />
        </div>

        {/* Dernière mise à jour */}
        {checklist.last_updated && (
          <div className="bg-blue-50 rounded-xl p-3 mb-6">
            <p className="text-sm text-blue-800">
              📝 Dernière mise à jour : {formatDate(checklist.last_updated)} à {formatTime(checklist.last_updated)}
            </p>
          </div>
        )}

        {/* Bouton de sauvegarde */}
        <div className="space-y-3">
          <button
            onClick={saveChecklist}
            disabled={saving}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '💾 Sauvegarde...' : '💾 Sauvegarder ma feuille de route'}
          </button>
          
          <button
            onClick={() => router.push('/workers/dashboard')}
            className="w-full bg-gray-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-700 transition-colors"
          >
            ← Retour au dashboard
          </button>
        </div>
      </div>
    </div>
  );
} 