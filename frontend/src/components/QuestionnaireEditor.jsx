import { useState, useEffect } from "react";
import { questionnaires } from "../services/api";

function QuestionnaireEditor({
  onBack,
  onSave,
  editQuestionnaireId = null,
  readOnly = false,
  onEdit = null,
}) {
  const [questionnaire, setQuestionnaire] = useState({
    title: "",
    description: "",
  });

  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Se stiamo editando, carica i dati del questionario
  useEffect(() => {
    if (editQuestionnaireId) {
      loadQuestionnaire();
    }
  }, [editQuestionnaireId]);

  const loadQuestionnaire = async () => {
    try {
      setLoading(true);
      const data = await questionnaires.getById(editQuestionnaireId);
      setQuestionnaire({
        title: data.questionnaire.title,
        description: data.questionnaire.description || "",
      });

      // Adatta le domande al formato dell'editor
      const adaptedQuestions = (data.questionnaire.questions || []).map(
        (q) => ({
          id: q.id,
          question_text: q.question_text,
          question_type:
            q.question_type === "text"
              ? "text"
              : q.question_type === "single"
              ? "multiple_choice"
              : q.question_type === "multiple"
              ? "checkbox"
              : q.question_type,
          question_options: q.question_options || null,
          is_required: q.is_required || false,
        })
      );

      setQuestions(adaptedQuestions);
    } catch (err) {
      setError("Errore nel caricamento del questionario: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Aggiungi nuova domanda
  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now(), // ID temporaneo
      question_text: "",
      question_type: type,
      question_options:
        type === "multiple_choice" || type === "checkbox" || type === "dropdown"
          ? ["Opzione 1"]
          : null,
      is_required: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  // Aggiorna domanda
  const updateQuestion = (questionId, field, value) => {
    setQuestions(
      questions.map((q) => (q.id === questionId ? { ...q, [field]: value } : q))
    );
  };

  // Aggiungi opzione a domanda
  const addOption = (questionId) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              question_options: [
                ...q.question_options,
                `Opzione ${q.question_options.length + 1}`,
              ],
            }
          : q
      )
    );
  };

  // Rimuovi opzione
  const removeOption = (questionId, optionIndex) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              question_options: q.question_options.filter(
                (_, i) => i !== optionIndex
              ),
            }
          : q
      )
    );
  };

  // Rimuovi domanda
  const removeQuestion = (questionId) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
  };

  // Salva questionario completo
  const handleSave = async () => {
    if (!questionnaire.title.trim()) {
      alert("Inserisci un titolo per il questionario");
      return;
    }

    setSaving(true);
    try {
      let questionnaireId;

      if (editQuestionnaireId) {
        // Aggiorna questionario esistente
        await questionnaires.update(editQuestionnaireId, questionnaire);
        questionnaireId = editQuestionnaireId;

        // Elimina tutte le domande esistenti prima di aggiungere quelle nuove
        await fetch(
          `http://localhost:3000/api/questionnaires/${questionnaireId}/questions`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } else {
        // Crea nuovo questionario
        const response = await questionnaires.create(questionnaire);
        questionnaireId = response.questionnaire.id;
      }

      // Salva tutte le domande
      for (const question of questions) {
        await fetch(
          `http://localhost:3000/api/questionnaires/${questionnaireId}/questions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              question_text: question.question_text,
              question_type: question.question_type,
              question_options: question.question_options,
              is_required: question.is_required,
            }),
          }
        );
      }

      alert(
        editQuestionnaireId
          ? "Questionario aggiornato con successo!"
          : "Questionario salvato con successo!"
      );
      onSave();
    } catch (error) {
      alert("Errore nel salvataggio: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto", padding: "20px" }}>
      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>Caricamento questionario...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{ color: "red", marginBottom: "20px", textAlign: "center" }}
        >
          {error}
        </div>
      )}

      {!loading && (
        <>
          {/* Header */}
          <div
            style={{
              marginBottom: "30px",
              borderBottom: "1px solid #ddd",
              paddingBottom: "20px",
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
                ← Indietro
              </button>

              {readOnly && onEdit && (
                <button
                  onClick={onEdit}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  ✏️ Modifica
                </button>
              )}
            </div>

            <h2>
              {readOnly
                ? questionnaire.title || "Visualizza Questionario"
                : editQuestionnaireId
                ? "Modifica Questionario"
                : "Crea Nuovo Questionario"}
            </h2>

            {readOnly && questionnaire.description && (
              <p style={{ color: "#666", margin: "10px 0 0 0" }}>
                {questionnaire.description}
              </p>
            )}

            {/* Info Questionario */}
            {!readOnly && (
              <div style={{ marginTop: "20px" }}>
                <input
                  type="text"
                  placeholder="Titolo del questionario"
                  value={questionnaire.title}
                  onChange={(e) =>
                    setQuestionnaire({
                      ...questionnaire,
                      title: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    marginBottom: "15px",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                />
                <textarea
                  placeholder="Descrizione del questionario (opzionale)"
                  value={questionnaire.description}
                  onChange={(e) =>
                    setQuestionnaire({
                      ...questionnaire,
                      description: e.target.value,
                    })
                  }
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "12px",
                    marginBottom: "20px",
                  }}
                />
              </div>
            )}
          </div>

          {/* Lista Domande */}
          <div style={{ marginBottom: "30px" }}>
            {questions.map((question, index) => (
              <QuestionEditor
                key={question.id}
                question={question}
                index={index}
                onUpdate={updateQuestion}
                onAddOption={addOption}
                onRemoveOption={removeOption}
                onRemove={removeQuestion}
                readOnly={readOnly}
              />
            ))}
          </div>

          {/* Aggiungi Domanda */}
          {!readOnly && (
            <div
              style={{
                marginBottom: "30px",
                padding: "20px",
                backgroundColor: "#f8f9fa",
                border: "1px solid #ddd",
              }}
            >
              <h4>Aggiungi Domanda</h4>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={() => addQuestion("text")}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                  }}
                >
                  📝 Testo
                </button>
                <button
                  onClick={() => addQuestion("multiple_choice")}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                  }}
                >
                  🔘 Scelta Multipla
                </button>
                <button
                  onClick={() => addQuestion("checkbox")}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#17a2b8",
                    color: "white",
                    border: "none",
                  }}
                >
                  ☑️ Checkbox
                </button>
                <button
                  onClick={() => addQuestion("scale")}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#ffc107",
                    color: "black",
                    border: "none",
                  }}
                >
                  ⭐ Scala 1-5
                </button>
                <button
                  onClick={() => addQuestion("dropdown")}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                  }}
                >
                  📋 Dropdown
                </button>
              </div>
            </div>
          )}

          {/* Azioni */}
          {!readOnly && (
            <div
              style={{
                textAlign: "center",
                borderTop: "1px solid #ddd",
                paddingTop: "20px",
              }}
            >
              <button
                onClick={handleSave}
                disabled={saving || !questionnaire.title.trim()}
                style={{
                  padding: "12px 30px",
                  backgroundColor: saving ? "#6c757d" : "#28a745",
                  color: "white",
                  border: "none",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                {saving ? "Salvataggio..." : "Salva Questionario"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Componente per editing singola domanda
function QuestionEditor({
  question,
  index,
  onUpdate,
  onAddOption,
  onRemoveOption,
  onRemove,
  readOnly = false,
}) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "20px",
        marginBottom: "20px",
        backgroundColor: "white",
        position: "relative",
      }}
    >
      {/* Numero domanda e rimuovi */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <h4>Domanda {index + 1}</h4>
        {!readOnly && (
          <button
            onClick={() => onRemove(question.id)}
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              padding: "5px 10px",
            }}
          >
            🗑️ Rimuovi
          </button>
        )}
      </div>

      {/* Testo domanda */}
      {readOnly ? (
        <div
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            fontSize: "16px",
            fontWeight: "bold",
            backgroundColor: "#f8f9fa",
            border: "1px solid #e9ecef",
            borderRadius: "4px",
          }}
        >
          {question.question_text}
        </div>
      ) : (
        <input
          type="text"
          placeholder="Scrivi la domanda..."
          value={question.question_text}
          onChange={(e) =>
            onUpdate(question.id, "question_text", e.target.value)
          }
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            fontSize: "16px",
          }}
        />
      )}

      {/* Tipo domanda */}
      <div style={{ marginBottom: "15px" }}>
        <strong>Tipo: </strong>
        {readOnly ? (
          <span style={{ marginLeft: "10px" }}>
            {question.question_type === "text"
              ? "Testo libero"
              : question.question_type === "multiple_choice"
              ? "Scelta multipla"
              : question.question_type === "checkbox"
              ? "Checkbox"
              : question.question_type === "scale"
              ? "Scala 1-5"
              : question.question_type === "dropdown"
              ? "Dropdown"
              : question.question_type}
          </span>
        ) : (
          <select
            value={question.question_type}
            onChange={(e) =>
              onUpdate(question.id, "question_type", e.target.value)
            }
            style={{ padding: "8px", marginLeft: "10px" }}
          >
            <option value="text">Testo libero</option>
            <option value="multiple_choice">Scelta multipla</option>
            <option value="checkbox">Checkbox</option>
            <option value="scale">Scala 1-5</option>
            <option value="dropdown">Dropdown</option>
          </select>
        )}
      </div>

      {/* Opzioni per domande multiple */}
      {(question.question_type === "multiple_choice" ||
        question.question_type === "checkbox" ||
        question.question_type === "dropdown") && (
        <div style={{ marginBottom: "15px" }}>
          <strong>Opzioni:</strong>
          {readOnly ? (
            <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
              {question.question_options?.map((option, optionIndex) => (
                <li
                  key={optionIndex}
                  style={{
                    marginBottom: "4px",
                    fontSize: "14px",
                    color: "#555",
                  }}
                >
                  {question.question_type === "multiple_choice" && "○ "}
                  {question.question_type === "checkbox" && "☐ "}
                  {option}
                </li>
              ))}
            </ul>
          ) : (
            <>
              {question.question_options?.map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "8px",
                  }}
                >
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...question.question_options];
                      newOptions[optionIndex] = e.target.value;
                      onUpdate(question.id, "question_options", newOptions);
                    }}
                    style={{ flex: 1, padding: "8px", marginRight: "10px" }}
                  />
                  {question.question_options.length > 1 && (
                    <button
                      onClick={() => onRemoveOption(question.id, optionIndex)}
                      style={{
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        padding: "5px 8px",
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => onAddOption(question.id)}
                style={{
                  marginTop: "10px",
                  padding: "8px 16px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                }}
              >
                + Aggiungi Opzione
              </button>
            </>
          )}
        </div>
      )}

      {/* Scala 1-5 preview */}
      {question.question_type === "scale" && (
        <div style={{ marginBottom: "15px" }}>
          <strong>Anteprima:</strong>
          <div style={{ marginTop: "8px" }}>
            {[1, 2, 3, 4, 5].map((num) => (
              <label key={num} style={{ marginRight: "15px" }}>
                <input type="radio" name={`preview-${question.id}`} disabled />{" "}
                {num}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Obbligatorio */}
      {readOnly ? (
        question.is_required && (
          <div
            style={{
              padding: "6px 12px",
              backgroundColor: "#dc3545",
              color: "white",
              fontSize: "12px",
              borderRadius: "3px",
              display: "inline-block",
              marginTop: "10px",
            }}
          >
            OBBLIGATORIA
          </div>
        )
      ) : (
        <label style={{ display: "flex", alignItems: "center" }}>
          <input
            type="checkbox"
            checked={question.is_required}
            onChange={(e) =>
              onUpdate(question.id, "is_required", e.target.checked)
            }
            style={{ marginRight: "8px" }}
          />
          Domanda obbligatoria
        </label>
      )}
    </div>
  );
}

export default QuestionnaireEditor;
