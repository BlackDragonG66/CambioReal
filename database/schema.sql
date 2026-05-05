-- ========================================
-- Reto Diario - Esquema de base de datos V1
-- ========================================

-- Base de datos de producción: u450340862_cambio
CREATE DATABASE IF NOT EXISTS u450340862_cambio
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE u450340862_cambio;

-- Usuarios
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Actividades
CREATE TABLE IF NOT EXISTS activities (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id          INT UNSIGNED NOT NULL,
  title            VARCHAR(200) NOT NULL,
  description      TEXT,
  date             DATE NOT NULL,
  time             TIME,
  points           SMALLINT UNSIGNED NOT NULL DEFAULT 10,
  status           ENUM('pending','completed','expired','cancelled') NOT NULL DEFAULT 'pending',
  category         VARCHAR(50) NOT NULL DEFAULT 'personal',
  repeat_type      ENUM('none','daily','weekly','monthly') NOT NULL DEFAULT 'none',
  reminder_minutes SMALLINT UNSIGNED,
  completed_at     DATETIME,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Recompensas
CREATE TABLE IF NOT EXISTS rewards (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NOT NULL,
  title           VARCHAR(200) NOT NULL,
  description     TEXT,
  points_required SMALLINT UNSIGNED NOT NULL,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Historial de puntos
CREATE TABLE IF NOT EXISTS points_history (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  activity_id INT UNSIGNED,
  reward_id   INT UNSIGNED,
  points      SMALLINT UNSIGNED NOT NULL,
  type        ENUM('earn','redeem') NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL,
  FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE SET NULL
) ENGINE=InnoDB;
