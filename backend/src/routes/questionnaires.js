const express = require("express");
const crypto = require("crypto");
const { query } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Genera un token sicuro per la condivisione
function generateShareToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Applica autenticazione a tutte le rotte
router.use(authenticateToken);

// GET /api/questionnaires - Lista questionari dell'utente
router.get("/", async (req, res) => {
  try {
    const questionnaires = await query(
      `SELECT 
                id, 
                title, 
                description, 
                is_active, 
                share_token,
                is_public,
                created_at, 
                updated_at 
             FROM questionnaires 
             WHERE user_id = ? 
             ORDER BY created_at DESC`,
      [req.user.userId]
    );

    res.json({
      message: "Lista questionari",
      count: questionnaires.length,
      questionnaires: questionnaires,
    });
  } catch (error) {
    console.error("Error fetching questionnaires:", error);
    res.status(500).json({
      error: "Errore nel recupero dei questionari",
    });
  }
});

// POST /api/questionnaires - Crea nuovo questionario
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;

    // Validazione input
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        error: "Il titolo del questionario è obbligatorio",
      });
    }

    if (title.length > 255) {
      return res.status(400).json({
        error: "Il titolo non può superare i 255 caratteri",
      });
    }

    // Inserisci questionario
    const result = await query(
      "INSERT INTO questionnaires (title, description, user_id) VALUES (?, ?, ?)",
      [title.trim(), description || null, req.user.userId]
    );

    // Recupera il questionario appena creato
    const newQuestionnaire = await query(
      "SELECT id, title, description, is_active, created_at FROM questionnaires WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      message: "Questionario creato con successo",
      questionnaire: newQuestionnaire[0],
    });
  } catch (error) {
    console.error("Error creating questionnaire:", error);
    res.status(500).json({
      error: "Errore nella creazione del questionario",
    });
  }
});

// GET /api/questionnaires/:id - Dettaglio questionario
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica che l'ID sia un numero
    if (isNaN(id)) {
      return res.status(400).json({
        error: "ID questionario non valido",
      });
    }

    // Recupera questionario
    const questionnaires = await query(
      `SELECT 
                id, 
                title, 
                description, 
                is_active, 
                created_at, 
                updated_at 
             FROM questionnaires 
             WHERE id = ? AND user_id = ?`,
      [id, req.user.userId]
    );

    if (questionnaires.length === 0) {
      return res.status(404).json({
        error: "Questionario non trovato",
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
      [id]
    );

    // Parsa le opzioni JSON per ogni domanda
    const parsedQuestions = questions.map((question) => ({
      ...question,
      question_options: question.question_options
        ? typeof question.question_options === "string"
          ? JSON.parse(question.question_options)
          : question.question_options
        : null,
    }));

    const questionnaire = questionnaires[0];
    questionnaire.questions = parsedQuestions;

    res.json({
      message: "Dettaglio questionario",
      questionnaire: questionnaire,
    });
  } catch (error) {
    console.error("Error fetching questionnaire:", error);
    res.status(500).json({
      error: "Errore nel recupero del questionario",
    });
  }
});

// PUT /api/questionnaires/:id - Modifica questionario
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, is_active } = req.body;

    // Validazione
    if (isNaN(id)) {
      return res.status(400).json({
        error: "ID questionario non valido",
      });
    }

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        error: "Il titolo del questionario è obbligatorio",
      });
    }

    // Verifica esistenza e proprietà
    const existing = await query(
      "SELECT id FROM questionnaires WHERE id = ? AND user_id = ?",
      [id, req.user.userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        error: "Questionario non trovato",
      });
    }

    // Aggiorna questionario
    await query(
      "UPDATE questionnaires SET title = ?, description = ?, is_active = ? WHERE id = ? AND user_id = ?",
      [
        title.trim(),
        description || null,
        is_active !== undefined ? is_active : true,
        id,
        req.user.userId,
      ]
    );

    // Recupera questionario aggiornato
    const updated = await query(
      "SELECT id, title, description, is_active, created_at, updated_at FROM questionnaires WHERE id = ?",
      [id]
    );

    res.json({
      message: "Questionario aggiornato con successo",
      questionnaire: updated[0],
    });
  } catch (error) {
    console.error("Error updating questionnaire:", error);
    res.status(500).json({
      error: "Errore nell'aggiornamento del questionario",
    });
  }
});

// DELETE /api/questionnaires/:id - Elimina questionario
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        error: "ID questionario non valido",
      });
    }

    // Verifica esistenza e proprietà
    const existing = await query(
      "SELECT id, title FROM questionnaires WHERE id = ? AND user_id = ?",
      [id, req.user.userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        error: "Questionario non trovato",
      });
    }

    // Elimina questionario (CASCADE eliminerà anche domande e risposte)
    await query("DELETE FROM questionnaires WHERE id = ? AND user_id = ?", [
      id,
      req.user.userId,
    ]);

    res.json({
      message: "Questionario eliminato con successo",
      deleted_questionnaire: existing[0],
    });
  } catch (error) {
    console.error("Error deleting questionnaire:", error);
    res.status(500).json({
      error: "Errore nell'eliminazione del questionario",
    });
  }
});

// POST /api/questionnaires/:id/share - Genera link di condivisione
router.post("/:id/share", async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica che l'ID sia un numero
    if (isNaN(id)) {
      return res.status(400).json({
        error: "ID questionario non valido",
      });
    }

    // Verifica che il questionario appartenga all'utente
    const questionnaires = await query(
      `SELECT id, title, share_token FROM questionnaires 
       WHERE id = ? AND user_id = ?`,
      [id, req.user.userId]
    );

    if (questionnaires.length === 0) {
      return res.status(404).json({
        error: "Questionario non trovato",
      });
    }

    const questionnaire = questionnaires[0];
    let shareToken = questionnaire.share_token;

    // Se non esiste già un token, generane uno nuovo
    if (!shareToken) {
      shareToken = generateShareToken();

      await query(
        `UPDATE questionnaires 
         SET share_token = ?, is_public = TRUE 
         WHERE id = ?`,
        [shareToken, id]
      );
    }

    res.json({
      message: "Link di condivisione generato con successo",
      share_token: shareToken,
      share_url: `${req.protocol}://${req.get("host")}/share/${shareToken}`,
    });
  } catch (error) {
    console.error("Error generating share link:", error);
    res.status(500).json({
      error: "Errore nella generazione del link di condivisione",
    });
  }
});

// DELETE /api/questionnaires/:id/share - Rimuovi condivisione
router.delete("/:id/share", async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        error: "ID questionario non valido",
      });
    }

    // Verifica che il questionario appartenga all'utente
    const questionnaires = await query(
      `SELECT id FROM questionnaires 
       WHERE id = ? AND user_id = ?`,
      [id, req.user.userId]
    );

    if (questionnaires.length === 0) {
      return res.status(404).json({
        error: "Questionario non trovato",
      });
    }

    // Rimuovi la condivisione
    await query(
      `UPDATE questionnaires 
       SET share_token = NULL, is_public = FALSE 
       WHERE id = ?`,
      [id]
    );

    res.json({
      message: "Condivisione rimossa con successo",
    });
  } catch (error) {
    console.error("Error removing share:", error);
    res.status(500).json({
      error: "Errore nella rimozione della condivisione",
    });
  }
});

// GET /api/questionnaires/:id/responses - Recupera risposte di un questionario
router.get("/:id/responses", async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica che l'ID sia un numero
    if (isNaN(id)) {
      return res.status(400).json({
        error: "ID questionario non valido",
      });
    }

    // Verifica che il questionario appartenga all'utente
    const questionnaires = await query(
      "SELECT id, title FROM questionnaires WHERE id = ? AND user_id = ?",
      [id, req.user.userId]
    );

    if (questionnaires.length === 0) {
      return res.status(404).json({
        error: "Questionario non trovato",
      });
    }

    // Recupera le risposte con i dettagli
    const responses = await query(
      `SELECT 
        r.id,
        r.respondent_name,
        r.respondent_email,
        r.submitted_at,
        q.question_text,
        a.answer_value
       FROM responses r
       LEFT JOIN answers a ON r.id = a.response_id
       LEFT JOIN questions q ON a.question_id = q.id
       WHERE r.questionnaire_id = ?
       ORDER BY r.submitted_at DESC, q.order_index ASC`,
      [id]
    );

    // Raggruppa le risposte per response_id
    const groupedResponses = {};

    responses.forEach((row) => {
      if (!groupedResponses[row.id]) {
        groupedResponses[row.id] = {
          id: row.id,
          respondent_name: row.respondent_name,
          respondent_email: row.respondent_email,
          submitted_at: row.submitted_at,
          responses: {},
        };
      }

      if (row.question_text && row.answer_value) {
        // Parse del JSON dell'answer_value
        try {
          const parsedAnswer = JSON.parse(row.answer_value);
          groupedResponses[row.id].responses[row.question_text] = parsedAnswer;
        } catch (e) {
          groupedResponses[row.id].responses[row.question_text] =
            row.answer_value;
        }
      }
    });

    // Converti in array
    const formattedResponses = Object.values(groupedResponses);

    res.json({
      message: "Risposte recuperate con successo",
      questionnaire: questionnaires[0],
      count: formattedResponses.length,
      responses: formattedResponses,
    });
  } catch (error) {
    console.error("Error fetching responses:", error);
    res.status(500).json({
      error: "Errore nel recupero delle risposte",
    });
  }
});

module.exports = router;
