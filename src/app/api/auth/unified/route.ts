import { NextRequest, NextResponse } from 'next/server';
import { getAdminByCredentials, getWorkerByCredentials, ensureDatabaseInitialized } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // S'assurer que la base de données est initialisée
    await ensureDatabaseInitialized();
    
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Nom d\'utilisateur et mot de passe requis' },
        { status: 400 }
      );
    }
    
    // Essayer d'abord de se connecter en tant qu'admin
    const admin = await getAdminByCredentials(username, password);
    if (admin) {
      return NextResponse.json({ 
        success: true, 
        message: 'Connexion admin réussie',
        userType: 'admin',
        user: {
          id: admin.id,
          name: admin.name,
          username: admin.username
        }
      });
    }
    
    // Essayer ensuite de se connecter en tant que travailleur
    const worker = await getWorkerByCredentials(username, password);
    if (worker) {
      return NextResponse.json({ 
        success: true, 
        message: 'Connexion travailleur réussie',
        userType: 'worker',
        user: {
          id: worker.id,
          name: worker.name,
          username: worker.username,
          qr_code: worker.qr_code
        }
      });
    }
    
    // Aucune correspondance trouvée
    return NextResponse.json(
      { success: false, message: 'Identifiants incorrects' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    
    // Log détaillé pour le diagnostic
    if (error instanceof Error) {
      console.error('Message d\'erreur:', error.message);
      console.error('Stack trace:', error.stack);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur serveur',
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Erreur inconnue' : undefined
      },
      { status: 500 }
    );
  }
} 