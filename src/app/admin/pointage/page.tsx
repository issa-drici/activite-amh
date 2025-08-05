'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavigation from '@/components/AdminNavigation';
import QRScanner from '@/components/QRScanner';
import CameraTest from '@/components/CameraTest';

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

export default function PointagePage() {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPeriod, setSelectedPeriod] = useState<'morning' | 'afternoon'>('morning');
  const [showScanner, setShowScanner] = useState(false);
  const [showCameraTest, setShowCameraTest] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadAttendance = useCallback(async () => {
    try {
      const response = await fetch(`/api/attendance?date=${selectedDate}`);
      const data = await response.json();
      if (data.success) {
        setAttendance(data.attendance);
      }
    } catch (_error) {
      console.error('Erreur lors du chargement des présences:', _error);
    }
  }, [selectedDate]);

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
    }
  }, [adminData, loadAttendance]);

  const handleQRScan = async (qrCode: string) => {
    if (!adminData) {
      setMessage('Erreur: données admin non disponibles');
      return;
    }

    console.log('Tentative d\'enregistrement pour le QR code:', qrCode);

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCode,
          date: selectedDate,
          period: selectedPeriod,
          adminId: adminData.id,
        }),
      });

      const data = await response.json();
      console.log('Réponse du serveur:', data);

      if (data.success) {
        setMessage(`✅ Présence enregistrée : ${data.worker} (${data.period})`);
        loadAttendance();
        setShowScanner(false);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${data.message || 'Erreur lors de l\'enregistrement'}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      setMessage('❌ Erreur de connexion au serveur');
      setTimeout(() => setMessage(''), 5000);
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
      
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📱 Pointage des Animateurs
          </h1>
          <p className="text-lg text-gray-600">
            Scanner les QR codes pour enregistrer les présences
          </p>
        </div>

        {message && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-800 text-sm">{message}</p>
          </div>
        )}

        {/* Configuration du pointage */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Date du pointage
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ⏰ Période
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'morning' | 'afternoon')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
              >
                <option value="morning">🌅 Matin</option>
                <option value="afternoon">🌆 Après-midi</option>
              </select>
            </div>
            
            <div className="flex items-end space-x-2">
              <button
                onClick={() => setShowScanner(true)}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                📱 Commencer le scan
              </button>
              <button
                onClick={() => setShowCameraTest(!showCameraTest)}
                className="px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                title="Tester la caméra"
              >
                🔍
              </button>
            </div>
          </div>
        </div>

        {/* Scanner QR Code */}
        {showScanner && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                📱 Scanner QR Code - {selectedPeriod === 'morning' ? 'Matin' : 'Après-midi'}
              </h3>
              <p className="text-blue-800 text-sm">
                Présentez le QR code de l&apos;animateur devant la caméra
              </p>
            </div>
            
            <QRScanner
              onScan={handleQRScan}
              onError={(error) => setMessage(`❌ Erreur scanner: ${error}`)}
            />
            
            <button
              onClick={() => setShowScanner(false)}
              className="mt-4 w-full py-3 px-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
            >
              ❌ Annuler le scan
            </button>
          </div>
        )}

        {/* Test de la caméra */}
        {showCameraTest && (
          <div className="mb-6">
            <CameraTest />
          </div>
        )}

        {/* Liste des présences */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📋 Présences du {formatDate(selectedDate)}
          </h2>
          
          {attendance.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <p className="text-gray-500 font-medium">Aucune présence enregistrée</p>
              <p className="text-gray-400 text-sm mt-1">Scannez un QR code pour commencer</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Présences du matin */}
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                  🌅 Présences du matin
                  <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                    {attendance.filter(record => record.period === 'morning').length}
                  </span>
                </h3>
                <div className="space-y-2">
                  {attendance.filter(record => record.period === 'morning').length === 0 ? (
                    <div className="text-center py-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-500 text-sm">Aucune présence matinale</p>
                    </div>
                  ) : (
                    attendance
                      .filter(record => record.period === 'morning')
                      .map((record, index) => (
                        <div
                          key={`morning-${index}`}
                          className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-200"
                        >
                          <div>
                            <span className="font-semibold text-gray-900">{record.name}</span>
                            <p className="text-xs text-gray-500">Pointé par {record.admin_name}</p>
                          </div>
                          <span className="text-sm font-medium px-3 py-1 rounded-full bg-green-100 text-green-800">
                            🌅 Matin
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Présences de l'après-midi */}
              <div>
                <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                  🌆 Présences de l&apos;après-midi
                  <span className="ml-2 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                    {attendance.filter(record => record.period === 'afternoon').length}
                  </span>
                </h3>
                <div className="space-y-2">
                  {attendance.filter(record => record.period === 'afternoon').length === 0 ? (
                    <div className="text-center py-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-500 text-sm">Aucune présence après-midi</p>
                    </div>
                  ) : (
                    attendance
                      .filter(record => record.period === 'afternoon')
                      .map((record, index) => (
                        <div
                          key={`afternoon-${index}`}
                          className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border border-orange-200"
                        >
                          <div>
                            <span className="font-semibold text-gray-900">{record.name}</span>
                            <p className="text-xs text-gray-500">Pointé par {record.admin_name}</p>
                          </div>
                          <span className="text-sm font-medium px-3 py-1 rounded-full bg-orange-100 text-orange-800">
                            🌆 Après-midi
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 