import { NextRequest, NextResponse } from 'next/server';
import { deleteAttendance } from '@/lib/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const attendanceId = parseInt(resolvedParams.id);
    
    if (isNaN(attendanceId)) {
      return NextResponse.json(
        { success: false, message: 'ID de présence invalide' },
        { status: 400 }
      );
    }
    
    const deleted = await deleteAttendance(attendanceId);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Présence non trouvée ou déjà supprimée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Présence supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la présence:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
