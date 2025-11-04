const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require("path");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  AlignmentType,
  WidthType,
} = require("docx");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "questionari_app",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Inizializzazione database
async function initDatabase() {
  try {
    // Crea la tabella condivisioni se non esiste
    await db.execute(`
      CREATE TABLE IF NOT EXISTS condivisioni (
        id INT AUTO_INCREMENT PRIMARY KEY,
        questionario_id INT NOT NULL,
        relatore_id INT NOT NULL,
        share_token VARCHAR(64) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NULL,
        FOREIGN KEY (questionario_id) REFERENCES questionari(id) ON DELETE CASCADE,
        FOREIGN KEY (relatore_id) REFERENCES relatori(id) ON DELETE CASCADE,
        UNIQUE KEY unique_questionario_relatore (questionario_id, relatore_id)
      )
    `);

    // Aggiungi colonna numero alla tabella lezioni se non esiste
    try {
      const [columns] = await db.execute(
        "SHOW COLUMNS FROM lezioni LIKE 'numero'"
      );
      if (columns.length === 0) {
        await db.execute(`
          ALTER TABLE lezioni 
          ADD COLUMN numero INT DEFAULT 0 
          AFTER id
        `);

        // Aggiorna i record esistenti con numeri progressivi
        const [lezioni] = await db.execute(
          "SELECT id FROM lezioni ORDER BY id"
        );
        for (let i = 0; i < lezioni.length; i++) {
          await db.execute("UPDATE lezioni SET numero = ? WHERE id = ?", [
            i + 1,
            lezioni[i].id,
          ]);
        }
        console.log(
          `✅ Colonna numero aggiunta e ${lezioni.length} lezioni aggiornate`
        );
      }
    } catch (err) {
      console.log("ℹ️ Colonna numero già presente o errore:", err.message);
    }

    // Aggiungi colonna codice_fiscale alla tabella relatori se non esiste
    try {
      const [columns] = await db.execute(
        "SHOW COLUMNS FROM relatori LIKE 'codice_fiscale'"
      );
      if (columns.length === 0) {
        await db.execute(`
          ALTER TABLE relatori 
          ADD COLUMN codice_fiscale VARCHAR(16) UNIQUE 
          AFTER nome
        `);

        // Aggiorna i relatori esistenti con codici fiscali fittizi
        const codiciRelatori = [
          "RLTMRA85M10H501A",
          "RLTLGI80C15F205B",
          "RLTFNC75H20L736C",
          "RLTGPP90S25A662D",
          "RLTMRC70D30B123E",
        ];

        const [relatori] = await db.execute(
          "SELECT id FROM relatori ORDER BY id"
        );
        for (let i = 0; i < relatori.length && i < codiciRelatori.length; i++) {
          await db.execute(
            "UPDATE relatori SET codice_fiscale = ? WHERE id = ?",
            [codiciRelatori[i], relatori[i].id]
          );
        }
        console.log(
          `✅ Colonna codice_fiscale aggiunta a relatori e ${relatori.length} record aggiornati`
        );
      }
    } catch (err) {
      console.log(
        "ℹ️ Colonna codice_fiscale relatori già presente o errore:",
        err.message
      );
    }

    // Aggiungi colonna codice_fiscale alla tabella utenti se non esiste
    try {
      const [columns] = await db.execute(
        "SHOW COLUMNS FROM utenti LIKE 'codice_fiscale'"
      );
      if (columns.length === 0) {
        await db.execute(`
          ALTER TABLE utenti 
          ADD COLUMN codice_fiscale VARCHAR(16) UNIQUE 
          AFTER nome
        `);

        // Aggiorna gli utenti esistenti con codici fiscali fittizi
        const codiciUtenti = [
          "UTNMRA90A01H501A",
          "UTNLGI85B02F205B",
          "UTNFNC80C03L736C",
          "UTNGPP75D04A662D",
          "UTNMRC70E05B123E",
          "UTNLRA88F06H501F",
          "UTNMRO83G07F205G",
          "UTNFCO78H08L736H",
          "UTNGLA92I09A662I",
          "UTNMTT87L10B123L",
          "UTNLSA84M11H501M",
          "UTNMDO81N12F205N",
          "UTNFLA79O13L736O",
          "UTNGVN94P14A662P",
          "UTNMCO89Q15B123Q",
          "UTNLBA86R16H501R",
          "UTNMEO82S17F205S",
          "UTNFTO77T18L736T",
          "UTNGNO93U19A662U",
          "UTNMSO91V20B123V",
          "UTNLDO88Z21H501Z",
          "UTNMAO85A22F205A",
          "UTNFBO80B23L736B",
          "UTNGCO76C24A662C",
          "UTNMDO71D25B123D",
          "UTNLEO89E26H501E",
          "UTNMFO84F27F205F",
          "UTNFGO79G28L736G",
          "UTNGHO95H29A662H",
          "UTNMIO92I30B123I",
        ];

        const [utenti] = await db.execute("SELECT id FROM utenti ORDER BY id");
        for (let i = 0; i < utenti.length && i < codiciUtenti.length; i++) {
          await db.execute(
            "UPDATE utenti SET codice_fiscale = ? WHERE id = ?",
            [codiciUtenti[i], utenti[i].id]
          );
        }
        console.log(
          `✅ Colonna codice_fiscale aggiunta a utenti e ${utenti.length} record aggiornati`
        );
      }
    } catch (err) {
      console.log(
        "ℹ️ Colonna codice_fiscale utenti già presente o errore:",
        err.message
      );
    }

    // Crea gli indici se non esistono
    try {
      await db.execute(
        "CREATE INDEX idx_share_token ON condivisioni(share_token)"
      );
    } catch (err) {
      if (err.code !== "ER_DUP_KEYNAME") throw err;
    }

    try {
      await db.execute(
        "CREATE INDEX idx_expires_at ON condivisioni(expires_at)"
      );
    } catch (err) {
      if (err.code !== "ER_DUP_KEYNAME") throw err;
    }

    console.log("✅ Database inizializzato correttamente");
  } catch (error) {
    console.error("❌ Errore inizializzazione database:", error);
  }
}

// Inizializza il database all'avvio
initDatabase();

// ==========================================
// AUTH ROUTES
// ==========================================

// Login relatore
app.post("/api/auth/relatore", async (req, res) => {
  try {
    const { codice_fiscale } = req.body;
    const [rows] = await db.execute(
      "SELECT * FROM relatori WHERE codice_fiscale = ?",
      [codice_fiscale]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Relatore non trovato" });
    }

    res.json({
      success: true,
      relatore: rows[0],
      type: "relatore",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login utente
app.post("/api/auth/utente", async (req, res) => {
  try {
    const { codice_fiscale } = req.body;
    const [rows] = await db.execute(
      "SELECT * FROM utenti WHERE codice_fiscale = ?",
      [codice_fiscale]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Utente non trovato" });
    }

    res.json({
      success: true,
      utente: rows[0],
      type: "utente",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// RELATORI ROUTES
// ==========================================

// Get tutti i relatori
app.get("/api/relatori", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM relatori ORDER BY id");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// UTENTI ROUTES
// ==========================================

// Get tutti gli utenti
app.get("/api/utenti", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM utenti ORDER BY id");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get risposte di un utente specifico
app.get("/api/utenti/:id/risposte", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      `
      SELECT c.*, q.titolo as questionario_titolo, q.domande, l.titolo as lezione_titolo, rel.nome as relatore_nome
      FROM compilazioni c
      JOIN questionari q ON c.questionario_id = q.id
      JOIN lezioni l ON q.lezione_id = l.id
      JOIN relatori rel ON q.relatore_id = rel.id
      WHERE c.utente_id = ?
      ORDER BY c.submitted_at DESC
    `,
      [id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// LEZIONI ROUTES
// ==========================================

// Get tutte le lezioni
app.get("/api/lezioni", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT l.*, r.nome as relatore_nome 
      FROM lezioni l
      JOIN relatori r ON l.relatore_id = r.id
      ORDER BY l.numero ASC, l.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get lezioni di un relatore
app.get("/api/lezioni/relatore/:relatore_id", async (req, res) => {
  try {
    const { relatore_id } = req.params;
    const [rows] = await db.execute(
      `
      SELECT l.*, r.nome as relatore_nome 
      FROM lezioni l
      JOIN relatori r ON l.relatore_id = r.id
      WHERE l.relatore_id = ?
      ORDER BY l.numero ASC, l.created_at DESC
    `,
      [relatore_id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crea nuova lezione
app.post("/api/lezioni", async (req, res) => {
  try {
    const { titolo, descrizione, numero, relatore_id } = req.body;
    const [result] = await db.execute(
      "INSERT INTO lezioni (titolo, descrizione, numero, relatore_id) VALUES (?, ?, ?, ?)",
      [titolo, descrizione, numero || 0, relatore_id]
    );

    const [rows] = await db.execute(
      `
      SELECT l.*, r.nome as relatore_nome 
      FROM lezioni l
      JOIN relatori r ON l.relatore_id = r.id
      WHERE l.id = ?
    `,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aggiorna lezione
app.put("/api/lezioni/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { titolo, descrizione } = req.body;

    await db.execute(
      "UPDATE lezioni SET titolo = ?, descrizione = ? WHERE id = ?",
      [titolo, descrizione, id]
    );

    const [rows] = await db.execute(
      `
      SELECT l.*, r.nome as relatore_nome 
      FROM lezioni l
      JOIN relatori r ON l.relatore_id = r.id
      WHERE l.id = ?
    `,
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Elimina lezione
app.delete("/api/lezioni/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM lezioni WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// QUESTIONARI ROUTES
// ==========================================

// Get tutti i questionari
app.get("/api/questionari", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT q.*, l.titolo as lezione_titolo, l.numero as lezione_numero, r.nome as relatore_nome
      FROM questionari q
      JOIN lezioni l ON q.lezione_id = l.id
      JOIN relatori r ON q.relatore_id = r.id
      ORDER BY l.numero ASC, q.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get questionari di un relatore
app.get("/api/questionari/relatore/:relatore_id", async (req, res) => {
  try {
    const { relatore_id } = req.params;
    const [rows] = await db.execute(
      `
      SELECT q.*, l.titolo as lezione_titolo, r.nome as relatore_nome
      FROM questionari q
      JOIN lezioni l ON q.lezione_id = l.id
      JOIN relatori r ON q.relatore_id = r.id
      WHERE q.relatore_id = ?
      ORDER BY q.created_at DESC
    `,
      [relatore_id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get questionari di una lezione
app.get("/api/questionari/lezione/:lezione_id", async (req, res) => {
  try {
    const { lezione_id } = req.params;
    const [rows] = await db.execute(
      `
      SELECT q.*, l.titolo as lezione_titolo, r.nome as relatore_nome
      FROM questionari q
      JOIN lezioni l ON q.lezione_id = l.id
      JOIN relatori r ON q.relatore_id = r.id
      WHERE q.lezione_id = ?
      ORDER BY q.created_at DESC
    `,
      [lezione_id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get questionario singolo
app.get("/api/questionari/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      `
      SELECT q.*, l.titolo as lezione_titolo, r.nome as relatore_nome
      FROM questionari q
      JOIN lezioni l ON q.lezione_id = l.id
      JOIN relatori r ON q.relatore_id = r.id
      WHERE q.id = ?
    `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Questionario non trovato" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crea nuovo questionario
app.post("/api/questionari", async (req, res) => {
  try {
    const { titolo, descrizione, lezione_id, relatore_id, config } = req.body;
    const [result] = await db.execute(
      "INSERT INTO questionari (titolo, descrizione, lezione_id, relatore_id, domande) VALUES (?, ?, ?, ?, ?)",
      [titolo, descrizione, lezione_id, relatore_id, JSON.stringify(config)]
    );

    const [rows] = await db.execute(
      `
      SELECT q.*, l.titolo as lezione_titolo, r.nome as relatore_nome
      FROM questionari q
      JOIN lezioni l ON q.lezione_id = l.id
      JOIN relatori r ON q.relatore_id = r.id
      WHERE q.id = ?
    `,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aggiorna questionario
app.put("/api/questionari/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { titolo, descrizione, config, attivo } = req.body;

    await db.execute(
      "UPDATE questionari SET titolo = ?, descrizione = ?, domande = ?, attivo = ? WHERE id = ?",
      [titolo, descrizione, JSON.stringify(config), attivo, id]
    );

    const [rows] = await db.execute(
      `
      SELECT q.*, l.titolo as lezione_titolo, r.nome as relatore_nome
      FROM questionari q
      JOIN lezioni l ON q.lezione_id = l.id
      JOIN relatori r ON q.relatore_id = r.id
      WHERE q.id = ?
    `,
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Elimina questionario
app.delete("/api/questionari/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM questionari WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// RISPOSTE ROUTES
// ==========================================

// Get risposte di un questionario
app.get("/api/risposte/questionario/:questionario_id", async (req, res) => {
  try {
    const { questionario_id } = req.params;
    const [rows] = await db.execute(
      `
      SELECT c.*, u.nome as utente_nome
      FROM compilazioni c
      JOIN utenti u ON c.utente_id = u.id
      WHERE c.questionario_id = ?
      ORDER BY c.submitted_at DESC
    `,
      [questionario_id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check se utente ha già risposto
app.get("/api/risposte/check/:questionario_id/:utente_id", async (req, res) => {
  try {
    const { questionario_id, utente_id } = req.params;
    const [rows] = await db.execute(
      "SELECT * FROM compilazioni WHERE questionario_id = ? AND utente_id = ?",
      [questionario_id, utente_id]
    );
    res.json({ hasAnswered: rows.length > 0, risposta: rows[0] || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Salva risposta questionario
app.post("/api/risposte", async (req, res) => {
  try {
    const {
      questionario_id,
      utente_id,
      risposte,
      completato,
      tempo_completamento,
    } = req.body;

    // Check if already exists
    const [existing] = await db.execute(
      "SELECT id FROM compilazioni WHERE questionario_id = ? AND utente_id = ?",
      [questionario_id, utente_id]
    );

    if (existing.length > 0) {
      // Update existing
      await db.execute(
        "UPDATE compilazioni SET risposte = ?, completata = ?, tempo_impiegato = ? WHERE questionario_id = ? AND utente_id = ?",
        [
          JSON.stringify(risposte),
          completato,
          tempo_completamento,
          questionario_id,
          utente_id,
        ]
      );
      const response_id = existing[0].id;

      const [rows] = await db.execute(
        `
        SELECT c.*, u.nome as utente_nome
        FROM compilazioni c
        JOIN utenti u ON c.utente_id = u.id
        WHERE c.id = ?
      `,
        [response_id]
      );

      res.json(rows[0]);
    } else {
      // Insert new
      const [result] = await db.execute(
        "INSERT INTO compilazioni (questionario_id, utente_id, risposte, completata, tempo_impiegato) VALUES (?, ?, ?, ?, ?)",
        [
          questionario_id,
          utente_id,
          JSON.stringify(risposte),
          completato,
          tempo_completamento,
        ]
      );

      const [rows] = await db.execute(
        `
        SELECT c.*, u.nome as utente_nome
        FROM compilazioni c
        JOIN utenti u ON c.utente_id = u.id
        WHERE c.id = ?
      `,
        [result.insertId]
      );

      res.status(201).json(rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistiche questionario
// Get statistiche questionario
app.get("/api/statistiche/questionario/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Totale risposte
    const [totalRows] = await db.execute(
      "SELECT COUNT(*) as total FROM compilazioni WHERE questionario_id = ?",
      [id]
    );

    // Risposte completate
    const [completedRows] = await db.execute(
      "SELECT COUNT(*) as completed FROM compilazioni WHERE questionario_id = ? AND completata = TRUE",
      [id]
    );

    // Tempo medio di completamento
    const [avgTimeRows] = await db.execute(
      "SELECT AVG(tempo_impiegato) as avg_time FROM compilazioni WHERE questionario_id = ? AND completata = TRUE AND tempo_impiegato IS NOT NULL",
      [id]
    );

    res.json({
      totale_risposte: totalRows[0].total,
      risposte_completate: completedRows[0].completed,
      tempo_medio: Math.round(avgTimeRows[0].avg_time || 0),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get analisi dettagliate questionario
app.get("/api/analisi/questionario/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Ottieni le informazioni del questionario
    const [questionarioRows] = await db.execute(
      "SELECT domande FROM questionari WHERE id = ?",
      [id]
    );

    if (questionarioRows.length === 0) {
      return res.status(404).json({ error: "Questionario non trovato" });
    }

    // Le domande sono già oggetti dal database MySQL
    const questionarioConfig = questionarioRows[0].domande;

    // Ottieni tutte le risposte
    const [risposteRows] = await db.execute(
      `SELECT risposte FROM compilazioni WHERE questionario_id = ? AND completata = TRUE`,
      [id]
    );

    // Totale utenti che hanno risposto
    const totalResponses = risposteRows.length;

    // Analizza ogni domanda
    const questionAnalysis = questionarioConfig.questions.map((question) => {
      const questionId = question.id.toString();
      const answers = risposteRows
        .map((row) => {
          // Le risposte sono già oggetti dal database MySQL
          const risposte = row.risposte;
          return risposte[questionId];
        })
        .filter(
          (answer) => answer !== undefined && answer !== null && answer !== ""
        );

      const responseRate =
        totalResponses > 0 ? (answers.length / totalResponses) * 100 : 0;

      let analysis = {
        questionId: question.id,
        question: question.question,
        type: question.type,
        totalResponses,
        answeredResponses: answers.length,
        responseRate: Math.round(responseRate * 100) / 100,
        analysis: {},
      };

      switch (question.type) {
        case "multiple_choice":
          const choiceCount = {};
          answers.forEach((answer) => {
            choiceCount[answer] = (choiceCount[answer] || 0) + 1;
          });

          analysis.analysis = {
            distribution: Object.entries(choiceCount)
              .map(([choice, count]) => ({
                choice,
                count,
                percentage: Math.round((count / answers.length) * 10000) / 100,
              }))
              .sort((a, b) => b.count - a.count),
          };
          break;

        case "checkbox":
          const allSelections = {};
          answers.forEach((answer) => {
            if (Array.isArray(answer)) {
              answer.forEach((selection) => {
                allSelections[selection] = (allSelections[selection] || 0) + 1;
              });
            }
          });

          analysis.analysis = {
            distribution: Object.entries(allSelections)
              .map(([choice, count]) => ({
                choice,
                count,
                percentage: Math.round((count / answers.length) * 10000) / 100,
              }))
              .sort((a, b) => b.count - a.count),
          };
          break;

        case "rating":
          const ratings = answers
            .map((a) => parseInt(a))
            .filter((r) => !isNaN(r));
          const sum = ratings.reduce((acc, val) => acc + val, 0);
          const average = ratings.length > 0 ? sum / ratings.length : 0;

          const ratingCount = {};
          ratings.forEach((rating) => {
            ratingCount[rating] = (ratingCount[rating] || 0) + 1;
          });

          analysis.analysis = {
            average: Math.round(average * 100) / 100,
            distribution: Object.entries(ratingCount)
              .map(([rating, count]) => ({
                rating: parseInt(rating),
                count,
                percentage: Math.round((count / ratings.length) * 10000) / 100,
              }))
              .sort((a, b) => a.rating - b.rating),
          };
          break;

        case "number":
          const numbers = answers
            .map((a) => parseFloat(a))
            .filter((n) => !isNaN(n));
          const numSum = numbers.reduce((acc, val) => acc + val, 0);
          const numAverage = numbers.length > 0 ? numSum / numbers.length : 0;
          const min = numbers.length > 0 ? Math.min(...numbers) : 0;
          const max = numbers.length > 0 ? Math.max(...numbers) : 0;

          analysis.analysis = {
            average: Math.round(numAverage * 100) / 100,
            min,
            max,
            responses: numbers.length,
          };
          break;

        case "text":
        case "textarea":
        case "email":
          const textResponses = answers.filter((a) => a && a.trim() !== "");
          const avgLength =
            textResponses.length > 0
              ? textResponses.reduce((acc, text) => acc + text.length, 0) /
                textResponses.length
              : 0;

          analysis.analysis = {
            responses: textResponses.length,
            averageLength: Math.round(avgLength),
            samples: textResponses.slice(0, 5), // Prime 5 risposte come esempio
          };
          break;

        default:
          analysis.analysis = {
            responses: answers.length,
            samples: answers.slice(0, 5),
          };
      }

      return analysis;
    });

    res.json({
      totalResponses,
      questions: questionAnalysis,
    });
  } catch (error) {
    console.error("Errore analisi questionario:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get risposte dettagliate con utenti per analisi
app.get("/api/questionari/:id/risposte-dettagliate", async (req, res) => {
  try {
    const { id } = req.params;

    // Ottieni tutte le risposte del questionario con i nomi degli utenti
    const [rows] = await db.execute(
      `
      SELECT c.risposte, u.nome as utente_nome, u.id as utente_id,
             c.submitted_at, c.tempo_impiegato, c.completata
      FROM compilazioni c
      JOIN utenti u ON c.utente_id = u.id
      WHERE c.questionario_id = ? AND c.completata = 1
      ORDER BY c.submitted_at DESC
      `,
      [id]
    );

    // Ottieni la configurazione del questionario per avere le domande
    const [questionarioRows] = await db.execute(
      "SELECT domande FROM questionari WHERE id = ?",
      [id]
    );

    if (questionarioRows.length === 0) {
      return res.status(404).json({ error: "Questionario non trovato" });
    }

    const questionario = questionarioRows[0];
    const config = questionario.domande; // È già un oggetto

    // Organizza le risposte per domanda
    const rispostePerDomanda = {};

    // Inizializza la struttura per ogni domanda
    if (config && config.questions) {
      config.questions.forEach((question, index) => {
        rispostePerDomanda[question.id || index] = {
          question: question.question,
          type: question.type,
          risposte: [],
        };
      });
    }

    // Processa ogni risposta
    rows.forEach((row, index) => {
      console.log(
        `Processando row ${index}:`,
        typeof row.risposte,
        row.risposte
      );
      try {
        let risposte;
        // Gestisci il caso in cui risposte sia già un oggetto o una stringa JSON
        if (typeof row.risposte === "string") {
          console.log("Parsing string JSON...");
          risposte = JSON.parse(row.risposte);
        } else if (typeof row.risposte === "object" && row.risposte !== null) {
          console.log("Usando oggetto direttamente...");
          risposte = row.risposte;
        } else {
          console.log(
            "Formato risposte non riconosciuto:",
            typeof row.risposte
          );
          return;
        }

        Object.entries(risposte).forEach(([questionId, answer]) => {
          if (rispostePerDomanda[questionId]) {
            rispostePerDomanda[questionId].risposte.push({
              utente_nome: row.utente_nome,
              utente_id: row.utente_id,
              risposta: answer,
              timestamp: row.submitted_at,
              tempo_impiegato: row.tempo_impiegato,
            });
          }
        });
      } catch (error) {
        console.error("Errore parsing risposta:", error, "Row:", row);
      }
    });

    res.json({
      totalResponses: rows.length,
      rispostePerDomanda,
    });
  } catch (error) {
    console.error("Errore recupero risposte dettagliate:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// UTILITY ROUTES
// ==========================================

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ==========================================
// CONDIVISIONE QUESTIONARI
// ==========================================

// Genera link di condivisione per un questionario
app.post("/api/questionari/:id/condividi", async (req, res) => {
  try {
    const { id } = req.params;
    const { relatore_id } = req.body;

    // Verifica che il questionario esista e appartenga al relatore
    const [questionario] = await db.execute(
      "SELECT * FROM questionari WHERE id = ? AND relatore_id = ?",
      [id, relatore_id]
    );

    if (questionario.length === 0) {
      return res.status(404).json({ error: "Questionario non trovato" });
    }

    // Genera un token unico per la condivisione
    const shareToken = require("crypto").randomBytes(32).toString("hex");
    const shareLink = `http://localhost:5173/shared/${shareToken}`;

    // Salva il token di condivisione nel database
    await db.execute(
      `INSERT INTO condivisioni (questionario_id, relatore_id, share_token, created_at, expires_at) 
       VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY))
       ON DUPLICATE KEY UPDATE 
       share_token = VALUES(share_token), 
       created_at = NOW(), 
       expires_at = DATE_ADD(NOW(), INTERVAL 30 DAY)`,
      [id, relatore_id, shareToken]
    );

    res.json({
      success: true,
      shareToken,
      shareLink,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Errore generazione link condivisione:", error);
    res.status(500).json({ error: error.message });
  }
});

// Ottieni informazioni del questionario tramite token di condivisione
app.get("/api/shared/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Verifica che il token sia valido e non scaduto
    const [condivisione] = await db.execute(
      `SELECT c.*, q.titolo, q.domande, r.nome as relatore_nome 
       FROM condivisioni c 
       JOIN questionari q ON c.questionario_id = q.id 
       JOIN relatori r ON c.relatore_id = r.id 
       WHERE c.share_token = ? AND c.expires_at > NOW()`,
      [token]
    );

    if (condivisione.length === 0) {
      return res
        .status(404)
        .json({ error: "Link di condivisione non valido o scaduto" });
    }

    const questionario = condivisione[0];

    res.json({
      success: true,
      questionario: {
        id: questionario.questionario_id,
        titolo: questionario.titolo,
        domande: questionario.domande,
        relatore_nome: questionario.relatore_nome,
        shareToken: token,
      },
    });
  } catch (error) {
    console.error("Errore recupero questionario condiviso:", error);
    res.status(500).json({ error: error.message });
  }
});

// Ottieni lista utenti per questionario condiviso
app.get("/api/shared/:token/utenti", async (req, res) => {
  try {
    const { token } = req.params;

    // Verifica che il token sia valido
    const [condivisione] = await db.execute(
      `SELECT c.relatore_id FROM condivisioni c 
       WHERE c.share_token = ? AND c.expires_at > NOW()`,
      [token]
    );

    if (condivisione.length === 0) {
      return res.status(404).json({ error: "Link di condivisione non valido" });
    }

    // Ottieni tutti gli utenti per permettere la selezione
    const [utenti] = await db.execute(
      "SELECT id, nome FROM utenti ORDER BY nome"
    );

    res.json({
      success: true,
      utenti,
    });
  } catch (error) {
    console.error("Errore recupero utenti:", error);
    res.status(500).json({ error: error.message });
  }
});

// Sottometti risposta per questionario condiviso
app.post("/api/shared/:token/submit", async (req, res) => {
  try {
    const { token } = req.params;
    const { utente_id, risposte, tempo_impiegato } = req.body;

    // Verifica che il token sia valido
    const [condivisione] = await db.execute(
      `SELECT c.questionario_id FROM condivisioni c 
       WHERE c.share_token = ? AND c.expires_at > NOW()`,
      [token]
    );

    if (condivisione.length === 0) {
      return res.status(404).json({ error: "Link di condivisione non valido" });
    }

    const questionario_id = condivisione[0].questionario_id;

    // Verifica che l'utente non abbia già risposto
    const [existing] = await db.execute(
      "SELECT id FROM compilazioni WHERE questionario_id = ? AND utente_id = ?",
      [questionario_id, utente_id]
    );

    if (existing.length > 0) {
      return res
        .status(409)
        .json({ error: "Hai già compilato questo questionario" });
    }

    // Salva la risposta
    await db.execute(
      `INSERT INTO compilazioni (questionario_id, utente_id, risposte, completata, submitted_at, tempo_impiegato) 
       VALUES (?, ?, ?, true, NOW(), ?)`,
      [
        questionario_id,
        utente_id,
        JSON.stringify(risposte),
        tempo_impiegato || 0,
      ]
    );

    res.json({
      success: true,
      message: "Risposta salvata con successo!",
    });
  } catch (error) {
    console.error("Errore salvataggio risposta condivisa:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// REDIRECT ROUTE PER LINK CONDIVISI
// ==========================================

// Redirect per link condivisi dal backend al frontend
app.get("/shared/:token", (req, res) => {
  const { token } = req.params;
  res.redirect(`http://localhost:5173/shared/${token}`);
});

// ===== EXPORT ENDPOINTS =====

// Anteprima dati export
app.get("/api/export/preview", async (req, res) => {
  try {
    const { utente_id, questionario_id, lezione_id, date_from, date_to } =
      req.query;

    let query = `
      SELECT 
        r.id,
        r.utente_id,
        u.nome as utente_nome,
        r.questionario_id,
        q.titolo as questionario_titolo,
        l.titolo as lezione_titolo,
        r.submitted_at,
        r.completata
      FROM risposte r
      JOIN utenti u ON r.utente_id = u.id
      JOIN questionari q ON r.questionario_id = q.id
      JOIN lezioni l ON q.lezione_id = l.id
      WHERE 1=1
    `;

    const params = [];

    if (utente_id) {
      query += " AND r.utente_id = ?";
      params.push(utente_id);
    }

    if (questionario_id) {
      query += " AND r.questionario_id = ?";
      params.push(questionario_id);
    }

    if (lezione_id) {
      query += " AND q.lezione_id = ?";
      params.push(lezione_id);
    }

    if (date_from) {
      query += " AND DATE(r.submitted_at) >= ?";
      params.push(date_from);
    }

    if (date_to) {
      query += " AND DATE(r.submitted_at) <= ?";
      params.push(date_to);
    }

    query += " ORDER BY r.submitted_at DESC";

    const [risposte] = await db.execute(query, params);

    // Calcola statistiche
    const utentiUnici = new Set(risposte.map((r) => r.utente_id)).size;
    const questionariUnici = new Set(risposte.map((r) => r.questionario_id))
      .size;

    res.json({
      totale_risposte: risposte.length,
      utenti_unici: utentiUnici,
      questionari_unici: questionariUnici,
      risposte: risposte,
    });
  } catch (error) {
    console.error("Errore anteprima export:", error);
    res.status(500).json({ error: "Errore nel caricamento dell'anteprima" });
  }
});

// Export risposte
app.get("/api/export/risposte", async (req, res) => {
  try {
    const {
      format,
      utente_id,
      questionario_id,
      lezione_id,
      date_from,
      date_to,
    } = req.query;

    // Query per ottenere le risposte complete
    let query = `
      SELECT 
        r.id,
        u.nome as utente_nome,
        u.id as utente_id,
        q.titolo as questionario_titolo,
        q.descrizione as questionario_descrizione,
        q.domande,
        l.titolo as lezione_titolo,
        rel.nome as relatore_nome,
        r.risposte,
        r.submitted_at,
        r.completata,
        r.tempo_impiegato
      FROM risposte r
      JOIN utenti u ON r.utente_id = u.id
      JOIN questionari q ON r.questionario_id = q.id
      JOIN lezioni l ON q.lezione_id = l.id
      JOIN relatori rel ON l.relatore_id = rel.id
      WHERE 1=1
    `;

    const params = [];

    if (utente_id) {
      query += " AND r.utente_id = ?";
      params.push(utente_id);
    }

    if (questionario_id) {
      query += " AND r.questionario_id = ?";
      params.push(questionario_id);
    }

    if (lezione_id) {
      query += " AND q.lezione_id = ?";
      params.push(lezione_id);
    }

    if (date_from) {
      query += " AND DATE(r.submitted_at) >= ?";
      params.push(date_from);
    }

    if (date_to) {
      query += " AND DATE(r.submitted_at) <= ?";
      params.push(date_to);
    }

    query += " ORDER BY r.submitted_at DESC";

    const [risposte] = await db.execute(query, params);

    // Prepara i dati per l'export
    const exportData = [];

    risposte.forEach((risposta) => {
      let risposteData = {};
      let domandeData = {};

      try {
        risposteData =
          typeof risposta.risposte === "string"
            ? JSON.parse(risposta.risposte)
            : risposta.risposte;

        domandeData =
          typeof risposta.domande === "string"
            ? JSON.parse(risposta.domande)
            : risposta.domande;
      } catch (e) {
        console.error("Errore parsing JSON:", e);
        return;
      }

      // Estrai le domande e risposte
      if (domandeData.questions && Array.isArray(domandeData.questions)) {
        domandeData.questions.forEach((domanda, index) => {
          const questionId = domanda.id || index;
          const risposta_valore = risposteData[questionId];

          let rispostaFormattata = "";
          if (Array.isArray(risposta_valore)) {
            rispostaFormattata = risposta_valore.join(", ");
          } else if (
            risposta_valore !== null &&
            risposta_valore !== undefined
          ) {
            rispostaFormattata = String(risposta_valore);
          } else {
            rispostaFormattata = "Nessuna risposta";
          }

          exportData.push({
            utente_nome: risposta.utente_nome,
            utente_id: risposta.utente_id,
            questionario: risposta.questionario_titolo,
            lezione: risposta.lezione_titolo,
            relatore: risposta.relatore_nome,
            domanda: domanda.question,
            tipo_domanda: domanda.type,
            risposta: rispostaFormattata,
            data_invio: new Date(risposta.submitted_at).toLocaleString("it-IT"),
            completata: risposta.completata ? "Sì" : "No",
            tempo_impiegato: risposta.tempo_impiegato
              ? `${Math.round(risposta.tempo_impiegato / 60)} min`
              : "N/A",
          });
        });
      }
    });

    // In base al formato richiesto
    if (format === "json") {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", "attachment; filename=export.json");
      res.json(exportData);
    } else if (format === "csv") {
      // Genera CSV
      const headers = Object.keys(exportData[0] || {});
      let csv = headers.join(",") + "\n";

      exportData.forEach((row) => {
        const values = headers.map((header) => {
          const value = row[header] || "";
          const escaped = String(value).replace(/"/g, '""');
          return escaped.includes(",") || escaped.includes("\n")
            ? `"${escaped}"`
            : escaped;
        });
        csv += values.join(",") + "\n";
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=export.csv");
      res.send(csv);
    } else if (format === "excel") {
      // Genera Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Risposte");

      // Stili
      const headerStyle = {
        font: { bold: true, color: { argb: "FFFFFFFF" } },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF0066CC" },
        },
        alignment: { vertical: "middle", horizontal: "center" },
      };

      // Aggiungi headers
      const headers = Object.keys(exportData[0] || {});
      const headerRow = worksheet.addRow(
        headers.map((h) => h.replace(/_/g, " ").toUpperCase())
      );
      headerRow.eachCell((cell) => {
        cell.style = headerStyle;
      });

      // Aggiungi dati
      exportData.forEach((row) => {
        const values = headers.map((h) => row[h]);
        worksheet.addRow(values);
      });

      // Auto-width colonne
      worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const cellLength = cell.value ? cell.value.toString().length : 10;
          if (cellLength > maxLength) maxLength = cellLength;
        });
        column.width = Math.min(maxLength + 2, 50);
      });

      // Freeze header
      worksheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=export.xlsx");

      await workbook.xlsx.write(res);
      res.end();
    } else if (format === "pdf") {
      // Genera PDF
      const doc = new PDFDocument({
        margin: 50,
        size: "A4",
        layout: "landscape",
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=export.pdf");

      doc.pipe(res);

      // Titolo
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("Export Risposte Questionari", { align: "center" });
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`Generato il ${new Date().toLocaleString("it-IT")}`, {
          align: "center",
        });
      doc.moveDown(2);

      // Statistiche
      const totalRisposte = exportData.length;
      const utentiUnici = new Set(exportData.map((r) => r.utente_id)).size;

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(
          `Totale Risposte: ${totalRisposte}  |  Utenti Unici: ${utentiUnici}`
        );
      doc.moveDown(1);

      // Tabella (semplificata per PDF)
      doc.fontSize(8).font("Helvetica");

      let y = doc.y;
      const lineHeight = 15;
      const colWidths = {
        utente: 80,
        questionario: 120,
        domanda: 150,
        risposta: 200,
        data: 90,
      };

      // Headers
      doc.font("Helvetica-Bold");
      doc.text("UTENTE", 50, y, { width: colWidths.utente, continued: true });
      doc.text("QUESTIONARIO", 50 + colWidths.utente, y, {
        width: colWidths.questionario,
        continued: true,
      });
      doc.text("DOMANDA", 50 + colWidths.utente + colWidths.questionario, y, {
        width: colWidths.domanda,
        continued: true,
      });
      doc.text(
        "RISPOSTA",
        50 + colWidths.utente + colWidths.questionario + colWidths.domanda,
        y,
        { width: colWidths.risposta, continued: true }
      );
      doc.text(
        "DATA",
        50 +
          colWidths.utente +
          colWidths.questionario +
          colWidths.domanda +
          colWidths.risposta,
        y,
        { width: colWidths.data }
      );

      doc
        .moveTo(50, y + lineHeight)
        .lineTo(750, y + lineHeight)
        .stroke();
      y += lineHeight + 5;

      // Dati (primi 100 per non sovraccaricare il PDF)
      doc.font("Helvetica");
      exportData.slice(0, 100).forEach((row) => {
        if (y > 500) {
          doc.addPage();
          y = 50;
        }

        const utente = (row.utente_nome || "").substring(0, 15);
        const questionario = (row.questionario || "").substring(0, 20);
        const domanda = (row.domanda || "").substring(0, 30);
        const risposta = (row.risposta || "").substring(0, 40);
        const data = (row.data_invio || "").split(",")[0];

        doc.text(utente, 50, y, { width: colWidths.utente, continued: true });
        doc.text(questionario, 50 + colWidths.utente, y, {
          width: colWidths.questionario,
          continued: true,
        });
        doc.text(domanda, 50 + colWidths.utente + colWidths.questionario, y, {
          width: colWidths.domanda,
          continued: true,
        });
        doc.text(
          risposta,
          50 + colWidths.utente + colWidths.questionario + colWidths.domanda,
          y,
          { width: colWidths.risposta, continued: true }
        );
        doc.text(
          data,
          50 +
            colWidths.utente +
            colWidths.questionario +
            colWidths.domanda +
            colWidths.risposta,
          y,
          { width: colWidths.data }
        );

        y += lineHeight;
      });

      if (exportData.length > 100) {
        doc.moveDown(2);
        doc
          .fontSize(10)
          .font("Helvetica-Oblique")
          .text(`... e altre ${exportData.length - 100} risposte`, {
            align: "center",
          });
      }

      doc.end();
    } else if (format === "word") {
      // Genera Word
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Titolo
              new Paragraph({
                text: "Export Risposte Questionari",
                heading: "Heading1",
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                text: `Generato il ${new Date().toLocaleString("it-IT")}`,
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({ text: "" }),

              // Statistiche
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Totale Risposte: ${exportData.length}  |  `,
                    bold: true,
                  }),
                  new TextRun({
                    text: `Utenti Unici: ${
                      new Set(exportData.map((r) => r.utente_id)).size
                    }`,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({ text: "" }),

              // Tabella
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  // Header
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({ text: "Utente", bold: true }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ text: "Questionario", bold: true }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ text: "Domanda", bold: true }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ text: "Risposta", bold: true }),
                        ],
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: "Data", bold: true })],
                      }),
                    ],
                  }),
                  // Dati (primi 50)
                  ...exportData.slice(0, 50).map(
                    (row) =>
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [
                              new Paragraph({ text: row.utente_nome || "" }),
                            ],
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({ text: row.questionario || "" }),
                            ],
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({ text: row.domanda || "" }),
                            ],
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({ text: row.risposta || "" }),
                            ],
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                text: (row.data_invio || "").split(",")[0],
                              }),
                            ],
                          }),
                        ],
                      })
                  ),
                ],
              }),
            ],
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader("Content-Disposition", "attachment; filename=export.docx");
      res.send(buffer);
    } else {
      res.status(400).json({
        error: "Formato non valido",
        message: "Formati supportati: json, csv, excel, pdf, word",
      });
    }
  } catch (error) {
    console.error("Errore export risposte:", error);
    res.status(500).json({ error: "Errore durante l'export" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Qualcosa è andato storto!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Endpoint non trovato" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server in esecuzione su porta ${PORT}`);
  console.log(`📊 API disponibili su http://localhost:${PORT}/api`);
});
