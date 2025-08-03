# Scan Pointage

Application de gestion de pointage avec QR codes pour les employés.

## 🚀 Déploiement avec PostgreSQL

Cette application utilise PostgreSQL pour une gestion robuste des données.

### Configuration requise

- Node.js 18+
- PostgreSQL 15+

### Variables d'environnement

Créez un fichier `.env` basé sur `env.example` :

```bash
# Configuration PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scan_pointage
DB_USER=postgres
DB_PASSWORD=password

# Environnement
NODE_ENV=development
```

### Déploiement local

1. **Installation des dépendances** :
   ```bash
   npm install
   ```

2. **Configuration de PostgreSQL** :
   - Installez PostgreSQL sur votre système
   - Créez une base de données `scan_pointage`
   - Configurez les variables d'environnement dans `.env`

3. **Démarrage de l'application** :
   ```bash
   npm run dev
   ```

### Déploiement sur Coolify

1. **Variables d'environnement à configurer** :
   ```
   DB_HOST=your-postgres-host
   DB_PORT=5432
   DB_NAME=scan_pointage
   DB_USER=your-username
   DB_PASSWORD=your-password
   NODE_ENV=production
   ```

2. **Configuration de la base de données PostgreSQL** :
   - Assurez-vous que PostgreSQL est accessible depuis votre serveur
   - Créez la base de données `scan_pointage`
   - Les tables seront créées automatiquement au premier démarrage

### Accès par défaut

- **Admin Principal** : `admin` / `admin123`
- **Admin 2** : `admin2` / `admin123`
- **Admin 3** : `admin3` / `admin123`

## 🛠️ Développement

```bash
npm run dev         # Démarrage en mode développement
npm run build       # Construction pour la production
npm run start       # Démarrage en mode production
npm run lint        # Vérification du code
npm run test-db     # Test de connexion PostgreSQL
npm run init-admins # Initialisation des admins par défaut
```

## 🔧 Outils de diagnostic

### Test de connexion PostgreSQL
```bash
npm run test-db
```

### Initialisation des admins
```bash
npm run init-admins
```

### Endpoints de diagnostic
- `GET /api/health` - Test de santé de la base de données
- `GET /api/admins` - Liste des admins existants

## 📊 Structure de la base de données

- **admins** : Administrateurs du système
- **workers** : Employés/travailleurs
- **attendance** : Enregistrements de présence

Les tables sont créées automatiquement au premier démarrage.
