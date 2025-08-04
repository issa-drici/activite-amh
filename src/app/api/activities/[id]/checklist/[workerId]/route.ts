import { NextRequest, NextResponse } from 'next/server';
import { getActivityChecklist } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; workerId: string }> }
) {
  try {
    const resolvedParams = await params;
    const activityId = parseInt(resolvedParams.id);
    const workerId = parseInt(resolvedParams.workerId);

    if (isNaN(activityId) || isNaN(workerId)) {
      return NextResponse.json(
        { success: false, message: 'ID d\'activité ou d\'animateur invalide' },
        { status: 400 }
      );
    }

    const checklist = await getActivityChecklist(activityId, workerId);

    return NextResponse.json({
      success: true,
      checklist: checklist
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la checklist:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 