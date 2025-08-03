import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Afficher les variables d'environnement (sans les mots de passe sensibles)
    const envInfo = {
      DB_HOST: process.env.DB_HOST || 'NON_DÉFINI',
      DB_PORT: process.env.DB_PORT || 'NON_DÉFINI',
      DB_NAME: process.env.DB_NAME || 'NON_DÉFINI',
      DB_USER: process.env.DB_USER || 'NON_DÉFINI',
      DB_PASSWORD: process.env.DB_PASSWORD ? 'DÉFINI' : 'NON_DÉFINI',
      NODE_ENV: process.env.NODE_ENV || 'NON_DÉFINI',
      // Test de connexion directe
      connectionTest: 'Test en cours...'
    };

    // Test de connexion directe
    try {
      const { Pool } = await import('pg');
      const pool = new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      });

      const client = await pool.connect();
      const result = await client.query('SELECT NOW() as time');
      client.release();
      await pool.end();

      envInfo.connectionTest = `SUCCÈS: ${result.rows[0].time}`;
    } catch (error) {
      envInfo.connectionTest = `ÉCHEC: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
    }

    return NextResponse.json({
      success: true,
      message: 'Informations de debug',
      environment: envInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur debug:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du debug',
      error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Erreur inconnue' : undefined
    }, { status: 500 });
  }
} 