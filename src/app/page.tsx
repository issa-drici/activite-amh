'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userLoggedIn = localStorage.getItem('userLoggedIn');
      const userTypeData = localStorage.getItem('userType');
      const userDataString = localStorage.getItem('userData');
      
      if (userLoggedIn && userTypeData && userDataString) {
        try {
          // Rediriger directement vers le dashboard approprié
          if (userTypeData === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/workers/dashboard');
          }
        } catch (_error) {
          console.error('Erreur lors du parsing des données utilisateur:', _error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
  }, [router]);





  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }



  // Formulaire de connexion pour utilisateurs non connectés
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
            </svg>
          </div>
                      <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Activités AMH Été 2025
            </h1>
            <p className="text-lg text-gray-600">
              Gestion des activités AMH Été 2025
            </p>
        </div>

        <div className="max-w-sm mx-auto">
          {/* Formulaire de Connexion */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Connexion
              </h2>
              <p className="text-sm text-gray-600">
                Accédez à votre espace
              </p>
            </div>
            
            <LoginForm />
          </div>
        </div>


      </div>
    </div>
  );
}

// Composant de formulaire de connexion
function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/unified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Stocker les informations de l'utilisateur connecté
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userType', data.userType);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        // Rediriger selon le type d'utilisateur
        if (data.userType === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/workers/dashboard');
        }
      } else {
        setError(data.message || 'Erreur de connexion');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
          Nom d&apos;utilisateur
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
          placeholder="Votre nom d&apos;utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
          placeholder="Votre mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-red-600 text-sm text-center">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium text-base hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Connexion...
          </div>
        ) : (
          'Se connecter'
        )}
      </button>
    </form>
  );
}
