const fs = require('fs');
const path = require('path');

// Lire le fichier service worker
const swPath = path.join(__dirname, '..', 'public', 'sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');

// Extraire la version actuelle
const versionMatch = swContent.match(/const CACHE_NAME = 'amh-ete-2025-v(\d+)';/);
if (versionMatch) {
  const currentVersion = parseInt(versionMatch[1]);
  const newVersion = currentVersion + 1;
  
  // Mettre à jour la version
  swContent = swContent.replace(
    /const CACHE_NAME = 'amh-ete-2025-v\d+';/,
    `const CACHE_NAME = 'amh-ete-2025-v${newVersion}';`
  );
  
  // Écrire le fichier mis à jour
  fs.writeFileSync(swPath, swContent);
  
  console.log(`✅ Version PWA mise à jour : v${currentVersion} → v${newVersion}`);
  console.log('📱 Les utilisateurs recevront une notification de mise à jour lors du prochain déploiement');
} else {
  console.error('❌ Impossible de trouver la version dans le service worker');
} 