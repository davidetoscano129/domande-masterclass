const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Importa database
const { testConnection } = require("./config/database");

// Importa routes
const authRoutes = require("./routes/auth");
const questionnaireRoutes = require("./routes/questionnaires");
const questionRoutes = require("./routes/questions");
const sharedRoutes = require("./routes/shared");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test database connection al startup
testConnection();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/questionnaires", questionnaireRoutes);
app.use("/api", questionRoutes);
app.use("/api/shared", sharedRoutes);

// Test route (una sola versione)
app.get("/", (req, res) => {
  res.json({
    message: "QuestionariApp API is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: [
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/questionnaires",
      "POST /api/questionnaires",
      "GET /api/questionnaires/:id",
      "PUT /api/questionnaires/:id",
      "DELETE /api/questionnaires/:id",
      "POST /api/questionnaires/:id/share",
      "DELETE /api/questionnaires/:id/share",
      "GET /api/questionnaires/:id/questions",
      "POST /api/questionnaires/:id/questions",
      "PUT /api/questions/:id",
      "DELETE /api/questions/:id",
      "GET /api/shared/:token",
      "POST /api/shared/:token/responses",
      "GET /health",
    ],
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    database: "Connected",
    uptime: process.uptime(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Server Error:", error);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🗄️  Database: ${process.env.DB_NAME || "Not configured"}`);
});

module.exports = app;
