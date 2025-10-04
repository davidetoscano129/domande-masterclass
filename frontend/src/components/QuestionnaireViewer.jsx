import { useState, useEffect } from "react";
import { questionnaires } from "../services/api";

function QuestionnaireViewer({ questionnaireId, onBack, onEdit }) {
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadQuestionnaire();
  }, [questionnaireId]);

  const loadQuestionnaire = async () => {
    try {
      setLoading(true);
      const data = await questionnaires.getById(questionnaireId);
      setQuestionnaire(data.questionnaire);
    } catch (err) {
      setError("Errore nel caricamento del questionario: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Caricamento questionario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: "600px", margin: "20px auto", padding: "20px" }}>
        <div style={{ color: "red", marginBottom: "20px" }}>{error}</div>
        <button
          onClick={onBack}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          ← Torna alla lista
        </button>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div style={{ maxWidth: "600px", margin: "20px auto", padding: "20px" }}>
        <p>Questionario non trovato</p>
        <button
          onClick={onBack}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          ← Torna alla lista
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto", padding: "20px" }}>
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
          <h1 style={{ margin: "0 0 8px 0" }}>{questionnaire.title}</h1>
          {questionnaire.description && (
            <p style={{ color: "#666", margin: 0 }}>
              {questionnaire.description}
            </p>
          )}
        </div>
        <div>
          {onEdit && (
            <button
              onClick={() => onEdit(questionnaire)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                marginRight: "10px",
                cursor: "pointer",
              }}
            >
              ✏️ Modifica
            </button>
          )}
          <button
            onClick={onBack}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ← Torna alla lista
          </button>
        </div>
      </div>

      {/* Info questionario */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "15px",
          borderRadius: "5px",
          marginBottom: "30px",
          border: "1px solid #dee2e6",
        }}
      >
        <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
          <div>
            <strong>Creato il:</strong>{" "}
            {new Date(questionnaire.created_at).toLocaleDateString("it-IT")}
          </div>
          <div>
            <strong>Domande:</strong> {questionnaire.questions?.length || 0}
          </div>
          <div>
            <strong>Stato:</strong>{" "}
            <span
              style={{
                padding: "2px 8px",
                backgroundColor: questionnaire.is_public
                  ? "#28a745"
                  : "#6c757d",
                color: "white",
                fontSize: "12px",
                borderRadius: "3px",
              }}
            >
              {questionnaire.is_public ? "CONDIVISO" : "PRIVATO"}
            </span>
          </div>
        </div>
      </div>

      {/* Domande */}
      <div>
        <h2 style={{ marginBottom: "20px" }}>
          Domande ({questionnaire.questions?.length || 0})
        </h2>

        {!questionnaire.questions || questionnaire.questions.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              backgroundColor: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: "5px",
            }}
          >
            <p style={{ color: "#666", margin: 0 }}>
              Questo questionario non ha ancora domande.
            </p>
          </div>
        ) : (
          <div>
            {questionnaire.questions.map((question, index) => (
              <div
                key={question.id || index}
                style={{
                  border: "1px solid #dee2e6",
                  borderRadius: "5px",
                  padding: "20px",
                  marginBottom: "15px",
                  backgroundColor: "white",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: "15px",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                      marginRight: "12px",
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
                      {question.question_text}
                    </h4>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#666",
                        marginBottom: "15px",
                      }}
                    >
                      <strong>Tipo:</strong>{" "}
                      {question.question_type === "text"
                        ? "Testo libero"
                        : question.question_type === "single"
                        ? "Scelta singola"
                        : question.question_type === "multiple"
                        ? "Scelta multipla"
                        : question.question_type}
                      {question.is_required && (
                        <span
                          style={{
                            marginLeft: "10px",
                            padding: "2px 6px",
                            backgroundColor: "#dc3545",
                            color: "white",
                            fontSize: "11px",
                            borderRadius: "3px",
                          }}
                        >
                          OBBLIGATORIA
                        </span>
                      )}
                    </div>

                    {/* Mostra opzioni se presente */}
                    {(question.question_type === "single" ||
                      question.question_type === "multiple") &&
                      question.question_options &&
                      question.question_options.length > 0 && (
                        <div>
                          <strong
                            style={{ fontSize: "14px", marginBottom: "8px" }}
                          >
                            Opzioni:
                          </strong>
                          <ul
                            style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}
                          >
                            {question.question_options.map(
                              (option, optIndex) => (
                                <li
                                  key={optIndex}
                                  style={{
                                    marginBottom: "4px",
                                    fontSize: "14px",
                                    color: "#555",
                                  }}
                                >
                                  {option}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer informazioni */}
      <div
        style={{
          marginTop: "40px",
          padding: "15px",
          backgroundColor: "#e7f3ff",
          border: "1px solid #b8daff",
          borderRadius: "5px",
          fontSize: "14px",
          color: "#004085",
        }}
      >
        <strong>ℹ️ Modalità visualizzazione</strong>
        <p style={{ margin: "8px 0 0 0" }}>
          Stai visualizzando il questionario in modalità sola lettura. Per
          modificare le domande, clicca su "Modifica" in alto a destra.
        </p>
      </div>
    </div>
  );
}

export default QuestionnaireViewer;
