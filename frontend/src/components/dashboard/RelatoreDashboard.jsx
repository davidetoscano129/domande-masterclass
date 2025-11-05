import React, { useState, useEffect } from "react";
import { API_BASE } from "../../constants/api.js";
import QuestionarioEditor from "../questionari/QuestionarioEditor.jsx";
import ExportManager from "../shared/ExportManager.jsx";
import "../../styles/design-system.css";
import "../../styles/dashboard.css";

function RelatoreDashboard({ user, onLogout }) {
  const [lezioni, setLezioni] = useState([]);
  const [expandedLezione, setExpandedLezione] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExportManager, setShowExportManager] = useState(false);
  const [showNewLezioneForm, setShowNewLezioneForm] = useState(false);
  const [editingQuestionario, setEditingQuestionario] = useState(null);

  const [newLezione, setNewLezione] = useState({
    numero: "",
    titolo: "",
    descrizione: "",
  });

  useEffect(() => {
    fetchLezioni();
  }, []);

  const fetchLezioni = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/lezioni/relatore/${user.relatore.id}`
      );
      const data = await response.json();
      setLezioni(data);
    } catch (error) {
      console.error("Errore nel caricamento lezioni:", error);
    }
    setLoading(false);
  };

  const handleCreateLezione = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/lezioni`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newLezione,
          relatore_id: user.relatore.id,
        }),
      });
      if (response.ok) {
        setNewLezione({ numero: "", titolo: "", descrizione: "" });
        setShowNewLezioneForm(false);
        fetchLezioni();
      }
    } catch (error) {
      console.error("Errore nella creazione lezione:", error);
    }
  };

  const handleDeleteLezione = async (lezioneId) => {
    if (!confirm("Eliminare questa lezione?")) return;
    try {
      const response = await fetch(`${API_BASE}/lezioni/${lezioneId}`, {
        method: "DELETE",
      });
      if (response.ok) fetchLezioni();
    } catch (error) {
      console.error("Errore nell'eliminazione lezione:", error);
    }
  };

  const toggleLezione = (lezioneId) => {
    setExpandedLezione(expandedLezione === lezioneId ? null : lezioneId);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-content">
          <div>
            <div className="header-title">{user.relatore.nome}</div>
            <div className="header-subtitle">Relatore</div>
          </div>
          <div className="header-actions">
            <button
              onClick={() => setShowExportManager(true)}
              className="btn btn-secondary"
            >
              Esporta
            </button>
            <button onClick={onLogout} className="btn btn-text">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="hero">
        <div className="hero-logo-container">
          <img
            src="/images/logo-tesoridellimpresa.png"
            alt="I Tesori dell'Impresa"
            className="hero-logo-image"
          />
        </div>
        <h1 className="hero-title">Masterclass</h1>
        <p className="hero-subtitle">
          Gestisci le tue lezioni e questionari in modo semplice ed efficace
        </p>
      </div>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Lezioni</h2>
            <p className="section-description">
              {lezioni.length} lezioni totali
            </p>
          </div>
          <button
            onClick={() => setShowNewLezioneForm(!showNewLezioneForm)}
            className="btn btn-primary"
          >
            {showNewLezioneForm ? "Annulla" : "Nuova Lezione"}
          </button>
        </div>

        {showNewLezioneForm && (
          <form onSubmit={handleCreateLezione} className="form">
            <h3 className="form-title">Crea Nuova Lezione</h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Numero</label>
                <input
                  type="number"
                  className="form-input"
                  value={newLezione.numero}
                  onChange={(e) =>
                    setNewLezione({ ...newLezione, numero: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Titolo</label>
                <input
                  type="text"
                  className="form-input"
                  value={newLezione.titolo}
                  onChange={(e) =>
                    setNewLezione({ ...newLezione, titolo: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Descrizione</label>
              <textarea
                className="form-input"
                rows="3"
                value={newLezione.descrizione}
                onChange={(e) =>
                  setNewLezione({ ...newLezione, descrizione: e.target.value })
                }
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => setShowNewLezioneForm(false)}
                className="btn btn-text"
              >
                Annulla
              </button>
              <button type="submit" className="btn btn-primary">
                Crea Lezione
              </button>
            </div>
          </form>
        )}

        {lezioni.length === 0 ? (
          <div className="empty-state">
            <h3 className="empty-state-title">Nessuna lezione</h3>
            <p className="empty-state-description">
              Inizia creando la tua prima lezione
            </p>
          </div>
        ) : (
          lezioni.map((lezione) => (
            <LezioneCard
              key={lezione.id}
              lezione={lezione}
              expanded={expandedLezione === lezione.id}
              onToggle={() => toggleLezione(lezione.id)}
              onDelete={() => handleDeleteLezione(lezione.id)}
              onEditQuestionario={setEditingQuestionario}
              onUpdate={fetchLezioni}
              user={user}
            />
          ))
        )}
      </section>

      {showExportManager && (
        <ExportManager
          user={user}
          onClose={() => setShowExportManager(false)}
        />
      )}

      {editingQuestionario && (
        <QuestionarioEditor
          questionario={editingQuestionario}
          onClose={() => setEditingQuestionario(null)}
          onSave={() => {
            setEditingQuestionario(null);
            fetchLezioni();
          }}
        />
      )}
    </div>
  );
}

function LezioneCard({
  lezione,
  expanded,
  onToggle,
  onDelete,
  onEditQuestionario,
  onUpdate,
  user,
}) {
  const [showNewQuestionarioForm, setShowNewQuestionarioForm] = useState(false);
  const [newQuestionario, setNewQuestionario] = useState({ titolo: "" });

  const handleCreateQuestionario = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/questionari`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titolo: newQuestionario.titolo,
          lezione_id: lezione.id,
          relatore_id: user.relatore.id,
          domande: [],
        }),
      });
      if (response.ok) {
        setNewQuestionario({ titolo: "" });
        setShowNewQuestionarioForm(false);
        onUpdate();
      }
    } catch (error) {
      console.error("Errore nella creazione questionario:", error);
    }
  };

  const handleDeleteQuestionario = async (questionarioId) => {
    if (!confirm("Eliminare questo questionario?")) return;
    try {
      const response = await fetch(
        `${API_BASE}/questionari/${questionarioId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) onUpdate();
    } catch (error) {
      console.error("Errore nell'eliminazione questionario:", error);
    }
  };

  const handleToggleActive = async (questionario) => {
    try {
      const response = await fetch(
        `${API_BASE}/questionari/${questionario.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...questionario,
            attivo: !questionario.attivo,
          }),
        }
      );
      if (response.ok) onUpdate();
    } catch (error) {
      console.error("Errore nell'aggiornamento questionario:", error);
    }
  };

  return (
    <div className="lezione-card">
      <div className="lezione-header" onClick={onToggle}>
        <div className="lezione-info">
          <span className="lezione-number">Lezione {lezione.numero}</span>
          <h3 className="lezione-title">{lezione.titolo}</h3>
          {lezione.descrizione && (
            <p className="lezione-description">{lezione.descrizione}</p>
          )}
        </div>
        <div className="lezione-stats">
          <div className="stat">
            <span className="stat-value">
              {lezione.questionari?.length || 0}
            </span>
            <span className="stat-label">Questionari</span>
          </div>
          <div className="stat">
            <span className="stat-value">{lezione.risposte_count || 0}</span>
            <span className="stat-label">Risposte</span>
          </div>
        </div>
        <button className="expand-btn">{expanded ? "−" : "+"}</button>
      </div>

      {expanded && (
        <div className="lezione-content">
          <div className="actions-bar">
            <button
              onClick={() =>
                setShowNewQuestionarioForm(!showNewQuestionarioForm)
              }
              className="btn btn-primary"
            >
              {showNewQuestionarioForm ? "Annulla" : "Nuovo Questionario"}
            </button>
            <button onClick={onDelete} className="btn btn-danger">
              Elimina Lezione
            </button>
          </div>

          {showNewQuestionarioForm && (
            <form onSubmit={handleCreateQuestionario} className="form">
              <div className="form-group">
                <label className="form-label">Titolo Questionario</label>
                <input
                  type="text"
                  className="form-input"
                  value={newQuestionario.titolo}
                  onChange={(e) =>
                    setNewQuestionario({ titolo: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowNewQuestionarioForm(false)}
                  className="btn btn-text"
                >
                  Annulla
                </button>
                <button type="submit" className="btn btn-primary">
                  Crea
                </button>
              </div>
            </form>
          )}

          <div className="questionari-section">
            <h4 className="section-subtitle">Questionari</h4>
            {!lezione.questionari || lezione.questionari.length === 0 ? (
              <div className="empty-state">
                <h3 className="empty-state-title">Nessun questionario</h3>
                <p className="empty-state-description">
                  Crea il primo questionario per questa lezione
                </p>
              </div>
            ) : (
              lezione.questionari.map((q) => (
                <div key={q.id} className="questionario-item">
                  <div className="questionario-info">
                    <h5 className="questionario-title">{q.titolo}</h5>
                    <div className="questionario-meta">
                      <span
                        className={`badge ${
                          q.attivo ? "badge-active" : "badge-inactive"
                        }`}
                      >
                        {q.attivo ? "Attivo" : "Non attivo"}
                      </span>
                      <span className="badge badge-neutral">
                        {q.domande?.length || 0} domande
                      </span>
                      <span className="badge badge-neutral">
                        {q.risposte_count || 0} risposte
                      </span>
                    </div>
                  </div>
                  <div className="questionario-actions">
                    <button
                      onClick={() => handleToggleActive(q)}
                      className="icon-btn"
                      title={q.attivo ? "Disattiva" : "Attiva"}
                    >
                      {q.attivo ? "⏸" : "▶"}
                    </button>
                    <button
                      onClick={() => onEditQuestionario(q)}
                      className="icon-btn"
                      title="Modifica"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDeleteQuestionario(q.id)}
                      className="icon-btn icon-btn-danger"
                      title="Elimina"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RelatoreDashboard;
