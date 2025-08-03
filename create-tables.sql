-- Script de création des tables pour l'application Scan Pointage

-- Table des admins
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des travailleurs
CREATE TABLE IF NOT EXISTS workers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  qr_code VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des présences
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  worker_id INTEGER NOT NULL,
  admin_id INTEGER NOT NULL,
  date DATE NOT NULL,
  period VARCHAR(20) NOT NULL CHECK (period IN ('morning', 'afternoon')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (worker_id) REFERENCES workers (id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE,
  UNIQUE(worker_id, date, period)
);

-- Insérer les admins par défaut
INSERT INTO admins (name, username, password) VALUES 
  ('Admin Principal', 'admin', 'admin123'),
  ('Admin 2', 'admin2', 'admin123'),
  ('Admin 3', 'admin3', 'admin123')
ON CONFLICT (username) DO NOTHING;

-- Afficher les admins créés
SELECT id, name, username, created_at FROM admins ORDER BY id; 