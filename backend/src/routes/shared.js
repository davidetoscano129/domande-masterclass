const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query, executeCommand } = require("../config/database");

const router = express.Router();

// GET /api/shared/:token - Visualizza questionario condiviso pubblicamente
router.get("/:token", async (req, res) => {
  try {
    const { token } = req.params;
    console.log(
      "📥 Richiesta questionario condiviso - Token:",
      token?.substring(0, 10) + "..."
    );

    // Valida il token
    if (!token || token.length !== 64) {
      console.log("❌ Token non valido:", token?.length);
      return res.status(400).json({
        error: "Token di condivisione non valido",
      });
    }

    console.log("🔍 Cerca questionario nel database...");
    // Recupera questionario tramite token
    const questionnaires = await query(
      `SELECT 
        id, 
        title, 
        description, 
        is_active,
        created_at
       FROM questionnaires 
       WHERE share_token = ? AND is_public = TRUE AND is_active = TRUE`,
      [token]
    );

    console.log("📊 Questionari trovati:", questionnaires.length);
    if (questionnaires.length === 0) {
      console.log("❌ Questionario non trovato");
      return res.status(404).json({
        error: "Questionario non trovato o non più disponibile",
      });
    }

    console.log("✅ Questionario trovato:", questionnaires[0].title);
    console.log("🔍 Cerca domande...");
    // Recupera le domande del questionario
    const questions = await query(
      `SELECT 
        id, 
        question_text, 
        question_type, 
        question_options, 
        is_required, 
        order_index 
       FROM questions 
       WHERE questionnaire_id = ? 
       ORDER BY order_index ASC`,
      [questionnaires[0].id]
    );

    console.log("📊 Domande trovate:", questions.length);
    console.log("🔄 Processa opzioni JSON...");

    // Processa le opzioni JSON per ogni domanda
    const processedQuestions = questions.map((question) => {
      let parsedOptions = null;

      // Parsing sicuro delle opzioni JSON
      if (question.question_options) {
        try {
          // Se è già un oggetto/array, non parsare
          if (typeof question.question_options === "string") {
            parsedOptions = JSON.parse(question.question_options);
          } else {
            parsedOptions = question.question_options;
          }
        } catch (e) {
          console.error(
            "Error parsing question options:",
            e,
            "Options:",
            question.question_options
          );
          parsedOptions = null;
        }
      }

      return {
        ...question,
        question_options: parsedOptions,
      };
    });

    const questionnaire = questionnaires[0];
    questionnaire.questions = processedQuestions;

    console.log("✅ Risposta preparata, invio al frontend...");
    res.json({
      message: "Questionario condiviso",
      questionnaire: questionnaire,
    });
  } catch (error) {
    console.error("❌ Error fetching shared questionnaire:", error);
    res.status(500).json({
      error: "Errore nel recupero del questionario condiviso",
    });
  }
});

// POST /api/shared/:token/responses - Invia risposta al questionario condiviso
router.post("/:token/responses", async (req, res) => {
  try {
    const { token } = req.params;
    const { respondent_name, respondent_email, answers } = req.body;

    console.log("📝 Richiesta invio risposta:", {
      token: token.substring(0, 10) + "...",
      respondent_name,
      respondent_email,
      answers_count: answers ? answers.length : 0,
      answers: answers,
    });

    // Valida il token
    if (!token || token.length !== 64) {
      console.log("❌ Token non valido:", token);
      return res.status(400).json({
        error: "Token di condivisione non valido",
      });
    }

    // Valida i dati di input
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      console.log("❌ Risposte non valide:", answers);
      return res.status(400).json({
        error: "Le risposte sono obbligatorie",
      });
    }

    // Recupera questionario tramite token
    const questionnaires = await query(
      `SELECT id FROM questionnaires 
       WHERE share_token = ? AND is_public = TRUE AND is_active = TRUE`,
      [token]
    );

    console.log(
      "🔍 Questionario trovato:",
      questionnaires.length > 0 ? "SI" : "NO"
    );

    if (questionnaires.length === 0) {
      console.log("❌ Questionario non trovato per token");
      return res.status(404).json({
        error: "Questionario non trovato o non più disponibile",
      });
    }

    const questionnaireId = questionnaires[0].id;
    console.log("📊 ID Questionario:", questionnaireId);

    // Inizia transazione per salvare la risposta
    console.log("🔄 Inizio transazione...");
    await executeCommand("START TRANSACTION");

    try {
      // Crea record risposta
      console.log("💾 Salvataggio risposta principale...");
      const responseResult = await query(
        `INSERT INTO responses (questionnaire_id, respondent_name, respondent_email) 
         VALUES (?, ?, ?)`,
        [questionnaireId, respondent_name || null, respondent_email || null]
      );

      const responseId = responseResult.insertId;
      console.log("✅ Response ID creato:", responseId);

      // Salva tutte le risposte
      console.log("💾 Salvataggio", answers.length, "risposte...");
      for (const answer of answers) {
        if (answer.question_id && answer.answer_value !== undefined) {
          console.log("📝 Salvataggio risposta:", {
            question_id: answer.question_id,
            answer_value: answer.answer_value,
          });

          await query(
            `INSERT INTO answers (response_id, question_id, answer_value) 
             VALUES (?, ?, ?)`,
            [
              responseId,
              answer.question_id,
              JSON.stringify(answer.answer_value),
            ]
          );
        }
      }

      await executeCommand("COMMIT");
      console.log("✅ Transazione completata con successo");

      res.json({
        message: "Risposta inviata con successo",
        response_id: responseId,
      });
    } catch (transactionError) {
      console.log("❌ Errore nella transazione:", transactionError.message);
      await executeCommand("ROLLBACK");
      throw transactionError;
    }
  } catch (error) {
    console.error("Error submitting response:", error);
    res.status(500).json({
      error: "Errore nell'invio della risposta",
    });
  }
});

// POST /api/shared/register-student - Registra uno studente nel sistema
router.post("/register-student", async (req, res) => {
  try {
    const { email, matricola, nome, cognome, questionnaireToken } = req.body;

    console.log("📝 Registrazione studente:", {
      email,
      matricola,
      nome,
      cognome,
    });

    // Validazioni
    if (!email || !matricola || !nome || !cognome) {
      return res.status(400).json({
        error:
          "Tutti i campi sono obbligatori (email, matricola, nome, cognome)",
      });
    }

    // Validazione formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Formato email non valido",
      });
    }

    // Verifica se lo studente esiste già
    const existingStudent = await query(
      "SELECT id FROM students WHERE email = ? OR matricola = ?",
      [email, matricola]
    );

    let studentId;

    if (existingStudent.length > 0) {
      // Studente esistente - aggiorna le informazioni se necessario
      studentId = existingStudent[0].id;
      console.log("👤 Studente esistente trovato, ID:", studentId);

      // Combiniamo nome e cognome in un unico campo name
      const fullName = `${nome} ${cognome}`;
      await query(
        "UPDATE students SET name = ?, updated_at = NOW() WHERE id = ?",
        [fullName, studentId]
      );
    } else {
      // Nuovo studente - crea record
      console.log("➕ Creazione nuovo studente");
      // Combiniamo nome e cognome in un unico campo name
      const fullName = `${nome} ${cognome}`;
      const result = await query(
        "INSERT INTO students (email, matricola, name, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
        [email, matricola, fullName]
      );
      studentId = result.insertId;
    }

    // Se abbiamo un token questionario, verifichiamo che esista
    let questionnaireId = null;
    if (questionnaireToken) {
      const questionnaire = await query(
        "SELECT id FROM questionnaires WHERE share_token = ?",
        [questionnaireToken]
      );

      if (questionnaire.length > 0) {
        questionnaireId = questionnaire[0].id;
      }
    }

    console.log("✅ Studente registrato con successo, ID:", studentId);

    res.json({
      message: "Studente registrato con successo",
      student_id: studentId,
      questionnaire_id: questionnaireId,
    });
  } catch (error) {
    console.error("Errore registrazione studente:", error);
    res.status(500).json({
      error: "Errore nella registrazione dello studente",
    });
  }
});

// POST /api/shared/login-user - Login utente esterno
router.post("/login-user", async (req, res) => {
  try {
    const { email, password, questionnaireToken } = req.body;

    console.log("🔐 Tentativo login utente:", email);

    // Validazioni
    if (!email || !password) {
      return res.status(400).json({
        error: "Email e password sono obbligatori",
      });
    }

    // Cerca utente nel database
    const users = await query(
      "SELECT id, email, password, nome, cognome, azienda FROM external_users WHERE email = ? AND is_active = TRUE",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: "Utente non trovato o credenziali non valide",
      });
    }

    const user = users[0];

    // Verifica password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        error: "Credenziali non valide",
      });
    }

    // Se c'è un token questionario, associa il questionario all'utente
    let questionnaireId = null;
    if (questionnaireToken) {
      const questionnaire = await query(
        "SELECT id FROM questionnaires WHERE share_token = ? AND is_active = TRUE",
        [questionnaireToken]
      );

      if (questionnaire.length > 0) {
        questionnaireId = questionnaire[0].id;

        // Inserisci nella tabella user_questionnaires se non esiste già
        await query(
          `INSERT IGNORE INTO user_questionnaires 
           (external_user_id, questionnaire_id, accessed_via_token) 
           VALUES (?, ?, ?)`,
          [user.id, questionnaireId, questionnaireToken]
        );

        console.log(
          `📋 Questionario ${questionnaireId} associato all'utente ${user.id}`
        );
      }
    }

    // Genera JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        type: "external_user",
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    console.log("✅ Login effettuato con successo per:", email);

    res.json({
      message: "Login effettuato con successo",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.nome} ${user.cognome}`,
        azienda: user.azienda,
      },
      questionnaire_id: questionnaireId,
    });
  } catch (error) {
    console.error("Errore login utente:", error);
    res.status(500).json({
      error: "Errore durante il login",
    });
  }
});

// POST /api/shared/register-user - Registra un utente lavoratore nel sistema
router.post("/register-user", async (req, res) => {
  try {
    const { email, password, azienda, nome, cognome, questionnaireToken } =
      req.body;

    console.log("📝 Registrazione utente:", {
      email,
      azienda,
      nome,
      cognome,
    });

    // Validazioni
    if (!email || !password || !azienda || !nome || !cognome) {
      return res.status(400).json({
        error:
          "Tutti i campi sono obbligatori (email, password, azienda, nome, cognome)",
      });
    }

    // Validazione formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Formato email non valido",
      });
    }

    // Validazione password
    if (password.length < 6) {
      return res.status(400).json({
        error: "La password deve essere di almeno 6 caratteri",
      });
    }

    // Verifica se l'utente esiste già nella tabella external_users
    const existingUser = await query(
      "SELECT id FROM external_users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        error: "Email già registrata",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea nuovo utente nella tabella external_users
    console.log("➕ Creazione nuovo utente");
    const result = await query(
      `INSERT INTO external_users (email, password, nome, cognome, azienda, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [email, hashedPassword, nome, cognome, azienda]
    );

    const userId = result.insertId;

    // Se abbiamo un token questionario, associalo all'utente
    let questionnaireId = null;
    if (questionnaireToken) {
      const questionnaire = await query(
        "SELECT id FROM questionnaires WHERE share_token = ? AND is_active = TRUE",
        [questionnaireToken]
      );

      if (questionnaire.length > 0) {
        questionnaireId = questionnaire[0].id;

        // Inserisci nella tabella user_questionnaires
        await query(
          `INSERT INTO user_questionnaires 
           (external_user_id, questionnaire_id, accessed_via_token) 
           VALUES (?, ?, ?)`,
          [userId, questionnaireId, questionnaireToken]
        );

        console.log(
          `📋 Questionario ${questionnaireId} associato al nuovo utente ${userId}`
        );
      }
    }

    // Genera JWT token
    const token = jwt.sign(
      {
        userId: userId,
        email: email,
        type: "external_user",
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    console.log("✅ Utente registrato con successo, ID:", userId);

    res.json({
      message: "Utente registrato con successo",
      token,
      user: {
        id: userId,
        email: email,
        name: `${nome} ${cognome}`,
        azienda: azienda,
      },
      questionnaire_id: questionnaireId,
    });
  } catch (error) {
    console.error("Errore registrazione utente:", error);
    res.status(500).json({
      error: "Errore nella registrazione dell'utente",
    });
  }
});

module.exports = router;
