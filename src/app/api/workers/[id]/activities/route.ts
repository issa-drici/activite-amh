import { NextRequest, NextResponse } from 'next/server';
import { getWorkerActivities } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const workerId = parseInt(resolvedParams.id);

    if (isNaN(workerId)) {
      return NextResponse.json(
        { success: false, message: 'ID d\'animateur invalide' },
        { status: 400 }
      );
    }

    const activities = await getWorkerActivities(workerId);

    return NextResponse.json({
      success: true,
      activities
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des activités de l\'animateur:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 