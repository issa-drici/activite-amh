import { NextResponse } from 'next/server';
import { getAllAttendance, ensureDatabaseInitialized } from '@/lib/database';

export async function GET() {
  try {
    // S'assurer que la base de données est initialisée
    await ensureDatabaseInitialized();
    
    // Récupérer toutes les présences
    const attendance = await getAllAttendance();
    
    // Créer le contenu CSV
    const csvHeaders = [
      'ID',
      'Nom du travailleur',
      'Nom d\'utilisateur',
      'Date',
      'Période',
      'Admin qui a pointé',
      'Date et heure de pointage'
    ];
    
    const csvRows = attendance.map(record => [
      record.worker_id,
      record.worker_name,
      record.worker_username,
      record.date,
      record.period === 'morning' ? 'Matin' : 'Après-midi',
      record.admin_name,
      new Date(record.created_at).toLocaleString('fr-FR', {
        timeZone: 'Europe/Paris',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    ]);
    
    // Construire le CSV
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Ajouter le BOM pour l'encodage UTF-8 correct dans Excel
    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;
    
    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="presences_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'export CSV:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur lors de l\'export des présences',
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Erreur inconnue' : undefined
      },
      { status: 500 }
    );
  }
} 