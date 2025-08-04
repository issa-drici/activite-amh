import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Configuration de la base de données SQLite
// Utiliser un répertoire persistant pour la production
const projectName = process.env.PROJECT_NAME || 'scan-pointage';
const dbPath = process.env.NODE_ENV === 'production' 
  ? path.join('/data', projectName, 'database.sqlite')
  : path.join(process.cwd(), 'database.sqlite');

// Créer le répertoire /data/{projectName} s'il n'existe pas (en production)
if (process.env.NODE_ENV === 'production') {
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}
const db = new sqlite3.Database(dbPath);

// Log de la configuration
console.log('Configuration SQLite:', {
  dbPath,
  exists: fs.existsSync(dbPath),
  nodeEnv: process.env.NODE_ENV
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
                      
                      // Créer les tables pour les activités
                      createActivityTables().then(() => {
                        resolve();
                      }).catch((error) => {
                        console.error('Erreur création tables activités:', error);
                        reject(error);
                      });
                    }
                  }
                );
              }
            } else {
              console.log('📋 Admins existants trouvés dans la base de données');
              
              // Créer les tables pour les activités
              createActivityTables().then(() => {
                resolve();
              }).catch((error: Error) => {
                console.error('Erreur création tables activités:', error);
                reject(error);
              });
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

interface Activity {
  id: number;
  title: string;
  description?: string;
  location: string;
  date: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  transport_mode: string;
  category: string;
  created_by: number;
  created_at: string;
}

interface ActivityWorker {
  id: number;
  activity_id: number;
  worker_id: number;
  assigned_at: string;
}

interface ActivityChecklist {
  id: number;
  activity_id: number;
  worker_id: number;
  departure_check: boolean;
  return_check: boolean;
  comments: string;
  mood: 'happy' | 'neutral' | 'sad';
  last_updated: string;
}

// Fonction pour créer les tables d'activités
function createActivityTables(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Table des activités
    db.run(`
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        location TEXT NOT NULL,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        max_participants INTEGER NOT NULL,
        transport_mode TEXT NOT NULL,
        category TEXT NOT NULL,
        created_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES admins (id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('Erreur création table activities:', err);
        reject(err);
        return;
      }
      console.log('Table activities créée/vérifiée');

      // Table des attributions d'animateurs
      db.run(`
        CREATE TABLE IF NOT EXISTS activity_workers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          activity_id INTEGER NOT NULL,
          worker_id INTEGER NOT NULL,
          assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE CASCADE,
          FOREIGN KEY (worker_id) REFERENCES workers (id) ON DELETE CASCADE,
          UNIQUE(activity_id, worker_id)
        )
      `, (err) => {
        if (err) {
          console.error('Erreur création table activity_workers:', err);
          reject(err);
          return;
        }
        console.log('Table activity_workers créée/vérifiée');

        // Table des feuilles de route
        db.run(`
          CREATE TABLE IF NOT EXISTS activity_checklists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            activity_id INTEGER NOT NULL,
            worker_id INTEGER NOT NULL,
            departure_check BOOLEAN DEFAULT FALSE,
            return_check BOOLEAN DEFAULT FALSE,
            comments TEXT NOT NULL,
            mood TEXT NOT NULL DEFAULT 'neutral',
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE CASCADE,
            FOREIGN KEY (worker_id) REFERENCES workers (id) ON DELETE CASCADE,
            UNIQUE(activity_id, worker_id)
          )
        `, (err) => {
          if (err) {
            console.error('Erreur création table activity_checklists:', err);
            reject(err);
            return;
          }
          console.log('Table activity_checklists créée/vérifiée');
          resolve();
        });
      });
    });
  });
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

export function getAllAttendance(): Promise<Array<{ 
  worker_id: number; 
  worker_name: string; 
  worker_username: string; 
  date: string; 
  period: string; 
  created_at: string; 
  admin_name: string 
}>> {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        a.worker_id,
        w.name as worker_name,
        w.username as worker_username,
        a.date,
        a.period,
        a.created_at,
        adm.name as admin_name
      FROM attendance a
      JOIN workers w ON a.worker_id = w.id
      JOIN admins adm ON a.admin_id = adm.id
      ORDER BY a.date DESC, w.name, a.period
    `, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as Array<{ 
        worker_id: number; 
        worker_name: string; 
        worker_username: string; 
        date: string; 
        period: string; 
        created_at: string; 
        admin_name: string 
      }>);
    });
  });
}

// Fonctions pour les activités
export function createActivity(
  title: string,
  description: string,
  location: string,
  date: string,
  startTime: string,
  endTime: string,
  maxParticipants: number,
  transportMode: string,
  category: string,
  createdBy: number
): Promise<Activity> {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO activities (title, description, location, date, start_time, end_time, max_participants, transport_mode, category, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, location, date, startTime, endTime, maxParticipants, transportMode, category, createdBy], 
    function(err) {
      if (err) reject(err);
      else resolve({
        id: this.lastID,
        title,
        description,
        location,
        date,
        start_time: startTime,
        end_time: endTime,
        max_participants: maxParticipants,
        transport_mode: transportMode,
        category,
        created_by: createdBy,
        created_at: new Date().toISOString()
      });
    });
  });
}

export function getAllActivities(): Promise<Array<Activity & { created_by_name: string }>> {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT a.*, adm.name as created_by_name
      FROM activities a
      JOIN admins adm ON a.created_by = adm.id
      ORDER BY a.date DESC, a.start_time
    `, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as Array<Activity & { created_by_name: string }>);
    });
  });
}

export async function getActivityById(id: number): Promise<Activity & { created_by_name: string } | null> {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT a.*, adm.name as created_by_name
      FROM activities a
      LEFT JOIN admins adm ON a.created_by = adm.id
      WHERE a.id = ?
    `, [id], (err, row) => {
      if (err) reject(err);
      else resolve(row as Activity & { created_by_name: string } | null);
    });
  });
}

export function assignWorkerToActivity(activityId: number, workerId: number): Promise<ActivityWorker> {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO activity_workers (activity_id, worker_id)
      VALUES (?, ?)
    `, [activityId, workerId], 
    function(err) {
      if (err) reject(err);
      else resolve({
        id: this.lastID,
        activity_id: activityId,
        worker_id: workerId,
        assigned_at: new Date().toISOString()
      });
    });
  });
}

export function getActivityWorkers(activityId: number): Promise<Array<{ worker_id: number; worker_name: string; assigned_at: string }>> {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT w.id as worker_id, w.name as worker_name, aw.assigned_at
      FROM workers w
      JOIN activity_workers aw ON w.id = aw.worker_id
      WHERE aw.activity_id = ?
      ORDER BY w.name
    `, [activityId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows as Array<{ worker_id: number; worker_name: string; assigned_at: string }>);
    });
  });
}

export function getWorkerActivities(workerId: number): Promise<Array<Activity & { created_by_name: string }>> {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT a.*, adm.name as created_by_name
      FROM activities a
      JOIN admins adm ON a.created_by = adm.id
      JOIN activity_workers aw ON a.id = aw.activity_id
      WHERE aw.worker_id = ?
      ORDER BY a.date DESC, a.start_time
    `, [workerId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows as Array<Activity & { created_by_name: string }>);
    });
  });
}

export function updateActivityChecklist(
  activityId: number,
  workerId: number,
  departureCheck: boolean,
  returnCheck: boolean,
  comments: string,
  mood: 'happy' | 'neutral' | 'sad'
): Promise<ActivityChecklist> {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT OR REPLACE INTO activity_checklists (activity_id, worker_id, departure_check, return_check, comments, mood, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [activityId, workerId, departureCheck, returnCheck, comments, mood, new Date().toISOString()], 
    function(err) {
      if (err) reject(err);
      else resolve({
        id: this.lastID,
        activity_id: activityId,
        worker_id: workerId,
        departure_check: departureCheck,
        return_check: returnCheck,
        comments,
        mood,
        last_updated: new Date().toISOString()
      });
    });
  });
}

export function getActivityChecklist(activityId: number, workerId: number): Promise<ActivityChecklist | null> {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT * FROM activity_checklists
      WHERE activity_id = ? AND worker_id = ?
    `, [activityId, workerId], (err, row) => {
      if (err) reject(err);
      else resolve(row as ActivityChecklist | null);
    });
  });
}

export function getActivityChecklists(activityId: number): Promise<Array<ActivityChecklist & { worker_name: string }>> {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT ac.*, w.name as worker_name
      FROM activity_checklists ac
      JOIN workers w ON ac.worker_id = w.id
      WHERE ac.activity_id = ?
      ORDER BY w.name
    `, [activityId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows as Array<ActivityChecklist & { worker_name: string }>);
    });
  });
}

export async function removeWorkerFromActivity(activityId: number, workerId: number): Promise<void> {
  try {
    const stmt = db.prepare('DELETE FROM activity_workers WHERE activity_id = ? AND worker_id = ?');
    stmt.run(activityId, workerId);
  } catch (error) {
    console.error('Erreur lors du retrait de l\'animateur:', error);
    throw error;
  }
}

export async function updateActivity(activityId: number, activityData: {
  title: string;
  description?: string;
  location: string;
  date: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  transport_mode: string;
  category: string;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(`
      UPDATE activities 
      SET title = ?, description = ?, location = ?, date = ?, 
          start_time = ?, end_time = ?, max_participants = ?, 
          transport_mode = ?, category = ?
      WHERE id = ?
    `, [
      activityData.title,
      activityData.description || null,
      activityData.location,
      activityData.date,
      activityData.start_time,
      activityData.end_time,
      activityData.max_participants,
      activityData.transport_mode,
      activityData.category,
      activityId
    ], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function deleteActivity(activityId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    // Supprimer d'abord les assignations d'animateurs
    db.run('DELETE FROM activity_workers WHERE activity_id = ?', [activityId], (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Puis supprimer l'activité
      db.run('DELETE FROM activities WHERE id = ?', [activityId], (err) => {
        if (err) reject(err);
        else resolve();
      });
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