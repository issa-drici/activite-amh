import { Pool } from 'pg';

// Configuration de la base de données PostgreSQL
const pool = new Pool(
  process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false,
  } : {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'scan_pointage',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false,
  }
);

// Log de la configuration (sans les mots de passe)
console.log('Configuration DB:', {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '5432',
  database: process.env.DB_NAME || 'scan_pointage',
  user: process.env.DB_USER || 'postgres',
  ssl: process.env.NODE_ENV === 'production',
  nodeEnv: process.env.NODE_ENV
});

// Initialiser la base de données
export async function initDatabase() {
  console.log('Tentative de connexion à la base de données...');
  
  try {
    const client = await pool.connect();
    console.log('Connexion à PostgreSQL réussie');
    
    try {
      // Table des admins
      await client.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Table admins créée/vérifiée');

      // Table des travailleurs
      await client.query(`
        CREATE TABLE IF NOT EXISTS workers (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          qr_code VARCHAR(255) UNIQUE NOT NULL,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Table workers créée/vérifiée');

      // Table des présences
      await client.query(`
        CREATE TABLE IF NOT EXISTS attendance (
          id SERIAL PRIMARY KEY,
          worker_id INTEGER NOT NULL,
          admin_id INTEGER NOT NULL,
          date DATE NOT NULL,
          period VARCHAR(20) NOT NULL CHECK (period IN ('morning', 'afternoon')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (worker_id) REFERENCES workers (id) ON DELETE CASCADE,
          FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE,
          UNIQUE(worker_id, date, period)
        )
      `);
      console.log('Table attendance créée/vérifiée');

      // Insérer les admins par défaut si la table est vide
      const adminCount = await client.query('SELECT COUNT(*) as count FROM admins');
      const count = parseInt(adminCount.rows[0].count);
      console.log(`Nombre d'admins existants: ${count}`);
      
      if (count === 0) {
        console.log('Création des admins par défaut...');
        
        // Créer les trois admins par défaut
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
        
        console.log('🎉 Tous les admins par défaut ont été créés avec succès !');
      } else {
        console.log('📋 Admins existants trouvés dans la base de données');
        
        // Lister les admins existants
        const existingAdmins = await client.query('SELECT name, username FROM admins ORDER BY id');
        existingAdmins.rows.forEach((admin, index) => {
          console.log(`  ${index + 1}. ${admin.name} (${admin.username})`);
        });
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
}

// Fonctions pour les travailleurs
export async function createWorker(name: string, qrCode: string, username: string, password: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO workers (name, qr_code, username, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, qrCode, username, password]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getAllWorkers() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM workers ORDER BY name');
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getWorkerByQrCode(qrCode: string) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM workers WHERE qr_code = $1', [qrCode]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function getWorkerByCredentials(username: string, password: string) {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM workers WHERE username = $1 AND password = $2',
        [username, password]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des credentials worker:', error);
    throw error;
  }
}

// Fonctions pour les admins
export async function getAdminByCredentials(username: string, password: string) {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM admins WHERE username = $1 AND password = $2',
        [username, password]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des credentials admin:', error);
    throw error;
  }
}

export async function getAdminById(id: number) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM admins WHERE id = $1', [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function getWorkerById(id: number) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM workers WHERE id = $1', [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Fonctions pour les présences
export async function markAttendance(workerId: number, adminId: number, date: string, period: 'morning' | 'afternoon') {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO attendance (worker_id, admin_id, date, period) VALUES ($1, $2, $3, $4) ON CONFLICT (worker_id, date, period) DO NOTHING RETURNING *',
      [workerId, adminId, date, period]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function getAttendanceByDate(date: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT w.name, a.period, a.created_at, adm.name as admin_name
      FROM attendance a
      JOIN workers w ON a.worker_id = w.id
      JOIN admins adm ON a.admin_id = adm.id
      WHERE a.date = $1
      ORDER BY w.name, a.period
    `, [date]);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getWorkerAttendance(workerId: number) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT date, period, created_at
      FROM attendance
      WHERE worker_id = $1
      ORDER BY date DESC, period
    `, [workerId]);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getWorkerAttendanceCount(workerId: number) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT COUNT(*) as count FROM attendance WHERE worker_id = $1', [workerId]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Initialiser la base de données au démarrage
let dbInitialized = false;

export async function ensureDatabaseInitialized() {
  if (!dbInitialized) {
    try {
      await initDatabase();
      dbInitialized = true;
      console.log('Base de données initialisée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la base de données:', error);
      throw error;
    }
  }
}

// Initialisation au démarrage (non-bloquante)
initDatabase()
  .then(() => {
    dbInitialized = true;
    console.log('Base de données initialisée avec succès au démarrage');
  })
  .catch((error) => {
    console.error('Erreur lors de l\'initialisation au démarrage:', error);
    // Ne pas faire échouer l'application, on réessaiera lors de la première requête
  });

export default pool; 