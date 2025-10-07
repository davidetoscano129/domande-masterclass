-- NUOVO SCHEMA PER SISTEMA UTENTI ESTERNI
-- Aggiunta al database esistente

USE `domande-questionari`;

-- ==========================================
-- TABELLA EXTERNAL_USERS (Utenti Esterni)
-- ==========================================
CREATE TABLE IF NOT EXISTS `external_users` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL, -- Hash bcrypt
    `name` VARCHAR(255) NOT NULL,
    `surname` VARCHAR(255) NOT NULL,
    `company` VARCHAR(255) NOT NULL, -- Azienda/Organizzazione
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indice univoco per email
ALTER TABLE `external_users` ADD UNIQUE `external_users_email_unique`(`email`);

-- ==========================================
-- TABELLA USER_QUESTIONNAIRES (Associazioni)
-- ==========================================
CREATE TABLE IF NOT EXISTS `user_questionnaires` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `external_user_id` INT UNSIGNED NOT NULL,
    `questionnaire_id` INT UNSIGNED NOT NULL,
    `assigned_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `completed_at` TIMESTAMP NULL,
    `status` ENUM('pending', 'completed') NOT NULL DEFAULT 'pending'
);

-- Foreign keys
ALTER TABLE `user_questionnaires` 
ADD CONSTRAINT `user_questionnaires_external_user_id_foreign` 
FOREIGN KEY(`external_user_id`) REFERENCES `external_users`(`id`) ON DELETE CASCADE;

ALTER TABLE `user_questionnaires` 
ADD CONSTRAINT `user_questionnaires_questionnaire_id_foreign` 
FOREIGN KEY(`questionnaire_id`) REFERENCES `questionnaires`(`id`) ON DELETE CASCADE;

-- Indice univoco per evitare duplicati
ALTER TABLE `user_questionnaires` 
ADD UNIQUE `user_questionnaires_unique`(`external_user_id`, `questionnaire_id`);

-- ==========================================
-- AGGIORNA TABELLA RESPONSES ESISTENTE
-- ==========================================
-- Aggiungi colonna per collegare le risposte agli utenti esterni
ALTER TABLE `responses` 
ADD COLUMN `external_user_id` INT UNSIGNED NULL AFTER `student_id`;

-- Foreign key per utenti esterni
ALTER TABLE `responses` 
ADD CONSTRAINT `responses_external_user_id_foreign` 
FOREIGN KEY(`external_user_id`) REFERENCES `external_users`(`id`) ON DELETE CASCADE;

-- ==========================================
-- INDICI PER PERFORMANCE
-- ==========================================
CREATE INDEX `idx_external_users_email` ON `external_users`(`email`);
CREATE INDEX `idx_user_questionnaires_external_user` ON `user_questionnaires`(`external_user_id`);
CREATE INDEX `idx_user_questionnaires_questionnaire` ON `user_questionnaires`(`questionnaire_id`);
CREATE INDEX `idx_responses_external_user` ON `responses`(`external_user_id`);

-- ==========================================
-- VERIFICA TABELLE CREATE
-- ==========================================
SHOW TABLES;
DESCRIBE external_users;
DESCRIBE user_questionnaires;