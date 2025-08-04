const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Configuration de la base de données
const projectName = process.env.PROJECT_NAME || 'scan-pointage';
const dbPath = process.env.NODE_ENV === 'production' 
  ? `/data/${projectName}/database.sqlite`
  : path.join(process.cwd(), 'database.sqlite');

console.log('🗄️ Suppression de toutes les données de la base de données...');
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

// Fonction pour supprimer toutes les données
async function clearAllData() {
  console.log('🧹 Suppression de toutes les données...');
  
  try {
    // Désactiver les contraintes de clés étrangères temporairement
    await runQuery('PRAGMA foreign_keys = OFF');
    
    // Supprimer toutes les données des tables
    await runQuery('DELETE FROM activity_checklists');
    console.log('✅ Données supprimées de activity_checklists');
    
    await runQuery('DELETE FROM activity_workers');
    console.log('✅ Données supprimées de activity_workers');
    
    await runQuery('DELETE FROM attendance');
    console.log('✅ Données supprimées de attendance');
    
    await runQuery('DELETE FROM activities');
    console.log('✅ Données supprimées de activities');
    
    await runQuery('DELETE FROM workers');
    console.log('✅ Données supprimées de workers');
    
    await runQuery('DELETE FROM admins');
    console.log('✅ Données supprimées de admins');
    
    // Réactiver les contraintes de clés étrangères
    await runQuery('PRAGMA foreign_keys = ON');
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des données:', error);
    process.exit(1);
  }
}

// Fonction pour créer l'admin
async function createAdmin() {
  console.log('👤 Création de l\'administrateur...');
  
  try {
    const adminData = {
      name: 'Asmaa',
      username: 'asgued1997',
      password: 'Issa1998'
    };

    await runQuery(
      'INSERT INTO admins (name, username, password) VALUES (?, ?, ?)',
      [adminData.name, adminData.username, adminData.password]
    );
    
    console.log('✅ Administrateur créé:');
    console.log(`   Nom: ${adminData.name}`);
    console.log(`   Username: ${adminData.username}`);
    console.log(`   Password: ${adminData.password}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
    process.exit(1);
  }
}

// Fonction principale
async function resetDatabase() {
  try {
    await clearAllData();
    await createAdmin();
    
    console.log('\n🎉 Base de données vidée avec succès !');
    console.log('📊 Toutes les tables ont été vidées');
    console.log('👤 Nouvel admin créé avec les identifiants fournis');
    console.log('\n🔑 Identifiants de connexion admin:');
    console.log('   Username: asgued1997');
    console.log('   Password: Issa1998');
    
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Exécuter le script
resetDatabase(); 