'use client';

import { useState, useEffect } from 'react';

export default function UpdateNotification() {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Vérifier si le service worker est enregistré
    if ('serviceWorker' in navigator) {
      // Écouter les mises à jour du service worker
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service worker mis à jour');
        setShowUpdateNotification(true);
      });

      // Vérifier s'il y a une mise à jour disponible
      const checkForUpdates = async () => {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            // Écouter les mises à jour
            registration.addEventListener('updatefound', () => {
              console.log('Mise à jour trouvée');
              setShowUpdateNotification(true);
            });

            // Vérifier s'il y a un service worker en attente
            if (registration.waiting) {
              setShowUpdateNotification(true);
            }
          }
        } catch (error) {
          console.error('Erreur lors de la vérification des mises à jour:', error);
        }
      };

      checkForUpdates();

      // Vérifier périodiquement les mises à jour (toutes les 30 minutes)
      const interval = setInterval(checkForUpdates, 30 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        // Envoyer un message au service worker pour forcer la mise à jour
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Recharger la page après un court délai
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        // Si pas de service worker en attente, recharger simplement
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      // Recharger en cas d'erreur
      window.location.reload();
    }
  };

  const dismissNotification = () => {
    setShowUpdateNotification(false);
  };

  if (!showUpdateNotification) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white border border-green-200 rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-green-600 text-sm">🔄</span>
          </div>
          <div>
            <p className="text-green-800 font-medium">Nouvelle version disponible</p>
            <p className="text-green-600 text-sm">Une mise à jour de l&apos;application est prête</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={dismissNotification}
            className="px-3 py-1 text-gray-500 hover:text-gray-700 text-sm"
          >
            Plus tard
          </button>
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isUpdating ? 'Mise à jour...' : 'Mettre à jour'}
          </button>
        </div>
      </div>
    </div>
  );
} 