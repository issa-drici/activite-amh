import { NextRequest, NextResponse } from 'next/server';
import { 
  updateActivityChecklist, 
  getActivityChecklist, 
  getActivityChecklists, 
  ensureDatabaseInitialized 
} from '@/lib/database';

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
    
    const { workerId, departureCheck, returnCheck, comments } = await request.json();
    
    if (workerId === undefined || departureCheck === undefined || returnCheck === undefined) {
      return NextResponse.json(
        { success: false, message: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }
    
    const checklist = await updateActivityChecklist(
      activityId,
      workerId,
      departureCheck,
      returnCheck,
      comments || ''
    );
    
    return NextResponse.json({
      success: true,
      message: 'Feuille de route mise à jour avec succès',
      checklist
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la feuille de route:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur lors de la mise à jour de la feuille de route',
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
    
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get('workerId');
    
    if (workerId) {
      // Récupérer la feuille de route d'un animateur spécifique
      const checklist = await getActivityChecklist(activityId, parseInt(workerId));
      return NextResponse.json({
        success: true,
        checklist
      });
    } else {
      // Récupérer toutes les feuilles de route de l'activité
      const checklists = await getActivityChecklists(activityId);
      return NextResponse.json({
        success: true,
        checklists
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des feuilles de route:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur lors de la récupération des feuilles de route',
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Erreur inconnue' : undefined
      },
      { status: 500 }
    );
  }
} 