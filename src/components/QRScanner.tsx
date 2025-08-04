'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (qrCode: string) => void;
  onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleScan = useCallback((decodedText: string) => {
    if (isScanning) return;
    
    console.log('QR Code détecté:', decodedText);
    setIsScanning(true);
    setScanResult(decodedText);
    
    // Appeler la fonction onScan
    onScan(decodedText);
  }, [isScanning, onScan]);

  const handleError = useCallback((error: string) => {
    console.log('Erreur de scan QR:', error);
    
    // Ne pas afficher les erreurs de permission ou de caméra non disponible
    if (error.includes('Permission') || error.includes('NotAllowedError') || error.includes('NotFoundError')) {
      if (onError) {
        onError('Veuillez autoriser l\'accès à la caméra pour scanner les QR codes');
      }
    } else if (error.includes('No MultiFormat Readers')) {
      // Erreur normale quand aucun QR code n'est détecté
      console.log('Aucun QR code détecté pour le moment');
    } else {
      if (onError) {
        onError(`Erreur de scan: ${error}`);
      }
    }
  }, [onError]);

  const resetScanner = useCallback(() => {
    setIsScanning(false);
    setScanResult(null);
    
    // Recréer le scanner
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (error) {
        console.log('Erreur lors du nettoyage du scanner:', error);
      }
      scannerRef.current = null;
    }
    
    // Réinitialiser immédiatement
    setTimeout(() => {
      if (!scannerRef.current) {
        try {
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
              showZoomSliderIfSupported: true
            },
            false
          );

          scannerRef.current.render(handleScan, handleError);
        } catch (error) {
          console.error('Erreur lors de la réinitialisation du scanner:', error);
        }
      }
    }, 100);
  }, [handleScan, handleError]);

  useEffect(() => {
    if (scannerRef.current) return;

    try {
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
          showZoomSliderIfSupported: true
        },
        false
      );

      scannerRef.current.render(handleScan, handleError);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du scanner:', error);
      if (onError) {
        onError('Erreur lors de l\'initialisation du scanner de QR code');
      }
    }

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
  }, [handleScan, handleError, onError]);

  return (
    <div className="w-full max-w-md mx-auto">
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
            <button
              onClick={resetScanner}
              className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
            >
              🔄 Nouveau scan
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 