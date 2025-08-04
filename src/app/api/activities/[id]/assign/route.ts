import { NextRequest, NextResponse } from 'next/server';
import { assignWorkerToActivity, getActivityWorkers, removeWorkerFromActivity } from '@/lib/database';

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

    const assignedWorkers = await getActivityWorkers(activityId);

    return NextResponse.json({
      success: true,
      assignedWorkers
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des animateurs assignés:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const activityId = parseInt(resolvedParams.id);
    const { workerId } = await request.json();

    if (isNaN(activityId) || !workerId) {
      return NextResponse.json(
        { success: false, message: 'Données invalides' },
        { status: 400 }
      );
    }

    await assignWorkerToActivity(activityId, workerId);

    return NextResponse.json({
      success: true,
      message: 'Animateur assigné avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de l\'attribution de l\'animateur:', error);
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
    const { workerId } = await request.json();

    if (isNaN(activityId) || !workerId) {
      return NextResponse.json(
        { success: false, message: 'Données invalides' },
        { status: 400 }
      );
    }

    await removeWorkerFromActivity(activityId, workerId);

    return NextResponse.json({
      success: true,
      message: 'Animateur retiré avec succès'
    });

  } catch (error) {
    console.error('Erreur lors du retrait de l\'animateur:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 