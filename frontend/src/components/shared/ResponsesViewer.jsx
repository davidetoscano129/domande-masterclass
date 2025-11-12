import React, { useState, useEffect } from "react";
import { API_BASE } from "../../constants/api.js";
import { normalizeConfig } from "../../utils/helpers.js";
import "../../styles/components/responses-viewer.css";

function ResponsesViewer({ questionario, onClose }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchResponses();
  }, [questionario.id]);

  const fetchResponses = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/risposte/questionario/${questionario.id}`
      );
      const data = await response.json();

      // Converte i dati dal formato DB al formato aspettato dal componente
      const processedData = data.map((row) => {
        let risposte;
        try {
          // Parse del campo risposte (che è un JSON string)
          risposte =
            typeof row.risposte === "string"
              ? JSON.parse(row.risposte)
              : row.risposte;
        } catch (e) {
          console.error("Errore parsing risposte:", e);
          risposte = {};
        }

        // Converti da { "questionId1": "risposta1", "questionId2": "risposta2" }
        // a [{ domanda_id: questionId1, risposta: "risposta1" }, { domanda_id: questionId2, risposta: "risposta2" }]
        const risposteArray = Object.entries(risposte).map(
          ([questionId, risposta]) => {
            return {
              domanda_id: questionId, // Mantieni l'ID originale della domanda
              risposta: risposta,
            };
          }
        );

        return {
          ...row,
          risposte: risposteArray,
        };
      });
      setResponses(processedData);
    } catch (error) {
      console.error("Errore nel caricamento risposte:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowUserDetail = (user) => {
    setSelectedUser(user);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
  };

  const config = normalizeConfig(
    typeof questionario.domande === "string"
      ? JSON.parse(questionario.domande)
      : questionario.domande
  );

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("it-IT");

  const formatTime = (seconds) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Raggruppa le risposte per utente
  const groupedResponses = responses.reduce((acc, response) => {
    const userId = response.utente_id;
    if (!acc[userId]) {
      acc[userId] = {
        utente: {
          id: userId,
          nome: response.utente_nome,
          cognome: response.utente_cognome,
          codice_fiscale: response.codice_fiscale,
        },
        timestamp: response.submitted_at,
        tempo_impiegato: response.tempo_impiegato,
        risposte: [],
      };
    }
    // Aggiungi le singole risposte dall'array processato, non l'intera response
    acc[userId].risposte.push(...response.risposte);
    return acc;
  }, {});

  const users = Object.values(groupedResponses);

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content-large">
          <div className="modal-header">
            <h2>Risposte - {questionario.titolo}</h2>
            <button onClick={onClose} className="btn-close">
              ×
            </button>
          </div>
          <div className="empty-state-modern">
            <p>Caricamento risposte...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content-large">
        <div className="modal-header">
          <h2>Risposte - {questionario.titolo}</h2>
          <button onClick={onClose} className="btn-close">
            ×
          </button>
        </div>

        <div className="responses-tabs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`btn-small-modern ${
              activeTab === "overview" ? "btn-view" : "btn-share"
            }`}
          >
            Panoramica
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`btn-small-modern ${
              activeTab === "users" ? "btn-view" : "btn-share"
            }`}
          >
            Risposte Individuali
          </button>
        </div>

        <div className="responses-content">
          {activeTab === "overview" && (
            <div>
              <div className="relatore-card-modern responses-overview-card">
                <div className="relatore-card-content">
                  <h3 className="relatore-card-title">
                    Riepilogo Questionario
                  </h3>
                  <div>
                    <p className="responses-summary-item">
                      <strong>Questionari compilati:</strong> {users.length}
                    </p>
                    <div className="questions-list">
                      {config.questions.map((question, index) => (
                        <div key={index} className="question-item">
                          <div className="question-item-header">
                            <p className="question-text">
                              {index + 1}. {question.question}
                            </p>
                            <span className="question-type-badge">
                              {question.type === "text"
                                ? "Testo libero"
                                : question.type === "textarea"
                                ? "Testo libero"
                                : question.type === "multiple_choice"
                                ? "Scelta multipla"
                                : question.type === "rating"
                                ? "Valutazione"
                                : question.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              {!selectedUser ? (
                <div>
                  <h3 className="relatore-card-title">
                    Lista utenti che hanno risposto ({users.length})
                  </h3>
                  {users.length === 0 ? (
                    <div className="empty-state-modern">
                      <p>
                        Nessun utente ha ancora risposto a questo questionario.
                      </p>
                    </div>
                  ) : (
                    <div className="responses-users-grid">
                      {users.map((userData) => (
                        <div
                          key={userData.utente.id}
                          className="relatore-card-modern user-response-card"
                          onClick={() => handleShowUserDetail(userData)}
                        >
                          <div className="relatore-card-content">
                            <div className="user-response-header">
                              <div className="user-response-info">
                                <h4>
                                  {userData.utente.nome}{" "}
                                  {userData.utente.cognome}
                                </h4>
                                <div className="relatore-card-meta">
                                  <span>
                                    CF: {userData.utente.codice_fiscale}
                                  </span>
                                  <span>
                                    Data: {formatDate(userData.timestamp)}
                                  </span>
                                  {userData.tempo_impiegato && (
                                    <span>
                                      Tempo:{" "}
                                      {formatTime(userData.tempo_impiegato)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="user-response-indicator">
                                Visualizza →
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="user-detail-header">
                    <button
                      onClick={handleBackToList}
                      className="btn-small-modern btn-share"
                    >
                      ← Torna alla lista
                    </button>
                    <h3>
                      Risposte di {selectedUser.utente.nome}{" "}
                      {selectedUser.utente.cognome}
                    </h3>
                  </div>

                  <div className="user-responses-grid">
                    {config.questions.map((question, qIndex) => {
                      // Trova la risposta dell'utente per questa domanda
                      const userResponse = selectedUser.risposte.find(
                        (r) => String(r.domanda_id) === String(question.id)
                      );

                      return (
                        <div
                          key={qIndex}
                          className="relatore-card-modern user-question-card"
                        >
                          <div className="relatore-card-content">
                            <h4>
                              Domanda {qIndex + 1}: {question.question}
                            </h4>

                            <div className="user-response-content">
                              {userResponse ? (
                                <div>
                                  <strong>Risposta:</strong>
                                  <div>
                                    {question.type === "rating" ? (
                                      <span>{userResponse.risposta}/10</span>
                                    ) : (
                                      <span>{userResponse.risposta}</span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="no-response-text">
                                  Nessuna risposta fornita
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResponsesViewer;
