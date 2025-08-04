'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (qrCode: string) => void;
  onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const handleScan = (decodedText: string) => {
    if (isProcessing) return;
    
    console.log('QR Code détecté:', decodedText);
    setIsProcessing(true);
    setScanResult(decodedText);
    
    // Appeler la fonction onScan
    onScan(decodedText);
    
    // Réinitialiser après 3 secondes pour permettre un nouveau scan
    setTimeout(() => {
      setIsProcessing(false);
      setScanResult(null);
    }, 3000);
  };

  const handleError = (error: string) => {
    console.log('Erreur de scan QR:', error);
    
    // Gestion spécifique des erreurs de caméra
    if (error.includes('Permission') || error.includes('NotAllowedError')) {
      setCameraError('Veuillez autoriser l\'accès à la caméra pour scanner les QR codes');
      if (onError) {
        onError('Veuillez autoriser l\'accès à la caméra pour scanner les QR codes');
      }
    } else if (error.includes('NotFoundError') || error.includes('NotReadableError')) {
      setCameraError('Aucune caméra disponible. Vérifiez que votre appareil a une caméra.');
      if (onError) {
        onError('Aucune caméra disponible. Vérifiez que votre appareil a une caméra.');
      }
    } else if (error.includes('NotSupportedError')) {
      setCameraError('Votre navigateur ne supporte pas l\'accès à la caméra.');
      if (onError) {
        onError('Votre navigateur ne supporte pas l\'accès à la caméra.');
      }
    } else if (error.includes('No MultiFormat Readers')) {
      // Erreur normale quand aucun QR code n'est détecté
      console.log('Aucun QR code détecté pour le moment');
    } else {
      setCameraError(`Erreur de scan: ${error}`);
      if (onError) {
        onError(`Erreur de scan: ${error}`);
      }
    }
  };

  const initializeScanner = () => {
    if (scannerRef.current) return;

    try {
      setIsInitializing(true);
      setCameraError(null);
      
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          supportedScanTypes: [
            Html5QrcodeScanType.SCAN_TYPE_CAMERA
          ],
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE
          ],
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          // Améliorations pour mobile
          disableFlip: false,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          }
        },
        false
      );

      scannerRef.current.render(handleScan, handleError);
      setIsInitializing(false);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du scanner:', error);
      setCameraError('Erreur lors de l\'initialisation du scanner');
      setIsInitializing(false);
      if (onError) {
        onError('Erreur lors de l\'initialisation du scanner');
      }
    }
  };

  const retryScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (error) {
        console.log('Erreur lors du nettoyage du scanner:', error);
      }
      scannerRef.current = null;
    }
    setCameraError(null);
    initializeScanner();
  };

  useEffect(() => {
    // Vérifier si on est sur mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      console.log('Appareil mobile détecté, initialisation du scanner...');
    }
    
    initializeScanner();

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (error) {
          console.log('Erreur lors du nettoyage du scanner:', error);
        }
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      {isInitializing && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Initialisation de la caméra...</p>
        </div>
      )}
      
      {cameraError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-red-600 text-sm">⚠️</span>
            </div>
            <div className="flex-1">
              <p className="text-red-800 font-medium">{cameraError}</p>
              <button
                onClick={retryScanner}
                className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
              >
                🔄 Réessayer
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div id="qr-reader" className="w-full"></div>
      
      {scanResult && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <p className="text-green-800 font-semibold">QR Code détecté !</p>
                <p className="text-green-600 text-sm">Code: {scanResult.substring(0, 20)}...</p>
              </div>
            </div>
            {isProcessing && (
              <div className="text-blue-600 text-sm">
                Traitement...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 