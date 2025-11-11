import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { API_BASE } from "../../constants/api.js";
import { normalizeConfig } from "../../utils/helpers.js";
import "../../styles/design-system.css";
import "../../styles/components/cards.css";
import "../../styles/components/buttons.css";
import "../../styles/components/forms.css";
import "../../styles/shared/shared-questionnaire.css";

function SharedQuestionairePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [questionario, setQuestionario] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);

  // Controlla se l'utente è già autenticato (passato dal login)
  const user = location.state?.user;

  useEffect(() => {
    if (!user) {
      // Se non è autenticato, reindirizza al login con il token
      navigate(`/?redirect=shared/${token}`, { replace: true });
      return;
    }

    fetchSharedData();
  }, [token, user, navigate]);

  const fetchSharedData = async () => {
    try {
      setLoading(true);

      // Carica solo i dati del questionario
      const questionarioResponse = await fetch(`${API_BASE}/shared/${token}`);
      if (!questionarioResponse.ok) {
        throw new Error("Link non valido o scaduto");
      }
      const questionarioData = await questionarioResponse.json();
      setQuestionario(questionarioData.questionario);
      setSelectedUser(user); // Usa l'utente autenticato
      setLoading(false);
    } catch (error) {
      console.error("Errore caricamento dati condivisi:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/", { replace: true });
  };

  const handleBackToSelection = () => {
    setSelectedUser(null);
    setShowQuestionnaire(false);
    setCodiceFiscale("");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <h2>🔄 Caricamento questionario...</h2>
          <p>Attendere prego</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>❌ Errore</h2>
          <p>{error}</p>
          <button
            className="error-button"
            onClick={() => (window.location.href = "/")}
          >
            Torna alla home
          </button>
        </div>
      </div>
    );
  }

  // Se l'utente è autenticato e abbiamo il questionario, mostra direttamente il questionario
  if (user && questionario && selectedUser) {
    return (
      <div className="shared-questionnaire-container">
        <div className="shared-content-wrapper">
          <SharedQuestionnaireViewer
            questionario={questionario}
            selectedUser={selectedUser}
            token={token}
            onBack={handleBackToLogin}
          />
        </div>
      </div>
    );
  }

  // Se arriviamo qui, significa che stiamo reindirizzando al login
  return (
    <div className="shared-questionnaire-container">
      <div className="shared-content-wrapper">
        <div className="loading-container">
          <div className="loading-content">
            <h2>🔄 Reindirizzamento al login...</h2>
            <p>Attendere prego</p>
          </div>
        </div>
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
  const [submitError, setSubmitError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const config = normalizeConfig(
    typeof questionario.domande === "string"
      ? JSON.parse(questionario.domande)
      : questionario.domande
  );

  // Calcola progresso completamento
  const totalQuestions = config.questions.length;
  const answeredQuestions = Object.keys(responses).filter((key) => {
    const response = responses[key];
    return (
      response !== null &&
      response !== undefined &&
      response !== "" &&
      (Array.isArray(response) ? response.length > 0 : true)
    );
  }).length;
  const progressPercentage =
    totalQuestions > 0
      ? Math.round((answeredQuestions / totalQuestions) * 100)
      : 0;

  // Valida se una domanda è stata risposte
  const isQuestionAnswered = (questionId) => {
    const response = responses[questionId];
    return (
      response !== null &&
      response !== undefined &&
      response !== "" &&
      (Array.isArray(response) ? response.length > 0 : true)
    );
  };

  const handleResponseChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    // Auto-scroll alla prossima domanda se non risposta
    setTimeout(() => {
      const currentIndex = config.questions.findIndex(
        (q) => q.id === questionId
      );
      if (currentIndex < config.questions.length - 1) {
        const nextQuestion = config.questions[currentIndex + 1];
        if (!isQuestionAnswered(nextQuestion.id)) {
          const nextElement = document.querySelector(
            `[data-question-id="${nextQuestion.id}"]`
          );
          if (nextElement) {
            nextElement.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

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
        const errorData = await response.json();

        // Gestisci diversi tipi di errore
        if (response.status === 409) {
          setSubmitError({
            type: "already_completed",
            message: "Hai già compilato questo questionario in precedenza.",
            details:
              "Non è possibile inviare nuove risposte per questo questionario.",
          });
        } else {
          setSubmitError({
            type: "generic",
            message: errorData.error || "Errore nel salvataggio delle risposte",
            details: "Riprova più tardi o contatta il supporto.",
          });
        }
      }
    } catch (error) {
      console.error("Errore invio risposte:", error);
      setSubmitError({
        type: "network",
        message: "Errore di connessione",
        details: "Verifica la tua connessione internet e riprova.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="success-message">
        <h2>🎉 Questionario completato!</h2>
        <p>
          Grazie <strong>{selectedUser.nome}</strong> per aver compilato il
          questionario "<strong>{questionario.titolo}</strong>".
        </p>
        <p>Le tue risposte sono state salvate correttamente.</p>
        <p>Puoi chiudere questa pagina.</p>
      </div>
    );
  }

  return (
    <div className="questionnaire-viewer">
      <div className="questionnaire-header">
        <div className="header-main">
          <div className="questionnaire-info">
            <h2 className="questionnaire-title">{questionario.titolo}</h2>
            <div className="user-info">
              <span className="user-badge">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                {selectedUser.nome}
              </span>
            </div>
          </div>

          <div className="header-actions">
            <button className="btn-secondary btn-logout" onClick={onBack}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
              Esci
            </button>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="progress-stats">
              <span className="progress-text">
                Progresso: {answeredQuestions} di {totalQuestions} domande
                completate
              </span>
              <span className="progress-percentage">{progressPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {config.questions.map((question, index) => (
          <div
            key={question.id}
            data-question-id={question.id}
            className={`question-item ${
              isQuestionAnswered(question.id) ? "answered" : "unanswered"
            }`}
          >
            <div className="question-header">
              <h3 className="question-title">
                {index + 1}. {question.question}
              </h3>
            </div>

            <div className="question-content">
              {question.type === "multiple_choice" && (
                <div className="question-options">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`option-item ${
                        responses[question.id] === option.text ? "selected" : ""
                      }`}
                      onClick={() =>
                        handleResponseChange(question.id, option.text)
                      }
                    >
                      <div className="option-radio"></div>
                      <span className="option-text">{option.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {question.type === "text" && (
                <input
                  type="text"
                  className="text-input"
                  value={responses[question.id] || ""}
                  onChange={(e) =>
                    handleResponseChange(question.id, e.target.value)
                  }
                  placeholder="Inserisci la tua risposta..."
                />
              )}

              {question.type === "email" && (
                <input
                  type="email"
                  className="text-input"
                  value={responses[question.id] || ""}
                  onChange={(e) =>
                    handleResponseChange(question.id, e.target.value)
                  }
                  placeholder="inserisci@email.com"
                />
              )}

              {question.type === "date" && (
                <input
                  type="date"
                  className="text-input"
                  value={responses[question.id] || ""}
                  onChange={(e) =>
                    handleResponseChange(question.id, e.target.value)
                  }
                />
              )}

              {question.type === "textarea" && (
                <textarea
                  className="text-input"
                  value={responses[question.id] || ""}
                  onChange={(e) =>
                    handleResponseChange(question.id, e.target.value)
                  }
                  placeholder="Inserisci la tua risposta..."
                  rows={4}
                />
              )}

              {question.type === "rating" && (
                <div className="rating-container">
                  <div className="rating-options">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <div
                        key={value}
                        className={`rating-item ${
                          responses[question.id] === value ? "selected" : ""
                        }`}
                        onClick={() => handleResponseChange(question.id, value)}
                      >
                        {value}
                      </div>
                    ))}
                  </div>
                  <div className="rating-labels">
                    <span>Molto basso</span>
                    <span>Molto alto</span>
                  </div>
                </div>
              )}

              {question.type === "checkbox" && (
                <div className="question-options">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`option-item checkbox ${
                        (responses[question.id] || []).includes(option.text)
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => {
                        const currentResponses = responses[question.id] || [];
                        if (currentResponses.includes(option.text)) {
                          handleResponseChange(
                            question.id,
                            currentResponses.filter((r) => r !== option.text)
                          );
                        } else {
                          handleResponseChange(question.id, [
                            ...currentResponses,
                            option.text,
                          ]);
                        }
                      }}
                    >
                      <div className="option-checkbox"></div>
                      <span className="option-text">{option.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {question.type === "number" && (
                <input
                  type="number"
                  className="text-input"
                  value={responses[question.id] || ""}
                  onChange={(e) =>
                    handleResponseChange(question.id, e.target.value)
                  }
                  placeholder="Inserisci un numero..."
                />
              )}
            </div>
          </div>
        ))}

        <div className="submit-section">
          <div className="submit-info">
            <p className="completion-status">
              {answeredQuestions === totalQuestions ? (
                <span className="status-complete">
                  ✓ Tutte le domande completate
                </span>
              ) : (
                <span className="status-incomplete">
                  {totalQuestions - answeredQuestions} domande rimanenti
                </span>
              )}
            </p>
          </div>

          {submitError && (
            <div className={`submit-error error-${submitError.type}`}>
              <div className="error-header">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <h4>
                  {submitError.type === "already_completed"
                    ? "⚠️ Questionario già completato"
                    : "❌ Errore di invio"}
                </h4>
              </div>
              <p className="error-message">{submitError.message}</p>
              <p className="error-details">{submitError.details}</p>
              {submitError.type === "already_completed" && (
                <div className="error-actions">
                  <button
                    className="btn-secondary error-action-btn"
                    onClick={onBack}
                  >
                    Torna al Login
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            className={`submit-button ${
              answeredQuestions === totalQuestions ? "ready" : "partial"
            }`}
            disabled={submitting || submitError?.type === "already_completed"}
          >
            {submitting ? (
              <>
                <span className="spinner"></span>
                Invio in corso...
              </>
            ) : answeredQuestions === totalQuestions ? (
              "Invia Risposte Completate"
            ) : (
              "Invia Risposte Parziali"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SharedQuestionairePage;
