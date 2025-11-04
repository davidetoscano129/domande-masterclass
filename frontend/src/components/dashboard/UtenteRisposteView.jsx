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
      <div>
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
    <div className="tab-section-modern">
      <div className="section-header-modern">
        <button onClick={onBack} className="btn-small-modern btn-view">
          ← Torna alla lista utenti
        </button>
      </div>

      <div
        className="relatore-card-modern"
        style={{ marginBottom: "var(--space-lg)" }}
      >
        <div className="relatore-card-content">
          <h2 className="relatore-card-title">Risposte di {utente.nome}</h2>
          <p className="relatore-card-description">
            Totale questionari compilati: <strong>{risposte.length}</strong>
          </p>
        </div>

        {/* Bottoni di esportazione */}
        <div
          className="relatore-card-footer"
          style={{ flexDirection: "column", alignItems: "flex-start" }}
        >
          <h5 style={{ margin: "0 0 var(--space-sm) 0", fontSize: "0.875rem" }}>
            Esporta tutte le risposte:
          </h5>
          <div
            style={{
              display: "flex",
              gap: "var(--space-xs)",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => handleUserExport("word")}
              title="Esporta in formato Word"
              className="btn-small-modern btn-view"
            >
              Word
            </button>
            <button
              onClick={() => handleUserExport("excel")}
              title="Esporta in formato Excel"
              className="btn-small-modern btn-view"
            >
              Excel
            </button>
            <button
              onClick={() => handleUserExport("csv")}
              title="Esporta in formato CSV"
              className="btn-small-modern btn-view"
            >
              CSV
            </button>
            <button
              onClick={() => handleUserExport("pdf")}
              title="Esporta in formato PDF"
              className="btn-small-modern btn-view"
            >
              PDF
            </button>
            <button
              onClick={() => handleUserExport("json")}
              title="Esporta in formato JSON"
              className="btn-small-modern btn-view"
            >
              JSON
            </button>
          </div>
        </div>
      </div>

      {/* Toggle per modalità visualizzazione */}
      <div
        className="section-header-modern"
        style={{ marginBottom: "var(--space-md)" }}
      >
        <div style={{ display: "flex", gap: "var(--space-sm)" }}>
          <button
            onClick={() => setViewMode("categorized")}
            className={`btn-small-modern ${
              viewMode === "categorized" ? "btn-view" : "btn-share"
            }`}
          >
            Per Questionario
          </button>
          <button
            onClick={() => setViewMode("global")}
            className={`btn-small-modern ${
              viewMode === "global" ? "btn-view" : "btn-share"
            }`}
          >
            Tutte le Risposte
          </button>
        </div>
      </div>

      {risposte.length === 0 ? (
        <div className="empty-state-modern">
          <p>Questo utente non ha ancora compilato nessun questionario.</p>
        </div>
      ) : viewMode === "categorized" ? (
        // Vista categorizzata per questionario (esistente)
        <div id="utente-risposte-content" className="content-section-modern">
          {risposte.map((risposta) => (
            <div
              key={risposta.id}
              className="relatore-card-modern"
              style={{ marginBottom: "var(--space-lg)" }}
            >
              <div className="relatore-card-content">
                <h3 className="relatore-card-title">
                  {risposta.questionario_titolo}
                </h3>
                <div className="relatore-card-meta">
                  <span>Lezione: {risposta.lezione_titolo}</span>
                  <span>Relatore: {risposta.relatore_nome}</span>
                  <span>
                    Data:{" "}
                    {new Date(risposta.submitted_at).toLocaleString("it-IT")}
                  </span>
                  {risposta.tempo_impiegato && (
                    <span>
                      Tempo: {Math.round(risposta.tempo_impiegato / 60)} minuti
                    </span>
                  )}
                </div>
              </div>

              <div>
                {risposta.completata ? (
                  <div>Completato</div>
                ) : (
                  <div>In corso</div>
                )}

                <div>
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
                            <div>
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
                        return <p>Formato risposte non riconosciuto</p>;
                      }

                      if (!risposteData || typeof risposteData !== "object") {
                        return <p>Nessuna risposta disponibile</p>;
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
                        return <p>Nessuna risposta trovata</p>;
                      }

                      return (
                        <div>
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
                              <div key={questionId}>
                                <div>
                                  <span>{index + 1}.</span>
                                  <span>{questionText}</span>
                                  <span>({questionType})</span>
                                </div>
                                <div>
                                  <span>Risposta:</span>
                                  <span>
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
                        <div>
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
        <div>
          <div>
            <h3>Tutte le risposte ({globalResponses.length} totali)</h3>
            <p>
              Vista unificata di tutte le risposte fornite dall'utente, ordinate
              per data più recente.
            </p>
          </div>

          {globalResponses.length === 0 ? (
            <div>
              <p>Nessuna risposta trovata.</p>
            </div>
          ) : (
            <div>
              {globalResponses.map((response, index) => (
                <div
                  key={`${response.questionario}-${response.questionId}-${index}`}
                >
                  <div>
                    <div>
                      <span>Questionario: {response.questionario}</span>
                      <span>Lezione: {response.lezione}</span>
                      <span>Relatore: {response.relatore}</span>
                      <span>
                        Data: {new Date(response.data).toLocaleString("it-IT")}
                      </span>
                      {response.completata ? (
                        <span>Completato</span>
                      ) : (
                        <span>In corso</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div>
                      <div>Domanda {response.questionNumber}:</div>
                      <div>{response.questionText}</div>
                      <div>Tipo: {response.questionType}</div>
                    </div>
                    <div>
                      <div>Risposta:</div>
                      <div>
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
