import { useState, useEffect } from "react";
import { questionnaires } from "../services/api";

function ResponsesViewer({ questionnaireId, questionnaireName, onBack }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadResponses();
  }, [questionnaireId]);

  const loadResponses = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await questionnaires.getResponses(questionnaireId);
      setResponses(data.responses || []);
    } catch (err) {
      setError(err.message || "Errore nel caricamento delle risposte");
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
    <div style={{ maxWidth: "1000px", margin: "20px auto", padding: "20px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
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
              marginRight: "15px",
            }}
          >
            ← Torna alla Dashboard
          </button>
          <h1 style={{ display: "inline" }}>Risposte: {questionnaireName}</h1>
        </div>
        {responses.length > 0 && (
          <button
            onClick={exportToCSV}
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              fontSize: "14px",
            }}
          >
            📊 Esporta CSV
          </button>
        )}
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
          {/* Statistiche */}
          <div
            style={{
              backgroundColor: "#e7f3ff",
              padding: "15px",
              borderRadius: "5px",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0" }}>📊 Statistiche</h3>
            <p style={{ margin: "0" }}>
              <strong>Totale risposte:</strong> {responses.length}
            </p>
          </div>

          {/* Lista Risposte */}
          <div>
            <h3>Risposte Raccolte</h3>
            {responses.map((response, index) => (
              <div
                key={response.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "20px",
                  marginBottom: "15px",
                  backgroundColor: "white",
                  borderRadius: "5px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >
                  <h4 style={{ margin: "0" }}>Risposta #{index + 1}</h4>
                  <small style={{ color: "#666" }}>
                    {formatDate(response.submitted_at)}
                  </small>
                </div>

                {/* Risposte */}
                <div>
                  {Object.entries(response.responses).map(
                    ([question, answer]) => (
                      <div
                        key={question}
                        style={{
                          marginBottom: "12px",
                          paddingBottom: "12px",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "bold",
                            marginBottom: "5px",
                            color: "#333",
                          }}
                        >
                          {question}
                        </div>
                        <div style={{ color: "#666" }}>
                          {Array.isArray(answer) ? (
                            <ul style={{ margin: "0", paddingLeft: "20px" }}>
                              {answer.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          ) : (
                            answer || <em>Nessuna risposta</em>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResponsesViewer;
