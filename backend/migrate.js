const fs = require("fs");
const { query } = require("./src/config/database");

async function runMigration() {
  try {
    console.log("🚀 INIZIANDO MIGRAZIONE DATABASE v1.0 → v2.0");

    // Step 1: Backup
    console.log("\n📦 STEP 1: Creazione backup interno...");
    await query(
      "CREATE TABLE IF NOT EXISTS backup_users AS SELECT * FROM users"
    );
    await query(
      "CREATE TABLE IF NOT EXISTS backup_questionnaires AS SELECT * FROM questionnaires"
    );
    await query(
      "CREATE TABLE IF NOT EXISTS backup_responses AS SELECT * FROM responses"
    );
    console.log("✅ Backup completato");

    // Step 2: Extend users table
    console.log("\n👥 STEP 2: Estensione tabella users...");
    try {
      await query(
        "ALTER TABLE users ADD COLUMN role ENUM('admin', 'instructor') DEFAULT 'instructor' AFTER name"
      );
      console.log("✅ Colonna role aggiunta");
    } catch (err) {
      if (err.message.includes("Duplicate column")) {
        console.log("⚠️  Colonna role già esistente");
      } else throw err;
    }

    try {
      await query(
        "ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER role"
      );
      console.log("✅ Colonna is_active aggiunta");
    } catch (err) {
      if (err.message.includes("Duplicate column")) {
        console.log("⚠️  Colonna is_active già esistente");
      } else throw err;
    }

    try {
      await query(
        "ALTER TABLE users ADD COLUMN invited_by INT UNSIGNED NULL AFTER is_active"
      );
      console.log("✅ Colonna invited_by aggiunta");
    } catch (err) {
      if (err.message.includes("Duplicate column")) {
        console.log("⚠️  Colonna invited_by già esistente");
      } else throw err;
    }

    // Step 3: Create students table
    console.log("\n👨‍🎓 STEP 3: Creazione tabella students...");
    await query(`
      CREATE TABLE IF NOT EXISTS students(
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        matricola VARCHAR(50) NULL,
        name VARCHAR(255) NULL,
        first_response_at TIMESTAMP NULL,
        last_response_at TIMESTAMP NULL,
        total_responses INT DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY students_email_unique(email),
        UNIQUE KEY students_matricola_unique(matricola)
      )
    `);
    console.log("✅ Tabella students creata");

    // Step 4: Create courses table
    console.log("\n📚 STEP 4: Creazione tabella courses...");
    await query(`
      CREATE TABLE IF NOT EXISTS courses(
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL,
        description TEXT NULL,
        instructor_id INT UNSIGNED NOT NULL,
        academic_year VARCHAR(20) NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY courses_code_unique(code)
      )
    `);
    console.log("✅ Tabella courses creata");

    // Step 5: Extend questionnaires table
    console.log("\n📋 STEP 5: Estensione tabella questionnaires...");
    const questCols = [
      "course_id",
      "is_archived",
      "share_token",
      "is_public",
      "archived_at",
    ];
    for (const col of questCols) {
      try {
        if (col === "course_id") {
          await query(
            "ALTER TABLE questionnaires ADD COLUMN course_id INT UNSIGNED NULL AFTER user_id"
          );
        } else if (col === "is_archived") {
          await query(
            "ALTER TABLE questionnaires ADD COLUMN is_archived BOOLEAN DEFAULT FALSE AFTER is_active"
          );
        } else if (col === "share_token") {
          await query(
            "ALTER TABLE questionnaires ADD COLUMN share_token VARCHAR(64) NULL AFTER is_archived"
          );
        } else if (col === "is_public") {
          await query(
            "ALTER TABLE questionnaires ADD COLUMN is_public BOOLEAN DEFAULT FALSE AFTER share_token"
          );
        } else if (col === "archived_at") {
          await query(
            "ALTER TABLE questionnaires ADD COLUMN archived_at TIMESTAMP NULL AFTER updated_at"
          );
        }
        console.log(`✅ Colonna ${col} aggiunta`);
      } catch (err) {
        if (err.message.includes("Duplicate column")) {
          console.log(`⚠️  Colonna ${col} già esistente`);
        } else throw err;
      }
    }

    // Step 6: Create admin user
    console.log("\n👨‍💼 STEP 6: Creazione utente admin...");
    try {
      await query(`
        INSERT INTO users (email, password, name, role) 
        VALUES ('admin@domande-masterclass.com', '$2b$10$dummy_hash_change_password', 'Amministratore Sistema', 'admin')
      `);
      console.log("✅ Utente admin creato");
    } catch (err) {
      if (err.message.includes("Duplicate entry")) {
        console.log("⚠️  Utente admin già esistente");
      } else throw err;
    }

    // Verifica finale
    console.log("\n🔍 VERIFICA FINALE:");
    const users = await query(
      "SELECT COUNT(*) as count, role FROM users GROUP BY role"
    );
    const students = await query("SELECT COUNT(*) as count FROM students");
    const courses = await query("SELECT COUNT(*) as count FROM courses");

    console.log("📊 RISULTATI:");
    users.forEach((u) => console.log(`  - ${u.role}: ${u.count} utenti`));
    console.log(`  - Students: ${students[0]?.count || 0}`);
    console.log(`  - Courses: ${courses[0]?.count || 0}`);

    console.log("\n✅ MIGRAZIONE COMPLETATA CON SUCCESSO!");
    process.exit(0);
  } catch (error) {
    console.error("💥 ERRORE CRITICO:", error.message);
    process.exit(1);
  }
}

runMigration();
