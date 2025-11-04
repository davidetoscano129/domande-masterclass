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
      <div>
        <div>
          <div>
            <h2>🔄 Caricamento questionario...</h2>
            <p>Attendere prego</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div>
          <div>
            <h2>Errore</h2>
            <p>{error}</p>
            <button onClick={() => (window.location.href = "/")}>
              Torna alla home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!showQuestionnaire) {
    return (
      <div>
        <div>
          <div>
            <div>
              <h1>Compilazione Questionario</h1>
              <h2>{questionario.titolo}</h2>
              <p>
                Relatore: <strong>{questionario.relatore_nome}</strong>
              </p>
            </div>

            <div>
              <h3>Seleziona il tuo nome per iniziare:</h3>
              <div>
                {utenti.map((user) => (
                  <div key={user.id} onClick={() => handleUserSelection(user)}>
                    <div>•</div>
                    <span>{user.nome}</span>
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
    <div>
      <div>
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
      <div>
        <div>
          <h2>Questionario completato!</h2>
          <p>
            Grazie <strong>{selectedUser.nome}</strong> per aver compilato il
            questionario:
          </p>
          <h3>"{questionario.titolo}"</h3>
          <p>Le tue risposte sono state salvate correttamente.</p>
          <p>
            🎉 La compilazione è stata completata. Puoi chiudere questa pagina.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <button onClick={onBack}>← Indietro</button>
        <div>
          <h2>{questionario.titolo}</h2>
          <p>
            Utente: <strong>{selectedUser.nome}</strong>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {config.questions.map((question, index) => (
          <div key={question.id}>
            <div>
              <span>{index + 1}.</span>
              <h3>{question.question}</h3>
            </div>

            <div>
              {question.type === "multiple_choice" && (
                <div>
                  {question.options.map((option) => (
                    <label key={option.id}>
                      <input
                        type="radio"
                        name={`question_${question.id}`}
                        value={option.text}
                        checked={responses[question.id] === option.text}
                        onChange={(e) =>
                          handleResponseChange(question.id, e.target.value)
                        }
                      />
                      <span>{option.text}</span>
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
                />
              )}

              {question.type === "date" && (
                <input
                  type="date"
                  value={responses[question.id] || ""}
                  onChange={(e) =>
                    handleResponseChange(question.id, e.target.value)
                  }
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
                />
              )}

              {question.type === "rating" && (
                <div>
                  <div>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <label key={value}>
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
                        <span>{value}</span>
                      </label>
                    ))}
                  </div>
                  <div>
                    <span>Molto basso</span>
                    <span>Molto alto</span>
                  </div>
                </div>
              )}

              {question.type === "checkbox" && (
                <div>
                  {question.options.map((option) => (
                    <label key={option.id}>
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
                      <span>{option.text}</span>
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
                />
              )}
            </div>
          </div>
        ))}

        <div>
          <button type="submit" disabled={submitting}>
            {submitting ? "Invio in corso..." : "Invia Risposte"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SharedQuestionairePage;
