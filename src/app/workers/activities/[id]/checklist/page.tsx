'use client';

import { useState, useEffect, useCallback } from 'react';
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
  comments: string;
  mood: 'happy' | 'neutral' | 'sad' | null;
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
    comments: '',
    mood: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activityId, setActivityId] = useState<string>('');
  const router = useRouter();

  // Charger les paramètres de l'URL
  useEffect(() => {
    const loadParams = async () => {
      const { id } = await params;
      setActivityId(id);
    };
    loadParams();
  }, [params]);

  // Vérifier l'authentification
  useEffect(() => {
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
      } catch (error) {
        console.error('Erreur lors du parsing des données animateur:', error);
        router.push('/workers/login');
        return;
      }
      setLoading(false);
    }
  }, [router]);

  const loadActivity = useCallback(async () => {
    if (!activityId) return;
    
    try {
      const response = await fetch(`/api/activities/${activityId}`);
      const data = await response.json();
      if (data.success) {
        setActivity(data.activity);
        setChecklist(prev => ({
          ...prev,
          activity_id: parseInt(activityId),
          worker_id: workerData?.id || 0
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'activité:', error);
    }
  }, [activityId, workerData]);

  const loadChecklist = useCallback(async () => {
    if (!activityId || !workerData) return;
    
    try {
      const response = await fetch(`/api/activities/${activityId}/checklist?workerId=${workerData.id}`);
      const data = await response.json();
      if (data.success && data.checklist) {
        setChecklist(data.checklist);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la feuille de route:', error);
    }
  }, [activityId, workerData]);

  // Charger les données quand les dépendances sont disponibles
  useEffect(() => {
    if (workerData && activityId) {
      loadActivity();
      loadChecklist();
    }
  }, [workerData, activityId, loadActivity, loadChecklist]);

  const saveChecklist = async () => {
    if (!workerData || !activityId) return;
    
    // Validation des champs obligatoires
    // Les commentaires sont obligatoires seulement si départ ET retour sont cochés
    if (checklist.departure_check && checklist.return_check && !checklist.comments.trim()) {
      setMessage('❌ Les commentaires sont obligatoires quand le départ et le retour sont effectués');
      return;
    }
    
    // Le mood est obligatoire seulement si départ ET retour sont cochés
    if (checklist.departure_check && checklist.return_check && !checklist.mood) {
      setMessage('❌ Le ressenti de la journée est obligatoire quand le départ et le retour sont effectués');
      return;
    }
    
    setSaving(true);
    setMessage('');
    
    try {
      const response = await fetch(`/api/activities/${activityId}/checklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workerId: workerData.id,
          departureCheck: checklist.departure_check,
          returnCheck: checklist.return_check,
          comments: checklist.comments,
          mood: checklist.mood || 'neutral' // Envoyer 'neutral' si null
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Afficher une alerte de succès
        alert('✅ Feuille de route sauvegardée avec succès !');
        setMessage('✅ Feuille de route sauvegardée avec succès !');
        setChecklist(prev => ({
          ...prev,
          id: data.checklist.id,
          last_updated: new Date().toISOString()
        }));
        // Scroll vers le haut pour voir le message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setMessage('❌ Erreur lors de la sauvegarde : ' + data.message);
      }
    } catch {
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{message || 'Données non disponibles'}</p>
        </div>
      </div>
    );
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
              <h1 className="text-lg font-semibold text-gray-900">Feuille de Route</h1>
              <p className="text-sm text-gray-600">{workerData.name}</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/workers/dashboard')}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50"
          >
            ← Retour
          </button>
        </div>
      </div>

      <div className="p-4 pb-24">
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
          <div className={`mb-4 rounded-xl p-4 border-2 ${
            message.includes('✅') 
              ? 'bg-green-50 border-green-300 animate-pulse' 
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-center">
              <span className="text-2xl mr-3">
                {message.includes('✅') ? '✅' : '❌'}
              </span>
              <p className={`text-lg font-medium ${
                message.includes('✅') ? 'text-green-800' : 'text-red-800'
              }`}>
                {message}
              </p>
            </div>
          </div>
        )}

        {/* Détails de l'activité */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border-l-4 border-purple-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Détails de l&apos;activité</h2>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>�� {activity.location}</div>
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

        {/* Formulaire de checklist */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Checklist de l&apos;activité
          </h2>

          <div className="space-y-6">
            {/* Départ */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">🚌 Départ</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="departureCheck"
                  checked={checklist.departure_check}
                  onChange={(e) => setChecklist(prev => ({ ...prev, departure_check: e.target.checked }))}
                  className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                />
                <label htmlFor="departureCheck" className="ml-3 text-gray-700">
                  J&apos;ai bien effectué le départ avec tous les participants
                </label>
              </div>
            </div>

            {/* Retour */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">🏠 Retour</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="returnCheck"
                  checked={checklist.return_check}
                  onChange={(e) => setChecklist(prev => ({ ...prev, return_check: e.target.checked }))}
                  className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                />
                <label htmlFor="returnCheck" className="ml-3 text-gray-700">
                  J&apos;ai bien effectué le retour avec tous les participants
                </label>
              </div>
            </div>

            {/* Ressenti de la journée */}
            <div className="space-y-3">
              <h3 className={`text-lg font-medium ${checklist.departure_check && checklist.return_check ? 'text-gray-900' : 'text-gray-500'}`}>
                😊 Ressenti de la journée {checklist.departure_check && checklist.return_check ? '*' : '(optionnel)'}
              </h3>
              <div className={`flex space-x-4 ${!checklist.departure_check || !checklist.return_check ? 'opacity-50' : ''}`}>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mood"
                    value="happy"
                    checked={checklist.mood === 'happy'}
                    onChange={(e) => setChecklist(prev => ({ ...prev, mood: e.target.value as 'happy' | 'neutral' | 'sad' | null }))}
                    className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                    disabled={!checklist.departure_check || !checklist.return_check}
                  />
                  <span className="text-2xl">😊</span>
                  <span className="text-sm text-gray-700">Heureux</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mood"
                    value="neutral"
                    checked={checklist.mood === 'neutral'}
                    onChange={(e) => setChecklist(prev => ({ ...prev, mood: e.target.value as 'happy' | 'neutral' | 'sad' | null }))}
                    className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                    disabled={!checklist.departure_check || !checklist.return_check}
                  />
                  <span className="text-2xl">😐</span>
                  <span className="text-sm text-gray-700">Moyen</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mood"
                    value="sad"
                    checked={checklist.mood === 'sad'}
                    onChange={(e) => setChecklist(prev => ({ ...prev, mood: e.target.value as 'happy' | 'neutral' | 'sad' | null }))}
                    className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                    disabled={!checklist.departure_check || !checklist.return_check}
                  />
                  <span className="text-2xl">😔</span>
                  <span className="text-sm text-gray-700">Triste</span>
                </label>
              </div>
              {checklist.departure_check && checklist.return_check && (
                <p className="text-sm text-gray-600">
                  Le ressenti devient obligatoire quand le départ et le retour sont effectués
                </p>
              )}
            </div>

            {/* Commentaires */}
            <div className="space-y-3">
              <h3 className={`text-lg font-medium ${checklist.departure_check && checklist.return_check ? 'text-gray-900' : 'text-gray-500'}`}>
                💬 Commentaires {checklist.departure_check && checklist.return_check ? '*' : '(optionnel)'}
              </h3>
              <textarea
                value={checklist.comments}
                onChange={(e) => setChecklist(prev => ({ ...prev, comments: e.target.value }))}
                placeholder={checklist.departure_check && checklist.return_check 
                  ? "Ajoutez des commentaires sur l'activité (obligatoire)" 
                  : "Ajoutez des commentaires sur l'activité (optionnel)"}
                className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                  checklist.departure_check && checklist.return_check ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                }`}
                rows={4}
                required={checklist.departure_check && checklist.return_check}
                disabled={!checklist.departure_check || !checklist.return_check}
              />
              {checklist.departure_check && checklist.return_check && (
                <p className="text-sm text-gray-600">
                  Les commentaires deviennent obligatoires quand le départ et le retour sont effectués
                </p>
              )}
            </div>

            {/* Bouton de sauvegarde */}
            <div className="pt-4">
              <button
                onClick={saveChecklist}
                disabled={saving}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder ma feuille de route'}
              </button>
            </div>
          </div>
        </div>

        {/* Statut de la checklist */}
        {checklist.id && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm p-4 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">✅ Feuille de route complétée</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>Dernière mise à jour : {checklist.last_updated ? new Date(checklist.last_updated).toLocaleString('fr-FR') : 'Maintenant'}</div>
              <div>Départ : {checklist.departure_check ? '✅ Effectué' : '❌ Non effectué'}</div>
              <div>Retour : {checklist.return_check ? '✅ Effectué' : '❌ Non effectué'}</div>
              <div>Ressenti : {
                checklist.mood === 'happy' ? '😊 Heureux' :
                checklist.mood === 'neutral' ? '😐 Moyen' :
                checklist.mood === 'sad' ? '😔 Triste' :
                '❓ Non renseigné'
              }</div>
              <div>
                <strong>Commentaires :</strong>
                <p className="mt-1 whitespace-pre-wrap">{checklist.comments}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 