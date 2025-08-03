#!/bin/bash

# Script de sauvegarde pour Activités AMH Été 2025
# Usage: ./scripts/backup.sh

BACKUP_DIR="./backups"
DATE=$(date +"%Y%m%d_%H%M%S")
DB_FILE="./data/database.sqlite"
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sqlite"

# Créer le dossier de sauvegarde s'il n'existe pas
mkdir -p "$BACKUP_DIR"

# Vérifier si la base de données existe
if [ ! -f "$DB_FILE" ]; then
    echo "❌ Base de données non trouvée: $DB_FILE"
    exit 1
fi

# Créer la sauvegarde
cp "$DB_FILE" "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Sauvegarde créée: $BACKUP_FILE"
    echo "📊 Taille: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo "❌ Erreur lors de la sauvegarde"
    exit 1
fi

# Garder seulement les 10 dernières sauvegardes
ls -t "$BACKUP_DIR"/backup_*.sqlite | tail -n +11 | xargs -r rm

echo "🧹 Anciennes sauvegardes nettoyées" 