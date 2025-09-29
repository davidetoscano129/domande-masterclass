const express = require("express");
const router = express.Router();
const { query } = require("../config/database");

// GET - Lista domande di un questionario (SENZA middleware per ora)
router.get("/questionnaires/:questionnaireId/questions", async (req, res) => {
  try {
    const { questionnaireId } = req.params;

    // Per ora ottieni tutte le domande del questionario (senza controllo utente)
    const questions = await query(
      "SELECT * FROM questions WHERE questionnaire_id = ? ORDER BY order_index ASC",
      [questionnaireId]
    );

    res.json({
      message: "Lista domande",
      questions: questions,
    });
  } catch (error) {
    console.error("Errore nel recupero domande:", error);
    res.status(500).json({ error: "Errore interno del server" });
  }
});

// POST - Crea nuova domanda (SENZA middleware per ora)
router.post("/questionnaires/:questionnaireId/questions", async (req, res) => {
  try {
    const { questionnaireId } = req.params;
    const { question_text, question_type, question_options, is_required } =
      req.body;

    // Validazione tipi di domanda
    const validTypes = [
      "text",
      "multiple_choice",
      "checkbox",
      "scale",
      "dropdown",
    ];
    if (!validTypes.includes(question_type)) {
      return res.status(400).json({ error: "Tipo di domanda non valido" });
    }

    // Ottieni il prossimo order_index
    const lastOrder = await query(
      "SELECT MAX(order_index) as max_order FROM questions WHERE questionnaire_id = ?",
      [questionnaireId]
    );
    const nextOrder =
      (lastOrder[0] && lastOrder[0].max_order ? lastOrder[0].max_order : 0) + 1;

    // Inserisci la domanda
    const result = await query(
      "INSERT INTO questions (questionnaire_id, question_text, question_type, question_options, is_required, order_index) VALUES (?, ?, ?, ?, ?, ?)",
      [
        questionnaireId,
        question_text,
        question_type,
        JSON.stringify(question_options || null),
        is_required || false,
        nextOrder,
      ]
    );

    // Recupera la domanda creata
    const newQuestion = await query("SELECT * FROM questions WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json({
      message: "Domanda creata con successo",
      question: newQuestion[0],
    });
  } catch (error) {
    console.error("Errore nella creazione domanda:", error);
    res.status(500).json({ error: "Errore interno del server" });
  }
});

module.exports = router;
