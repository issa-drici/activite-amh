import { NextRequest, NextResponse } from 'next/server';
import { createWorker, getAllWorkers } from '@/lib/database';
import { generateWorkerQrCode } from '@/lib/qr-utils';

export async function GET() {
  try {
    const workers = await getAllWorkers();
    return NextResponse.json({ success: true, workers });
  } catch (error) {
    console.error('Erreur lors de la récupération des travailleurs:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, username, password } = await request.json();
    
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Le nom est requis' },
        { status: 400 }
      );
    }
    
    if (!username || username.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Le nom d\'utilisateur est requis' },
        { status: 400 }
      );
    }
    
    if (!password || password.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Le mot de passe est requis' },
        { status: 400 }
      );
    }
    
    const qrCode = generateWorkerQrCode();
    const result = await createWorker(name.trim(), qrCode, username.trim(), password.trim());
    
    return NextResponse.json({
      success: true,
      worker: {
        id: result.id,
        name: name.trim(),
        username: username.trim(),
        qr_code: qrCode
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du travailleur:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 