import { NextRequest, NextResponse } from 'next/server';
import { getActivityById } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const activityId = parseInt(resolvedParams.id);

    if (isNaN(activityId)) {
      return NextResponse.json(
        { success: false, message: 'ID d\'activité invalide' },
        { status: 400 }
      );
    }

    const activity = await getActivityById(activityId);
    
    if (!activity) {
      return NextResponse.json(
        { success: false, message: 'Activité non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      activity
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 