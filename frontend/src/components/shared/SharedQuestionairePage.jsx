import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_BASE } from "../../constants/api.js";
import { normalizeConfig } from "../../utils/helpers.js";

function SharedQuestionairePage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [questionario, setQuestionario] = useState(null);
  const [utenti, setUtenti] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSharedData();
  }, [token]);

  const fetchSharedData = async () => {
    try {
      setLoading(true);

      // Carica informazioni questionario
      const questionarioResponse = await fetch(`${API_BASE}/shared/${token}`);
      if (!questionarioResponse.ok) {
        throw new Error("Link non valido o scaduto");
      }
      const questionarioData = await questionarioResponse.json();
      setQuestionario(questionarioData.questionario);

      // Carica lista utenti
      const utentiResponse = await fetch(`${API_BASE}/shared/${token}/utenti`);
      if (!utentiResponse.ok) {
        throw new Error("Errore nel caricamento utenti");
      }
      const utentiData = await utentiResponse.json();
      setUtenti(utentiData.utenti);
    } catch (error) {
      console.error("Errore caricamento dati condivisi:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelection = (user) => {
    setSelectedUser(user);
    setShowQuestionnaire(true);
  };

  const handleBackToUserSelection = () => {
    setSelectedUser(null);
    setShowQuestionnaire(false);
  };

  if (loading) {
    return (
      <div className="shared-page">
        <div className="shared-container">
          <div className="loading">
            <h2>🔄 Caricamento questionario...</h2>
            <p>Attendere prego</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-page">
        <div className="shared-container">
          <div className="error-message">
            <h2>Errore</h2>
            <p>{error}</p>
            <button
              onClick={() => (window.location.href = "/")}
              className="btn-primary"
            >
              Torna alla home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!showQuestionnaire) {
    return (
      <div className="shared-page">
        <div className="shared-container">
          <div className="user-selection-section">
            <div className="header">
              <h1>Compilazione Questionario</h1>
              <h2>{questionario.titolo}</h2>
              <p>
                Relatore: <strong>{questionario.relatore_nome}</strong>
              </p>
            </div>

            <div className="user-selection">
              <h3>Seleziona il tuo nome per iniziare:</h3>
              <div className="users-grid">
                {utenti.map((user) => (
                  <div
                    key={user.id}
                    className="user-card"
                    onClick={() => handleUserSelection(user)}
                  >
                    <div className="user-avatar">•</div>
                    <span className="user-name">{user.nome}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-page">
      <div className="shared-container">
        <SharedQuestionnaireViewer
          questionario={questionario}
          selectedUser={selectedUser}
          token={token}
          onBack={handleBackToUserSelection}
        />
      </div>
    </div>
  );
}

// Componente per visualizzare il questionario condiviso
function SharedQuestionnaireViewer({
  questionario,
  selectedUser,
  token,
  onBack,
}) {
  const [responses, setResponses] = useState({});
  const [startTime] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const config = normalizeConfig(
    typeof questionario.domande === "string"
      ? JSON.parse(questionario.domande)
      : questionario.domande
  );

  const handleResponseChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const tempo_impiegato = Math.round((Date.now() - startTime) / 1000);

      const response = await fetch(`${API_BASE}/shared/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utente_id: selectedUser.id,
          risposte: responses,
          tempo_impiegato,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const error = await response.json();
        alert(error.error || "Errore nel salvataggio delle risposte");
      }
    } catch (error) {
      console.error("Errore invio risposte:", error);
      alert("Errore nel salvataggio delle risposte");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="submission-success">
        <div className="success-content">
          <h2>Questionario completato!</h2>
          <p>
            Grazie <strong>{selectedUser.nome}</strong> per aver compilato il
            questionario:
          </p>
          <h3>"{questionario.titolo}"</h3>
          <p>Le tue risposte sono state salvate correttamente.</p>
          <p className="completion-note">
            🎉 La compilazione è stata completata. Puoi chiudere questa pagina.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="questionnaire-viewer">
      <div className="questionnaire-header">
        <button onClick={onBack} className="btn-back">
          ← Indietro
        </button>
        <div className="header-info">
          <h2>{questionario.titolo}</h2>
          <p>
            Utente: <strong>{selectedUser.nome}</strong>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="questionnaire-form">
        {config.questions.map((question, index) => (
          <div key={question.id} className="question-block">
            <div className="question-header">
              <span className="question-number">{index + 1}.</span>
              <h3 className="question-text">{question.question}</h3>
            </div>

            <div className="question-input">
              {question.type === "multiple_choice" && (
                <div className="options-list">
                  {question.options.map((option) => (
                    <label key={option.id} className="option-label">
                      <input
                        type="radio"
                        name={`question_${question.id}`}
                        value={option.text}
                        checked={responses[question.id] === option.text}
                        onChange={(e) =>
                          handleResponseChange(question.id, e.target.value)
                        }
                      />
                      <span className="option-text">{option.text}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === "text" && (
                <input
                  type="text"
                  value={responses[question.id] || ""}
                  onChange={(e) =>
                    handleResponseChange(question.id, e.target.value)
                  }
                  placeholder="Inserisci la tua risposta..."
                  className="text-input"
                />
              )}

              {question.type === "email" && (
                <input
                  type="email"
                  value={responses[question.id] || ""}
                  onChange={(e) =>
                    handleResponseChange(question.id, e.target.value)
                  }
                  placeholder="inserisci@email.com"
                  className="text-input"
                />
              )}

              {question.type === "date" && (
                <input
                  type="date"
                  value={responses[question.id] || ""}
                  onChange={(e) =>
                    handleResponseChange(question.id, e.target.value)
                  }
                  className="text-input"
                />
              )}

              {question.type === "textarea" && (
                <textarea
                  value={responses[question.id] || ""}
                  onChange={(e) =>
                    handleResponseChange(question.id, e.target.value)
                  }
                  placeholder="Inserisci la tua risposta..."
                  rows={4}
                  className="textarea-input"
                />
              )}

              {question.type === "rating" && (
                <div className="rating-input">
                  <div className="rating-scale">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <label key={value} className="rating-option">
                        <input
                          type="radio"
                          name={`question_${question.id}`}
                          value={value}
                          checked={responses[question.id] === value}
                          onChange={(e) =>
                            handleResponseChange(
                              question.id,
                              parseInt(e.target.value)
                            )
                          }
                        />
                        <span className="rating-number">{value}</span>
                      </label>
                    ))}
                  </div>
                  <div className="rating-labels">
                    <span>Molto basso</span>
                    <span>Molto alto</span>
                  </div>
                </div>
              )}

              {question.type === "checkbox" && (
                <div className="checkbox-list">
                  {question.options.map((option) => (
                    <label key={option.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={(responses[question.id] || []).includes(
                          option.text
                        )}
                        onChange={(e) => {
                          const currentResponses = responses[question.id] || [];
                          if (e.target.checked) {
                            handleResponseChange(question.id, [
                              ...currentResponses,
                              option.text,
                            ]);
                          } else {
                            handleResponseChange(
                              question.id,
                              currentResponses.filter((r) => r !== option.text)
                            );
                          }
                        }}
                      />
                      <span className="checkbox-text">{option.text}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === "number" && (
                <input
                  type="number"
                  value={responses[question.id] || ""}
                  onChange={(e) =>
                    handleResponseChange(question.id, e.target.value)
                  }
                  placeholder="Inserisci un numero..."
                  className="number-input"
                />
              )}
            </div>
          </div>
        ))}

        <div className="submit-section">
          <button type="submit" disabled={submitting} className="btn-submit">
            {submitting ? "Invio in corso..." : "Invia Risposte"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SharedQuestionairePage;
