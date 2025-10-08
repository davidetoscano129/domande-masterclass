const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require("path");
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

// ==========================================
// AUTH ROUTES
// ==========================================

// Login relatore
app.post("/api/auth/relatore", async (req, res) => {
  try {
    const { id } = req.body;
    const [rows] = await db.execute("SELECT * FROM relatori WHERE id = ?", [
      id,
    ]);

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
    const { id } = req.body;
    const [rows] = await db.execute("SELECT * FROM utenti WHERE id = ?", [id]);

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
      SELECT r.*, q.titolo as questionario_titolo, l.titolo as lezione_titolo, rel.nome as relatore_nome
      FROM risposte r
      JOIN questionari q ON r.questionario_id = q.id
      JOIN lezioni l ON q.lezione_id = l.id
      JOIN relatori rel ON q.relatore_id = rel.id
      WHERE r.utente_id = ?
      ORDER BY r.created_at DESC
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
      ORDER BY l.created_at DESC
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
      ORDER BY l.created_at DESC
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
    const { titolo, descrizione, relatore_id } = req.body;
    const [result] = await db.execute(
      "INSERT INTO lezioni (titolo, descrizione, relatore_id) VALUES (?, ?, ?)",
      [titolo, descrizione, relatore_id]
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
      SELECT q.*, l.titolo as lezione_titolo, r.nome as relatore_nome
      FROM questionari q
      JOIN lezioni l ON q.lezione_id = l.id
      JOIN relatori r ON q.relatore_id = r.id
      ORDER BY q.created_at DESC
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
      "INSERT INTO questionari (titolo, descrizione, lezione_id, relatore_id, config) VALUES (?, ?, ?, ?, ?)",
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
      "UPDATE questionari SET titolo = ?, descrizione = ?, config = ?, attivo = ? WHERE id = ?",
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
      SELECT r.*, u.nome as utente_nome
      FROM risposte r
      JOIN utenti u ON r.utente_id = u.id
      WHERE r.questionario_id = ?
      ORDER BY r.created_at DESC
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
      "SELECT * FROM risposte WHERE questionario_id = ? AND utente_id = ?",
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
      "SELECT id FROM risposte WHERE questionario_id = ? AND utente_id = ?",
      [questionario_id, utente_id]
    );

    if (existing.length > 0) {
      // Update existing
      await db.execute(
        "UPDATE risposte SET risposte = ?, completato = ?, tempo_completamento = ? WHERE questionario_id = ? AND utente_id = ?",
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
        SELECT r.*, u.nome as utente_nome
        FROM risposte r
        JOIN utenti u ON r.utente_id = u.id
        WHERE r.id = ?
      `,
        [response_id]
      );

      res.json(rows[0]);
    } else {
      // Insert new
      const [result] = await db.execute(
        "INSERT INTO risposte (questionario_id, utente_id, risposte, completato, tempo_completamento) VALUES (?, ?, ?, ?, ?)",
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
        SELECT r.*, u.nome as utente_nome
        FROM risposte r
        JOIN utenti u ON r.utente_id = u.id
        WHERE r.id = ?
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
app.get("/api/statistiche/questionario/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Totale risposte
    const [totalRows] = await db.execute(
      "SELECT COUNT(*) as total FROM risposte WHERE questionario_id = ?",
      [id]
    );

    // Risposte completate
    const [completedRows] = await db.execute(
      "SELECT COUNT(*) as completed FROM risposte WHERE questionario_id = ? AND completato = TRUE",
      [id]
    );

    // Tempo medio di completamento
    const [avgTimeRows] = await db.execute(
      "SELECT AVG(tempo_completamento) as avg_time FROM risposte WHERE questionario_id = ? AND completato = TRUE AND tempo_completamento IS NOT NULL",
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

// ==========================================
// UTILITY ROUTES
// ==========================================

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
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
