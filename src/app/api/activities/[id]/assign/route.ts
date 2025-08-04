import { NextRequest, NextResponse } from 'next/server';
import { assignWorkerToActivity, getActivityWorkers, ensureDatabaseInitialized } from '@/lib/database';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDatabaseInitialized();
    
    const { id } = await params;
    const activityId = parseInt(id);
    
    if (isNaN(activityId)) {
      return NextResponse.json(
        { success: false, message: 'ID d\'activité invalide' },
        { status: 400 }
      );
    }
    
    const { workerId } = await request.json();
    
    if (!workerId) {
      return NextResponse.json(
        { success: false, message: 'ID de l\'animateur requis' },
        { status: 400 }
      );
    }
    
    await assignWorkerToActivity(activityId, workerId);
    
    // Récupérer la liste mise à jour des animateurs
    const workers = await getActivityWorkers(activityId);
    
    return NextResponse.json({
      success: true,
      message: 'Animateur attribué avec succès',
      workers
    });
  } catch (error) {
    console.error('Erreur lors de l\'attribution de l\'animateur:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur lors de l\'attribution de l\'animateur',
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Erreur inconnue' : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDatabaseInitialized();
    
    const { id } = await params;
    const activityId = parseInt(id);
    
    if (isNaN(activityId)) {
      return NextResponse.json(
        { success: false, message: 'ID d\'activité invalide' },
        { status: 400 }
      );
    }
    
    const workers = await getActivityWorkers(activityId);
    
    return NextResponse.json({
      success: true,
      workers
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des animateurs:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur lors de la récupération des animateurs',
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Erreur inconnue' : undefined
      },
      { status: 500 }
    );
  }
} 