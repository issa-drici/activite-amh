import { v4 as uuidv4 } from 'uuid';

// Générer un QR code unique pour un travailleur
export function generateWorkerQrCode(): string {
  return `WORKER_${uuidv4()}`;
}

// Générer l'URL du QR code
export async function generateQrCodeUrl(qrCode: string): Promise<string> {
  try {
    // Utiliser une API externe pour générer le QR code
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCode)}`;
    return qrCodeUrl;
  } catch (error) {
    console.error('Erreur lors de la génération du QR code:', error);
    throw error;
  }
}

// Valider le format d'un QR code
export function isValidWorkerQrCode(qrCode: string): boolean {
  return qrCode.startsWith('WORKER_') && qrCode.length > 7;
} 