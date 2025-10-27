import React, { useState, useEffect } from "react";
import { API_BASE } from "../../constants/api.js";
import { normalizeConfig } from "../../utils/helpers.js";

function QuestionarioEditor({ questionario, lezioni, user, onSave, onCancel }) {
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
      setFormData({
        titolo: questionario.titolo,
        descrizione: questionario.descrizione,
        lezione_id: questionario.lezione_id,
        config: normalizeConfig(
          typeof questionario.domande === "string"
            ? JSON.parse(questionario.domande)
            : questionario.domande
        ),
      });
    }
  }, [questionario]);

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
        questions: prev.config.questions.map((q) =>
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
        questions: prev.config.questions.filter((q) => q.id !== questionId),
      },
    }));
  };

  const addOption = (questionId) => {
    const newOption = { id: Date.now(), text: "" };
    updateQuestion(questionId, "options", [
      ...(formData.config.questions.find((q) => q.id === questionId)?.options ||
        []),
      newOption,
    ]);
  };

  const updateOption = (questionId, optionId, text) => {
    const question = formData.config.questions.find((q) => q.id === questionId);
    const updatedOptions = question.options.map((opt) =>
      opt.id === optionId ? { ...opt, text } : opt
    );
    updateQuestion(questionId, "options", updatedOptions);
  };

  const deleteOption = (questionId, optionId) => {
    const question = formData.config.questions.find((q) => q.id === questionId);
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
    <div className="questionario-editor">
      <h3>{questionario ? "Modifica Questionario" : "Nuovo Questionario"}</h3>

      <form onSubmit={handleSubmit} className="form-card">
        <input
          type="text"
          placeholder="Titolo questionario"
          value={formData.titolo}
          onChange={(e) => setFormData({ ...formData, titolo: e.target.value })}
          required
        />

        <textarea
          placeholder="Descrizione"
          value={formData.descrizione}
          onChange={(e) =>
            setFormData({ ...formData, descrizione: e.target.value })
          }
          rows={3}
        />

        <select
          value={formData.lezione_id}
          onChange={(e) =>
            setFormData({ ...formData, lezione_id: e.target.value })
          }
          required
        >
          <option value="">Seleziona lezione</option>
          {lezioni.map((lezione) => (
            <option key={lezione.id} value={lezione.id}>
              {lezione.titolo}
            </option>
          ))}
        </select>

        <div className="questions-section">
          <div className="section-header">
            <h4>Domande</h4>
            <button type="button" onClick={addQuestion} className="btn-small">
              + Aggiungi Domanda
            </button>
          </div>

          {formData.config.questions.map((question, index) => (
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
              onDeleteOption={(optionId) => deleteOption(question.id, optionId)}
            />
          ))}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Annulla
          </button>
          <button type="submit" className="btn-primary">
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
    <div className="question-editor">
      <div className="question-header">
        <span className="question-number">Domanda {index + 1}</span>
        <button
          type="button"
          onClick={onDelete}
          className="btn-small btn-delete"
        >
          Elimina
        </button>
      </div>

      <input
        type="text"
        placeholder="Scrivi la domanda..."
        value={question.question}
        onChange={(e) => onUpdate("question", e.target.value)}
        required
      />

      <div className="question-controls">
        <select
          value={question.type}
          onChange={(e) => onUpdate("type", e.target.value)}
        >
          {questionTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        <label className="checkbox-label">
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
          <div className="section-header">
            <span>Opzioni:</span>
            <button type="button" onClick={onAddOption} className="btn-small">
              + Opzione
            </button>
          </div>

          {(question.options || []).map((option, optIndex) => (
            <div key={option.id || optIndex} className="option-editor">
              <input
                type="text"
                placeholder={`Opzione ${optIndex + 1}`}
                value={option.text}
                onChange={(e) => onUpdateOption(option.id, e.target.value)}
              />
              <button
                type="button"
                onClick={() => onDeleteOption(option.id)}
                className="btn-small btn-delete"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuestionarioEditor;
