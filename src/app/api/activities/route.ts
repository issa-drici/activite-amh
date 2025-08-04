import { NextRequest, NextResponse } from 'next/server';
import { createActivity, getAllActivities, ensureDatabaseInitialized, assignWorkerToActivity } from '@/lib/database';

export async function GET() {
  try {
    await ensureDatabaseInitialized();
    
    const activities = await getAllActivities();
    
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

export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    
    const {
      title,
      description,
      location,
      date,
      startTime,
      endTime,
      maxParticipants,
      transportMode,
      category,
      createdBy,
      selectedWorkers
    } = await request.json();
    
    // Validation des données
    if (!title || !location || !date || !startTime || !endTime || !maxParticipants || !transportMode || !category || !createdBy) {
      return NextResponse.json(
        { success: false, message: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }
    
    const activity = await createActivity(
      title,
      description || '',
      location,
      date,
      startTime,
      endTime,
      maxParticipants,
      transportMode,
      category,
      createdBy
    );
    
    // Assigner les animateurs sélectionnés si fournis
    if (selectedWorkers && Array.isArray(selectedWorkers) && selectedWorkers.length > 0) {
      for (const workerId of selectedWorkers) {
        await assignWorkerToActivity(activity.id, workerId);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Activité créée avec succès',
      activity
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'activité:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur lors de la création de l\'activité',
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Erreur inconnue' : undefined
      },
      { status: 500 }
    );
  }
} 