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
          <div
            style={{
              display: "flex",
              gap: "var(--space-md)",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <h4
                style={{
                  margin: "0 0 var(--space-xs) 0",
                  fontSize: "0.875rem",
                  color: "var(--gray-600)",
                }}
              >
                Esporta Risposte Questionario
              </h4>
              <div style={{ display: "flex", gap: "var(--space-xs)" }}>
                <button
                  onClick={() => alert("Export non ancora implementato")}
                  title="Esporta in formato Word"
                  className="btn-small-modern btn-view"
                >
                  Word
                </button>
                <button
                  onClick={() => alert("Export non ancora implementato")}
                  title="Esporta in formato Excel"
                  className="btn-small-modern btn-view"
                >
                  Excel
                </button>
                <button
                  onClick={() => alert("Export non ancora implementato")}
                  title="Esporta in formato CSV"
                  className="btn-small-modern btn-view"
                >
                  CSV
                </button>
                <button
                  onClick={() => alert("Export non ancora implementato")}
                  title="Esporta in formato PDF"
                  className="btn-small-modern btn-view"
                >
                  PDF
                </button>
                <button
                  onClick={() => alert("Export non ancora implementato")}
                  title="Esporta in formato JSON"
                  className="btn-small-modern btn-view"
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

        <div
          className="modal-tabs"
          style={{
            display: "flex",
            gap: "var(--space-sm)",
            padding: "var(--space-md)",
            borderBottom: "1px solid var(--gray-200)",
            backgroundColor: "var(--gray-50)",
          }}
        >
          <button
            onClick={() => setActiveTab("overview")}
            className={`btn-small-modern ${
              activeTab === "overview" ? "btn-view" : "btn-share"
            }`}
          >
            Panoramica
          </button>
          <button
            onClick={() => setActiveTab("analysis")}
            className={`btn-small-modern ${
              activeTab === "analysis" ? "btn-view" : "btn-share"
            }`}
          >
            Analisi Dettagliata
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`btn-small-modern ${
              activeTab === "details" ? "btn-view" : "btn-share"
            }`}
          >
            Risposte Individuali
          </button>
        </div>

        <div style={{ padding: "var(--space-lg)" }}>
          {activeTab === "overview" && (
            <div>
              {statistics && (
                <div
                  className="relatore-card-modern"
                  style={{ marginBottom: "var(--space-lg)" }}
                >
                  <div className="relatore-card-content">
                    <h3 className="relatore-card-title">
                      Statistiche Generali
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "var(--space-md)",
                        marginTop: "var(--space-md)",
                      }}
                    >
                      <div
                        style={{
                          padding: "var(--space-md)",
                          backgroundColor: "var(--gray-50)",
                          borderRadius: "var(--radius-sm)",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            display: "block",
                            fontSize: "2rem",
                            fontWeight: "700",
                            color: "var(--brand-blue)",
                          }}
                        >
                          {statistics.totale_risposte}
                        </span>
                        <span
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--gray-600)",
                          }}
                        >
                          Risposte Totali
                        </span>
                      </div>
                      <div
                        style={{
                          padding: "var(--space-md)",
                          backgroundColor: "var(--gray-50)",
                          borderRadius: "var(--radius-sm)",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            display: "block",
                            fontSize: "2rem",
                            fontWeight: "700",
                            color: "var(--brand-green)",
                          }}
                        >
                          {statistics.risposte_completate}
                        </span>
                        <span
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--gray-600)",
                          }}
                        >
                          Completate
                        </span>
                      </div>
                      <div
                        style={{
                          padding: "var(--space-md)",
                          backgroundColor: "var(--gray-50)",
                          borderRadius: "var(--radius-sm)",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            display: "block",
                            fontSize: "2rem",
                            fontWeight: "700",
                            color: "var(--gray-700)",
                          }}
                        >
                          {formatTime(statistics.tempo_medio)}
                        </span>
                        <span
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--gray-600)",
                          }}
                        >
                          Tempo Medio
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {analysis && (
                <div className="relatore-card-modern">
                  <div className="relatore-card-content">
                    <h3 className="relatore-card-title">Panoramica Rapida</h3>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--space-md)",
                        marginTop: "var(--space-md)",
                      }}
                    >
                      {analysis.questions.map((q) => (
                        <div
                          key={q.questionId}
                          style={{
                            padding: "var(--space-md)",
                            backgroundColor: "var(--gray-50)",
                            borderRadius: "var(--radius-sm)",
                            borderLeft: "3px solid var(--brand-blue)",
                          }}
                        >
                          <h4
                            style={{
                              margin: "0 0 var(--space-sm) 0",
                              color: "var(--gray-900)",
                            }}
                          >
                            {q.question}
                          </h4>
                          <div className="relatore-card-meta">
                            <span>
                              Risposte: {q.responseRate}% ({q.answeredResponses}
                              /{q.totalResponses})
                            </span>
                            {q.type === "multiple_choice" &&
                              q.analysis.distribution[0] && (
                                <span>
                                  Più votata: "
                                  {q.analysis.distribution[0].choice}" (
                                  {q.analysis.distribution[0].percentage}%)
                                </span>
                              )}
                            {q.type === "rating" && (
                              <span>Media: {q.analysis.average}/10</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "analysis" && analysis && (
            <div>
              {!showDetailedView ? (
                <div>
                  <h3 style={{ marginBottom: "var(--space-lg)" }}>
                    Analisi Dettagliata per Domanda
                  </h3>
                  {analysis.questions.map((questionData) => (
                    <div
                      key={questionData.questionId}
                      className="relatore-card-modern"
                      style={{ marginBottom: "var(--space-md)" }}
                    >
                      <div className="relatore-card-header">
                        <h4 style={{ margin: 0, flex: 1 }}>
                          {questionData.question}
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            gap: "var(--space-sm)",
                            alignItems: "center",
                          }}
                        >
                          <span className="badge-success">
                            {questionData.type}
                          </span>
                          <span className="relatore-card-number">
                            {questionData.responseRate}% risposto
                          </span>
                          <button
                            onClick={() =>
                              handleShowUserResponses(questionData.questionId)
                            }
                            title="Vedi chi ha risposto cosa"
                            className="btn-small-modern btn-view"
                          >
                            Dettagli utenti
                          </button>
                        </div>
                      </div>
                      <div className="relatore-card-content">
                        {questionData.type === "multiple_choice" && (
                          <div>
                            <h5
                              style={{
                                margin: "0 0 var(--space-md) 0",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                color: "var(--gray-700)",
                              }}
                            >
                              Distribuzione Scelte:
                            </h5>
                            {questionData.analysis.distribution.map(
                              (item, index) => (
                                <div
                                  key={index}
                                  style={{ marginBottom: "var(--space-sm)" }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      marginBottom: "var(--space-xs)",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: "0.875rem",
                                        color: "var(--gray-700)",
                                      }}
                                    >
                                      {item.choice}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: "0.875rem",
                                        fontWeight: "600",
                                        color: "var(--brand-blue)",
                                      }}
                                    >
                                      {item.count} voti ({item.percentage}%)
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      width: "100%",
                                      height: "8px",
                                      backgroundColor: "var(--gray-200)",
                                      borderRadius: "var(--radius-sm)",
                                      overflow: "hidden",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: `${item.percentage}%`,
                                        height: "100%",
                                        backgroundColor: "var(--brand-blue)",
                                        transition: "width 0.3s ease",
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                        {questionData.type === "rating" && (
                          <div>
                            <div
                              style={{
                                padding: "var(--space-md)",
                                backgroundColor: "var(--brand-blue)",
                                color: "var(--white)",
                                borderRadius: "var(--radius-sm)",
                                textAlign: "center",
                                marginBottom: "var(--space-md)",
                              }}
                            >
                              <div>
                                <span
                                  style={{
                                    fontSize: "2.5rem",
                                    fontWeight: "700",
                                    display: "block",
                                  }}
                                >
                                  {questionData.analysis.average}
                                </span>
                                <span style={{ fontSize: "0.875rem" }}>
                                  Media
                                </span>
                              </div>
                            </div>
                            <h5
                              style={{
                                margin: "0 0 var(--space-md) 0",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                color: "var(--gray-700)",
                              }}
                            >
                              Distribuzione Voti:
                            </h5>
                            {questionData.analysis.distribution.map((item) => (
                              <div
                                key={item.rating}
                                style={{ marginBottom: "var(--space-sm)" }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: "var(--space-xs)",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "0.875rem",
                                      color: "var(--gray-700)",
                                    }}
                                  >
                                    {item.rating} ★
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "0.875rem",
                                      fontWeight: "600",
                                      color: "var(--brand-blue)",
                                    }}
                                  >
                                    {item.count} voti ({item.percentage}%)
                                  </span>
                                </div>
                                <div
                                  style={{
                                    width: "100%",
                                    height: "8px",
                                    backgroundColor: "var(--gray-200)",
                                    borderRadius: "var(--radius-sm)",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: `${item.percentage}%`,
                                      height: "100%",
                                      backgroundColor: "var(--brand-green)",
                                      transition: "width 0.3s ease",
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {(questionData.type === "text" ||
                          questionData.type === "textarea") && (
                          <div>
                            <div
                              className="relatore-card-meta"
                              style={{ marginBottom: "var(--space-md)" }}
                            >
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
                              <div>
                                <h5
                                  style={{
                                    margin: "0 0 var(--space-sm) 0",
                                    fontSize: "0.875rem",
                                    fontWeight: "600",
                                    color: "var(--gray-700)",
                                  }}
                                >
                                  Esempi di risposte:
                                </h5>
                                {questionData.analysis.samples.map(
                                  (sample, index) => (
                                    <div
                                      key={index}
                                      style={{
                                        padding: "var(--space-sm)",
                                        backgroundColor: "var(--gray-50)",
                                        borderRadius: "var(--radius-sm)",
                                        marginBottom: "var(--space-xs)",
                                        fontSize: "0.875rem",
                                        color: "var(--gray-700)",
                                        fontStyle: "italic",
                                      }}
                                    >
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
            <div>
              <div>
                <h3 style={{ marginBottom: "var(--space-lg)" }}>
                  Risposte Individuali ({responses.length})
                </h3>
                {responses.length === 0 ? (
                  <div className="empty-state-modern">
                    <p>Nessuna risposta ancora ricevuta.</p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--space-md)",
                    }}
                  >
                    {responses.map((response) => (
                      <div key={response.id} className="relatore-card-modern">
                        <div className="relatore-card-header">
                          <h4 style={{ margin: 0 }}>{response.utente_nome}</h4>
                          <div className="relatore-card-meta">
                            <span>
                              Data: {formatDate(response.submitted_at)}
                            </span>
                            <span>
                              Tempo: {formatTime(response.tempo_impiegato)}
                            </span>
                            <span
                              className={
                                response.completata
                                  ? "badge-success"
                                  : "badge-elimina"
                              }
                            >
                              {response.completata
                                ? "Completata"
                                : "Incompleta"}
                            </span>
                          </div>

                          {/* Pulsanti export per utente specifico */}
                          <div>
                            <span>Export:</span>
                            <button
                              onClick={() =>
                                alert("Export non ancora implementato")
                              }
                              title="Esporta risposte di questo utente in Word"
                            >
                              Word
                            </button>
                            <button
                              onClick={() =>
                                alert("Export non ancora implementato")
                              }
                              title="Esporta risposte di questo utente in Excel"
                            >
                              Excel
                            </button>
                          </div>
                        </div>
                        <div>
                          {config.questions.map((question) => {
                            const risposteData =
                              typeof response.risposte === "string"
                                ? JSON.parse(response.risposte)
                                : response.risposte;
                            const answer = risposteData[question.id];
                            return (
                              <div key={question.id}>
                                <strong>{question.question}</strong>
                                <div>
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
      <div>
        <p>Caricamento risposte dettagliate...</p>
      </div>
    );
  }

  const questionData = detailedResponses.rispostePerDomanda[questionId];
  if (!questionData) {
    return (
      <div>
        <p>Domanda non trovata</p>
        <button onClick={onBack}>← Torna indietro</button>
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
    <div>
      <div>
        <button onClick={onBack}>← Torna all'analisi</button>
      </div>

      <div>
        <div>
          <h3>Chi ha risposto cosa</h3>
          <h4>{questionData.question}</h4>
          <p>
            Tipo: <span>{questionData.type}</span> | Totale risposte:{" "}
            <strong>{questionData.risposte.length}</strong>
          </p>
        </div>
      </div>

      <div id="detailed-response-content">
        {Object.entries(groupedResponses).map(([answer, users]) => (
          <div key={answer}>
            <div>
              <div>
                <span>{answer}</span>
                <span>
                  {users.length} utent{users.length === 1 ? "e" : "i"}
                </span>
              </div>
            </div>
            <div>
              {users.map((user, index) => (
                <div key={index}>
                  <div>
                    <span>{user.utente_nome}</span>
                    <span>
                      Data: {new Date(user.timestamp).toLocaleString("it-IT")}
                    </span>
                    {user.tempo_impiegato && (
                      <span>
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
