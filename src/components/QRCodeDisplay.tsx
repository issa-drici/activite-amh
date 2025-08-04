'use client';

import { useEffect, useState } from 'react';
import { generateQrCodeUrl } from '@/lib/qr-utils';

interface QRCodeDisplayProps {
  qrCode: string;
  workerName: string;
}

export default function QRCodeDisplay({ qrCode, workerName }: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    generateQrCodeUrl(qrCode).then(setQrCodeUrl);
  }, [qrCode]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h3 className="text-lg font-semibold text-center mb-4">{workerName}</h3>
      {qrCodeUrl ? (
        <div className="text-center">
          <img
            src={qrCodeUrl}
            alt={`QR Code pour ${workerName}`}
            width={200}
            height={200}
            className="mx-auto mb-4"
          />
          <p className="text-sm text-gray-600 break-all">{qrCode}</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Génération du QR code...</p>
        </div>
      )}
    </div>
  );
} 