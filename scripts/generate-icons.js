const fs = require('fs');
const path = require('path');

// Créer une icône SVG simple pour AMH
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#16a34a" rx="64"/>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="120" font-weight="bold" text-anchor="middle" fill="white">AMH</text>
  <text x="256" y="380" font-family="Arial, sans-serif" font-size="40" text-anchor="middle" fill="white">ÉTÉ 2025</text>
</svg>
`;

// Fonction pour créer une icône PNG simple (en SVG pour l'exemple)
function createIcon(size, filename) {
  const iconPath = path.join(__dirname, '..', 'public', filename);
  
  // Pour cet exemple, on crée juste le SVG
  // En production, vous devriez utiliser une vraie bibliothèque pour convertir en PNG
  const svgContent = svgIcon.replace('width="512" height="512"', `width="${size}" height="${size}"`);
  
  fs.writeFileSync(iconPath.replace('.png', '.svg'), svgContent);
  console.log(`Icône créée: ${filename.replace('.png', '.svg')}`);
}

// Créer les icônes
console.log('Génération des icônes PWA...');

// Créer les icônes SVG (en attendant les vraies PNG)
createIcon(192, 'icon-192x192.svg');
createIcon(512, 'icon-512x512.svg');
createIcon(180, 'apple-touch-icon.svg');

console.log('Icônes SVG créées !');
console.log('Note: Pour une vraie PWA, vous devriez créer des icônes PNG avec les bonnes dimensions.'); 