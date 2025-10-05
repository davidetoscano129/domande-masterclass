import { useState, useEffect } from "react";
import { questionnaires } from "../services/api";

function ResponsesViewer({ questionnaireId, questionnaireName, onBack }) {
  const [questionnaire, setQuestionnaire] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("table"); // 'table', 'cards', 'analytics'

  useEffect(() => {
    loadData();
  }, [questionnaireId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Carica questionario e risposte in parallelo
      const [questionnaireData, responsesData] = await Promise.all([
        questionnaires.getById(questionnaireId),
        questionnaires.getResponses(questionnaireId),
      ]);

      setQuestionnaire(questionnaireData.questionnaire);
      setResponses(responsesData.responses || []);
    } catch (err) {
      setError(err.message || "Errore nel caricamento dei dati");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("it-IT", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calcola statistiche per una domanda
  const getQuestionStats = (question) => {
    const questionText = question.question_text;
    const answers = responses
      .map((r) => r.responses[questionText])
      .filter(Boolean);

    if (question.question_type === "text") {
      return {
        type: "text",
        totalAnswers: answers.length,
        averageLength:
          answers.reduce((sum, answer) => sum + (answer?.length || 0), 0) /
            answers.length || 0,
      };
    }

    if (question.question_type === "scale") {
      const numericAnswers = answers
        .map((a) => parseInt(a))
        .filter((n) => !isNaN(n));
      return {
        type: "scale",
        totalAnswers: numericAnswers.length,
        average:
          numericAnswers.reduce((sum, n) => sum + n, 0) /
            numericAnswers.length || 0,
        distribution: [1, 2, 3, 4, 5].map((val) => ({
          value: val,
          count: numericAnswers.filter((n) => n === val).length,
        })),
      };
    }

    if (
      question.question_type === "single" ||
      question.question_type === "multiple_choice"
    ) {
      const answerCounts = {};
      answers.forEach((answer) => {
        if (answer) {
          answerCounts[answer] = (answerCounts[answer] || 0) + 1;
        }
      });

      return {
        type: "choice",
        totalAnswers: answers.length,
        distribution: Object.entries(answerCounts).map(([option, count]) => ({
          option,
          count,
          percentage: ((count / answers.length) * 100).toFixed(1),
        })),
      };
    }

    if (
      question.question_type === "multiple" ||
      question.question_type === "checkbox"
    ) {
      const optionCounts = {};
      answers.forEach((answer) => {
        if (Array.isArray(answer)) {
          answer.forEach((option) => {
            optionCounts[option] = (optionCounts[option] || 0) + 1;
          });
        }
      });

      return {
        type: "multiple",
        totalAnswers: answers.length,
        distribution: Object.entries(optionCounts).map(([option, count]) => ({
          option,
          count,
          percentage: ((count / answers.length) * 100).toFixed(1),
        })),
      };
    }

    return { type: "unknown", totalAnswers: answers.length };
  };

  const exportToCSV = () => {
    if (responses.length === 0) return;

    // Crea l'header del CSV
    const questions = Object.keys(responses[0].responses);
    const headers = ["Data Compilazione", ...questions];

    // Crea le righe di dati
    const csvRows = responses.map((response) => {
      const row = [formatDate(response.submitted_at)];
      questions.forEach((question) => {
        const answer = response.responses[question];
        // Gestisci risposte multiple (array) e singole
        const answerText = Array.isArray(answer)
          ? answer.join("; ")
          : answer || "";
        // Escape delle virgolette nel CSV
        row.push(`"${answerText.replace(/"/g, '""')}"`);
      });
      return row.join(",");
    });

    // Combina header e dati
    const csvContent = [headers.join(","), ...csvRows].join("\n");

    // Crea e scarica il file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `risposte_${questionnaireName.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}.csv`;
    link.click();
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "20px auto", padding: "20px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          borderBottom: "2px solid #eee",
          paddingBottom: "20px",
        }}
      >
        <div>
          <button
            onClick={onBack}
            style={{
              padding: "8px 16px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              marginBottom: "15px",
            }}
          >
            ← Torna alla Dashboard
          </button>
          <h1 style={{ margin: "0 0 8px 0" }}>
            Risposte: {questionnaire?.title || questionnaireName}
          </h1>
          {questionnaire?.description && (
            <p style={{ color: "#666", margin: 0 }}>
              {questionnaire.description}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Modalità visualizzazione */}
          <div>
            <button
              onClick={() => setViewMode("table")}
              style={{
                padding: "8px 12px",
                backgroundColor: viewMode === "table" ? "#007bff" : "#f8f9fa",
                color: viewMode === "table" ? "white" : "#333",
                border: "1px solid #ddd",
                borderRadius: "4px 0 0 4px",
                fontSize: "12px",
              }}
            >
              📊 Tabella
            </button>
            <button
              onClick={() => setViewMode("cards")}
              style={{
                padding: "8px 12px",
                backgroundColor: viewMode === "cards" ? "#007bff" : "#f8f9fa",
                color: viewMode === "cards" ? "white" : "#333",
                border: "1px solid #ddd",
                borderLeft: "none",
                fontSize: "12px",
              }}
            >
              📋 Schede
            </button>
            <button
              onClick={() => setViewMode("analytics")}
              style={{
                padding: "8px 12px",
                backgroundColor:
                  viewMode === "analytics" ? "#007bff" : "#f8f9fa",
                color: viewMode === "analytics" ? "white" : "#333",
                border: "1px solid #ddd",
                borderLeft: "none",
                borderRadius: "0 4px 4px 0",
                fontSize: "12px",
              }}
            >
              📈 Analisi
            </button>
          </div>
          {responses.length > 0 && (
            <button
              onClick={exportToCSV}
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              � Esporta CSV
            </button>
          )}
        </div>
      </div>

      {/* Errore */}
      {error && (
        <div
          style={{
            color: "red",
            marginBottom: "20px",
            padding: "10px",
            border: "1px solid #ff6b6b",
            backgroundColor: "#fff5f5",
          }}
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Caricamento risposte...</p>
        </div>
      ) : responses.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #ddd",
            borderRadius: "5px",
          }}
        >
          <h3>📝 Nessuna risposta ancora</h3>
          <p style={{ color: "#666" }}>
            Non sono ancora state raccolte risposte per questo questionario.
          </p>
          <p style={{ color: "#888", fontSize: "14px" }}>
            Condividi il questionario per iniziare a raccogliere risposte!
          </p>
        </div>
      ) : (
        <div>
          {/* Statistiche generali */}
          <div
            style={{
              backgroundColor: "#e7f3ff",
              padding: "20px",
              borderRadius: "5px",
              marginBottom: "30px",
            }}
          >
            <h3 style={{ margin: "0 0 15px 0" }}>📊 Statistiche Generali</h3>
            <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
              <div>
                <strong>Totale risposte:</strong> {responses.length}
              </div>
              <div>
                <strong>Domande:</strong>{" "}
                {questionnaire?.questions?.length || 0}
              </div>
              {responses.length > 0 && (
                <div>
                  <strong>Tasso di completamento:</strong> 100%
                </div>
              )}
            </div>
          </div>

          {/* Contenuto basato sulla modalità */}
          {viewMode === "analytics" && questionnaire && (
            <div>
              <h3>📈 Analisi per Domanda</h3>
              {questionnaire.questions.map((question, index) => {
                const stats = getQuestionStats(question);
                return (
                  <div
                    key={question.id}
                    style={{
                      border: "1px solid #ddd",
                      padding: "20px",
                      marginBottom: "20px",
                      backgroundColor: "white",
                      borderRadius: "5px",
                    }}
                  >
                    <h4 style={{ margin: "0 0 15px 0" }}>
                      Domanda {index + 1}: {question.question_text}
                    </h4>
                    <div
                      style={{
                        marginBottom: "10px",
                        fontSize: "14px",
                        color: "#666",
                      }}
                    >
                      Tipo: {question.question_type} | Risposte:{" "}
                      {stats.totalAnswers}/{responses.length}
                    </div>

                    {stats.type === "choice" && (
                      <div>
                        <strong>Distribuzione risposte:</strong>
                        {stats.distribution.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              margin: "8px 0",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <div style={{ width: "200px", fontSize: "14px" }}>
                              {item.option}
                            </div>
                            <div
                              style={{
                                width: `${Math.max(item.percentage, 5)}%`,
                                backgroundColor: "#007bff",
                                height: "20px",
                                marginRight: "10px",
                                borderRadius: "3px",
                              }}
                            ></div>
                            <span style={{ fontSize: "12px" }}>
                              {item.count} ({item.percentage}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {stats.type === "scale" && (
                      <div>
                        <div style={{ marginBottom: "10px" }}>
                          <strong>Media:</strong> {stats.average.toFixed(1)}/5
                        </div>
                        <strong>Distribuzione:</strong>
                        {stats.distribution.map((item) => (
                          <div
                            key={item.value}
                            style={{
                              margin: "5px 0",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <div style={{ width: "30px" }}>{item.value}</div>
                            <div
                              style={{
                                width: `${Math.max(
                                  (item.count / stats.totalAnswers) * 100,
                                  3
                                )}%`,
                                backgroundColor: "#28a745",
                                height: "15px",
                                marginRight: "10px",
                                borderRadius: "3px",
                              }}
                            ></div>
                            <span style={{ fontSize: "12px" }}>
                              {item.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {stats.type === "text" && (
                      <div>
                        <strong>Lunghezza media:</strong>{" "}
                        {stats.averageLength.toFixed(0)} caratteri
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === "table" && questionnaire && (
            <div>
              <h3>📊 Vista Tabella</h3>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    backgroundColor: "white",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fa" }}>
                      <th
                        style={{
                          padding: "12px",
                          border: "1px solid #ddd",
                          textAlign: "left",
                        }}
                      >
                        Data
                      </th>
                      {questionnaire.questions.map((question, index) => (
                        <th
                          key={question.id}
                          style={{
                            padding: "12px",
                            border: "1px solid #ddd",
                            textAlign: "left",
                            minWidth: "150px",
                          }}
                        >
                          Q{index + 1}:{" "}
                          {question.question_text.length > 30
                            ? question.question_text.substring(0, 30) + "..."
                            : question.question_text}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map((response, index) => (
                      <tr
                        key={response.id}
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? "white" : "#f9f9f9",
                        }}
                      >
                        <td
                          style={{
                            padding: "12px",
                            border: "1px solid #ddd",
                            fontSize: "12px",
                          }}
                        >
                          {formatDate(response.submitted_at)}
                        </td>
                        {questionnaire.questions.map((question) => (
                          <td
                            key={question.id}
                            style={{
                              padding: "12px",
                              border: "1px solid #ddd",
                              fontSize: "14px",
                            }}
                          >
                            {Array.isArray(
                              response.responses[question.question_text]
                            )
                              ? response.responses[question.question_text].join(
                                  ", "
                                )
                              : response.responses[question.question_text] ||
                                "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {viewMode === "cards" && (
            <div>
              <h3>📋 Vista Schede</h3>
              {responses.map((response, index) => (
                <div
                  key={response.id}
                  style={{
                    border: "1px solid #ddd",
                    padding: "20px",
                    marginBottom: "20px",
                    backgroundColor: "white",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                      borderBottom: "1px solid #eee",
                      paddingBottom: "10px",
                    }}
                  >
                    <h4 style={{ margin: "0", color: "#007bff" }}>
                      Risposta #{index + 1}
                    </h4>
                    <small
                      style={{
                        color: "#666",
                        backgroundColor: "#f8f9fa",
                        padding: "4px 8px",
                        borderRadius: "3px",
                      }}
                    >
                      {formatDate(response.submitted_at)}
                    </small>
                  </div>

                  <div style={{ display: "grid", gap: "15px" }}>
                    {Object.entries(response.responses).map(
                      ([question, answer]) => (
                        <div
                          key={question}
                          style={{
                            padding: "15px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "5px",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: "bold",
                              marginBottom: "8px",
                              color: "#333",
                            }}
                          >
                            {question}
                          </div>
                          <div style={{ color: "#555", lineHeight: "1.4" }}>
                            {Array.isArray(answer) ? (
                              <div>
                                {answer.map((item, idx) => (
                                  <span
                                    key={idx}
                                    style={{
                                      display: "inline-block",
                                      margin: "2px 4px 2px 0",
                                      padding: "2px 8px",
                                      backgroundColor: "#007bff",
                                      color: "white",
                                      borderRadius: "12px",
                                      fontSize: "12px",
                                    }}
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              answer || (
                                <em style={{ color: "#999" }}>
                                  Nessuna risposta
                                </em>
                              )
                            )}
                          </div>
                        </div>
                      )
                    )}
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

export default ResponsesViewer;
