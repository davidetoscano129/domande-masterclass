const express = require("express");
const { query, executeCommand } = require("../config/database");

const router = express.Router();

// GET /api/shared/:token - Visualizza questionario condiviso pubblicamente
router.get("/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Valida il token
    if (!token || token.length !== 64) {
      return res.status(400).json({
        error: "Token di condivisione non valido",
      });
    }

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

    if (questionnaires.length === 0) {
      return res.status(404).json({
        error: "Questionario non trovato o non più disponibile",
      });
    }

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

    const questionnaire = questionnaires[0];
    questionnaire.questions = questions;

    res.json({
      message: "Questionario condiviso",
      questionnaire: questionnaire,
    });
  } catch (error) {
    console.error("Error fetching shared questionnaire:", error);
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

module.exports = router;
