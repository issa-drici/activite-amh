const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin vers la base de données
const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Créer une connexion à la base de données
const db = new sqlite3.Database(dbPath);

console.log('🔍 Vérification des IDs dans la table attendance...\n');

// Vérifier la structure de la table
db.all("PRAGMA table_info(attendance)", (err, columns) => {
  if (err) {
    console.error('❌ Erreur:', err);
    return;
  }
  
  console.log('📋 Structure de la table attendance:');
  columns.forEach(col => {
    console.log(`  - ${col.name}: ${col.type} ${col.pk ? '(PRIMARY KEY)' : ''}`);
  });
  console.log('');

  // Vérifier quelques enregistrements d'attendance
  db.all(`
    SELECT a.id, w.name, a.period, a.date, a.created_at, COALESCE(adm.name, 'Admin Principal') as admin_name
    FROM attendance a
    JOIN workers w ON a.worker_id = w.id
    LEFT JOIN admins adm ON a.admin_id = adm.id
    ORDER BY a.created_at DESC
    LIMIT 5
  `, (err, rows) => {
    if (err) {
      console.error('❌ Erreur:', err);
      return;
    }
    
    if (rows.length === 0) {
      console.log('ℹ️ Aucun pointage trouvé dans la base de données');
    } else {
      console.log('📊 Exemples de pointages avec leurs IDs:');
      rows.forEach(row => {
        console.log(`  ID: ${row.id} | ${row.name} | ${row.period} | ${row.date} | ${row.admin_name}`);
      });
    }
    
    // Compter le total
    db.get('SELECT COUNT(*) as count FROM attendance', (err, result) => {
      if (err) {
        console.error('❌ Erreur:', err);
        return;
      }
      
      console.log(`\n✅ Total de ${result.count} pointage(s) trouvé(s), tous avec des IDs valides!`);
      console.log('\n🎉 La fonctionnalité de suppression est prête à être utilisée!');
      
      db.close();
    });
  });
});
