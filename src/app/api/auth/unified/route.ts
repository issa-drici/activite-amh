import { NextRequest, NextResponse } from 'next/server';
import { getAdminByCredentials, getWorkerByCredentials } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Nom d\'utilisateur et mot de passe requis' },
        { status: 400 }
      );
    }
    
    // Essayer d'abord de se connecter en tant qu'admin
    const admin = getAdminByCredentials(username, password);
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
    const worker = getWorkerByCredentials(username, password);
    if (worker) {
      return NextResponse.json({ 
        success: true, 
        message: 'Connexion travailleur réussie',
        userType: 'worker',
        user: {
          id: worker.id,
          name: worker.name,
          username: worker.username
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
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 