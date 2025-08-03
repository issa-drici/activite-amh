const { Pool } = require('pg');

// Configuration PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'scan_pointage',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function initAdmins() {
  console.log('🔧 Initialisation des admins...');
  
  try {
    const client = await pool.connect();
    
    try {
      // Vérifier si la table admins existe
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'admins'
        );
      `);
      
      if (!tableExists.rows[0].exists) {
        console.log('📋 Création de la table admins...');
        await client.query(`
          CREATE TABLE admins (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log('✅ Table admins créée');
      }
      
      // Compter les admins existants
      const adminCount = await client.query('SELECT COUNT(*) as count FROM admins');
      const count = parseInt(adminCount.rows[0].count);
      console.log(`📊 Nombre d'admins existants: ${count}`);
      
      if (count === 0) {
        console.log('👥 Création des admins par défaut...');
        
        const admins = [
          { name: 'Admin Principal', username: 'admin', password: 'admin123' },
          { name: 'Admin 2', username: 'admin2', password: 'admin123' },
          { name: 'Admin 3', username: 'admin3', password: 'admin123' }
        ];
        
        for (const admin of admins) {
          await client.query(
            'INSERT INTO admins (name, username, password) VALUES ($1, $2, $3)',
            [admin.name, admin.username, admin.password]
          );
          console.log(`✅ Admin créé: ${admin.name} (${admin.username})`);
        }
        
        console.log('🎉 Tous les admins ont été créés avec succès !');
      } else {
        console.log('📋 Admins existants:');
        const existingAdmins = await client.query('SELECT id, name, username FROM admins ORDER BY id');
        existingAdmins.rows.forEach((admin, index) => {
          console.log(`  ${index + 1}. [ID: ${admin.id}] ${admin.name} (${admin.username})`);
        });
      }
      
      // Afficher les informations de connexion
      console.log('\n🔑 Informations de connexion:');
      console.log('  Username: admin, admin2, ou admin3');
      console.log('  Password: admin123');
      
    } finally {
      client.release();
    }
    
    await pool.end();
    console.log('✅ Script terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

initAdmins(); 