import React, { useState } from "react";
// TODO: Import export functions when available

function UtenteRisposteView({ utente, risposte, loading, onBack }) {
  const [viewMode, setViewMode] = useState("categorized"); // 'categorized' o 'global'

  // Funzione per preparare i dati per l'esportazione utente
  const prepareUserExportData = () => {
    const exportData = [];

    risposte.forEach((risposta) => {
      try {
        let risposteData;
        let domandeData;

        // Parse delle risposte
        if (typeof risposta.risposte === "string") {
          try {
            risposteData = JSON.parse(risposta.risposte);
          } catch (parseError) {
            console.error("Errore parsing risposte JSON:", parseError);
            return;
          }
        } else if (
          typeof risposta.risposte === "object" &&
          risposta.risposte !== null
        ) {
          risposteData = risposta.risposte;
        } else {
          return;
        }

        // Parse delle domande
        if (typeof risposta.domande === "string") {
          try {
            domandeData = JSON.parse(risposta.domande);
          } catch (parseError) {
            console.error("Errore parsing domande JSON:", parseError);
            domandeData = null;
          }
        } else if (
          typeof risposta.domande === "object" &&
          risposta.domande !== null
        ) {
          domandeData = risposta.domande;
        }

        if (risposteData && typeof risposteData === "object") {
          Object.entries(risposteData).forEach(
            ([questionId, answer], index) => {
              let questionText = `Domanda ${index + 1}`;
              let questionType = "text";

              if (domandeData && domandeData.questions) {
                const question = domandeData.questions.find(
                  (q) =>
                    (q.id && q.id === questionId) ||
                    domandeData.questions.indexOf(q) === index
                );
                if (question) {
                  questionText = question.question || questionText;
                  questionType = question.type || questionType;
                }
              }

              const answerText = (() => {
                if (Array.isArray(answer)) {
                  return answer.length > 0
                    ? answer.join(", ")
                    : "Nessuna selezione";
                }
                if (answer === null || answer === undefined || answer === "") {
                  return "Nessuna risposta";
                }
                return (
                  String(answer)
                    .replace(/\n/g, " ")
                    .replace(/\r/g, "")
                    .trim() || "Risposta vuota"
                );
              })();

              exportData.push({
                question: questionText,
                type: questionType,
                answer: answerText,
                user: utente.nome,
                date: new Date(risposta.submitted_at).toLocaleString("it-IT"),
                questionario: risposta.questionario_titolo,
                lezione: risposta.lezione_titolo,
                relatore: risposta.relatore_nome,
                completata: risposta.completata ? "Sì" : "No",
                tempo_impiegato: risposta.tempo_impiegato
                  ? `${Math.round(risposta.tempo_impiegato / 60)} minuti`
                  : "",
              });
            }
          );
        }
      } catch (error) {
        console.error("Errore nel processare risposta per export:", error);
      }
    });

    return exportData;
  };

  const handleUserExport = (format) => {
    const data = prepareUserExportData();
    const fileName = `risposte_${utente.nome
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}`;

    // TODO: Import and implement export functions
    alert(`Export ${format} non ancora implementato`);
    /*
    switch (format) {
      case "word":
        exportToWord(data, fileName);
        break;
      case "excel":
        exportToExcel(data, fileName);
        break;
      case "csv":
        exportToCSV(data, fileName);
        break;
      case "pdf":
        exportToPDF("utente-risposte-content", fileName);
        break;
      case "json":
        exportToJSON(data, fileName);
        break;
      default:
        alert("Formato non supportato");
    }
    */
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Caricamento risposte...</p>
      </div>
    );
  }

  // Funzione per creare la vista globale di tutte le risposte
  const getGlobalResponses = () => {
    const allResponses = [];

    risposte.forEach((risposta) => {
      try {
        let risposteData;
        let domandeData;

        if (typeof risposta.risposte === "string") {
          try {
            risposteData = JSON.parse(risposta.risposte);
          } catch (parseError) {
            console.error("Errore parsing JSON:", parseError);
            return;
          }
        } else if (
          typeof risposta.risposte === "object" &&
          risposta.risposte !== null
        ) {
          risposteData = risposta.risposte;
        } else {
          return;
        }

        // Parse delle domande
        if (typeof risposta.domande === "string") {
          try {
            domandeData = JSON.parse(risposta.domande);
          } catch (parseError) {
            console.error("Errore parsing domande JSON:", parseError);
            domandeData = null;
          }
        } else if (
          typeof risposta.domande === "object" &&
          risposta.domande !== null
        ) {
          domandeData = risposta.domande;
        }

        if (risposteData && typeof risposteData === "object") {
          Object.entries(risposteData).forEach(
            ([questionId, answer], index) => {
              // Trova la domanda corrispondente
              let questionText = `Domanda ${index + 1}`;
              let questionType = "text";

              if (domandeData && domandeData.questions) {
                const question = domandeData.questions.find(
                  (q) =>
                    (q.id && q.id === questionId) ||
                    domandeData.questions.indexOf(q) === index
                );
                if (question) {
                  questionText = question.question || questionText;
                  questionType = question.type || questionType;
                }
              }

              allResponses.push({
                questionario: risposta.questionario_titolo,
                lezione: risposta.lezione_titolo,
                relatore: risposta.relatore_nome,
                data: risposta.submitted_at,
                questionId: questionId,
                questionNumber: index + 1,
                questionText: questionText,
                questionType: questionType,
                answer: answer,
                completata: risposta.completata,
                tempo_impiegato: risposta.tempo_impiegato,
              });
            }
          );
        }
      } catch (error) {
        console.error("Errore nel processare risposta:", error);
      }
    });

    // Ordina per data decrescente
    return allResponses.sort((a, b) => new Date(b.data) - new Date(a.data));
  };

  const globalResponses = getGlobalResponses();

  return (
    <div className="utente-risposte">
      <div className="back-button-container">
        <button onClick={onBack} className="btn-back-prominent">
          ← Torna alla lista utenti
        </button>
      </div>

      <div className="utente-header">
        <h2>Risposte di {utente.nome}</h2>
        <p className="total-risposte">
          Totale questionari compilati: <strong>{risposte.length}</strong>
        </p>

        {/* Bottoni di esportazione */}
        <div className="export-section">
          <h5>Esporta tutte le risposte:</h5>
          <div className="export-options">
            <button
              onClick={() => handleUserExport("word")}
              className="btn-export btn-word"
              title="Esporta in formato Word"
            >
              Word
            </button>
            <button
              onClick={() => handleUserExport("excel")}
              className="btn-export btn-excel"
              title="Esporta in formato Excel"
            >
              Excel
            </button>
            <button
              onClick={() => handleUserExport("csv")}
              className="btn-export btn-csv"
              title="Esporta in formato CSV"
            >
              CSV
            </button>
            <button
              onClick={() => handleUserExport("pdf")}
              className="btn-export btn-pdf"
              title="Esporta in formato PDF"
            >
              PDF
            </button>
            <button
              onClick={() => handleUserExport("json")}
              className="btn-export btn-json"
              title="Esporta in formato JSON"
            >
              JSON
            </button>
          </div>
        </div>

        {/* Toggle per modalità visualizzazione */}
        <div className="view-mode-toggle">
          <button
            className={`toggle-btn ${
              viewMode === "categorized" ? "active" : ""
            }`}
            onClick={() => setViewMode("categorized")}
          >
            Per Questionario
          </button>
          <button
            className={`toggle-btn ${viewMode === "global" ? "active" : ""}`}
            onClick={() => setViewMode("global")}
          >
            Tutte le Risposte
          </button>
        </div>
      </div>

      {risposte.length === 0 ? (
        <div className="no-responses">
          <p>Questo utente non ha ancora compilato nessun questionario.</p>
        </div>
      ) : viewMode === "categorized" ? (
        // Vista categorizzata per questionario (esistente)
        <div id="utente-risposte-content" className="risposte-list">
          {risposte.map((risposta) => (
            <div key={risposta.id} className="risposta-card">
              <div className="risposta-header">
                <h3>{risposta.questionario_titolo}</h3>
                <div className="risposta-meta">
                  <span className="lezione">
                    Lezione: {risposta.lezione_titolo}
                  </span>
                  <span className="relatore">
                    Relatore: {risposta.relatore_nome}
                  </span>
                  <span className="data">
                    Data:{" "}
                    {new Date(risposta.submitted_at).toLocaleString("it-IT")}
                  </span>
                  {risposta.tempo_impiegato && (
                    <span className="tempo">
                      Tempo: {Math.round(risposta.tempo_impiegato / 60)} minuti
                    </span>
                  )}
                </div>
              </div>

              <div className="risposta-content">
                {risposta.completata ? (
                  <div className="status completata">Completato</div>
                ) : (
                  <div className="status incompleta">In corso</div>
                )}

                <div className="risposte-details">
                  <h4>Risposte:</h4>
                  {(() => {
                    try {
                      let risposteData;

                      // Controlla se risposte è già un oggetto o una stringa JSON
                      if (typeof risposta.risposte === "string") {
                        try {
                          risposteData = JSON.parse(risposta.risposte);
                        } catch (parseError) {
                          console.error(
                            "Errore parsing JSON string:",
                            parseError
                          );
                          console.log("Contenuto stringa:", risposta.risposte);
                          return (
                            <div className="error">
                              <p>Errore nel formato JSON delle risposte</p>
                              <details>
                                <summary>Dettagli errore</summary>
                                <pre>{parseError.message}</pre>
                                <pre>
                                  {String(risposta.risposte).substring(0, 200)}
                                  ...
                                </pre>
                              </details>
                            </div>
                          );
                        }
                      } else if (
                        typeof risposta.risposte === "object" &&
                        risposta.risposte !== null
                      ) {
                        risposteData = risposta.risposte;
                      } else {
                        console.log(
                          "Tipo risposte sconosciuto:",
                          typeof risposta.risposte,
                          risposta.risposte
                        );
                        return (
                          <p className="error">
                            Formato risposte non riconosciuto
                          </p>
                        );
                      }

                      if (!risposteData || typeof risposteData !== "object") {
                        return (
                          <p className="error">Nessuna risposta disponibile</p>
                        );
                      }

                      // Parse delle domande del questionario
                      let domandeData;
                      if (typeof risposta.domande === "string") {
                        try {
                          domandeData = JSON.parse(risposta.domande);
                        } catch (parseError) {
                          console.error(
                            "Errore parsing domande JSON:",
                            parseError
                          );
                          domandeData = null;
                        }
                      } else if (
                        typeof risposta.domande === "object" &&
                        risposta.domande !== null
                      ) {
                        domandeData = risposta.domande;
                      }

                      const entries = Object.entries(risposteData);
                      if (entries.length === 0) {
                        return (
                          <p className="error">Nessuna risposta trovata</p>
                        );
                      }

                      return (
                        <div className="answers-grid">
                          {entries.map(([questionId, answer], index) => {
                            // Trova la domanda corrispondente
                            let questionText = `Domanda ${index + 1}`;
                            let questionType = "text";

                            if (domandeData && domandeData.questions) {
                              const question = domandeData.questions.find(
                                (q) =>
                                  (q.id && q.id === questionId) ||
                                  domandeData.questions.indexOf(q) === index
                              );
                              if (question) {
                                questionText =
                                  question.question || questionText;
                                questionType = question.type || questionType;
                              }
                            }

                            return (
                              <div key={questionId} className="answer-item">
                                <div className="question-section">
                                  <span className="question-number">
                                    {index + 1}.
                                  </span>
                                  <span className="question-text">
                                    {questionText}
                                  </span>
                                  <span className="question-type">
                                    ({questionType})
                                  </span>
                                </div>
                                <div className="answer-section">
                                  <span className="answer-label">
                                    Risposta:
                                  </span>
                                  <span className="answer-text">
                                    {(() => {
                                      try {
                                        if (Array.isArray(answer)) {
                                          return answer.length > 0
                                            ? answer.join(", ")
                                            : "Nessuna selezione";
                                        }
                                        if (
                                          answer === null ||
                                          answer === undefined ||
                                          answer === ""
                                        ) {
                                          return "Nessuna risposta";
                                        }
                                        // Converti sempre in stringa e gestisci caratteri speciali
                                        const cleanAnswer = String(answer)
                                          .replace(/\n/g, " ")
                                          .replace(/\r/g, "")
                                          .trim();

                                        return cleanAnswer || "Risposta vuota";
                                      } catch (e) {
                                        console.error(
                                          "Errore nel processare la risposta:",
                                          answer,
                                          e
                                        );
                                        return `Errore formato: ${typeof answer}`;
                                      }
                                    })()}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    } catch (error) {
                      console.error("Errore generale parsing risposte:", error);
                      console.log("Dati risposte completi:", risposta.risposte);
                      console.log("Tipo dati:", typeof risposta.risposte);
                      return (
                        <div className="error">
                          <p>Errore nel parsing delle risposte</p>
                          <details>
                            <summary>
                              Dettagli errore (click per espandere)
                            </summary>
                            <pre>{String(error.message)}</pre>
                            <pre>Tipo: {typeof risposta.risposte}</pre>
                            <pre>
                              {String(risposta.risposte || "").substring(
                                0,
                                300
                              )}
                              ...
                            </pre>
                          </details>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Vista globale di tutte le risposte
        <div className="global-responses">
          <div className="global-responses-header">
            <h3>Tutte le risposte ({globalResponses.length} totali)</h3>
            <p className="global-description">
              Vista unificata di tutte le risposte fornite dall'utente, ordinate
              per data più recente.
            </p>
          </div>

          {globalResponses.length === 0 ? (
            <div className="no-responses">
              <p>Nessuna risposta trovata.</p>
            </div>
          ) : (
            <div className="global-responses-list">
              {globalResponses.map((response, index) => (
                <div
                  key={`${response.questionario}-${response.questionId}-${index}`}
                  className="global-response-item"
                >
                  <div className="response-context">
                    <div className="context-info">
                      <span className="questionario-ref">
                        Questionario: {response.questionario}
                      </span>
                      <span className="lezione-ref">
                        Lezione: {response.lezione}
                      </span>
                      <span className="relatore-ref">
                        Relatore: {response.relatore}
                      </span>
                      <span className="data-ref">
                        Data: {new Date(response.data).toLocaleString("it-IT")}
                      </span>
                      {response.completata ? (
                        <span className="status-ref completata">
                          Completato
                        </span>
                      ) : (
                        <span className="status-ref incompleta">In corso</span>
                      )}
                    </div>
                  </div>

                  <div className="response-content">
                    <div className="question-section-global">
                      <div className="question-number">
                        Domanda {response.questionNumber}:
                      </div>
                      <div className="question-text-global">
                        {response.questionText}
                      </div>
                      <div className="question-type-global">
                        Tipo: {response.questionType}
                      </div>
                    </div>
                    <div className="answer-section-global">
                      <div className="answer-label-global">Risposta:</div>
                      <div className="answer-text">
                        {(() => {
                          try {
                            if (Array.isArray(response.answer)) {
                              return response.answer.length > 0
                                ? response.answer.join(", ")
                                : "Nessuna selezione";
                            }
                            if (
                              response.answer === null ||
                              response.answer === undefined ||
                              response.answer === ""
                            ) {
                              return "Nessuna risposta";
                            }

                            const cleanAnswer = String(response.answer)
                              .replace(/\n/g, " ")
                              .replace(/\r/g, "")
                              .trim();

                            return cleanAnswer || "Risposta vuota";
                          } catch (e) {
                            console.error(
                              "Errore nel processare risposta globale:",
                              response.answer,
                              e
                            );
                            return `Errore formato: ${typeof response.answer}`;
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UtenteRisposteView;
