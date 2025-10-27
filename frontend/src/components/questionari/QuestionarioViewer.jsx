import React, { useState, useEffect } from "react";
import { API_BASE } from "../../constants/api.js";
import { normalizeConfig } from "../../utils/helpers.js";

function QuestionarioViewer({ questionario, user, onBack, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [startTime] = useState(Date.now());

  const config =
    typeof questionario.domande === "string"
      ? JSON.parse(questionario.domande)
      : questionario.domande;

  const normalizedConfig = normalizeConfig(config);

  useEffect(() => {
    // Se l'utente ha già risposto, carica le risposte esistenti
    if (questionario.hasAnswered && questionario.risposta) {
      const existingAnswers =
        typeof questionario.risposta.risposte === "string"
          ? JSON.parse(questionario.risposta.risposte)
          : questionario.risposta.risposte;
      setAnswers(existingAnswers);
      setIsReadOnly(true);
    }
  }, [questionario]);

  const handleAnswerChange = (questionId, value) => {
    if (isReadOnly) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    setLoading(true);

    // Verifica che tutte le domande obbligatorie siano state risposte
    const missingRequired = normalizedConfig.questions.filter(
      (q) => q.required && (!answers[q.id] || answers[q.id] === "")
    );

    if (missingRequired.length > 0) {
      alert("Per favore completa tutte le domande obbligatorie");
      setLoading(false);
      return;
    }

    try {
      const completionTime = Math.round((Date.now() - startTime) / 1000);

      const response = await fetch(`${API_BASE}/risposte`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionario_id: questionario.id,
          utente_id: user.utente.id,
          risposte: answers,
          completato: true,
          tempo_completamento: completionTime,
        }),
      });

      if (response.ok) {
        alert("Questionario completato con successo!");
        onComplete();
      }
    } catch (error) {
      console.error("Errore salvataggio risposte:", error);
      alert("Errore nel salvataggio. Riprova.");
    }

    setLoading(false);
  };

  return (
    <div className="questionario-viewer">
      <header className="viewer-header">
        <button onClick={onBack} className="btn-secondary">
          ← Indietro
        </button>
        <div className="questionario-info">
          <h1>{questionario.titolo}</h1>
          <p>{questionario.descrizione}</p>
          <small>
            Lezione: {questionario.lezione_titolo} -{" "}
            {questionario.relatore_nome}
          </small>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="questions-form">
        {normalizedConfig.questions.map((question, index) => (
          <QuestionRenderer
            key={question.id}
            question={question}
            index={index}
            value={answers[question.id] || ""}
            onChange={(value) => handleAnswerChange(question.id, value)}
            isReadOnly={isReadOnly}
          />
        ))}

        {!isReadOnly && (
          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn-large"
            >
              {loading ? "Salvataggio..." : "Invia Questionario"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

// Renderer per singola domanda
function QuestionRenderer({ question, index, value, onChange, isReadOnly }) {
  const renderInput = () => {
    switch (question.type) {
      case "text":
      case "email":
        return (
          <input
            type={question.type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isReadOnly}
            className="question-input"
          />
        );

      case "textarea":
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isReadOnly}
            rows={4}
            className="question-input"
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isReadOnly}
            className="question-input"
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isReadOnly}
            className="question-input"
          />
        );

      case "multiple_choice":
        return (
          <div className="options-list">
            {question.options.map((option, optionIndex) => (
              <label key={option.id || optionIndex} className="option-label">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={option.text}
                  checked={value === option.text}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={isReadOnly}
                />
                {option.text}
              </label>
            ))}
          </div>
        );

      case "checkbox":
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="options-list">
            {question.options.map((option, optionIndex) => (
              <label key={option.id || optionIndex} className="option-label">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.text)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selectedValues, option.text]);
                    } else {
                      onChange(selectedValues.filter((v) => v !== option.text));
                    }
                  }}
                  disabled={isReadOnly}
                />
                {option.text}
              </label>
            ))}
          </div>
        );

      case "rating":
        return (
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map((rating) => (
              <label key={rating} className="rating-label">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={rating}
                  checked={value == rating}
                  onChange={(e) => onChange(parseInt(e.target.value))}
                  disabled={isReadOnly}
                />
                <span className="rating-star">★</span>
                {rating}
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="question-container">
      <div className="question-header">
        <span className="question-number">Domanda {index + 1}</span>
        {question.required && <span className="required-indicator">*</span>}
      </div>

      <h3 className="question-text">{question.question}</h3>

      <div className="question-input-container">{renderInput()}</div>
    </div>
  );
}

export default QuestionarioViewer;
