-- Elimina tabelle esistenti per ricrearle
DROP TABLE IF EXISTS `answers`;
DROP TABLE IF EXISTS `responses`;
DROP TABLE IF EXISTS `questions`;
DROP TABLE IF EXISTS `questionnaires`;
DROP TABLE IF EXISTS `users`;

-- Database: domande-questionari
USE `domande-questionari`;

CREATE TABLE `users`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
ALTER TABLE `users` ADD UNIQUE `users_email_unique`(`email`);

CREATE TABLE `questionnaires`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `user_id` INT UNSIGNED NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT '1',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `questions`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `questionnaire_id` INT UNSIGNED NOT NULL,
    `question_text` TEXT NOT NULL,
    `question_type` ENUM('text', 'multiple_choice', 'checkbox', 'scale', 'date') NOT NULL,
    `question_options` JSON NULL,
    `is_required` BOOLEAN NOT NULL DEFAULT '0',
    `order_index` INT NOT NULL DEFAULT '0'
);

CREATE TABLE `responses`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `questionnaire_id` INT UNSIGNED NOT NULL,
    `respondent_name` VARCHAR(255) NULL,
    `respondent_email` VARCHAR(255) NULL,
    `submitted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `answers`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `response_id` INT UNSIGNED NOT NULL,
    `question_id` INT UNSIGNED NOT NULL,
    `answer_value` TEXT NOT NULL
);

-- Foreign Keys
ALTER TABLE `questionnaires` ADD CONSTRAINT `questionnaires_user_id_foreign` 
    FOREIGN KEY(`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE;

ALTER TABLE `questions` ADD CONSTRAINT `questions_questionnaire_id_foreign` 
    FOREIGN KEY(`questionnaire_id`) REFERENCES `questionnaires`(`id`) ON DELETE CASCADE;

ALTER TABLE `responses` ADD CONSTRAINT `responses_questionnaire_id_foreign` 
    FOREIGN KEY(`questionnaire_id`) REFERENCES `questionnaires`(`id`) ON DELETE CASCADE;

ALTER TABLE `answers` ADD CONSTRAINT `answers_response_id_foreign` 
    FOREIGN KEY(`response_id`) REFERENCES `responses`(`id`) ON DELETE CASCADE;

ALTER TABLE `answers` ADD CONSTRAINT `answers_question_id_foreign` 
    FOREIGN KEY(`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE;

-- Verifica tabelle create
SHOW TABLES;