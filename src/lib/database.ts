import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Configuration de la base de données SQLite
const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Log de la configuration
console.log('Configuration SQLite:', {
  dbPath,
  exists: fs.existsSync(dbPath)
});

// Initialiser la base de données
export function initDatabase() {
  console.log('Initialisation de la base de données SQLite...');
  
  try {
    // Table des admins
    db.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table admins créée/vérifiée');

    // Table des travailleurs
    db.exec(`
      CREATE TABLE IF NOT EXISTS workers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        qr_code TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table workers créée/vérifiée');

    // Table des présences
    db.exec(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        worker_id INTEGER NOT NULL,
        admin_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        period TEXT NOT NULL CHECK (period IN ('morning', 'afternoon')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (worker_id) REFERENCES workers (id) ON DELETE CASCADE,
        FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE,
        UNIQUE(worker_id, date, period)
      )
    `);
    console.log('Table attendance créée/vérifiée');

    // Insérer les admins par défaut si la table est vide
    const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get() as { count: number };
    console.log(`Nombre d'admins existants: ${adminCount.count}`);
    
    if (adminCount.count === 0) {
      console.log('Création des admins par défaut...');
      
      // Créer les trois admins par défaut
      const admins = [
        { name: 'Admin Principal', username: 'admin', password: 'admin123' },
        { name: 'Admin 2', username: 'admin2', password: 'admin123' },
        { name: 'Admin 3', username: 'admin3', password: 'admin123' }
      ];
      
      const insertAdmin = db.prepare('INSERT INTO admins (name, username, password) VALUES (?, ?, ?)');
      
      for (const admin of admins) {
        insertAdmin.run(admin.name, admin.username, admin.password);
        console.log(`✅ Admin créé: ${admin.name} (${admin.username})`);
      }
      
      console.log('🎉 Tous les admins par défaut ont été créés avec succès !');
    } else {
      console.log('📋 Admins existants trouvés dans la base de données');
      
      // Lister les admins existants
      const existingAdmins = db.prepare('SELECT name, username FROM admins ORDER BY id').all() as Array<{ name: string; username: string }>;
      existingAdmins.forEach((admin, index) => {
        console.log(`  ${index + 1}. ${admin.name} (${admin.username})`);
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
}

// Fonctions pour les travailleurs
export function createWorker(name: string, qrCode: string, username: string, password: string) {
  const stmt = db.prepare('INSERT INTO workers (name, qr_code, username, password) VALUES (?, ?, ?, ?)');
  const result = stmt.run(name, qrCode, username, password);
  return { id: result.lastInsertRowid, name, qr_code: qrCode, username, password };
}

export function getAllWorkers() {
  return db.prepare('SELECT * FROM workers ORDER BY name').all();
}

export function getWorkerByQrCode(qrCode: string) {
  return db.prepare('SELECT * FROM workers WHERE qr_code = ?').get(qrCode) || null;
}

export function getWorkerByCredentials(username: string, password: string) {
  try {
    return db.prepare('SELECT * FROM workers WHERE username = ? AND password = ?').get(username, password) || null;
  } catch (error) {
    console.error('Erreur lors de la vérification des credentials worker:', error);
    throw error;
  }
}

// Fonctions pour les admins
export function getAdminByCredentials(username: string, password: string) {
  try {
    return db.prepare('SELECT * FROM admins WHERE username = ? AND password = ?').get(username, password) || null;
  } catch (error) {
    console.error('Erreur lors de la vérification des credentials admin:', error);
    throw error;
  }
}

export function getAdminById(id: number) {
  return db.prepare('SELECT * FROM admins WHERE id = ?').get(id) || null;
}

export function getWorkerById(id: number) {
  return db.prepare('SELECT * FROM workers WHERE id = ?').get(id) || null;
}

// Fonctions pour les présences
export function markAttendance(workerId: number, adminId: number, date: string, period: 'morning' | 'afternoon') {
  const stmt = db.prepare('INSERT OR IGNORE INTO attendance (worker_id, admin_id, date, period) VALUES (?, ?, ?, ?)');
  const result = stmt.run(workerId, adminId, date, period);
  return result.changes > 0 ? { id: result.lastInsertRowid, worker_id: workerId, admin_id: adminId, date, period } : null;
}

export function getAttendanceByDate(date: string) {
  return db.prepare(`
    SELECT w.name, a.period, a.created_at, adm.name as admin_name
    FROM attendance a
    JOIN workers w ON a.worker_id = w.id
    JOIN admins adm ON a.admin_id = adm.id
    WHERE a.date = ?
    ORDER BY w.name, a.period
  `).all(date);
}

export function getWorkerAttendance(workerId: number) {
  return db.prepare(`
    SELECT date, period, created_at
    FROM attendance
    WHERE worker_id = ?
    ORDER BY date DESC, period
  `).all(workerId);
}

export function getWorkerAttendanceCount(workerId: number) {
  return db.prepare('SELECT COUNT(*) as count FROM attendance WHERE worker_id = ?').get(workerId);
}

// Initialiser la base de données au démarrage
let dbInitialized = false;

export function ensureDatabaseInitialized() {
  if (!dbInitialized) {
    try {
      initDatabase();
      dbInitialized = true;
      console.log('Base de données initialisée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la base de données:', error);
      throw error;
    }
  }
}

// Initialisation au démarrage
try {
  initDatabase();
  dbInitialized = true;
  console.log('Base de données initialisée avec succès au démarrage');
} catch (error) {
  console.error('Erreur lors de l\'initialisation au démarrage:', error);
  // Ne pas faire échouer l'application, on réessaiera lors de la première requête
}

export default db; 