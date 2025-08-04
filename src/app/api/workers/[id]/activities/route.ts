import { NextRequest, NextResponse } from 'next/server';
import { getWorkerActivities, ensureDatabaseInitialized } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDatabaseInitialized();
    
    const { id } = await params;
    const workerId = parseInt(id);
    
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
    console.error('Erreur lors de la récupération des activités:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur lors de la récupération des activités',
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Erreur inconnue' : undefined
      },
      { status: 500 }
    );
  }
} 