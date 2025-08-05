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



export default function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activityId, setActivityId] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    maxParticipants: 20,
    transportMode: 'À pied',
    category: '5-8 ans',
    selectedWorkers: [] as number[]
  });
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
    }
  }, [adminData, activityId]);

  const loadActivity = async () => {
    try {
      const response = await fetch(`/api/activities/${activityId}`);
      const data = await response.json();
      if (data.success) {
        setActivity(data.activity);
        setFormData({
          title: data.activity.title,
          description: data.activity.description || '',
          location: data.activity.location,
          date: data.activity.date,
          startTime: data.activity.start_time,
          endTime: data.activity.end_time,
          maxParticipants: data.activity.max_participants,
          transportMode: data.activity.transport_mode,
          category: data.activity.category,
          selectedWorkers: []
        });
      }
    } catch (_error) {
      console.error('Erreur lors du chargement de l\'activité:', _error);
    }
  };



  const updateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminData) {
      setMessage('Erreur: données admin non disponibles');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          createdBy: adminData.id
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('✅ Activité mise à jour avec succès !');
        setTimeout(() => {
          router.push('/admin/activities');
        }, 2000);
      } else {
        setMessage(`❌ ${data.message || 'Erreur lors de la mise à jour'}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch {
      setMessage('❌ Erreur de connexion au serveur');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const deleteActivity = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setMessage('✅ Activité supprimée avec succès !');
        setTimeout(() => {
          router.push('/admin/activities');
        }, 2000);
      } else {
        setMessage(`❌ ${data.message || 'Erreur lors de la suppression'}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch {
      setMessage('❌ Erreur de connexion au serveur');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
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
            ✏️ Modifier l&apos;Activité
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

        {/* Formulaire de modification */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Modifier l&apos;activité</h2>
          
          <form onSubmit={updateActivity} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l&apos;activité *
              </label>
              <input
                type="text"
                placeholder="Ex: Sortie au parc d&apos;attractions"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lieu *
              </label>
              <input
                type="text"
                placeholder="Ex: Parc d&apos;attractions Disney"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Participants *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure départ *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure retour *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transport *
                </label>
                <select
                  value={formData.transportMode}
                  onChange={(e) => setFormData({...formData, transportMode: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                  required
                >
                  <option value="À pied">🚶 À pied</option>
                  <option value="Bus">🚌 Bus</option>
                  <option value="Car">🚐 Car</option>
                  <option value="Voiture">🚗 Voiture</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                  required
                >
                  <option value="5-8 ans">🧒 5-8 ans</option>
                  <option value="8-15 ans">👦 8-15 ans</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optionnel)
              </label>
              <textarea
                placeholder="Détails sur l&apos;activité..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-purple-600 text-white py-4 px-4 rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {saving ? '⏳ Sauvegarde...' : '✅ Sauvegarder'}
              </button>
              
              <button
                type="button"
                onClick={deleteActivity}
                disabled={saving}
                className="bg-red-600 text-white py-4 px-4 rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                🗑️ Supprimer
              </button>
            </div>
          </form>
        </div>

        {/* Bouton retour */}
        <div className="text-center">
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