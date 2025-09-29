const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query } = require("../config/database");

const router = express.Router();

// Registrazione utente
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validazione input
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Tutti i campi sono obbligatori (name, email, password)",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "La password deve essere di almeno 6 caratteri",
      });
    }

    // Controlla se l'email esiste già
    const existingUser = await query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);

    if (existingUser.length > 0) {
      return res.status(400).json({
        error: "Email già registrata",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserisci utente
    const result = await query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    // Genera JWT
    const token = jwt.sign(
      {
        userId: result.insertId,
        email: email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: "Utente registrato con successo",
      user: {
        id: result.insertId,
        name: name,
        email: email,
      },
      token: token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Errore durante la registrazione",
    });
  }
});

// Login utente
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validazione input
    if (!email || !password) {
      return res.status(400).json({
        error: "Email e password sono obbligatori",
      });
    }

    // Trova utente
    const users = await query(
      "SELECT id, name, email, password FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: "Credenziali non valide",
      });
    }

    const user = users[0];

    // Verifica password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: "Credenziali non valide",
      });
    }

    // Genera JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: "Login effettuato con successo",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token: token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Errore durante il login",
    });
  }
});

module.exports = router;
