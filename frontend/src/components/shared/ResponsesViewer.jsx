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
      <div>
        <div>
          <div>
            <h2>Risposte - {questionario.titolo}</h2>
            <button onClick={onClose}>×</button>
          </div>
          <div>
            <p>Caricamento risposte...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div>
          <h2>Risposte - {questionario.titolo}</h2>
          <div>
            <div>
              <h4>Esporta Risposte Questionario</h4>
              <div>
                <button
                  onClick={() => alert("Export non ancora implementato")}
                  title="Esporta in formato Word"
                >
                  Word
                </button>
                <button
                  onClick={() => alert("Export non ancora implementato")}
                  title="Esporta in formato Excel"
                >
                  Excel
                </button>
                <button
                  onClick={() => alert("Export non ancora implementato")}
                  title="Esporta in formato CSV"
                >
                  CSV
                </button>
                <button
                  onClick={() => alert("Export non ancora implementato")}
                  title="Esporta in formato PDF"
                >
                  PDF
                </button>
                <button
                  onClick={() => alert("Export non ancora implementato")}
                  title="Esporta in formato JSON"
                >
                  JSON
                </button>
              </div>
            </div>
            <button onClick={onClose}>×</button>
          </div>
        </div>

        <div>
          <button onClick={() => setActiveTab("overview")}>Panoramica</button>
          <button onClick={() => setActiveTab("analysis")}>
            Analisi Dettagliata
          </button>
          <button onClick={() => setActiveTab("details")}>
            Risposte Individuali
          </button>
        </div>

        <div>
          {activeTab === "overview" && (
            <div>
              {statistics && (
                <div>
                  <h3>Statistiche Generali</h3>
                  <div>
                    <div>
                      <span>{statistics.totale_risposte}</span>
                      <span>Risposte Totali</span>
                    </div>
                    <div>
                      <span>{statistics.risposte_completate}</span>
                      <span>Completate</span>
                    </div>
                    <div>
                      <span>{formatTime(statistics.tempo_medio)}</span>
                      <span>Tempo Medio</span>
                    </div>
                  </div>
                </div>
              )}
              {analysis && (
                <div>
                  <h3>Panoramica Rapida</h3>
                  <div>
                    {analysis.questions.map((q) => (
                      <div key={q.questionId}>
                        <h4>{q.question}</h4>
                        <div>
                          <span>
                            Risposte: {q.responseRate}% ({q.answeredResponses}/
                            {q.totalResponses})
                          </span>
                          {q.type === "multiple_choice" &&
                            q.analysis.distribution[0] && (
                              <span>
                                Più votata: "{q.analysis.distribution[0].choice}
                                " ({q.analysis.distribution[0].percentage}%)
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
              )}
            </div>
          )}

          {activeTab === "analysis" && analysis && (
            <div>
              {!showDetailedView ? (
                <div>
                  <h3>Analisi Dettagliata per Domanda</h3>
                  {analysis.questions.map((questionData) => (
                    <div key={questionData.questionId}>
                      <div>
                        <h4>{questionData.question}</h4>
                        <div>
                          <span>{questionData.type}</span>
                          <span>{questionData.responseRate}% risposto</span>
                          <button
                            onClick={() =>
                              handleShowUserResponses(questionData.questionId)
                            }
                            title="Vedi chi ha risposto cosa"
                          >
                            Dettagli utenti
                          </button>
                        </div>
                      </div>
                      <div>
                        {questionData.type === "multiple_choice" && (
                          <div>
                            <h5>Distribuzione Scelte:</h5>
                            {questionData.analysis.distribution.map(
                              (item, index) => (
                                <div key={index}>
                                  <div>
                                    <span>{item.choice}</span>
                                    <span>
                                      {item.count} voti ({item.percentage}%)
                                    </span>
                                  </div>
                                  <div>
                                    <div
                                      style={{ width: `${item.percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                        {questionData.type === "rating" && (
                          <div>
                            <div>
                              <div>
                                <span>{questionData.analysis.average}</span>
                                <span>Media</span>
                              </div>
                            </div>
                            <h5>Distribuzione Voti:</h5>
                            {questionData.analysis.distribution.map((item) => (
                              <div key={item.rating}>
                                <div>
                                  <span>{item.rating} ★</span>
                                  <span>
                                    {item.count} voti ({item.percentage}%)
                                  </span>
                                </div>
                                <div>
                                  <div
                                    style={{ width: `${item.percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {(questionData.type === "text" ||
                          questionData.type === "textarea") && (
                          <div>
                            <div>
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
                                <h5>Esempi di risposte:</h5>
                                {questionData.analysis.samples.map(
                                  (sample, index) => (
                                    <div key={index}>"{sample}"</div>
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
                <h3>Risposte Individuali ({responses.length})</h3>
                {responses.length === 0 ? (
                  <p>Nessuna risposta ancora ricevuta.</p>
                ) : (
                  <div>
                    {responses.map((response) => (
                      <div key={response.id}>
                        <div>
                          <h4>{response.utente_nome}</h4>
                          <div>
                            <span>
                              Data: {formatDate(response.submitted_at)}
                            </span>
                            <span>
                              Tempo: {formatTime(response.tempo_impiegato)}
                            </span>
                            <span>
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
