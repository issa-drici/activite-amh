const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Chemin vers la base de données
const dbPath = path.join(__dirname, 'database.sqlite');

// Créer une nouvelle connexion à la base de données
const db = new sqlite3.Database(dbPath);

// Fonction pour exécuter une requête SQL
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('Erreur SQL:', err);
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

// Fonction pour récupérer des données
function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('Erreur SQL:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Fonction pour récupérer toutes les données
function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Erreur SQL:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function initTestData() {
  try {
    console.log('🚀 Initialisation des données de test...');

    // Vérifier si les tables existent
    const tables = await allQuery(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('admins', 'workers', 'attendance')
    `);
    
    console.log('Tables existantes:', tables.map(t => t.name));

    // Créer les admins de test
    const adminData = [
      { name: 'Admin Principal', username: 'admin', password: 'admin123' },
      { name: 'Admin Secondaire', username: 'admin2', password: 'admin456' },
      { name: 'Admin Tertiaire', username: 'admin3', password: 'admin789' }
    ];

    for (const admin of adminData) {
      const existingAdmin = await getQuery('SELECT id FROM admins WHERE username = ?', [admin.username]);
      if (!existingAdmin) {
        await runQuery(
          'INSERT INTO admins (name, username, password) VALUES (?, ?, ?)',
          [admin.name, admin.username, admin.password]
        );
        console.log(`✅ Admin créé: ${admin.name} (${admin.username})`);
      } else {
        console.log(`ℹ️ Admin existe déjà: ${admin.name} (${admin.username})`);
      }
    }

    // Créer les travailleurs de test
    const workerData = [
      { name: 'Yasmine', username: 'yas1305', password: 'yas123' },
      { name: 'Mohammed', username: 'moh123', password: 'moh456' },
      { name: 'Fatima', username: 'fat789', password: 'fat123' },
      { name: 'Ahmed', username: 'ahm456', password: 'ahm789' },
      { name: 'Amina', username: 'ami321', password: 'ami654' }
    ];

    for (const worker of workerData) {
      const existingWorker = await getQuery('SELECT id FROM workers WHERE username = ?', [worker.username]);
      if (!existingWorker) {
        const qrCode = `WORKER_${uuidv4()}`;
        await runQuery(
          'INSERT INTO workers (name, username, password, qr_code) VALUES (?, ?, ?, ?)',
          [worker.name, worker.username, worker.password, qrCode]
        );
        console.log(`✅ Travailleur créé: ${worker.name} (${worker.username}) - QR: ${qrCode}`);
      } else {
        console.log(`ℹ️ Travailleur existe déjà: ${worker.name} (${worker.username})`);
      }
    }

    // Afficher les données créées
    console.log('\n📊 Données dans la base:');
    
    const admins = await allQuery('SELECT id, name, username FROM admins');
    console.log('Admins:', admins);
    
    const workers = await allQuery('SELECT id, name, username, qr_code FROM workers');
    console.log('Travailleurs:', workers);

    console.log('\n✅ Initialisation terminée avec succès !');
    console.log('\n🔑 Identifiants de test:');
    console.log('Admin: admin / admin123');
    console.log('Travailleur: yas1305 / yas123');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  } finally {
    db.close();
  }
}

// Exécuter le script
initTestData(); 