-- ============================================================
-- SUPERMACHO FANTASY FOOTBALL AI - GODADDY MYSQL SCHEMA (PHP 8.3)
-- Import this SQL file into your GoDaddy phpMyAdmin database!
-- ============================================================

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) DEFAULT 'client',
  `plan` VARCHAR(255) DEFAULT '20 Free Credits Rookie ($0.00 USD)',
  `status` VARCHAR(100) DEFAULT 'Active Subscriber',
  `credits` INT DEFAULT 20,
  `pref_lang` VARCHAR(10) DEFAULT 'es',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `leagues` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_email` VARCHAR(255) NOT NULL,
  `platform` VARCHAR(50) DEFAULT 'ESPN',
  `league_id` VARCHAR(100) NOT NULL,
  `team_id` VARCHAR(50) DEFAULT '1',
  `espn_s2` TEXT NULL,
  `swid` VARCHAR(255) NULL,
  `scoring_format` VARCHAR(50) DEFAULT 'PPR',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_user_email` (`user_email`),
  CONSTRAINT `fk_league_user` FOREIGN KEY (`user_email`) REFERENCES `users` (`email`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `draft_queue` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_email` VARCHAR(255) NOT NULL,
  `player_id` VARCHAR(100) NOT NULL,
  `player_name` VARCHAR(255) NOT NULL,
  `position` VARCHAR(20) NOT NULL,
  `team` VARCHAR(50) DEFAULT '',
  `adp` VARCHAR(20) DEFAULT '',
  `proj_pts` DECIMAL(8,2) DEFAULT 0.00,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_draft_user` (`user_email`),
  CONSTRAINT `fk_draft_user` FOREIGN KEY (`user_email`) REFERENCES `users` (`email`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin account
INSERT INTO `users` (`email`, `password_hash`, `role`, `plan`, `status`, `credits`, `pref_lang`)
VALUES ('zivo13@yahoo.com', '$2y$10$e8w.x7W3Z1q4K2yJ1v.6euO7H5R5l1L0o3F4g2H1j0K9L8M7N6O5P', 'admin', '300 Credits Commissioner ($24.99 USD)', 'Active Subscriber', 300, 'es')
ON DUPLICATE KEY UPDATE `role`='admin', `plan`='300 Credits Commissioner ($24.99 USD)';
