import { NextRequest, NextResponse } from 'next/server';
import { markAttendance, getAttendanceByDate, getWorkerByQrCode } from '@/lib/database';
import { isValidWorkerQrCode } from '@/lib/qr-utils';

interface Worker {
  id: number;
  name: string;
  qr_code: string;
}

export async function POST(request: NextRequest) {
  try {
    const { qrCode, date, period, adminId } = await request.json();
    
    if (!qrCode || !date || !period || !adminId) {
      return NextResponse.json(
        { success: false, message: 'QR code, date, période et admin requis' },
        { status: 400 }
      );
    }
    
    if (!isValidWorkerQrCode(qrCode)) {
      return NextResponse.json(
        { success: false, message: 'QR code invalide' },
        { status: 400 }
      );
    }
    
    if (!['morning', 'afternoon'].includes(period)) {
      return NextResponse.json(
        { success: false, message: 'Période invalide' },
        { status: 400 }
      );
    }
    
    const worker = await getWorkerByQrCode(qrCode) as Worker | undefined;
    if (!worker) {
      return NextResponse.json(
        { success: false, message: 'Travailleur non trouvé' },
        { status: 404 }
      );
    }
    
    await markAttendance(worker.id, adminId, date, period);
    
    return NextResponse.json({
      success: true,
      message: `Présence enregistrée pour ${worker.name}`,
      worker: worker.name,
      period: period === 'morning' ? 'matin' : 'après-midi'
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la présence:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json(
        { success: false, message: 'Date requise' },
        { status: 400 }
      );
    }
    
    const attendance = await getAttendanceByDate(date);
    return NextResponse.json({ success: true, attendance });
  } catch (error) {
    console.error('Erreur lors de la récupération des présences:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 