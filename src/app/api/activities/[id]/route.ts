import { NextRequest, NextResponse } from 'next/server';
import { getActivityById, updateActivity, deleteActivity } from '@/lib/database';

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const activityId = parseInt(resolvedParams.id);
    const body = await request.json();

    if (isNaN(activityId)) {
      return NextResponse.json(
        { success: false, message: 'ID d\'activité invalide' },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      location,
      date,
      startTime,
      endTime,
      maxParticipants,
      transportMode,
      category
    } = body;

    if (!title || !location || !date || !startTime || !endTime || !maxParticipants || !transportMode || !category) {
      return NextResponse.json(
        { success: false, message: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    await updateActivity(activityId, {
      title,
      description,
      location,
      date,
      start_time: startTime,
      end_time: endTime,
      max_participants: maxParticipants,
      transport_mode: transportMode,
      category
    });

    return NextResponse.json({
      success: true,
      message: 'Activité mise à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'activité:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await deleteActivity(activityId);

    return NextResponse.json({
      success: true,
      message: 'Activité supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'activité:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 