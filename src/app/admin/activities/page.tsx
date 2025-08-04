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

export default function ActivitiesPage() {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    maxParticipants: 20,
    transportMode: 'Bus',
    category: '8-12 ans',
    selectedWorkers: [] as number[]
  });
  const router = useRouter();

  const loadActivities = useCallback(async () => {
    try {
      const response = await fetch('/api/activities');
      const data = await response.json();
      if (data.success) {
        setActivities(data.activities);
      }
    } catch (_error) {
      console.error('Erreur lors du chargement des activités:', _error);
    }
  }, []);

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
      loadActivities();
      loadWorkers();
    }
  }, [adminData, loadActivities, loadWorkers]);

  const createActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminData) {
      setMessage('Erreur: données admin non disponibles');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newActivity,
          createdBy: adminData.id
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('✅ Activité créée avec succès !');
        setNewActivity({
          title: '',
          description: '',
          location: '',
          date: '',
          startTime: '',
          endTime: '',
          maxParticipants: 20,
          transportMode: 'Bus',
          category: '8-12 ans',
          selectedWorkers: []
        });
        setShowCreateForm(false);
        loadActivities();
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
            📅 Activités
          </h1>
          <p className="text-gray-600">
            Créer et gérer les sorties
          </p>
        </div>

        {message && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-800 text-sm">{message}</p>
          </div>
        )}

        {/* Bouton créer activité */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full bg-purple-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-purple-700 transition-colors text-lg"
          >
            {showCreateForm ? '❌ Annuler' : '➕ Créer une activité'}
          </button>
        </div>

        {/* Formulaire de création */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Nouvelle Activité</h2>
            
            <form onSubmit={createActivity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de l&apos;activité *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Sortie au parc d&apos;attractions"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
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
                  value={newActivity.location}
                  onChange={(e) => setNewActivity({...newActivity, location: e.target.value})}
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
                    value={newActivity.date}
                    onChange={(e) => setNewActivity({...newActivity, date: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Participants max *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newActivity.maxParticipants}
                    onChange={(e) => setNewActivity({...newActivity, maxParticipants: parseInt(e.target.value)})}
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
                    value={newActivity.startTime}
                    onChange={(e) => setNewActivity({...newActivity, startTime: e.target.value})}
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
                    value={newActivity.endTime}
                    onChange={(e) => setNewActivity({...newActivity, endTime: e.target.value})}
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
                    value={newActivity.transportMode}
                    onChange={(e) => setNewActivity({...newActivity, transportMode: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                    required
                  >
                    <option value="Bus">🚌 Bus</option>
                    <option value="Minibus">🚐 Minibus</option>
                    <option value="Voiture">🚗 Voiture</option>
                    <option value="Train">🚂 Train</option>
                    <option value="Métro">🚇 Métro</option>
                    <option value="À pied">🚶 À pied</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    value={newActivity.category}
                    onChange={(e) => setNewActivity({...newActivity, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                    required
                  >
                    <option value="3-6 ans">👶 3-6 ans</option>
                    <option value="6-8 ans">🧒 6-8 ans</option>
                    <option value="8-12 ans">👦 8-12 ans</option>
                    <option value="12-15 ans">👧 12-15 ans</option>
                    <option value="15-18 ans">👨 15-18 ans</option>
                    <option value="Tous âges">👥 Tous âges</option>
                  </select>
                </div>
              </div>
              
                               <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Description (optionnel)
                   </label>
                   <textarea
                     placeholder="Détails sur l&apos;activité..."
                     value={newActivity.description}
                     onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                     rows={3}
                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     👥 Animateurs à assigner (optionnel)
                   </label>
                   <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-xl p-3">
                     {workers.length === 0 ? (
                       <p className="text-sm text-gray-500 text-center py-2">
                         Aucun animateur disponible
                       </p>
                     ) : (
                       <div className="space-y-2">
                         {workers.map((worker) => (
                           <label key={worker.id} className="flex items-center space-x-3 cursor-pointer">
                             <input
                               type="checkbox"
                               checked={newActivity.selectedWorkers.includes(worker.id)}
                               onChange={(e) => {
                                 if (e.target.checked) {
                                   setNewActivity({
                                     ...newActivity,
                                     selectedWorkers: [...newActivity.selectedWorkers, worker.id]
                                   });
                                 } else {
                                   setNewActivity({
                                     ...newActivity,
                                     selectedWorkers: newActivity.selectedWorkers.filter(id => id !== worker.id)
                                   });
                                 }
                               }}
                               className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                             />
                             <span className="text-sm text-gray-700">
                               {worker.name} (@{worker.username})
                             </span>
                           </label>
                         ))}
                       </div>
                     )}
                   </div>
                   {newActivity.selectedWorkers.length > 0 && (
                     <p className="text-xs text-gray-500 mt-1">
                       {newActivity.selectedWorkers.length} animateur(s) sélectionné(s)
                     </p>
                   )}
                 </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-4 px-4 rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '⏳ Création...' : '✅ Créer l\'activité'}
              </button>
            </form>
          </div>
        )}

        {/* Liste des activités */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Activités créées</h2>
          
          {activities.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <p className="text-gray-500 font-medium">Aucune activité créée</p>
              <p className="text-gray-400 text-sm mt-1">Créez votre première activité !</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-purple-500"
              >
                <div className="space-y-2">
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
                    <p className="text-sm text-gray-600 mt-2">{activity.description}</p>
                  )}
                  
                                     <div className="flex space-x-2 mt-3">
                     <Link
                       href={`/admin/activities/${activity.id}/edit`}
                       className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors text-center"
                     >
                       ✏️ Modifier
                     </Link>
                     <Link
                       href={`/admin/activities/${activity.id}/assign`}
                       className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors text-center"
                     >
                       👥 Attribuer
                     </Link>
                     <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                       📋 Feuilles
                     </button>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 