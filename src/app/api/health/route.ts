import { NextResponse } from 'next/server';
import pool from '@/lib/database';

export async function GET() {
  try {
    console.log('Test de connexion à la base de données...');
    
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT NOW() as current_time, version() as version');
      console.log('Connexion réussie:', result.rows[0]);
      
      return NextResponse.json({
        success: true,
        message: 'Base de données accessible',
        timestamp: result.rows[0].current_time,
        version: result.rows[0].version.split(' ')[0] // Juste la version PostgreSQL
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erreur de connexion à la base de données',
      error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Erreur inconnue' : undefined
    }, { status: 500 });
  }
} 