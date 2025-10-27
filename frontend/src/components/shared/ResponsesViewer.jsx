import React, { useState, useEffect } from "react";
import { API_BASE } from "../../constants/api.js";
import { normalizeConfig } from "../../utils/helpers.js";

function ResponsesViewer({ questionario, onClose }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [detailedResponses, setDetailedResponses] = useState(null);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchResponses();
    fetchStatistics();
    fetchAnalysis();
  }, [questionario.id]);

  const fetchResponses = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/risposte/questionario/${questionario.id}`
      );
      const data = await response.json();
      setResponses(data);
    } catch (error) {
      console.error("Errore nel caricamento risposte:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/statistiche/questionario/${questionario.id}`
      );
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error("Errore nel caricamento statistiche:", error);
    }
  };

  const fetchAnalysis = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/analisi/questionario/${questionario.id}`
      );
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error("Errore nel caricamento analisi:", error);
    }
  };

  const fetchDetailedResponses = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/questionari/${questionario.id}/risposte-dettagliate`
      );
      const data = await response.json();
      setDetailedResponses(data);
    } catch (error) {
      console.error("Errore nel caricamento risposte dettagliate:", error);
    }
  };

  const handleShowUserResponses = async (questionId) => {
    if (!detailedResponses) {
      await fetchDetailedResponses();
    }
    setSelectedQuestion(questionId);
    setShowDetailedView(true);
  };

  const handleBackToAnalysis = () => {
    setShowDetailedView(false);
    setSelectedQuestion(null);
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

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content responses-modal">
          <div className="modal-header">
            <h2>Risposte - {questionario.titolo}</h2>
            <button onClick={onClose} className="btn-close">
              ×
            </button>
          </div>
          <div className="modal-body">
            <p>Caricamento risposte...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content responses-modal">
        <div className="modal-header">
          <h2>Risposte - {questionario.titolo}</h2>
          <div className="header-actions">
            <div className="export-section">
              <h4>Esporta Risposte Questionario</h4>
              <div className="export-buttons">
                <button
                  onClick={() => alert("Export non ancora implementato")}
                  className="btn-export btn-word"
                  title="Esporta in formato Word"
                >
                  Word
                </button>
                <button
                  onClick={() => alert("Export non ancora implementato")}
                  className="btn-export btn-excel"
                  title="Esporta in formato Excel"
                >
                  Excel
                </button>
                <button
                  onClick={() => alert("Export non ancora implementato")}
                  className="btn-export btn-csv"
                  title="Esporta in formato CSV"
                >
                  CSV
                </button>
                <button
                  onClick={() => alert("Export non ancora implementato")}
                  className="btn-export btn-pdf"
                  title="Esporta in formato PDF"
                >
                  PDF
                </button>
                <button
                  onClick={() => alert("Export non ancora implementato")}
                  className="btn-export btn-json"
                  title="Esporta in formato JSON"
                >
                  JSON
                </button>
              </div>
            </div>
            <button onClick={onClose} className="btn-close">
              ×
            </button>
          </div>
        </div>

        <div className="tabs-navigation">
          <button
            className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Panoramica
          </button>
          <button
            className={`tab-button ${activeTab === "analysis" ? "active" : ""}`}
            onClick={() => setActiveTab("analysis")}
          >
            Analisi Dettagliata
          </button>
          <button
            className={`tab-button ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            Risposte Individuali
          </button>
        </div>

        <div className="modal-body">
          {activeTab === "overview" && (
            <div className="tab-content">
              {statistics && (
                <div className="statistics-section">
                  <h3>Statistiche Generali</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <span className="stat-number">
                        {statistics.totale_risposte}
                      </span>
                      <span className="stat-label">Risposte Totali</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-number">
                        {statistics.risposte_completate}
                      </span>
                      <span className="stat-label">Completate</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-number">
                        {formatTime(statistics.tempo_medio)}
                      </span>
                      <span className="stat-label">Tempo Medio</span>
                    </div>
                  </div>
                </div>
              )}
              {analysis && (
                <div className="quick-overview">
                  <h3>Panoramica Rapida</h3>
                  <div className="overview-grid">
                    {analysis.questions.map((q) => (
                      <div key={q.questionId} className="overview-card">
                        <h4>{q.question}</h4>
                        <div className="overview-stats">
                          <span className="response-rate">
                            Risposte: {q.responseRate}% ({q.answeredResponses}/
                            {q.totalResponses})
                          </span>
                          {q.type === "multiple_choice" &&
                            q.analysis.distribution[0] && (
                              <span className="top-answer">
                                Più votata: "{q.analysis.distribution[0].choice}
                                " ({q.analysis.distribution[0].percentage}%)
                              </span>
                            )}
                          {q.type === "rating" && (
                            <span className="average-rating">
                              Media: {q.analysis.average}/10
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "analysis" && analysis && (
            <div className="tab-content">
              {!showDetailedView ? (
                <div className="detailed-analysis">
                  <h3>Analisi Dettagliata per Domanda</h3>
                  {analysis.questions.map((questionData) => (
                    <div
                      key={questionData.questionId}
                      className="question-analysis"
                    >
                      <div className="question-header">
                        <h4>{questionData.question}</h4>
                        <div className="question-meta">
                          <span className="question-type">
                            {questionData.type}
                          </span>
                          <span className="response-rate">
                            {questionData.responseRate}% risposto
                          </span>
                          <button
                            className="btn-small btn-users"
                            onClick={() =>
                              handleShowUserResponses(questionData.questionId)
                            }
                            title="Vedi chi ha risposto cosa"
                          >
                            Dettagli utenti
                          </button>
                        </div>
                      </div>
                      <div className="analysis-content">
                        {questionData.type === "multiple_choice" && (
                          <div className="choice-analysis">
                            <h5>Distribuzione Scelte:</h5>
                            {questionData.analysis.distribution.map(
                              (item, index) => (
                                <div key={index} className="choice-bar">
                                  <div className="choice-info">
                                    <span className="choice-text">
                                      {item.choice}
                                    </span>
                                    <span className="choice-stats">
                                      {item.count} voti ({item.percentage}%)
                                    </span>
                                  </div>
                                  <div className="progress-bar">
                                    <div
                                      className="progress-fill"
                                      style={{ width: `${item.percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                        {questionData.type === "rating" && (
                          <div className="rating-analysis">
                            <div className="rating-summary">
                              <div className="avg-rating">
                                <span className="rating-number">
                                  {questionData.analysis.average}
                                </span>
                                <span className="rating-label">Media</span>
                              </div>
                            </div>
                            <h5>Distribuzione Voti:</h5>
                            {questionData.analysis.distribution.map((item) => (
                              <div key={item.rating} className="rating-bar">
                                <div className="rating-info">
                                  <span className="rating-value">
                                    {item.rating} ★
                                  </span>
                                  <span className="rating-stats">
                                    {item.count} voti ({item.percentage}%)
                                  </span>
                                </div>
                                <div className="progress-bar">
                                  <div
                                    className="progress-fill"
                                    style={{ width: `${item.percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {(questionData.type === "text" ||
                          questionData.type === "textarea") && (
                          <div className="text-analysis">
                            <div className="text-stats">
                              <span>
                                Risposte: {questionData.analysis.responses}{" "}
                                risposte testuali
                              </span>
                              <span>
                                Lunghezza media:{" "}
                                {questionData.analysis.averageLength} caratteri
                              </span>
                            </div>
                            {questionData.analysis.samples.length > 0 && (
                              <div className="text-samples">
                                <h5>Esempi di risposte:</h5>
                                {questionData.analysis.samples.map(
                                  (sample, index) => (
                                    <div key={index} className="sample-text">
                                      "{sample}"
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <DetailedResponseView
                  questionId={selectedQuestion}
                  detailedResponses={detailedResponses}
                  onBack={handleBackToAnalysis}
                />
              )}
            </div>
          )}

          {activeTab === "details" && (
            <div className="tab-content">
              <div className="responses-section">
                <h3>Risposte Individuali ({responses.length})</h3>
                {responses.length === 0 ? (
                  <p className="no-responses">
                    Nessuna risposta ancora ricevuta.
                  </p>
                ) : (
                  <div className="responses-list">
                    {responses.map((response) => (
                      <div key={response.id} className="response-card">
                        <div className="response-header">
                          <h4>{response.utente_nome}</h4>
                          <div className="response-meta">
                            <span>
                              Data: {formatDate(response.submitted_at)}
                            </span>
                            <span>
                              Tempo: {formatTime(response.tempo_impiegato)}
                            </span>
                            <span
                              className={`status ${
                                response.completata ? "completed" : "incomplete"
                              }`}
                            >
                              {response.completata
                                ? "Completata"
                                : "Incompleta"}
                            </span>
                          </div>

                          {/* Pulsanti export per utente specifico */}
                          <div className="user-export-buttons">
                            <span className="export-label">Export:</span>
                            <button
                              onClick={() =>
                                alert("Export non ancora implementato")
                              }
                              className="btn-export btn-word btn-small"
                              title="Esporta risposte di questo utente in Word"
                            >
                              Word
                            </button>
                            <button
                              onClick={() =>
                                alert("Export non ancora implementato")
                              }
                              className="btn-export btn-excel btn-small"
                              title="Esporta risposte di questo utente in Excel"
                            >
                              Excel
                            </button>
                          </div>
                        </div>
                        <div className="response-answers">
                          {config.questions.map((question) => {
                            const risposteData =
                              typeof response.risposte === "string"
                                ? JSON.parse(response.risposte)
                                : response.risposte;
                            const answer = risposteData[question.id];
                            return (
                              <div key={question.id} className="answer-item">
                                <strong>{question.question}</strong>
                                <div className="answer-value">
                                  {Array.isArray(answer)
                                    ? answer.join(", ")
                                    : answer || "Nessuna risposta"}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente per visualizzare risposte dettagliate per utente
function DetailedResponseView({ questionId, detailedResponses, onBack }) {
  if (!detailedResponses || !detailedResponses.rispostePerDomanda) {
    return (
      <div className="loading-container">
        <p>Caricamento risposte dettagliate...</p>
      </div>
    );
  }

  const questionData = detailedResponses.rispostePerDomanda[questionId];
  if (!questionData) {
    return (
      <div className="error">
        <p>Domanda non trovata</p>
        <button onClick={onBack} className="btn-secondary">
          ← Torna indietro
        </button>
      </div>
    );
  }

  // Raggruppa le risposte per valore
  const groupedResponses = {};
  questionData.risposte.forEach((resp) => {
    const key = Array.isArray(resp.risposta)
      ? resp.risposta.join(", ")
      : String(resp.risposta);
    if (!groupedResponses[key]) {
      groupedResponses[key] = [];
    }
    groupedResponses[key].push(resp);
  });

  return (
    <div className="detailed-response-view">
      <div className="back-button-container">
        <button onClick={onBack} className="btn-back-prominent">
          ← Torna all'analisi
        </button>
      </div>

      <div className="question-detail-header">
        <div className="header-content">
          <h3>Chi ha risposto cosa</h3>
          <h4>{questionData.question}</h4>
          <p className="response-summary">
            Tipo: <span className="question-type">{questionData.type}</span> |
            Totale risposte: <strong>{questionData.risposte.length}</strong>
          </p>
        </div>
      </div>

      <div id="detailed-response-content" className="grouped-responses">
        {Object.entries(groupedResponses).map(([answer, users]) => (
          <div key={answer} className="response-group">
            <div className="response-group-header">
              <div className="answer-display">
                <span className="answer-text">{answer}</span>
                <span className="user-count">
                  {users.length} utent{users.length === 1 ? "e" : "i"}
                </span>
              </div>
            </div>
            <div className="users-list">
              {users.map((user, index) => (
                <div key={index} className="user-response-item">
                  <div className="user-info">
                    <span className="user-name">{user.utente_nome}</span>
                    <span className="timestamp">
                      Data: {new Date(user.timestamp).toLocaleString("it-IT")}
                    </span>
                    {user.tempo_impiegato && (
                      <span className="time-taken">
                        Tempo: {Math.round(user.tempo_impiegato / 60)} min
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResponsesViewer;
