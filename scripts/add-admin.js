const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Configuration de la base de données
const projectName = process.env.PROJECT_NAME || 'scan-pointage';
const dbPath = process.env.NODE_ENV === 'production' 
  ? `/data/${projectName}/database.sqlite`
  : path.join(process.cwd(), 'database.sqlite');

console.log('👤 Ajout d\'un nouvel administrateur...');
console.log(`📁 Chemin de la base de données: ${dbPath}`);

// Vérifier que la base de données existe
if (!fs.existsSync(dbPath)) {
  console.error('❌ Base de données non trouvée:', dbPath);
  process.exit(1);
}

// Créer une connexion à la base de données existante
const db = new sqlite3.Database(dbPath);

// Fonction pour exécuter des requêtes SQL
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

// Fonction pour vérifier si l'admin existe déjà
function checkAdminExists(username) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id, name, username FROM admins WHERE username = ?', [username], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Fonction pour créer l'admin
async function createAdmin() {
  console.log('👤 Création de l\'administrateur...');
  
  const adminData = {
    name: 'F.faissal.admin',
    username: 'F.faissal.admin',
    password: 'Faissal'
  };

  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await checkAdminExists(adminData.username);
    
    if (existingAdmin) {
      console.log('⚠️  Un administrateur avec ce nom d\'utilisateur existe déjà:');
      console.log(`   ID: ${existingAdmin.id}`);
      console.log(`   Nom: ${existingAdmin.name}`);
      console.log(`   Username: ${existingAdmin.username}`);
      console.log('\n🔑 Identifiants de connexion existants:');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log('   Password: [mot de passe existant]');
      return;
    }

    // Créer le nouvel admin
    await runQuery(
      'INSERT INTO admins (name, username, password) VALUES (?, ?, ?)',
      [adminData.name, adminData.username, adminData.password]
    );
    
    console.log('✅ Administrateur créé avec succès:');
    console.log(`   Nom: ${adminData.name}`);
    console.log(`   Username: ${adminData.username}`);
    console.log(`   Password: ${adminData.password}`);
    
    console.log('\n🔑 Identifiants de connexion admin:');
    console.log(`   Username: ${adminData.username}`);
    console.log(`   Password: ${adminData.password}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
    process.exit(1);
  }
}

// Fonction principale
async function addAdmin() {
  try {
    await createAdmin();
    
    console.log('\n🎉 Script terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de l\'admin:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Exécuter le script
addAdmin(); 