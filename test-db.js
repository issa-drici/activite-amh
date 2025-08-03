const { Pool } = require('pg');

// Configuration de test
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'scan_pointage',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function testConnection() {
  console.log('🔍 Test de connexion PostgreSQL...');
  console.log('Configuration:', {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '5432',
    database: process.env.DB_NAME || 'scan_pointage',
    user: process.env.DB_USER || 'postgres',
    ssl: process.env.NODE_ENV === 'production',
    nodeEnv: process.env.NODE_ENV
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connexion réussie !');
    
    const result = await client.query('SELECT NOW() as time, version() as version');
    console.log('📅 Heure serveur:', result.rows[0].time);
    console.log('🐘 Version PostgreSQL:', result.rows[0].version.split(' ')[0]);
    
    client.release();
    await pool.end();
    
    console.log('✅ Test terminé avec succès !');
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testConnection(); 