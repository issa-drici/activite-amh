import { NextRequest, NextResponse } from 'next/server';
import { getWorkerAttendance, getWorkerAttendanceCount, getWorkerById } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const workerId = parseInt(resolvedParams.id);
    
    if (isNaN(workerId)) {
      return NextResponse.json(
        { success: false, message: 'ID de travailleur invalide' },
        { status: 400 }
      );
    }
    
    const worker = await getWorkerById(workerId);
    if (!worker) {
      return NextResponse.json(
        { success: false, message: 'Travailleur non trouvé' },
        { status: 404 }
      );
    }
    
    const attendance = await getWorkerAttendance(workerId);
    const attendanceCount = await getWorkerAttendanceCount(workerId);
    
    return NextResponse.json({
      success: true,
      worker,
      attendance,
      totalSessions: attendanceCount.count
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des présences:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 