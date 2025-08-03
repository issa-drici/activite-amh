'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (qrCode: string) => void;
  onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          if (isScanning) return;
          setIsScanning(true);
          onScan(decodedText);
        },
        (error) => {
          if (onError) {
            onError(error);
          }
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [onScan, onError, isScanning]);

  const resetScanner = () => {
    setIsScanning(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="qr-reader" className="w-full"></div>
      {isScanning && (
        <div className="mt-4 text-center">
          <p className="text-green-600 font-semibold">QR Code détecté !</p>
          <button
            onClick={resetScanner}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Scanner un autre QR code
          </button>
        </div>
      )}
    </div>
  );
} 