-- MIGRATION SCRIPT v1.0 → v2.0
-- Esecuzione graduale e reversibile
-- Data: 5 ottobre 2025

USE `domande-questionari`;

-- ==========================================
-- STEP 1: BACKUP INTERNAL (via SQL)
-- ==========================================
-- Creiamo tabelle di backup dei dati esistenti
CREATE TABLE IF NOT EXISTS `backup_users` AS SELECT * FROM `users`;
CREATE TABLE IF NOT EXISTS `backup_questionnaires` AS SELECT * FROM `questionnaires`;
CREATE TABLE IF NOT EXISTS `backup_responses` AS SELECT * FROM `responses`;

SELECT 'ℹ️  Backup interno completato' AS status;

-- ==========================================
-- STEP 2: EXTEND EXISTING TABLES (Non-breaking)
-- ==========================================

-- Aggiungiamo colonne alla tabella users esistente
ALTER TABLE `users` 
ADD COLUMN `role` ENUM('admin', 'instructor') DEFAULT 'instructor' AFTER `name`,
ADD COLUMN `is_active` BOOLEAN DEFAULT TRUE AFTER `role`,
ADD COLUMN `invited_by` INT UNSIGNED NULL AFTER `is_active`;

-- Aggiungiamo constraint per invited_by (self-reference)
ALTER TABLE `users` 
ADD CONSTRAINT `users_invited_by_foreign` 
FOREIGN KEY(`invited_by`) REFERENCES `users`(`id`) ON DELETE SET NULL;

-- Aggiungiamo colonne alla tabella questionnaires
ALTER TABLE `questionnaires`
ADD COLUMN `course_id` INT UNSIGNED NULL AFTER `user_id`,
ADD COLUMN `is_archived` BOOLEAN DEFAULT FALSE AFTER `is_active`,
ADD COLUMN `share_token` VARCHAR(64) NULL AFTER `is_archived`,
ADD COLUMN `is_public` BOOLEAN DEFAULT FALSE AFTER `share_token`,
ADD COLUMN `archived_at` TIMESTAMP NULL AFTER `updated_at`;

-- Aggiungiamo unique constraint per share_token
ALTER TABLE `questionnaires`
ADD UNIQUE KEY `questionnaires_share_token_unique`(`share_token`);

SELECT 'ℹ️  Tabelle esistenti estese con successo' AS status;

-- ==========================================
-- STEP 3: CREATE NEW TABLES
-- ==========================================

-- Tabella students (nuova)
CREATE TABLE `students`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL,
    `matricola` VARCHAR(50) NULL,
    `name` VARCHAR(255) NULL,
    `first_response_at` TIMESTAMP NULL,
    `last_response_at` TIMESTAMP NULL,
    `total_responses` INT DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE `students` 
ADD UNIQUE KEY `students_email_unique`(`email`),
ADD UNIQUE KEY `students_matricola_unique`(`matricola`);

-- Tabella courses (nuova)
CREATE TABLE `courses`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `instructor_id` INT UNSIGNED NOT NULL,
    `academic_year` VARCHAR(20) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE `courses`
ADD UNIQUE KEY `courses_code_unique`(`code`),
ADD CONSTRAINT `courses_instructor_id_foreign` 
FOREIGN KEY(`instructor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE;

-- Aggiungere foreign key questionnaires → courses
ALTER TABLE `questionnaires`
ADD CONSTRAINT `questionnaires_course_id_foreign` 
FOREIGN KEY(`course_id`) REFERENCES `courses`(`id`) ON DELETE SET NULL;

SELECT 'ℹ️  Nuove tabelle create con successo' AS status;

-- ==========================================
-- STEP 4: EXTEND RESPONSES TABLE
-- ==========================================

-- Prima aggiungiamo la colonna senza constraint
ALTER TABLE `responses`
ADD COLUMN `student_id` INT UNSIGNED NULL AFTER `questionnaire_id`,
ADD COLUMN `ip_address` VARCHAR(45) NULL AFTER `student_id`,
ADD COLUMN `user_agent` TEXT NULL AFTER `ip_address`,
ADD COLUMN `completion_time_seconds` INT NULL AFTER `user_agent`;

-- Creiamo la tabella student_responses per lo storico
CREATE TABLE `student_responses`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT UNSIGNED NOT NULL,
    `questionnaire_id` INT UNSIGNED NOT NULL,
    `response_id` INT UNSIGNED NOT NULL,
    `course_id` INT UNSIGNED NULL,
    `completed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `score` DECIMAL(5,2) NULL,
    `notes` TEXT NULL
);

ALTER TABLE `student_responses`
ADD CONSTRAINT `student_responses_student_id_foreign` 
FOREIGN KEY(`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
ADD CONSTRAINT `student_responses_questionnaire_id_foreign` 
FOREIGN KEY(`questionnaire_id`) REFERENCES `questionnaires`(`id`) ON DELETE CASCADE,
ADD CONSTRAINT `student_responses_response_id_foreign` 
FOREIGN KEY(`response_id`) REFERENCES `responses`(`id`) ON DELETE CASCADE,
ADD CONSTRAINT `student_responses_course_id_foreign` 
FOREIGN KEY(`course_id`) REFERENCES `courses`(`id`) ON DELETE SET NULL;

SELECT 'ℹ️  Tabella responses estesa e student_responses creata' AS status;

-- ==========================================
-- STEP 5: MIGRATE EXISTING DATA
-- ==========================================

-- Creiamo un admin di default (se non esiste già)
INSERT IGNORE INTO `users` (`email`, `password`, `name`, `role`) 
VALUES ('admin@domande-masterclass.com', '$2b$10$dummy_hash_change_this', 'Amministratore Sistema', 'admin');

-- Convertiamo tutti gli utenti esistenti in instructors (già fatto dal DEFAULT)
UPDATE `users` SET `role` = 'instructor' WHERE `role` IS NULL;

-- Estraiamo studenti unici dalle risposte esistenti
INSERT INTO `students` (`email`, `name`, `first_response_at`, `total_responses`)
SELECT 
    COALESCE(respondent_email, CONCAT('studente_', id, '@example.com')) as email,
    respondent_name as name,
    MIN(submitted_at) as first_response_at,
    COUNT(*) as total_responses
FROM `responses` 
WHERE respondent_email IS NOT NULL OR respondent_name IS NOT NULL
GROUP BY COALESCE(respondent_email, CONCAT('studente_', id, '@example.com')), respondent_name
ON DUPLICATE KEY UPDATE 
    total_responses = VALUES(total_responses),
    first_response_at = LEAST(first_response_at, VALUES(first_response_at));

-- Aggiorniamo le risposte esistenti collegandole agli studenti
UPDATE `responses` r
JOIN `students` s ON (
    s.email = COALESCE(r.respondent_email, CONCAT('studente_', r.id, '@example.com'))
)
SET r.student_id = s.id
WHERE r.student_id IS NULL;

-- Popoliamo student_responses per lo storico
INSERT INTO `student_responses` (`student_id`, `questionnaire_id`, `response_id`, `completed_at`)
SELECT 
    r.student_id,
    r.questionnaire_id,
    r.id,
    r.submitted_at
FROM `responses` r
WHERE r.student_id IS NOT NULL;

-- Aggiorniamo contatori studenti
UPDATE `students` s
SET 
    total_responses = (
        SELECT COUNT(*) FROM `responses` r WHERE r.student_id = s.id
    ),
    last_response_at = (
        SELECT MAX(submitted_at) FROM `responses` r WHERE r.student_id = s.id
    )
WHERE s.id > 0;

SELECT 'ℹ️  Migrazione dati completata' AS status;

-- ==========================================
-- STEP 6: ADD CONSTRAINTS AND INDEXES
-- ==========================================

-- Ora possiamo aggiungere il constraint per student_id (dopo aver popolato i dati)
ALTER TABLE `responses`
ADD CONSTRAINT `responses_student_id_foreign` 
FOREIGN KEY(`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE;

-- Aggiungiamo indici per performance
CREATE INDEX `idx_questionnaires_user_course` ON `questionnaires`(`user_id`, `course_id`);
CREATE INDEX `idx_responses_questionnaire_student` ON `responses`(`questionnaire_id`, `student_id`);
CREATE INDEX `idx_student_responses_student_date` ON `student_responses`(`student_id`, `completed_at`);
CREATE INDEX `idx_students_email_matricola` ON `students`(`email`, `matricola`);

SELECT 'ℹ️  Indici e constraint aggiunti' AS status;

-- ==========================================
-- STEP 7: VERIFICATION
-- ==========================================

-- Verifica integrità referenziale
SELECT 'ℹ️  VERIFICA INTEGRITÀ:' AS status;

SELECT 
    'Users' as tabella,
    COUNT(*) as records,
    SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
    SUM(CASE WHEN role = 'instructor' THEN 1 ELSE 0 END) as instructor_count
FROM users
UNION ALL
SELECT 
    'Students' as tabella,
    COUNT(*) as records,
    NULL as admin_count,
    NULL as instructor_count
FROM students
UNION ALL
SELECT 
    'Questionnaires' as tabella,
    COUNT(*) as records,
    NULL as admin_count,
    NULL as instructor_count
FROM questionnaires
UNION ALL
SELECT 
    'Responses' as tabella,
    COUNT(*) as records,
    SUM(CASE WHEN student_id IS NOT NULL THEN 1 ELSE 0 END) as linked_to_students,
    NULL as instructor_count
FROM responses
UNION ALL
SELECT 
    'Student Responses' as tabella,
    COUNT(*) as records,
    NULL as admin_count,
    NULL as instructor_count
FROM student_responses;

SELECT '✅ MIGRAZIONE COMPLETATA CON SUCCESSO!' AS final_status;