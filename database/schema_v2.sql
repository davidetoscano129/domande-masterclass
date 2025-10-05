-- NUOVO SCHEMA DATABASE v2.0
-- Basato sui requisiti definiti dall'utente

-- Elimina tabelle esistenti per ricrearle
DROP TABLE IF EXISTS `student_responses`;
DROP TABLE IF EXISTS `answers`;
DROP TABLE IF EXISTS `responses`;
DROP TABLE IF EXISTS `questions`;
DROP TABLE IF EXISTS `questionnaires`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `users`;

-- Database: domande-questionari
USE `domande-questionari`;

-- ==========================================
-- TABELLA USERS (Admin + Relatori)
-- ==========================================
CREATE TABLE `users`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'instructor') NOT NULL DEFAULT 'instructor',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `invited_by` INT UNSIGNED NULL, -- Chi ha invitato questo utente
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
ALTER TABLE `users` ADD UNIQUE `users_email_unique`(`email`);
ALTER TABLE `users` ADD CONSTRAINT `users_invited_by_foreign` 
    FOREIGN KEY(`invited_by`) REFERENCES `users`(`id`) ON DELETE SET NULL;

-- ==========================================
-- TABELLA STUDENTS (Separata per tracking)
-- ==========================================
CREATE TABLE `students`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL,
    `matricola` VARCHAR(50) NULL, -- Codice studente univoco
    `name` VARCHAR(255) NULL, -- Opzionale inizialmente
    `first_response_at` TIMESTAMP NULL, -- Prima volta che ha compilato
    `last_response_at` TIMESTAMP NULL, -- Ultima compilazione
    `total_responses` INT DEFAULT 0, -- Contatore risposte
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
ALTER TABLE `students` ADD UNIQUE `students_email_unique`(`email`);
ALTER TABLE `students` ADD UNIQUE `students_matricola_unique`(`matricola`);

-- ==========================================
-- TABELLA COURSES (Organizzazione)
-- ==========================================
CREATE TABLE `courses`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(50) NOT NULL, -- Codice corso univoco
    `description` TEXT NULL,
    `instructor_id` INT UNSIGNED NOT NULL, -- Relatore proprietario
    `academic_year` VARCHAR(20) NULL, -- Es: "2024-2025"
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
ALTER TABLE `courses` ADD UNIQUE `courses_code_unique`(`code`);
ALTER TABLE `courses` ADD CONSTRAINT `courses_instructor_id_foreign` 
    FOREIGN KEY(`instructor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE;

-- ==========================================
-- TABELLA QUESTIONNAIRES (Aggiornata)
-- ==========================================
CREATE TABLE `questionnaires`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `user_id` INT UNSIGNED NOT NULL, -- Creatore (admin o instructor)
    `course_id` INT UNSIGNED NULL, -- Collegamento al corso (opzionale)
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `is_archived` BOOLEAN NOT NULL DEFAULT FALSE, -- Soft delete
    `share_token` VARCHAR(64) NULL, -- Token per condivisione
    `is_public` BOOLEAN NOT NULL DEFAULT FALSE, -- Se condiviso
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `archived_at` TIMESTAMP NULL -- Quando è stato archiviato
);
ALTER TABLE `questionnaires` ADD CONSTRAINT `questionnaires_user_id_foreign` 
    FOREIGN KEY(`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE;
ALTER TABLE `questionnaires` ADD CONSTRAINT `questionnaires_course_id_foreign` 
    FOREIGN KEY(`course_id`) REFERENCES `courses`(`id`) ON DELETE SET NULL;
ALTER TABLE `questionnaires` ADD UNIQUE `questionnaires_share_token_unique`(`share_token`);

-- ==========================================
-- TABELLA QUESTIONS (Invariata)
-- ==========================================
CREATE TABLE `questions`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `questionnaire_id` INT UNSIGNED NOT NULL,
    `question_text` TEXT NOT NULL,
    `question_type` ENUM('text', 'multiple_choice', 'checkbox', 'scale', 'dropdown') NOT NULL,
    `question_options` JSON NULL,
    `is_required` BOOLEAN NOT NULL DEFAULT FALSE,
    `order_index` INT NOT NULL DEFAULT 0
);
ALTER TABLE `questions` ADD CONSTRAINT `questions_questionnaire_id_foreign` 
    FOREIGN KEY(`questionnaire_id`) REFERENCES `questionnaires`(`id`) ON DELETE CASCADE;

-- ==========================================
-- TABELLA RESPONSES (Collegata agli studenti)
-- ==========================================
CREATE TABLE `responses`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `questionnaire_id` INT UNSIGNED NOT NULL,
    `student_id` INT UNSIGNED NOT NULL, -- NUOVO: collegamento a studente
    `ip_address` VARCHAR(45) NULL, -- Per tracking aggiuntivo
    `user_agent` TEXT NULL, -- Browser info
    `submitted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `completion_time_seconds` INT NULL -- Tempo impiegato per completare
);
ALTER TABLE `responses` ADD CONSTRAINT `responses_questionnaire_id_foreign` 
    FOREIGN KEY(`questionnaire_id`) REFERENCES `questionnaires`(`id`) ON DELETE CASCADE;
ALTER TABLE `responses` ADD CONSTRAINT `responses_student_id_foreign` 
    FOREIGN KEY(`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE;

-- ==========================================
-- TABELLA ANSWERS (Invariata)
-- ==========================================
CREATE TABLE `answers`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `response_id` INT UNSIGNED NOT NULL,
    `question_id` INT UNSIGNED NOT NULL,
    `answer_value` TEXT NOT NULL
);
ALTER TABLE `answers` ADD CONSTRAINT `answers_response_id_foreign` 
    FOREIGN KEY(`response_id`) REFERENCES `responses`(`id`) ON DELETE CASCADE;
ALTER TABLE `answers` ADD CONSTRAINT `answers_question_id_foreign` 
    FOREIGN KEY(`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE;

-- ==========================================
-- TABELLA STUDENT_RESPONSES (Storico dettagliato)
-- ==========================================
CREATE TABLE `student_responses`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT UNSIGNED NOT NULL,
    `questionnaire_id` INT UNSIGNED NOT NULL,
    `response_id` INT UNSIGNED NOT NULL,
    `course_id` INT UNSIGNED NULL,
    `completed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `score` DECIMAL(5,2) NULL, -- Eventuale punteggio calcolato
    `notes` TEXT NULL -- Note aggiuntive
);
ALTER TABLE `student_responses` ADD CONSTRAINT `student_responses_student_id_foreign` 
    FOREIGN KEY(`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE;
ALTER TABLE `student_responses` ADD CONSTRAINT `student_responses_questionnaire_id_foreign` 
    FOREIGN KEY(`questionnaire_id`) REFERENCES `questionnaires`(`id`) ON DELETE CASCADE;
ALTER TABLE `student_responses` ADD CONSTRAINT `student_responses_response_id_foreign` 
    FOREIGN KEY(`response_id`) REFERENCES `responses`(`id`) ON DELETE CASCADE;
ALTER TABLE `student_responses` ADD CONSTRAINT `student_responses_course_id_foreign` 
    FOREIGN KEY(`course_id`) REFERENCES `courses`(`id`) ON DELETE SET NULL;

-- ==========================================
-- INDICI PER PERFORMANCE
-- ==========================================
CREATE INDEX `idx_questionnaires_user_course` ON `questionnaires`(`user_id`, `course_id`);
CREATE INDEX `idx_responses_questionnaire_student` ON `responses`(`questionnaire_id`, `student_id`);
CREATE INDEX `idx_student_responses_student_date` ON `student_responses`(`student_id`, `completed_at`);
CREATE INDEX `idx_students_email_matricola` ON `students`(`email`, `matricola`);

-- ==========================================
-- DATI INIZIALI (Admin di default)
-- ==========================================
INSERT INTO `users` (`email`, `password`, `name`, `role`) 
VALUES ('admin@example.com', '$2b$10$dummy_hash', 'Amministratore', 'admin');

-- Verifica tabelle create
SHOW TABLES;