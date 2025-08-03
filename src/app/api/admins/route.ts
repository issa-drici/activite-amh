import { NextResponse } from 'next/server';
import { ensureDatabaseInitialized } from '@/lib/database';

export async function GET() {
  try {
    // S'assurer que la base de données est initialisée
    await ensureDatabaseInitialized();
    
    const { Pool } = await import('pg');
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'scan_pointage',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    const client = await pool.connect();
    try {
      // Récupérer tous les admins (sans les mots de passe)
      const result = await client.query(
        'SELECT id, name, username, created_at FROM admins ORDER BY id'
      );
      
      return NextResponse.json({
        success: true,
        message: 'Liste des admins récupérée avec succès',
        count: result.rows.length,
        admins: result.rows
      });
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des admins:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de la récupération des admins',
      error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Erreur inconnue' : undefined
    }, { status: 500 });
  }
} 