'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavigation from '@/components/AdminNavigation';

interface AdminData {
  id: number;
  name: string;
  username: string;
}

interface Attendance {
  name: string;
  period: string;
  created_at: string;
  admin_name: string;
}

interface Activity {
  id: number;
  title: string;
  location: string;
  date: string;
  category: string;
  assigned_workers_count: number;
}

export default function ReportsPage() {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAllData, setShowAllData] = useState(false);
  const router = useRouter();

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
      loadAttendance();
      loadActivities();
    }
  }, [adminData, selectedDate, showAllData]);

  const loadAttendance = async () => {
    try {
      const url = showAllData ? '/api/attendance' : `/api/attendance?date=${selectedDate}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setAttendance(data.attendance);
      }
    } catch (_error) {
      console.error('Erreur lors du chargement des présences:', _error);
    }
  };

  const loadActivities = async () => {
    try {
      const response = await fetch('/api/activities');
      const data = await response.json();
      if (data.success) {
        setActivities(data.activities);
      }
    } catch (_error) {
      console.error('Erreur lors du chargement des activités:', _error);
    }
  };

  const exportAttendanceCSV = async () => {
    try {
      const response = await fetch('/api/export-attendance');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `presences_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setMessage('✅ Export CSV réussi !');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Erreur lors de l\'export CSV');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      setMessage('❌ Erreur lors de l\'export CSV');
      setTimeout(() => setMessage(''), 3000);
    }
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

  const getStats = () => {
    const relevantAttendance = showAllData ? attendance : attendance.filter(a => 
      new Date(a.created_at).toDateString() === new Date().toDateString()
    );
    
    const morningCount = relevantAttendance.filter(a => a.period === 'morning').length;
    const afternoonCount = relevantAttendance.filter(a => a.period === 'afternoon').length;
    
    const upcomingActivities = activities.filter(a => 
      new Date(a.date) >= new Date()
    );

    const pastActivities = activities.filter(a => 
      new Date(a.date) < new Date()
    );

    return {
      totalAttendance: relevantAttendance.length,
      morningCount,
      afternoonCount,
      totalActivities: activities.length,
      upcomingActivities: upcomingActivities.length,
      pastActivities: pastActivities.length
    };
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

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      
      <div className="p-4 pb-24">
        {/* En-tête */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            📊 Rapports
          </h1>
          <p className="text-gray-600">
            Statistiques et export des données
          </p>
        </div>

        {message && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-800 text-sm">{message}</p>
          </div>
        )}

        {/* Sélecteur de données */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Sélection des données</h2>
          
          <div className="space-y-4">
            <div className="flex space-x-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  checked={!showAllData}
                  onChange={() => setShowAllData(false)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Données du jour sélectionné</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  checked={showAllData}
                  onChange={() => setShowAllData(true)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Toutes les données</span>
              </label>
            </div>
            
            {!showAllData && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📅 Date pour l&apos;analyse
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>
            )}
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-green-500">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalAttendance}</div>
              <div className="text-sm text-green-800">
                {showAllData ? 'Total présences' : 'Présences du jour'}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-blue-500">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalActivities}</div>
              <div className="text-sm text-blue-800">Total activités</div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-orange-500">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.morningCount}</div>
              <div className="text-sm text-orange-800">Matin</div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-purple-500">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.afternoonCount}</div>
              <div className="text-sm text-purple-800">Après-midi</div>
            </div>
          </div>
        </div>

        {showAllData && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-indigo-500">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{stats.upcomingActivities}</div>
                <div className="text-sm text-indigo-800">Activités à venir</div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-red-500">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.pastActivities}</div>
                <div className="text-sm text-red-800">Activités passées</div>
              </div>
            </div>
          </div>
        )}

        {/* Export CSV */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📄 Export des données</h2>
          
          <div className="space-y-4">
            <button
              onClick={exportAttendanceCSV}
              className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-green-700 transition-colors text-lg"
            >
              📊 Exporter toutes les présences (CSV)
            </button>
            
            <p className="text-sm text-gray-600">
              L&apos;export inclut toutes les présences de tous les animateurs depuis le début
            </p>
          </div>
        </div>

        {/* Présences */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📋 Présences {showAllData ? 'toutes périodes' : `du ${formatDate(selectedDate)}`}
          </h2>
          
          <div className="space-y-3">
            {attendance.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">📱</span>
                </div>
                <p className="text-gray-500 font-medium">Aucune présence enregistrée</p>
                <p className="text-gray-400 text-sm mt-1">
                  {showAllData ? 'Aucune donnée disponible' : 'Changez de date ou scannez des QR codes'}
                </p>
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
                    {showAllData && (
                      <p className="text-xs text-gray-500">{formatDate(record.created_at)}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      record.period === 'morning' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {record.period === 'morning' ? '🌅 Matin' : '🌆 Après-midi'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(record.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activités à venir */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📅 Activités à venir ({stats.upcomingActivities})
          </h2>
          
          <div className="space-y-3">
            {activities.filter(a => new Date(a.date) >= new Date()).length === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">📅</span>
                </div>
                <p className="text-gray-500 font-medium">Aucune activité à venir</p>
                <p className="text-gray-400 text-sm mt-1">Créez de nouvelles activités</p>
              </div>
            ) : (
              activities
                .filter(a => new Date(a.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map((activity) => (
                  <div
                    key={activity.id}
                    className="p-4 bg-gray-50 rounded-xl border-l-4 border-purple-500"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                        <p className="text-sm text-gray-600">
                          📍 {activity.location} • 📅 {formatDate(activity.date)}
                        </p>
                        <p className="text-sm text-gray-600">
                          👥 {activity.category} • 👥 {activity.assigned_workers_count || 0} animateurs
                        </p>
                      </div>
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