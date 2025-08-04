'use client';

import { useState, useEffect } from 'react';

export default function CameraTest() {
  const [cameraStatus, setCameraStatus] = useState<string>('Vérification...');
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [isSecure, setIsSecure] = useState<boolean>(false);

  useEffect(() => {
    // Vérifier si on est en HTTPS
    const secure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    setIsSecure(secure);

    // Vérifier si l'API getUserMedia est disponible
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('Votre navigateur ne supporte pas l\'accès à la caméra');
      setHasCamera(false);
      return;
    }

    // Tenter d'accéder à la caméra
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        setCameraStatus('Caméra accessible ✅');
        setHasCamera(true);
        // Arrêter le stream de test
        stream.getTracks().forEach(track => track.stop());
      })
      .catch((error) => {
        console.error('Erreur caméra:', error);
        if (error.name === 'NotAllowedError') {
          setCameraStatus('Accès à la caméra refusé ❌');
        } else if (error.name === 'NotFoundError') {
          setCameraStatus('Aucune caméra trouvée ❌');
        } else if (error.name === 'NotSupportedError') {
          setCameraStatus('Caméra non supportée ❌');
        } else {
          setCameraStatus(`Erreur: ${error.message} ❌`);
        }
        setHasCamera(false);
      });
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-blue-500">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">🔍 Test de la Caméra</h2>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">HTTPS/SSL :</span>
          <span className={`text-sm font-medium ${isSecure ? 'text-green-600' : 'text-red-600'}`}>
            {isSecure ? '✅ Sécurisé' : '❌ Non sécurisé'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">API Caméra :</span>
          <span className={`text-sm font-medium ${navigator.mediaDevices ? 'text-green-600' : 'text-red-600'}`}>
            {navigator.mediaDevices ? '✅ Disponible' : '❌ Non disponible'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Accès Caméra :</span>
          <span className={`text-sm font-medium ${hasCamera === true ? 'text-green-600' : hasCamera === false ? 'text-red-600' : 'text-yellow-600'}`}>
            {cameraStatus}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">User Agent :</span>
          <span className="text-xs text-gray-500 truncate ml-2">
            {navigator.userAgent.substring(0, 50)}...
          </span>
        </div>
      </div>
      
      {!isSecure && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            ⚠️ L&apos;accès à la caméra nécessite HTTPS en production
          </p>
        </div>
      )}
      
      {hasCamera === false && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">
            ❌ Impossible d&apos;accéder à la caméra. Vérifiez les permissions.
          </p>
        </div>
      )}
    </div>
  );
} 