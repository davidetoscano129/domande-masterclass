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
    <div className="questionario-viewer-container">
      <header className="questionario-viewer-header">
        <button onClick={onBack} className="btn-back-modern">
          ← Indietro
        </button>
        <div className="questionario-viewer-title-section">
          <h1 className="questionario-viewer-title">
            Visualizzazione Questionario
          </h1>
          <p className="questionario-viewer-description">
            {questionario.descrizione}
          </p>
          <small className="questionario-viewer-meta">
            Lezione: {questionario.lezione_titolo} -{" "}
            {questionario.relatore_nome}
          </small>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="questionario-viewer-form">
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
          <div className="questionario-viewer-actions">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary-modern"
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
          />
        );

      case "textarea":
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isReadOnly}
            rows={4}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isReadOnly}
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isReadOnly}
          />
        );

      case "multiple_choice":
        return (
          <div>
            {question.options.map((option, optionIndex) => (
              <label key={option.id || optionIndex}>
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
          <div>
            {question.options.map((option, optionIndex) => (
              <label key={option.id || optionIndex}>
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
          <div>
            {[1, 2, 3, 4, 5].map((rating) => (
              <label key={rating}>
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={rating}
                  checked={value == rating}
                  onChange={(e) => onChange(parseInt(e.target.value))}
                  disabled={isReadOnly}
                />
                <span>★</span>
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
    <div>
      <div>
        <span>Domanda {index + 1}</span>
        {question.required && <span>*</span>}
      </div>

      <h3>{question.question}</h3>

      <div>{renderInput()}</div>
    </div>
  );
}

export default QuestionarioViewer;
