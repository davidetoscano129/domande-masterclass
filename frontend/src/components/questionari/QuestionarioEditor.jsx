import React, { useState, useEffect } from "react";
import { API_BASE } from "../../constants/api.js";
import { normalizeConfig } from "../../utils/helpers.js";

function QuestionarioEditor({
  questionario,
  lezioni,
  user,
  lezionePreselezionata,
  onSave,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    titolo: "",
    descrizione: "",
    lezione_id: "",
    config: {
      questions: [],
    },
  });

  useEffect(() => {
    if (questionario) {
      console.log("Questionario ricevuto per editing:", questionario);

      // Controlli di sicurezza per le domande
      let questionsData = questionario.domande;

      // Se domande è una stringa, prova a parsarla
      if (typeof questionsData === "string") {
        try {
          questionsData = JSON.parse(questionsData);
        } catch (error) {
          console.error("Errore parsing domande:", error);
          questionsData = { questions: [] };
        }
      }

      // Se questionsData è null, undefined o non ha la struttura corretta
      if (!questionsData || typeof questionsData !== "object") {
        questionsData = { questions: [] };
      }

      // Assicurati che questions sia un array
      if (!Array.isArray(questionsData.questions)) {
        questionsData = { ...questionsData, questions: [] };
      }

      console.log("Dati processati per editing:", questionsData);

      const normalizedConfig = normalizeConfig(questionsData);
      console.log("Config normalizzata:", normalizedConfig);

      setFormData({
        titolo: questionario.titolo || "",
        descrizione: questionario.descrizione || "",
        lezione_id: questionario.lezione_id || "",
        config: normalizedConfig,
      });
    } else if (lezionePreselezionata) {
      // Modalità creazione con lezione preselezionata
      setFormData({
        titolo: "",
        descrizione: "",
        lezione_id: lezionePreselezionata.id,
        config: {
          questions: [],
        },
      });
    }
  }, [questionario, lezionePreselezionata]);

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: "text",
      question: "",
      required: false,
      options: [],
    };

    setFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        questions: [...prev.config.questions, newQuestion],
      },
    }));
  };

  const updateQuestion = (questionId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        questions: (prev.config?.questions || []).map((q) =>
          q.id === questionId ? { ...q, [field]: value } : q
        ),
      },
    }));
  };

  const deleteQuestion = (questionId) => {
    setFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        questions: (prev.config?.questions || []).filter(
          (q) => q.id !== questionId
        ),
      },
    }));
  };

  const addOption = (questionId) => {
    const newOption = { id: Date.now(), text: "" };
    updateQuestion(questionId, "options", [
      ...((formData.config?.questions || []).find((q) => q.id === questionId)
        ?.options || []),
      newOption,
    ]);
  };

  const updateOption = (questionId, optionId, text) => {
    const question = (formData.config?.questions || []).find(
      (q) => q.id === questionId
    );
    if (!question || !question.options) return;

    const updatedOptions = question.options.map((opt) =>
      opt.id === optionId ? { ...opt, text } : opt
    );
    updateQuestion(questionId, "options", updatedOptions);
  };

  const deleteOption = (questionId, optionId) => {
    const question = (formData.config?.questions || []).find(
      (q) => q.id === questionId
    );
    if (!question || !question.options) return;

    const updatedOptions = question.options.filter(
      (opt) => opt.id !== optionId
    );
    updateQuestion(questionId, "options", updatedOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = questionario ? "PUT" : "POST";
      const url = questionario
        ? `${API_BASE}/questionari/${questionario.id}`
        : `${API_BASE}/questionari`;

      const payload = {
        ...formData,
        relatore_id: user.relatore.id,
        attivo: true,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSave();
      }
    } catch (error) {
      console.error("Errore salvataggio questionario:", error);
    }
  };

  return (
    <div className="form-card-modern">
      <div className="form-header">
        <div>
          <h3>
            {questionario ? "Modifica Questionario" : "Nuovo Questionario"}
            {lezionePreselezionata && !questionario && (
              <span
                style={{
                  color: "#666",
                  fontSize: "16px",
                  display: "block",
                  marginTop: "4px",
                }}
              >
                per {lezionePreselezionata.titolo}
              </span>
            )}
          </h3>
          <p>
            Compila tutti i campi per {questionario ? "modificare" : "creare"}{" "}
            il questionario
            {lezionePreselezionata && !questionario
              ? ` per la ${lezionePreselezionata.titolo}`
              : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-text"
          style={{ fontSize: "24px", padding: "8px" }}
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-modern">
        <div className="input-group">
          <label>Titolo questionario</label>
          <input
            type="text"
            placeholder="Titolo questionario"
            value={formData.titolo}
            onChange={(e) =>
              setFormData({ ...formData, titolo: e.target.value })
            }
            required
            className="input-modern"
          />
        </div>

        <div className="input-group">
          <label>Descrizione</label>
          <textarea
            placeholder="Descrizione"
            value={formData.descrizione}
            onChange={(e) =>
              setFormData({ ...formData, descrizione: e.target.value })
            }
            rows={3}
            className="textarea-modern"
          />
        </div>

        {!lezionePreselezionata && (
          <div className="input-group">
            <label>Seleziona lezione</label>
            <select
              value={formData.lezione_id}
              onChange={(e) =>
                setFormData({ ...formData, lezione_id: e.target.value })
              }
              required
              className="input-modern"
            >
              <option value="">Seleziona lezione</option>
              {lezioni && Array.isArray(lezioni)
                ? lezioni.map((lezione) => (
                    <option key={lezione.id} value={lezione.id}>
                      {lezione.titolo}
                    </option>
                  ))
                : null}
            </select>
          </div>
        )}

        <div className="domande-section">
          <div className="domande-header">
            <h4 className="domande-title">Domande</h4>
            <button
              type="button"
              onClick={addQuestion}
              className="btn-add-question"
            >
              <span>+</span> Aggiungi Domanda
            </button>
          </div>

          {formData.config.questions && Array.isArray(formData.config.questions)
            ? formData.config.questions.map((question, index) => (
                <QuestionEditor
                  key={question.id}
                  question={question}
                  index={index}
                  onUpdate={(field, value) =>
                    updateQuestion(question.id, field, value)
                  }
                  onDelete={() => deleteQuestion(question.id)}
                  onAddOption={() => addOption(question.id)}
                  onUpdateOption={(optionId, text) =>
                    updateOption(question.id, optionId, text)
                  }
                  onDeleteOption={(optionId) =>
                    deleteOption(question.id, optionId)
                  }
                />
              ))
            : null}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary-modern"
          >
            Annulla
          </button>
          <button type="submit" className="btn-primary-modern">
            {questionario ? "Aggiorna" : "Crea"} Questionario
          </button>
        </div>
      </form>
    </div>
  );
}

// Editor singola domanda
function QuestionEditor({
  question,
  index,
  onUpdate,
  onDelete,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
}) {
  const questionTypes = [
    { value: "text", label: "Testo libero" },
    { value: "textarea", label: "Testo lungo" },
    { value: "multiple_choice", label: "Scelta multipla" },
    { value: "checkbox", label: "Caselle di controllo" },
    { value: "number", label: "Numero" },
    { value: "date", label: "Data" },
    { value: "rating", label: "Valutazione (1-5)" },
    { value: "email", label: "Email" },
  ];

  const needsOptions = ["multiple_choice", "checkbox"].includes(question.type);

  return (
    <div className="question-card">
      <div className="question-header">
        <div className="question-number">{index + 1}</div>
        <div className="question-actions">
          <button
            type="button"
            onClick={onDelete}
            className="btn-small-modern btn-delete"
          >
            Elimina
          </button>
        </div>
      </div>

      <div className="question-content">
        <div className="input-group">
          <input
            type="text"
            placeholder="Scrivi la domanda..."
            value={question.question}
            onChange={(e) => onUpdate("question", e.target.value)}
            required
            className="input-modern"
          />
        </div>

        <div className="form-row-modern">
          <div className="input-group flex-2">
            <select
              value={question.type}
              onChange={(e) => onUpdate("type", e.target.value)}
              className="input-modern"
            >
              {questionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-xs)",
              padding: "var(--space-sm)",
            }}
          >
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => onUpdate("required", e.target.checked)}
            />
            Obbligatoria
          </label>
        </div>

        {needsOptions && (
          <div className="options-section">
            <div
              className="domande-header"
              style={{ marginBottom: "16px", paddingBottom: "8px" }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1d1d1f",
                }}
              >
                Opzioni:
              </span>
              <button
                type="button"
                onClick={onAddOption}
                className="btn-add-option"
              >
                + Opzione
              </button>
            </div>

            <div className="options-list">
              {(question.options || []).map((option, optIndex) => (
                <div key={option.id || optIndex} className="option-item">
                  <span
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      minWidth: "60px",
                    }}
                  >
                    Opzione {optIndex + 1}
                  </span>
                  <input
                    type="text"
                    placeholder={`Scrivi l'opzione...`}
                    value={option.text}
                    onChange={(e) => onUpdateOption(option.id, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => onDeleteOption(option.id)}
                    className="btn-remove-option"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionarioEditor;
