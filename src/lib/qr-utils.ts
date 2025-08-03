import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

// Générer un QR code unique pour un travailleur
export function generateWorkerQrCode(): string {
  return `WORKER_${uuidv4()}`;
}

// Générer l'URL du QR code
export async function generateQrCodeUrl(qrCode: string): Promise<string> {
  try {
    return await QRCode.toDataURL(qrCode, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.error('Erreur lors de la génération du QR code:', error);
    throw error;
  }
}

// Valider le format d'un QR code
export function isValidWorkerQrCode(qrCode: string): boolean {
  return qrCode.startsWith('WORKER_') && qrCode.length > 7;
} 