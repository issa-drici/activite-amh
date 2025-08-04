const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Lire le package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Extraire la version actuelle
const currentVersion = packageJson.version;
const versionParts = currentVersion.split('.');
const patchVersion = parseInt(versionParts[2]);
const newPatchVersion = patchVersion + 1;
const newVersion = `${versionParts[0]}.${versionParts[1]}.${newPatchVersion}`;

// Mettre à jour la version dans package.json
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`✅ Version mise à jour : ${currentVersion} → ${newVersion}`);

// Régénérer le service worker PWA
console.log('🔄 Régénération du service worker PWA...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Service worker PWA régénéré avec succès');
} catch (error) {
  console.error('❌ Erreur lors de la régénération du service worker:', error.message);
  process.exit(1);
}

// Ajouter tous les changements au git
try {
  execSync('git add .', { stdio: 'inherit' });
  console.log('✅ Fichiers ajoutés au git');
  
  // Créer le commit
  execSync(`git commit -m "🔖 Version ${newVersion} - Correction des marges inférieures pour la barre de navigation"`, { stdio: 'inherit' });
  console.log('✅ Commit créé avec succès');
  
  console.log('🚀 Déploiement terminé !');
  console.log('📱 Les utilisateurs recevront une notification de mise à jour lors du prochain déploiement');
} catch (error) {
  console.error('❌ Erreur lors du commit:', error.message);
  process.exit(1);
} 