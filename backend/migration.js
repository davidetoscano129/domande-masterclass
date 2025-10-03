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
      database: process.env.DB_NAME || "questionari_app",
    });

    console.log("Connesso al database MySQL");

    // Verifica se le colonne esistono già
    const [columns] = await connection.execute(
      `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'questionnaires' 
      AND COLUMN_NAME IN ('share_token', 'is_public')
    `,
      [process.env.DB_NAME || "questionari_app"]
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
