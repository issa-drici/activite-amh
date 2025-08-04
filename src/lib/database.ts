import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Configuration de la base de données SQLite
const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Log de la configuration
console.log('Configuration SQLite:', {
  dbPath,
  exists: fs.existsSync(dbPath)
});

// Initialiser la base de données
export function initDatabase() {
  console.log('Initialisation de la base de données SQLite...');
  
  return new Promise<void>((resolve, reject) => {
    // Table des admins
    db.run(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Erreur création table admins:', err);
        reject(err);
        return;
      }
      console.log('Table admins créée/vérifiée');

      // Table des travailleurs
      db.run(`
        CREATE TABLE IF NOT EXISTS workers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          qr_code TEXT UNIQUE NOT NULL,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Erreur création table workers:', err);
          reject(err);
          return;
        }
        console.log('Table workers créée/vérifiée');

        // Table des présences
        db.run(`
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
        `, (err) => {
          if (err) {
            console.error('Erreur création table attendance:', err);
            reject(err);
            return;
          }
          console.log('Table attendance créée/vérifiée');

                                // Vérifier et créer les admins par défaut
           db.get('SELECT COUNT(*) as count FROM admins', (err, row: { count: number } | undefined) => {
             if (err) {
               console.error('Erreur comptage admins:', err);
               reject(err);
               return;
             }
             
             if (!row) {
               console.error('Aucun résultat pour le comptage des admins');
               reject(new Error('Aucun résultat pour le comptage des admins'));
               return;
             }
             
             console.log(`Nombre d'admins existants: ${row.count}`);
             
             if (row.count === 0) {
              console.log('Création des admins par défaut...');
              
              const admins = [
                { name: 'Admin Principal', username: 'admin', password: 'admin123' },
                { name: 'Admin 2', username: 'admin2', password: 'admin123' },
                { name: 'Admin 3', username: 'admin3', password: 'admin123' }
              ];
              
              let completed = 0;
              for (const admin of admins) {
                db.run('INSERT INTO admins (name, username, password) VALUES (?, ?, ?)', 
                  [admin.name, admin.username, admin.password], 
                  (err) => {
                    if (err) {
                      console.error(`Erreur création admin ${admin.username}:`, err);
                    } else {
                      console.log(`✅ Admin créé: ${admin.name} (${admin.username})`);
                    }
                    completed++;
                    if (completed === admins.length) {
                      console.log('🎉 Tous les admins par défaut ont été créés avec succès !');
                      resolve();
                    }
                  }
                );
              }
            } else {
              console.log('📋 Admins existants trouvés dans la base de données');
              resolve();
            }
          });
        });
      });
    });
  });
}

// Types pour la base de données
interface Worker {
  id: number;
  name: string;
  qr_code: string;
  username: string;
  password: string;
  created_at: string;
}

interface Admin {
  id: number;
  name: string;
  username: string;
  password: string;
  created_at: string;
}

interface Attendance {
  id: number;
  worker_id: number;
  admin_id: number;
  date: string;
  period: string;
  created_at: string;
}

// Fonctions pour les travailleurs
export function createWorker(name: string, qrCode: string, username: string, password: string): Promise<Worker> {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO workers (name, qr_code, username, password) VALUES (?, ?, ?, ?)', 
      [name, qrCode, username, password], 
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, name, qr_code: qrCode, username, password, created_at: new Date().toISOString() });
      }
    );
  });
}

export function getAllWorkers(): Promise<Worker[]> {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM workers ORDER BY name', (err, rows) => {
      if (err) reject(err);
      else resolve(rows as Worker[]);
    });
  });
}

export function getWorkerByQrCode(qrCode: string): Promise<Worker | null> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM workers WHERE qr_code = ?', [qrCode], (err, row) => {
      if (err) reject(err);
      else resolve(row as Worker || null);
    });
  });
}

export function getWorkerByCredentials(username: string, password: string): Promise<Worker | null> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM workers WHERE username = ? AND password = ?', [username, password], (err, row) => {
      if (err) reject(err);
      else resolve(row as Worker || null);
    });
  });
}

// Fonctions pour les admins
export function getAdminByCredentials(username: string, password: string): Promise<Admin | null> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM admins WHERE username = ? AND password = ?', [username, password], (err, row) => {
      if (err) reject(err);
      else resolve(row as Admin || null);
    });
  });
}

export function getAdminById(id: number): Promise<Admin | null> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM admins WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row as Admin || null);
    });
  });
}

export function getWorkerById(id: number): Promise<Worker | null> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM workers WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row as Worker || null);
    });
  });
}

// Fonctions pour les présences
export function markAttendance(workerId: number, adminId: number, date: string, period: 'morning' | 'afternoon'): Promise<Attendance | null> {
  return new Promise((resolve, reject) => {
    db.run('INSERT OR IGNORE INTO attendance (worker_id, admin_id, date, period) VALUES (?, ?, ?, ?)', 
      [workerId, adminId, date, period], 
      function(err) {
        if (err) reject(err);
        else resolve(this.changes > 0 ? { id: this.lastID, worker_id: workerId, admin_id: adminId, date, period, created_at: new Date().toISOString() } : null);
      }
    );
  });
}

export function getAttendanceByDate(date: string): Promise<Array<{ name: string; period: string; created_at: string; admin_name: string }>> {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT w.name, a.period, a.created_at, adm.name as admin_name
      FROM attendance a
      JOIN workers w ON a.worker_id = w.id
      JOIN admins adm ON a.admin_id = adm.id
      WHERE a.date = ?
      ORDER BY w.name, a.period
    `, [date], (err, rows) => {
      if (err) reject(err);
      else resolve(rows as Array<{ name: string; period: string; created_at: string; admin_name: string }>);
    });
  });
}

export function getWorkerAttendance(workerId: number): Promise<Array<{ date: string; period: string; created_at: string }>> {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT date, period, created_at
      FROM attendance
      WHERE worker_id = ?
      ORDER BY date DESC, period
    `, [workerId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows as Array<{ date: string; period: string; created_at: string }>);
    });
  });
}

export function getWorkerAttendanceCount(workerId: number): Promise<{ count: number }> {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM attendance WHERE worker_id = ?', [workerId], (err, row) => {
      if (err) reject(err);
      else resolve(row as { count: number });
    });
  });
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

// Initialisation au démarrage
initDatabase()
  .then(() => {
    dbInitialized = true;
    console.log('Base de données initialisée avec succès au démarrage');
  })
  .catch((error) => {
    console.error('Erreur lors de l\'initialisation au démarrage:', error);
    // Ne pas faire échouer l'application, on réessaiera lors de la première requête
  });

export default db; 