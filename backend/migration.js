const mysql = require("mysql2/promise");
require("dotenv").config();

async function runMigration() {
  let connection;

  try {
    // Connessione al database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "domande-questionari",
    });

    console.log("Connesso al database MySQL");

    // ===========================================
    // MIGRAZIONE TABELLE UTENTI ESTERNI
    // ===========================================

    // Crea tabella external_users se non esiste
    console.log("Creazione tabella external_users...");
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS external_users (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        surname VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabella external_users creata");

    // Crea tabella user_questionnaires se non esiste
    console.log("Creazione tabella user_questionnaires...");
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_questionnaires (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        external_user_id INT UNSIGNED NOT NULL,
        questionnaire_id INT UNSIGNED NOT NULL,
        assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        status ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
        UNIQUE KEY user_questionnaires_unique (external_user_id, questionnaire_id),
        FOREIGN KEY (external_user_id) REFERENCES external_users(id) ON DELETE CASCADE,
        FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ Tabella user_questionnaires creata");

    // Aggiungi colonna external_user_id alla tabella responses se non esiste
    console.log("Aggiornamento tabella responses...");
    try {
      await connection.execute(`
        ALTER TABLE responses 
        ADD COLUMN external_user_id INT UNSIGNED NULL
      `);
      console.log("✅ Colonna external_user_id aggiunta a responses");
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        console.log("⚠️  Colonna external_user_id già presente in responses");
      } else {
        throw error;
      }
    }

    // Aggiungi foreign key per external_user_id se non esiste
    try {
      await connection.execute(`
        ALTER TABLE responses 
        ADD CONSTRAINT responses_external_user_id_foreign 
        FOREIGN KEY (external_user_id) REFERENCES external_users(id) ON DELETE CASCADE
      `);
      console.log("✅ Foreign key external_user_id aggiunta a responses");
    } catch (error) {
      if (error.code === "ER_DUP_KEYNAME") {
        console.log(
          "⚠️  Foreign key external_user_id già presente in responses"
        );
      } else {
        throw error;
      }
    }

    // ===========================================
    // MIGRAZIONE ORIGINALE QUESTIONARI
    // ===========================================

    // Verifica se le colonne esistono già
    const [columns] = await connection.execute(
      `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'questionnaires' 
      AND COLUMN_NAME IN ('share_token', 'is_public')
    `,
      [process.env.DB_NAME || "domande-questionari"]
    );

    if (columns.length === 0) {
      console.log(
        "Eseguo migration per aggiungere funzionalità di condivisione..."
      );

      // Aggiungi le nuove colonne
      await connection.execute(`
        ALTER TABLE questionnaires 
        ADD COLUMN share_token VARCHAR(64) UNIQUE NULL,
        ADD COLUMN is_public BOOLEAN DEFAULT FALSE
      `);

      // Crea indice per performance
      await connection.execute(`
        CREATE INDEX idx_questionnaires_share_token ON questionnaires(share_token)
      `);

      console.log("✅ Migration completata con successo!");
    } else {
      console.log("⚠️ Migration già eseguita, colonne esistenti");
    }
  } catch (error) {
    console.error("❌ Errore durante la migration:", error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Connessione al database chiusa");
    }
  }
}

// Esegui la migration
runMigration();
