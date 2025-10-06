-- ================================
-- MIGRAZIONE DATABASE v3.0
-- Sistema Login/Registrazione Utenti Esterni
-- ================================

-- 1. Tabella per utenti esterni (separata da admin/instructor)
CREATE TABLE IF NOT EXISTS `external_users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `nome` VARCHAR(100) NOT NULL,
  `cognome` VARCHAR(100) NOT NULL,
  `azienda` VARCHAR(255) NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `email_verified` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabella per tracciare questionari condivisi con utenti esterni
CREATE TABLE IF NOT EXISTS `user_questionnaires` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `external_user_id` INT NOT NULL,
  `questionnaire_id` INT NOT NULL,
  `status` ENUM('pending', 'completed') DEFAULT 'pending',
  `shared_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `completed_at` TIMESTAMP NULL,
  `accessed_via_token` VARCHAR(64) NULL, -- token con cui ha acceduto inizialmente
  FOREIGN KEY (`external_user_id`) REFERENCES `external_users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`questionnaire_id`) REFERENCES `questionnaires`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_questionnaire` (`external_user_id`, `questionnaire_id`)
);

-- 3. Aggiungiamo indici per performance
CREATE INDEX `idx_external_users_email` ON `external_users`(`email`);
CREATE INDEX `idx_user_questionnaires_user` ON `user_questionnaires`(`external_user_id`);
CREATE INDEX `idx_user_questionnaires_status` ON `user_questionnaires`(`status`);

-- 4. Aggiorniamo la tabella responses per supportare external_users
ALTER TABLE `responses` 
ADD COLUMN `external_user_id` INT NULL AFTER `respondent_email`,
ADD FOREIGN KEY (`external_user_id`) REFERENCES `external_users`(`id`) ON DELETE SET NULL;

SHOW TABLES;