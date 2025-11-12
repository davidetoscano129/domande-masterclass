import React, { useState, useEffect } from "react";
import { API_BASE } from "../../constants/api.js";
import QuestionarioEditor from "../questionari/QuestionarioEditor.jsx";
import ExportManager from "../shared/ExportManager.jsx";
import ShareModal from "../shared/ShareModal.jsx";
import ResponsesViewer from "../shared/ResponsesViewer.jsx";
import "../../styles/design-system.css";
import "../../styles/dashboard.css";
import "../../styles/dashboard/relatore.css";

function RelatoreDashboard({ user, onLogout }) {
  const [lezioni, setLezioni] = useState([]);
  const [expandedLezione, setExpandedLezione] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExportManager, setShowExportManager] = useState(false);
  const [showNewLezioneForm, setShowNewLezioneForm] = useState(false);
  const [editingQuestionario, setEditingQuestionario] = useState(null);
  const [creatingQuestionario, setCreatingQuestionario] = useState(null); // Lezione per cui creare questionario
  const [viewingResponses, setViewingResponses] = useState(null); // Questionario di cui vedere le risposte
  const [shareData, setShareData] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

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

  const handleDeleteQuestionario = async (questionarioId) => {
    if (!confirm("Eliminare questo questionario?")) return;
    try {
      const response = await fetch(
        `${API_BASE}/questionari/${questionarioId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        await fetchLezioni(); // Ricarica le lezioni
      }
    } catch (error) {
      console.error("Errore nell'eliminazione questionario:", error);
    }
  };

  const handleShareQuestionario = async (questionario) => {
    console.log("🔗 Condivisione questionario:", questionario);
    try {
      console.log("📡 Chiamata API condivisione...");
      const response = await fetch(
        `${API_BASE}/questionari/${questionario.id}/condividi`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            relatore_id: user.relatore.id,
          }),
        }
      );

      console.log("📡 Risposta API:", response.status, response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Dati condivisione ricevuti:", data);
        setShareData({
          questionario: questionario.titolo,
          shareLink: data.shareLink,
          shareToken: data.shareToken,
          expiresAt: data.expiresAt,
        });
        setShowShareModal(true);
      } else {
        const errorText = await response.text();
        console.error(
          "❌ Errore API condivisione:",
          response.status,
          errorText
        );
      }
    } catch (error) {
      console.error("❌ Errore nella creazione link condivisione:", error);
    }
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
              onToggle={() =>
                setExpandedLezione(
                  expandedLezione === lezione.id ? null : lezione.id
                )
              }
              onDelete={() => handleDeleteLezione(lezione.id)}
              onEditQuestionario={setEditingQuestionario}
              onCreateQuestionario={setCreatingQuestionario}
              onUpdate={fetchLezioni}
              onDeleteQuestionario={handleDeleteQuestionario}
              onShareQuestionario={handleShareQuestionario}
              onViewResponses={setViewingResponses}
              setExpandedLezione={setExpandedLezione}
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
        <div className="modal-overlay">
          <div className="modal-content-large">
            <QuestionarioEditor
              questionario={editingQuestionario}
              lezioni={lezioni}
              user={user}
              onCancel={() => setEditingQuestionario(null)}
              onSave={() => {
                setEditingQuestionario(null);
                fetchLezioni();
              }}
            />
          </div>
        </div>
      )}

      {creatingQuestionario && (
        <div className="modal-overlay">
          <div className="modal-content-large">
            <QuestionarioEditor
              questionario={null}
              lezioni={[creatingQuestionario]}
              user={user}
              lezionePreselezionata={creatingQuestionario}
              onCancel={() => setCreatingQuestionario(null)}
              onSave={() => {
                setCreatingQuestionario(null);
                fetchLezioni();
              }}
            />
          </div>
        </div>
      )}

      {showShareModal && shareData && (
        <ShareModal
          shareData={shareData}
          onClose={() => {
            setShowShareModal(false);
            setShareData(null);
          }}
        />
      )}

      {viewingResponses && (
        <div className="modal-overlay">
          <div className="modal-content-large">
            <ResponsesViewer
              questionario={viewingResponses}
              onClose={() => setViewingResponses(null)}
            />
          </div>
        </div>
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
  onCreateQuestionario,
  onUpdate,
  onDeleteQuestionario,
  onShareQuestionario,
  onViewResponses,
  setExpandedLezione,
  user,
}) {
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
              onClick={() => onCreateQuestionario(lezione)}
              className="btn btn-primary"
            >
              Nuovo Questionario
            </button>
            <button onClick={onDelete} className="btn btn-danger">
              Elimina Lezione
            </button>
          </div>

          <div className="questionari-section">
            <h4 className="section-subtitle">Questionari</h4>
            {!lezione.questionari || lezione.questionari.length === 0 ? (
              <div className="empty-state-card">
                <div className="empty-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                </div>
                <h3 className="empty-state-title">Nessun questionario</h3>
                <p className="empty-state-description">
                  Crea il primo questionario per questa lezione
                </p>
                <button
                  onClick={() => onCreateQuestionario(lezione)}
                  className="btn btn-primary-outline"
                >
                  Crea Questionario
                </button>
              </div>
            ) : (
              <div className="questionari-grid">
                {lezione.questionari.map((q) => (
                  <div key={q.id} className="questionario-card-modern">
                    <div className="questionario-card-body">
                      <h5 className="questionario-card-title">{q.titolo}</h5>
                    </div>

                    <div className="questionario-card-actions">
                      <button
                        onClick={() => onViewResponses(q)}
                        className={`card-action-btn primary ${
                          !q.risposte_count || q.risposte_count === 0
                            ? "disabled"
                            : ""
                        }`}
                        disabled={!q.risposte_count || q.risposte_count === 0}
                        title="Visualizza risposte"
                      >
                        <svg
                          className="btn-icon"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        </svg>
                        Visualizza
                      </button>
                      <button
                        onClick={() => onEditQuestionario(q)}
                        className="card-action-btn secondary"
                        title="Modifica questionario"
                      >
                        <svg
                          className="btn-icon"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                        Modifica
                      </button>
                      <button
                        onClick={() => onShareQuestionario(q)}
                        className="card-action-btn accent"
                        title="Condividi questionario"
                      >
                        <svg
                          className="btn-icon"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.50-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                        </svg>
                        Condividi
                      </button>
                      <button
                        onClick={() => onDeleteQuestionario(q.id)}
                        className="card-action-btn danger"
                        title="Elimina questionario"
                      >
                        <svg
                          className="btn-icon"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                        Elimina
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RelatoreDashboard;
