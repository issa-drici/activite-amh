import { NextRequest, NextResponse } from 'next/server';
import { getWorkerChecklists, ensureDatabaseInitialized } from '@/lib/database';

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
    
    const checklists = await getWorkerChecklists(workerId);
    
    return NextResponse.json({
      success: true,
      checklists
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des checklists:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 